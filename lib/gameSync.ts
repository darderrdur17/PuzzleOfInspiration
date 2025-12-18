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
}

const GAME_CONFIG_KEY = "puzzle-game-config";
const DEFAULT_SESSION_ID = "default";
const POLL_INTERVAL = 1000; // local fallback polling

let cachedConfig: GameConfig | null = null;
let unsubscribeRealtime: (() => void) | null = null;

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
  const { error } = await supabase.from("sessions").upsert(toDbRow(config));
  if (error) {
    console.error("Supabase upsert config failed", error);
  }
};

const ensureRealtimeSubscription = (callback: (config: GameConfig | null) => void) => {
  if (unsubscribeRealtime || !isSupabaseConfigured) return;
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const channel = supabase
    .channel("sessions-default")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "sessions", filter: `id=eq.${DEFAULT_SESSION_ID}` },
      (payload) => {
        const row = (payload.new ?? payload.old) as any;
        if (!row) return;
        const cfg = toGameConfig(row);
        cachedConfig = cfg;
        writeLocal(cfg);
        callback(cfg);
      }
    )
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        const existing = await fetchConfigFromSupabase();
        if (existing) {
          cachedConfig = existing;
          writeLocal(existing);
          callback(existing);
        }
      }
    });

  unsubscribeRealtime = () => {
    supabase.removeChannel(channel);
    unsubscribeRealtime = null;
  };
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
    jigsawMode: 'classic' | 'jigsaw' = 'classic'
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
    };
    this.setConfig(config);
  },

  endGame(): void {
    const config = this.getConfig();
    if (config) {
      const next = { ...config, isGameActive: false };
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
      ensureRealtimeSubscription(callback);
      void (async () => {
        const remote = await fetchConfigFromSupabase();
        if (remote) {
          cachedConfig = remote;
          writeLocal(remote);
          callback(remote);
          return;
        }
        // if no remote row yet, seed with a default inactive config
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
        };
        cachedConfig = seed;
        writeLocal(seed);
        callback(seed);
        await upsertConfigToSupabase(seed);
      })();

      return () => {
        if (unsubscribeRealtime) {
          unsubscribeRealtime();
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

