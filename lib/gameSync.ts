// Shared game state synchronization using Supabase (cross-device) with a
// localStorage fallback for offline/single-device play.
import type {
  ChallengeMode,
  RapidFireQuestion,
  SharedHint,
  ThemeId,
} from "@/types/game";
import type { BoardLayoutType } from "@/types/boardLayout";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { DEFAULT_JIGSAW_LAYOUT, type JigsawLayoutId } from "./jigsawThemes";

export interface GameConfig {
  timeLimit: number; // in seconds
  maxQuotes: number; // number of quotes to use
  isGameActive: boolean;
  gameStartTime: number | null;
  gameEndTime: number | null;
  sessionId: string; // Unique session/class identifier (storage key)
  sessionName?: string; // Friendly name shown to users
  themeId: ThemeId;
  challengeMode: ChallengeMode;
  rapidFireQuestion: RapidFireQuestion | null;
  activeHint: SharedHint | null;
  boardLayout?: BoardLayoutType; // Board layout type
  jigsawMode?: 'classic' | 'jigsaw'; // Game mode selection
  quotePackIds?: string[];
  jigsawLayout?: JigsawLayoutId;
}

const GAME_CONFIG_KEY = "puzzle-game-config";
const DEFAULT_SESSION_ID = "default";
const POLL_INTERVAL = 1000; // local fallback polling

let cachedConfig: GameConfig | null = null;
const listeners = new Set<(config: GameConfig | null) => void>();
let realtimeChannel: RealtimeChannel | null = null;
let realtimeSubscribed = false;
let seedInFlight: Promise<void> | null = null;
const DEFAULT_QUOTE_PACKS = ["classic-core"];

const toGameConfig = (row: any): GameConfig => {
  return {
    timeLimit: row.time_limit,
    maxQuotes: row.max_quotes,
    isGameActive: row.is_game_active,
    gameStartTime: row.game_start_time,
    gameEndTime: row.game_end_time,
    sessionId: row.id,
    sessionName: row.session_name ?? row.id,
    themeId: row.theme_id,
    challengeMode: row.challenge_mode,
    rapidFireQuestion: row.rapid_fire_question,
    activeHint: row.active_hint,
    boardLayout: row.board_layout,
    jigsawMode: row.jigsaw_mode || 'classic',
    quotePackIds: row.quote_pack_ids ?? row.quote_packages ?? DEFAULT_QUOTE_PACKS,
    jigsawLayout: (row.jigsaw_layout as JigsawLayoutId) ?? DEFAULT_JIGSAW_LAYOUT,
  };
};

const toDbRow = (config: GameConfig) => ({
  id: DEFAULT_SESSION_ID,
  is_game_active: config.isGameActive,
  time_limit: config.timeLimit,
  max_quotes: config.maxQuotes,
  game_start_time: config.gameStartTime,
  game_end_time: config.gameEndTime,
  session_name: config.sessionName ?? config.sessionId,
  theme_id: config.themeId,
  challenge_mode: config.challengeMode,
  rapid_fire_question: config.rapidFireQuestion,
  active_hint: config.activeHint,
  board_layout: config.boardLayout ?? null,
  jigsaw_mode: config.jigsawMode ?? 'classic',
  jigsaw_layout: config.jigsawLayout ?? DEFAULT_JIGSAW_LAYOUT,
  quote_pack_ids: (config.quotePackIds && config.quotePackIds.length > 0
    ? config.quotePackIds
    : DEFAULT_QUOTE_PACKS),
});

const writeLocal = (config: GameConfig | null) => {
  if (typeof window === "undefined") return;
  if (!config) {
    localStorage.removeItem(GAME_CONFIG_KEY);
    return;
  }
  localStorage.setItem(GAME_CONFIG_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent("gameConfigUpdated"));
};

const readLocal = (): GameConfig | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(GAME_CONFIG_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const fetchConfigFromSupabase = async (): Promise<GameConfig | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", DEFAULT_SESSION_ID)
    .maybeSingle();

  if (error) {
    console.error("Supabase fetch config failed", error);
    return null;
  }

  if (!data) return null;
  return toGameConfig(data);
};

const upsertConfigToSupabase = async (config: GameConfig) => {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const row = toDbRow(config);
  const attempt = async (payload: Record<string, any>, suppressedErrors: string[] = []) => {
    const { error } = await supabase.from("sessions").upsert(payload);
    if (!error) return;
    const message = (error as any)?.message ?? String(error);
    if (/quote_pack_ids/i.test(message) && !suppressedErrors.includes("quote_pack_ids")) {
      console.warn("Supabase column quote_pack_ids missing. Run migrate_add_quote_pack_ids.sql.");
      const { quote_pack_ids: _packs, ...rest } = payload;
      return attempt(rest, [...suppressedErrors, "quote_pack_ids"]);
    }
    if (/jigsaw_mode/i.test(message) && !suppressedErrors.includes("jigsaw_mode")) {
      console.warn("Supabase column jigsaw_mode missing. Run migrate_add_jigsaw_mode.sql.");
      const { jigsaw_mode: _mode, ...rest } = payload;
      return attempt(rest, [...suppressedErrors, "jigsaw_mode"]);
    }
    if (/jigsaw_layout/i.test(message) && !suppressedErrors.includes("jigsaw_layout")) {
      console.warn("Supabase column jigsaw_layout missing. Consider adding it for layout sync.");
      const { jigsaw_layout: _layout, ...rest } = payload;
      return attempt(rest, [...suppressedErrors, "jigsaw_layout"]);
    }
    console.error("Supabase upsert config failed", error);
  }
  await attempt(row);
};

const notifyAll = (config: GameConfig | null) => {
  listeners.forEach((listener) => {
    try {
      listener(config);
    } catch (error) {
      console.error("GameSync listener error", error);
    }
  });
};

const maybeAutoEndExpired = (cfg: GameConfig): GameConfig => {
  if (!cfg.isGameActive || !cfg.gameEndTime) return cfg;
  if (Date.now() < cfg.gameEndTime) return cfg;
  const ended: GameConfig = {
    ...cfg,
    isGameActive: false,
    challengeMode: "normal",
    rapidFireQuestion: null,
    activeHint: null,
  };
  void upsertConfigToSupabase(ended);
  return ended;
};

const ensureRealtimeSubscription = () => {
  if (realtimeSubscribed || !isSupabaseConfigured) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  realtimeChannel = supabase
    .channel("sessions-default")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "sessions", filter: `id=eq.${DEFAULT_SESSION_ID}` },
      (payload) => {
        const row = (payload.new ?? payload.old) as any;
        if (!row) return;
        const cfg = maybeAutoEndExpired(toGameConfig(row));
        cachedConfig = cfg;
        writeLocal(cfg);
        notifyAll(cfg);
      }
    )
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        const existing = await fetchConfigFromSupabase();
        if (existing) {
          const cfg = maybeAutoEndExpired(existing);
          cachedConfig = cfg;
          writeLocal(cfg);
          notifyAll(cfg);
        }
      }
    });

  realtimeSubscribed = true;
};

const maybeSeedDefaultSession = async () => {
  if (!isSupabaseConfigured) return;
  if (cachedConfig || readLocal()) return;
  if (seedInFlight) return seedInFlight;

  seedInFlight = (async () => {
    const remote = await fetchConfigFromSupabase();
    if (remote) {
      const cfg = maybeAutoEndExpired(remote);
      cachedConfig = cfg;
      writeLocal(cfg);
      notifyAll(cfg);
      return;
    }
    const seed: GameConfig = {
      timeLimit: 300,
      maxQuotes: 20,
      isGameActive: false,
      gameStartTime: null,
      gameEndTime: null,
      sessionId: DEFAULT_SESSION_ID,
      sessionName: "Default Session",
      themeId: "classic",
      challengeMode: "normal",
      rapidFireQuestion: null,
      activeHint: null,
      boardLayout: "elephant",
      jigsawMode: "classic",
      jigsawLayout: DEFAULT_JIGSAW_LAYOUT,
      quotePackIds: DEFAULT_QUOTE_PACKS,
    };
    cachedConfig = seed;
    writeLocal(seed);
    notifyAll(seed);
    await upsertConfigToSupabase(seed);
  })().finally(() => {
    seedInFlight = null;
  });

  await seedInFlight;
};

export const GameSync = {
  getConfig(): GameConfig | null {
    if (cachedConfig) return cachedConfig;
    const local = readLocal();
    if (local) {
      cachedConfig = local;
      return local;
    }
    return null;
  },

  setConfig(config: GameConfig): void {
    cachedConfig = config;
    writeLocal(config);
    notifyAll(config);
    if (isSupabaseConfigured) {
      void upsertConfigToSupabase(config);
    }
  },

  startGame(
    timeLimit: number,
    maxQuotes: number,
    sessionName: string = "Default Session",
    themeId: ThemeId = "classic",
    boardLayout: BoardLayoutType = "elephant",
    jigsawMode: 'classic' | 'jigsaw' = 'classic',
    quotePackIds: string[] = DEFAULT_QUOTE_PACKS,
    jigsawLayout: JigsawLayoutId = DEFAULT_JIGSAW_LAYOUT
  ): void {
    const config: GameConfig = {
      timeLimit,
      maxQuotes,
      isGameActive: true,
      gameStartTime: Date.now(),
      gameEndTime: Date.now() + timeLimit * 1000,
      sessionId: DEFAULT_SESSION_ID,
      sessionName,
      themeId,
      challengeMode: "normal",
      rapidFireQuestion: null,
      activeHint: null,
      boardLayout,
      jigsawMode,
      jigsawLayout,
      quotePackIds: quotePackIds.length ? quotePackIds : DEFAULT_QUOTE_PACKS,
    };
    this.setConfig(config);
  },

  endGame(): void {
    const config = this.getConfig();
    if (config) {
      const endedAt = Date.now();
      const next: GameConfig = {
        ...config,
        isGameActive: false,
        gameEndTime: endedAt,
        rapidFireQuestion: null,
        activeHint: null,
        challengeMode: "normal",
      };
      this.setConfig(next);
    }
  },

  isGameActive(): boolean {
    const config = this.getConfig();
    if (!config) return false;
    if (!config.isGameActive) return false;
    if (config.gameEndTime && Date.now() >= config.gameEndTime) {
      this.endGame();
      return false;
    }
    return true;
  },

  getRemainingTime(): number {
    const config = this.getConfig();
    if (!config || !config.gameEndTime) return 0;
    const remaining = Math.max(0, Math.floor((config.gameEndTime - Date.now()) / 1000));
    return remaining;
  },

  subscribe(callback: (config: GameConfig | null) => void): () => void {
    if (typeof window === "undefined") return () => {};

    if (isSupabaseConfigured) {
      listeners.add(callback);
      callback(this.getConfig());
      ensureRealtimeSubscription();
      void maybeSeedDefaultSession();

      return () => {
        listeners.delete(callback);
        if (listeners.size === 0 && realtimeChannel) {
          const supabase = getSupabaseClient();
          if (supabase && realtimeChannel) {
            supabase.removeChannel(realtimeChannel);
          }
          realtimeChannel = null;
          realtimeSubscribed = false;
        }
      };
    }

    // Local fallback
    const handler = () => {
      callback(this.getConfig());
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === GAME_CONFIG_KEY) {
        handler();
      }
    };

    window.addEventListener("gameConfigUpdated", handler);
    window.addEventListener("storage", storageHandler);
    const interval = setInterval(handler, POLL_INTERVAL);
    handler();

    return () => {
      window.removeEventListener("gameConfigUpdated", handler);
      window.removeEventListener("storage", storageHandler);
      clearInterval(interval);
    };
  },

  updateConfig(partial: Partial<GameConfig>): void {
    const current = this.getConfig();
    if (!current) return;
    this.setConfig({ ...current, ...partial });
  },
};

