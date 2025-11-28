"use client";

import { useState, useEffect } from "react";
import { GameSync, type GameConfig } from "@/lib/gameSync";
import { PlayerScore, type ThemeId, type Phase } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Clock, Users, Settings, Trophy, Play, Square, Zap, Sparkles, Lightbulb } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { themeList, getRandomRapidFireQuestion } from "@/data/themes";
import { CustomQuotes, type CustomQuote } from "@/lib/customQuotes";
import { toast } from "sonner";

interface ActivePlayer {
  name: string;
  points: number;
  score: number;
  startTime: number;
  lastUpdate: number;
}

const phaseOptions: Phase[] = ["preparation", "incubation", "illumination", "verification"];
const phaseLabels: Record<Phase, string> = {
  preparation: "Preparation",
  incubation: "Incubation",
  illumination: "Illumination",
  verification: "Verification",
};

export default function GameMasterPage() {
  const [timeLimit, setTimeLimit] = useState(5); // minutes
  const [maxQuotes, setMaxQuotes] = useState(20);
  const [isGameActive, setIsGameActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("classic");
  const [configSnapshot, setConfigSnapshot] = useState<GameConfig | null>(null);
  const [customQuotes, setCustomQuotes] = useState<CustomQuote[]>([]);
  const [newQuote, setNewQuote] = useState<{
    text: string;
    author: string;
    phase: Phase;
    themeId: ThemeId;
  }>({
    text: "",
    author: "",
    phase: "preparation",
    themeId: "classic",
  });

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
      setConfigSnapshot(config);
      if (config) {
        setIsGameActive(config.isGameActive);
        setSelectedTheme(config.themeId);
      } else {
        setIsGameActive(false);
        setRemainingTime(0);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = CustomQuotes.subscribe(setCustomQuotes);
    return unsubscribe;
  }, []);

  useEffect(() => {
    setNewQuote((prev) => ({ ...prev, themeId: selectedTheme }));
  }, [selectedTheme]);

  useEffect(() => {
    if (!configSnapshot?.isGameActive || !configSnapshot.gameEndTime) {
      setRemainingTime(0);
      return;
    }

    const updateTime = () => {
      const remaining = Math.max(0, Math.floor((configSnapshot.gameEndTime! - Date.now()) / 1000));
      setRemainingTime(remaining);
      if (remaining === 0) {
        setIsGameActive(false);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [configSnapshot?.gameEndTime, configSnapshot?.isGameActive]);

  const [sessionName, setSessionName] = useState("");

  const currentTheme =
    themeList.find((theme) => theme.id === (configSnapshot?.themeId ?? selectedTheme)) ?? themeList[0];
  const challengeMode = configSnapshot?.challengeMode ?? "normal";
  const activeHint = configSnapshot?.activeHint ?? null;
  const activeRapidFire = configSnapshot?.rapidFireQuestion ?? null;
  const isDoublePointsActive = challengeMode === "double-points";
  const isRapidFireActive = challengeMode === "rapid-fire" && !!activeRapidFire;
  const themeSpecificCustomQuotes = customQuotes.filter((quote) => quote.themeId === selectedTheme);

  const handleStartGame = () => {
    const sessionId = sessionName.trim() || `Class-${new Date().toLocaleDateString()}-${Date.now()}`;
    GameSync.startGame(timeLimit * 60, maxQuotes, sessionId, selectedTheme);
    setIsGameActive(true);
  };

  const handleEndGame = () => {
    GameSync.endGame();
    setIsGameActive(false);
  };

  const handleToggleDoublePoints = () => {
    if (!configSnapshot) return;
    const nextMode = isDoublePointsActive ? "normal" : "double-points";
    GameSync.updateConfig({
      challengeMode: nextMode,
      rapidFireQuestion: nextMode === "double-points" ? null : configSnapshot.rapidFireQuestion,
    });
  };

  const handleLaunchRapidFire = () => {
    if (!configSnapshot) return;
    const question = getRandomRapidFireQuestion(configSnapshot.themeId);
    GameSync.updateConfig({
      challengeMode: "rapid-fire",
      rapidFireQuestion: question,
    });
  };

  const handleEndChallenge = () => {
    if (!configSnapshot) return;
    GameSync.updateConfig({
      challengeMode: "normal",
      rapidFireQuestion: null,
    });
  };

  const handleClearHint = () => {
    if (!configSnapshot || !configSnapshot.activeHint) return;
    GameSync.updateConfig({ activeHint: null });
  };

  const handleAddCustomQuote = () => {
    if (!newQuote.text.trim() || !newQuote.author.trim()) {
      toast.error("Please enter both the quote text and author.");
      return;
    }
    const quote: CustomQuote = {
      id: `custom-${Date.now()}`,
      text: newQuote.text.trim(),
      author: newQuote.author.trim(),
      phase: newQuote.phase,
      themeId: newQuote.themeId,
    };
    CustomQuotes.add(quote);
    toast.success("Custom quote added!");
    setNewQuote((prev) => ({
      ...prev,
      text: "",
      author: "",
    }));
  };

  const handleRemoveCustomQuote = (id: string) => {
    CustomQuotes.remove(id);
    toast.success("Quote removed.");
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

          {/* Theme Selection */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Theme
            </label>
            <div className="flex flex-col md:flex-row gap-3">
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value as ThemeId)}
                disabled={isGameActive}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              >
                {themeList.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
              <div
                className="flex-1 rounded-lg border-2 border-dashed border-gray-200 p-4 text-sm text-gray-600 bg-gradient-to-r from-gray-50 via-white to-gray-50"
                style={{ borderColor: currentTheme.badgeColor }}
              >
                <p className="font-semibold text-gray-800 mb-1">Preview: {currentTheme.name}</p>
                <p>{currentTheme.description}</p>
              </div>
            </div>
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
                <div className="text-xs text-green-700 mt-2 flex flex-col gap-1">
                  <span>
                    Theme: <span className="font-semibold">{currentTheme.name}</span>
                  </span>
                  {challengeMode !== "normal" && (
                    <span>
                      Challenge:{" "}
                      <strong>
                        {challengeMode === "double-points" ? "Double Points" : "Rapid Fire Quiz"}
                      </strong>
                    </span>
                  )}
                </div>
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

        {/* Challenge Controls */}
        <div className="bg-white border-2 border-indigo-200 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            <h2 className="text-2xl font-bold text-gray-800">Challenge Rounds & Power-Ups</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border-2 border-dashed border-indigo-100 rounded-xl bg-indigo-50/40 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Double Points Round</p>
                  <p className="text-xs text-gray-500">
                    Multiply every correct placement like a Kahoot lightning round.
                  </p>
                </div>
                <Lightbulb className={`w-5 h-5 ${isDoublePointsActive ? "text-amber-500" : "text-gray-400"}`} />
              </div>
              <Button onClick={handleToggleDoublePoints} variant={isDoublePointsActive ? "destructive" : "default"}>
                {isDoublePointsActive ? "End Double Points" : "Start Double Points"}
              </Button>
            </div>
            <div className="p-4 border-2 border-dashed border-indigo-100 rounded-xl bg-indigo-50/40 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Rapid-Fire Mini Quiz</p>
                  <p className="text-xs text-gray-500">
                    Push a Kahoot-style question to every player for bonus points.
                  </p>
                </div>
                <Sparkles className={`w-5 h-5 ${isRapidFireActive ? "text-purple-500" : "text-gray-400"}`} />
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={handleLaunchRapidFire} disabled={isRapidFireActive}>
                  {isRapidFireActive ? "Quiz Active" : "Launch Rapid Fire"}
                </Button>
                {isRapidFireActive && (
                  <Button variant="outline" onClick={handleEndChallenge}>
                    End Rapid Fire
                  </Button>
                )}
                {isRapidFireActive && activeRapidFire && (
                  <div className="text-xs text-gray-600 bg-white border border-indigo-100 rounded-lg p-2">
                    <p className="font-semibold text-gray-800 mb-1">Current Question Preview:</p>
                    <p>{activeRapidFire.question}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 border-2 border-dashed border-purple-100 rounded-xl bg-purple-50/40 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Collaborative Hint</p>
                <p className="text-xs text-gray-500">
                  Players can spend points to unlock a shared hint. Clear it when you want a new one.
                </p>
              </div>
              <Button onClick={handleClearHint} variant="outline" disabled={!activeHint}>
                Clear Hint
              </Button>
            </div>
            {activeHint ? (
              <div className="text-sm text-gray-700 bg-white border border-purple-100 rounded-lg p-3">
                <p>
                  <strong>{activeHint.activatedBy}</strong> activated a hint for{" "}
                  <span className="font-semibold capitalize">{activeHint.phase}</span>.
                </p>
                <p className="mt-1 text-gray-600">{activeHint.message}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No active hint right now.</p>
            )}
          </div>
        </div>

        {/* Custom Quotes Manager */}
        <div className="bg-white border-2 border-green-200 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-500" />
                Custom Quote Library
              </h2>
              <p className="text-sm text-gray-500">
                Add unique quotes to keep sessions fresh. They sync instantly with every player.
              </p>
            </div>
            <span className="text-sm font-semibold text-green-700">
              {customQuotes.length} total custom quotes
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Quote</label>
              <textarea
                rows={3}
                value={newQuote.text}
                onChange={(e) => setNewQuote((prev) => ({ ...prev, text: e.target.value }))}
                className="w-full border-2 border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Creativity thrives when..."
              />
              <label className="text-sm font-semibold text-gray-700">Author</label>
              <input
                type="text"
                value={newQuote.author}
                onChange={(e) => setNewQuote((prev) => ({ ...prev, author: e.target.value }))}
                className="w-full border-2 border-green-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Author name"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Theme</label>
                  <select
                    value={newQuote.themeId}
                    onChange={(e) => setNewQuote((prev) => ({ ...prev, themeId: e.target.value as ThemeId }))}
                    className="w-full border-2 border-green-200 rounded-lg px-3 py-2"
                  >
                    {themeList.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Phase</label>
                  <select
                    value={newQuote.phase}
                    onChange={(e) => setNewQuote((prev) => ({ ...prev, phase: e.target.value as Phase }))}
                    className="w-full border-2 border-green-200 rounded-lg px-3 py-2 capitalize"
                  >
                    {phaseOptions.map((phase) => (
                      <option key={phase} value={phase}>
                        {phaseLabels[phase]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button onClick={handleAddCustomQuote} className="w-full">
                Add Quote
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {themeList.find((theme) => theme.id === selectedTheme)?.name || "Selected Theme"} Quotes
                </h3>
                <span className="text-sm text-gray-500">
                  {themeSpecificCustomQuotes.length} for this theme
                </span>
              </div>
              {themeSpecificCustomQuotes.length === 0 ? (
                <div className="text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg p-4">
                  No custom quotes for this theme yet. Add one on the left!
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {themeSpecificCustomQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="border border-gray-200 rounded-lg p-3 text-sm bg-gray-50 flex flex-col gap-2"
                    >
                      <p className="text-gray-800 italic">&ldquo;{quote.text}&rdquo;</p>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>— {quote.author}</span>
                        <span className="font-semibold text-gray-700">{phaseLabels[quote.phase]}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="self-start"
                        onClick={() => handleRemoveCustomQuote(quote.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

