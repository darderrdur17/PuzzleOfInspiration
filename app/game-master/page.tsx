"use client";

import { useState, useEffect } from "react";
import { GameSync } from "@/lib/gameSync";
import { PlayerScore } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Clock, Users, Settings, Trophy, Play, Square } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface ActivePlayer {
  name: string;
  points: number;
  score: number;
  startTime: number;
  lastUpdate: number;
}

export default function GameMasterPage() {
  const [timeLimit, setTimeLimit] = useState(5); // minutes
  const [maxQuotes, setMaxQuotes] = useState(20);
  const [isGameActive, setIsGameActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);

  useEffect(() => {
    // Load leaderboard from localStorage (for cross-tab sync) or sessionStorage (fallback)
    const loadLeaderboard = () => {
      const stored = localStorage.getItem("creativity-leaderboard") || sessionStorage.getItem("creativity-leaderboard");
      if (stored) {
        try {
          setLeaderboard(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse leaderboard", e);
        }
      }
    };
    
    // Load active players
    const loadActivePlayers = () => {
      const stored = localStorage.getItem("creativity-active-players");
      if (stored) {
        try {
          const players = JSON.parse(stored);
          // Filter out players who haven't updated in 10 seconds (likely disconnected)
          const now = Date.now();
          const active = players.filter((p: ActivePlayer) => now - p.lastUpdate < 10000);
          setActivePlayers(active);
        } catch (e) {
          console.error("Failed to parse active players", e);
        }
      }
    };
    
    loadLeaderboard();
    loadActivePlayers();
    
    // Listen for updates from other tabs
    const handleUpdate = () => {
      loadLeaderboard();
      loadActivePlayers();
    };
    
    window.addEventListener("leaderboardUpdated", handleUpdate);
    window.addEventListener("activePlayersUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    
    // Also poll for changes as backup
    const interval = setInterval(() => {
      loadLeaderboard();
      loadActivePlayers();
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("leaderboardUpdated", handleUpdate);
      window.removeEventListener("activePlayersUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  useEffect(() => {
    // Subscribe to game config changes
    const unsubscribe = GameSync.subscribe((config) => {
      if (config) {
        setIsGameActive(config.isGameActive);
        if (config.isGameActive && config.gameEndTime) {
          const updateTime = () => {
            const remaining = Math.max(0, Math.floor((config.gameEndTime! - Date.now()) / 1000));
            setRemainingTime(remaining);
            if (remaining === 0) {
              setIsGameActive(false);
            }
          };
          updateTime();
          const interval = setInterval(updateTime, 1000);
          return () => clearInterval(interval);
        }
      } else {
        setIsGameActive(false);
        setRemainingTime(0);
      }
    });

    return unsubscribe;
  }, []);

  const [sessionName, setSessionName] = useState("");

  const handleStartGame = () => {
    const sessionId = sessionName.trim() || `Class-${new Date().toLocaleDateString()}-${Date.now()}`;
    GameSync.startGame(timeLimit * 60, maxQuotes, sessionId);
    setIsGameActive(true);
  };

  const handleEndGame = () => {
    GameSync.endGame();
    setIsGameActive(false);
  };

  // Group leaderboard by session
  const leaderboardBySession = leaderboard.reduce((acc, entry) => {
    const sessionId = entry.sessionId || "unknown";
    if (!acc[sessionId]) {
      acc[sessionId] = [];
    }
    acc[sessionId].push(entry);
    return acc;
  }, {} as Record<string, typeof leaderboard>);

  // Sort each session's leaderboard
  Object.keys(leaderboardBySession).forEach((sessionId) => {
    leaderboardBySession[sessionId].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.score !== a.score) return b.score - a.score;
      return a.time - b.time;
    });
  });

  // Get session names (use sessionId if no name provided)
  const getSessionName = (sessionId: string) => {
    if (sessionId.startsWith("Class-")) {
      return sessionId.replace("Class-", "");
    }
    if (sessionId.startsWith("session-")) {
      return `Session ${sessionId.split("-")[1]}`;
    }
    return sessionId;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <Settings className="w-10 h-10" />
            Game Master Control
          </h1>
          <p className="text-lg text-gray-600">Manage game settings and monitor players</p>
        </div>

        {/* Game Controls */}
        <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Game Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Time Limit */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Limit (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                disabled={isGameActive}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              />
            </div>

            {/* Number of Quotes */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Number of Quotes
              </label>
              <input
                type="number"
                min="4"
                max="48"
                value={maxQuotes}
                onChange={(e) => setMaxQuotes(Math.max(4, Math.min(48, parseInt(e.target.value) || 4)))}
                disabled={isGameActive}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Session Name */}
          <div className="mb-6 space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Session/Class Name (Optional)
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Class A, Session 1, Morning Class"
              disabled={isGameActive}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500">Leave empty to auto-generate a session ID</p>
          </div>

          {/* Game Status */}
          {isGameActive && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-green-700 font-semibold mb-1">Game Active</div>
                  <div className="text-3xl font-bold text-green-700 font-mono">
                    {formatTime(remainingTime * 1000)}
                  </div>
                  <div className="text-xs text-green-600 mt-1">Time Remaining</div>
                </div>
                <Button
                  onClick={handleEndGame}
                  variant="destructive"
                  size="lg"
                  className="h-12"
                >
                  <Square className="w-5 h-5 mr-2" />
                  End Game
                </Button>
              </div>
            </div>
          )}

          {/* Start Button */}
          {!isGameActive && (
            <Button
              onClick={handleStartGame}
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          )}

          {/* Game Link */}
          <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <div className="text-sm font-semibold text-blue-800 mb-2">Player Link:</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}/play` : ""}
                className="flex-1 px-3 py-2 rounded border border-blue-300 bg-white text-gray-800"
              />
              <Button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(`${window.location.origin}/play`);
                  }
                }}
                variant="outline"
                size="sm"
              >
                Copy
              </Button>
            </div>
          </div>
        </div>

        {/* Active Players */}
        {activePlayers.length > 0 && (
          <div className="bg-white border-2 border-blue-300 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Active Players ({activePlayers.length})
            </h2>
            <div className="space-y-2">
              {activePlayers
                .sort((a, b) => {
                  if (b.points !== a.points) return b.points - a.points;
                  return b.score - a.score;
                })
                .map((player, index) => (
                  <div
                    key={player.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border-2 border-blue-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold w-6">{index + 1}.</span>
                      <div>
                        <div className="font-bold text-lg text-gray-800">{player.name}</div>
                        <div className="text-xs text-gray-600">
                          {player.score} correct • Playing now
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{player.points}</div>
                      <div className="text-xs text-gray-600">points</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Leaderboard by Session */}
        <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Final Leaderboard by Session
          </h2>

          {Object.keys(leaderboardBySession).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {activePlayers.length === 0 
                ? "No players yet. Waiting for players to join..."
                : "No completed games yet. Players are still playing..."}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(leaderboardBySession)
                .sort(([a], [b]) => {
                  // Sort by most recent session first
                  const aTime = Math.max(...leaderboardBySession[a].map(e => e.timestamp));
                  const bTime = Math.max(...leaderboardBySession[b].map(e => e.timestamp));
                  return bTime - aTime;
                })
                .map(([sessionId, entries]) => (
                  <div key={sessionId} className="border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-gray-700 mb-3 pb-2 border-b-2 border-gray-300">
                      📚 {getSessionName(sessionId)}
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({entries.length} {entries.length === 1 ? "player" : "players"})
                      </span>
                    </h3>
                    <div className="space-y-2">
                      {entries.map((entry, index) => {
                        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
                        return (
                          <div
                            key={`${sessionId}-${index}`}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              index === 0
                                ? "bg-yellow-50 border-2 border-yellow-400"
                                : index === 1
                                ? "bg-gray-100 border-2 border-gray-400"
                                : index === 2
                                ? "bg-orange-100 border-2 border-orange-400"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl font-bold w-6">{medal}</span>
                              <div>
                                <div className="font-bold text-base text-gray-800">{entry.name}</div>
                                <div className="text-xs text-gray-600">
                                  {entry.score} correct • {formatTime(entry.time)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-purple-600">{entry.points}</div>
                              <div className="text-xs text-gray-600">points</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

