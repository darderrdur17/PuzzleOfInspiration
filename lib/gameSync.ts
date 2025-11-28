// Shared game state synchronization using localStorage
// This allows game master and players to sync game settings

import type {
  ChallengeMode,
  RapidFireQuestion,
  SharedHint,
  ThemeId,
} from "@/types/game";

export interface GameConfig {
  timeLimit: number; // in seconds
  maxQuotes: number; // number of quotes to use
  isGameActive: boolean;
  gameStartTime: number | null;
  gameEndTime: number | null;
  sessionId: string; // Unique session/class identifier
  themeId: ThemeId;
  challengeMode: ChallengeMode;
  rapidFireQuestion: RapidFireQuestion | null;
  activeHint: SharedHint | null;
}

const GAME_CONFIG_KEY = "puzzle-game-config";
const POLL_INTERVAL = 1000; // Check every second

export const GameSync = {
  // Get current game config
  getConfig(): GameConfig | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(GAME_CONFIG_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  // Set game config (game master only)
  setConfig(config: GameConfig): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(GAME_CONFIG_KEY, JSON.stringify(config));
    // Trigger custom event for immediate sync
    window.dispatchEvent(new CustomEvent("gameConfigUpdated"));
  },

  // Start game
  startGame(timeLimit: number, maxQuotes: number, sessionId?: string, themeId: ThemeId = "classic"): void {
    const config: GameConfig = {
      timeLimit,
      maxQuotes,
      isGameActive: true,
      gameStartTime: Date.now(),
      gameEndTime: Date.now() + timeLimit * 1000,
      sessionId: sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      themeId,
      challengeMode: "normal",
      rapidFireQuestion: null,
      activeHint: null,
    };
    this.setConfig(config);
  },

  // End game
  endGame(): void {
    const config = this.getConfig();
    if (config) {
      config.isGameActive = false;
      this.setConfig(config);
    }
  },

  // Check if game is active
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

  // Get remaining time
  getRemainingTime(): number {
    const config = this.getConfig();
    if (!config || !config.gameEndTime) return 0;
    const remaining = Math.max(0, Math.floor((config.gameEndTime - Date.now()) / 1000));
    return remaining;
  },

  // Subscribe to config changes
  subscribe(callback: (config: GameConfig | null) => void): () => void {
    if (typeof window === "undefined") return () => {};
    
    const handler = () => {
      callback(this.getConfig());
    };

    // Listen for custom events
    window.addEventListener("gameConfigUpdated", handler);

    // Also poll for changes (in case of multiple tabs)
    const interval = setInterval(handler, POLL_INTERVAL);

    // Initial call
    handler();

    // Return unsubscribe function
    return () => {
      window.removeEventListener("gameConfigUpdated", handler);
      clearInterval(interval);
    };
  },

  updateConfig(partial: Partial<GameConfig>): void {
    const current = this.getConfig();
    if (!current) return;
    this.setConfig({ ...current, ...partial });
  },
};

