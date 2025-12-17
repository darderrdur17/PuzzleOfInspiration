"use client";

import type { PlayerScore } from "@/types/game";
import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

export interface ActivePlayer {
  name: string;
  points: number;
  score: number;
  startTime: number;
  lastUpdate: number;
}

const DEFAULT_SESSION_ID = "default";
const ACTIVE_KEY = "creativity-active-players";
const LEADERBOARD_KEY = "creativity-leaderboard";

const writeLocal = (key: string, value: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(value) }));
};

const readLocal = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
};

export const RealtimeStore = {
  async fetchActivePlayers(): Promise<ActivePlayer[]> {
    if (!isSupabaseConfigured) {
      return readLocal<ActivePlayer[]>(ACTIVE_KEY, []);
    }
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("active_players")
      .select("*")
      .eq("session_id", DEFAULT_SESSION_ID)
      .order("points", { ascending: false });
    if (error) {
      console.error("Supabase fetch active players failed", error);
      return [];
    }
    const players =
      data?.map((p) => ({
        name: p.name,
        points: p.points ?? 0,
        score: p.score ?? 0,
        startTime: p.start_time ?? Date.now(),
        lastUpdate: p.last_update ?? Date.now(),
      })) ?? [];
    writeLocal(ACTIVE_KEY, players);
    return players;
  },

  async upsertActivePlayer(player: ActivePlayer): Promise<void> {
    if (!isSupabaseConfigured) {
      const existing = readLocal<ActivePlayer[]>(ACTIVE_KEY, []).filter((p) => p.name !== player.name);
      const next = [...existing, player];
      writeLocal(ACTIVE_KEY, next);
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("active_players").upsert({
      session_id: DEFAULT_SESSION_ID,
      name: player.name,
      points: player.points,
      score: player.score,
      start_time: player.startTime,
      last_update: player.lastUpdate,
    });
    if (error) {
      console.error("Supabase upsert active player failed", error);
    }
  },

  async removeActivePlayer(name: string): Promise<void> {
    if (!isSupabaseConfigured) {
      const existing = readLocal<ActivePlayer[]>(ACTIVE_KEY, []).filter((p) => p.name !== name);
      writeLocal(ACTIVE_KEY, existing);
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase
      .from("active_players")
      .delete()
      .eq("session_id", DEFAULT_SESSION_ID)
      .eq("name", name);
    if (error) {
      console.error("Supabase remove active player failed", error);
    }
  },

  subscribeActivePlayers(callback: (players: ActivePlayer[]) => void): () => void {
    if (!isSupabaseConfigured) {
      callback(readLocal(ACTIVE_KEY, []));
      const handler = (e: StorageEvent) => {
        if (e.key === ACTIVE_KEY) {
          callback(readLocal(ACTIVE_KEY, []));
        }
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    }

    const supabase = getSupabaseClient();
    if (!supabase) return () => {};

    // Initial fetch
    void this.fetchActivePlayers().then(callback);

    const channel = supabase
      .channel("active-players")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "active_players", filter: `session_id=eq.${DEFAULT_SESSION_ID}` },
        () => {
          void this.fetchActivePlayers().then(callback);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async fetchLeaderboard(): Promise<PlayerScore[]> {
    if (!isSupabaseConfigured) {
      return readLocal<PlayerScore[]>(LEADERBOARD_KEY, []);
    }
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("session_id", DEFAULT_SESSION_ID)
      .order("timestamp", { ascending: false });
    if (error) {
      console.error("Supabase fetch leaderboard failed", error);
      return [];
    }
    const entries =
      data?.map((row) => ({
        name: row.name,
        points: row.points,
        score: row.score,
        time: row.time,
        timestamp: row.timestamp,
        sessionId: row.session_id,
      })) ?? [];
    writeLocal(LEADERBOARD_KEY, entries);
    return entries;
  },

  async addLeaderboardEntry(entry: PlayerScore): Promise<void> {
    if (!isSupabaseConfigured) {
      const next = [...readLocal<PlayerScore[]>(LEADERBOARD_KEY, []), entry];
      writeLocal(LEADERBOARD_KEY, next);
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("leaderboard").insert({
      session_id: entry.sessionId ?? DEFAULT_SESSION_ID,
      name: entry.name,
      points: entry.points,
      score: entry.score,
      time: entry.time,
      timestamp: entry.timestamp,
    });
    if (error) {
      console.error("Supabase add leaderboard entry failed", error);
    }
  },

  subscribeLeaderboard(callback: (entries: PlayerScore[]) => void): () => void {
    if (!isSupabaseConfigured) {
      callback(readLocal(LEADERBOARD_KEY, []));
      const handler = (e: StorageEvent) => {
        if (e.key === LEADERBOARD_KEY) {
          callback(readLocal(LEADERBOARD_KEY, []));
        }
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    }

    const supabase = getSupabaseClient();
    if (!supabase) return () => {};

    void this.fetchLeaderboard().then(callback);

    const channel = supabase
      .channel("leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard", filter: `session_id=eq.${DEFAULT_SESSION_ID}` },
        () => {
          void this.fetchLeaderboard().then(callback);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};




