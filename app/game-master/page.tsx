"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { GameSync, type GameConfig } from "@/lib/gameSync";
import { PlayerScore, type ThemeId, type Phase } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Clock, Users, Settings, Trophy, Play, Square, Zap, Sparkles, Lightbulb, Layout, AlertCircle, Puzzle } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { themeList, getRandomRapidFireQuestion } from "@/data/themes";
import { CustomQuotes, type CustomQuote } from "@/lib/customQuotes";
import { toast } from "sonner";
import { BOARD_LAYOUTS, type BoardLayoutType } from "@/types/boardLayout";
import { RealtimeStore } from "@/lib/realtimeStore";
import { THEME_CONFIG, getThemeConfig } from "@/lib/themeConfig";
import { quotePackages, quotePackagesById, getDefaultQuotePackIds, type QuotePackId } from "@/data/quotePackages";
import {
  DEFAULT_JIGSAW_LAYOUT,
  defaultJigsawLayoutByTheme,
  jigsawLayoutOptions,
  type JigsawLayoutId,
} from "@/lib/jigsawThemes";

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

// Enhanced theme-layout mapping for better synchronization
const themeLayoutMapping: Record<string, BoardLayoutType[]> = {
  classic: ['elephant'],
  science: ['cyberpunk', 'elephant'],
  art: ['enchantedForest', 'elephant'],
  entrepreneurship: ['cyberpunk', 'steampunk', 'elephant']
};

export default function GameMasterPage() {
  const [timeLimit, setTimeLimit] = useState(5); // minutes
  const [maxQuotes, setMaxQuotes] = useState(20);
  const [isGameActive, setIsGameActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("classic");
  const [selectedBoardLayout, setSelectedBoardLayout] = useState<BoardLayoutType>("elephant");
  const [selectedJigsawLayout, setSelectedJigsawLayout] = useState<JigsawLayoutId>(DEFAULT_JIGSAW_LAYOUT);
  const [userManuallySelectedLayout, setUserManuallySelectedLayout] = useState(false);
  const [userManuallySelectedJigsaw, setUserManuallySelectedJigsaw] = useState(false);
  const [gameMode, setGameMode] = useState<'classic' | 'jigsaw'>('classic');
  const [configSnapshot, setConfigSnapshot] = useState<GameConfig | null>(null);
  const hydratedFromConfigRef = useRef(false);
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
  const [previewTheme, setPreviewTheme] = useState(getThemeConfig(selectedTheme));
  const [quoteErrors, setQuoteErrors] = useState<{
    text: string;
    author: string;
  }>({
    text: "",
    author: "",
  });
  const [selectedQuotePacks, setSelectedQuotePacks] = useState<QuotePackId[]>(getDefaultQuotePackIds(selectedTheme));
  const [userManuallySelectedPacks, setUserManuallySelectedPacks] = useState(false);

  useEffect(() => {
    const stopActive = RealtimeStore.subscribeActivePlayers(setActivePlayers);
    const stopLeaderboard = RealtimeStore.subscribeLeaderboard(setLeaderboard);
    return () => {
      stopActive?.();
      stopLeaderboard?.();
    };
  }, []);

  // Filter out stale players (from previous rounds or disconnected clients)
  const filteredActivePlayers = useMemo(() => {
    if (!configSnapshot?.gameStartTime) {
      return activePlayers;
    }
    const cutoff = Date.now() - 15_000;
    return activePlayers.filter(
      (player) => player.startTime >= configSnapshot.gameStartTime! && player.lastUpdate >= cutoff
    );
  }, [activePlayers, configSnapshot?.gameStartTime]);

  const selectedQuotePackDetails = useMemo(
    () => selectedQuotePacks.map((id) => quotePackagesById[id]).filter(Boolean),
    [selectedQuotePacks]
  );
  const selectedJigsawLayoutMeta = useMemo(
    () => jigsawLayoutOptions.find((layout) => layout.id === selectedJigsawLayout),
    [selectedJigsawLayout]
  );
  const activeJigsawLayoutName = useMemo(() => {
    const layoutId = configSnapshot?.jigsawLayout ?? selectedJigsawLayout;
    return jigsawLayoutOptions.find((layout) => layout.id === layoutId)?.name ?? "Aurora Grove";
  }, [configSnapshot?.jigsawLayout, selectedJigsawLayout]);
  const selectedQuotePackCount = selectedQuotePackDetails.reduce(
    (total, pack) => total + (pack?.quotes.length ?? 0),
    0
  );

  useEffect(() => {
    // Subscribe to game config changes
    const unsubscribe = GameSync.subscribe((config) => {
      setConfigSnapshot(config);
      if (!config) {
        setIsGameActive(false);
        setRemainingTime(0);
        return;
      }

      // If game not active, hydrate the GM form from the last saved config once
      // so navigation doesn't reset settings.
      if (!config.isGameActive) {
        setIsGameActive(false);
        setRemainingTime(0);
        if (!hydratedFromConfigRef.current) {
          hydratedFromConfigRef.current = true;
          setTimeLimit(Math.max(1, Math.min(60, Math.round((config.timeLimit ?? 300) / 60))));
          setMaxQuotes(Math.max(4, Math.min(48, config.maxQuotes ?? 20)));
          setSelectedTheme((config.themeId ?? "classic") as ThemeId);
          if (config.boardLayout) {
            const migratedLayout = ['classic', 'alchemist', 'gardener'].includes(config.boardLayout)
              ? 'elephant'
              : config.boardLayout;
            setSelectedBoardLayout(migratedLayout as BoardLayoutType);
          }
          if (config.jigsawLayout) {
            setSelectedJigsawLayout(config.jigsawLayout);
          } else {
            setSelectedJigsawLayout(defaultJigsawLayoutByTheme[(config.themeId ?? "classic") as ThemeId] ?? DEFAULT_JIGSAW_LAYOUT);
          }
          if (config.jigsawMode === "jigsaw" || config.jigsawMode === "classic") {
            setGameMode(config.jigsawMode);
          }
          if (config.sessionName) {
            setSessionName(config.sessionName);
          }
        }
        return;
      }

      // Game is active: enforce synced theme/layout
      setIsGameActive(true);
      setSelectedTheme(config.themeId);

      // Ensure boardLayout is always set for active games (backfill older configs)
      if (!config.boardLayout) {
        const fallbackTheme = themeList.find((t) => t.id === config.themeId);
        const fallbackLayout = fallbackTheme?.boardLayout ?? "elephant";
        GameSync.updateConfig({ boardLayout: fallbackLayout });
        setSelectedBoardLayout(fallbackLayout);
        setUserManuallySelectedLayout(true);
      } else {
        // Migrate old layouts to new ones
        const migratedLayout = ['classic', 'alchemist', 'gardener'].includes(config.boardLayout)
          ? 'elephant'
          : config.boardLayout;
        
        if (migratedLayout !== config.boardLayout) {
          GameSync.updateConfig({ boardLayout: migratedLayout });
        }
        
        setSelectedBoardLayout(migratedLayout);
        setUserManuallySelectedLayout(true);
      }
      if (config?.jigsawLayout) {
        setSelectedJigsawLayout(config.jigsawLayout);
        setUserManuallySelectedJigsaw(true);
      }
    });

    return unsubscribe;
  }, [userManuallySelectedLayout]);

  useEffect(() => {
    if (!configSnapshot) return;
    if (configSnapshot.isGameActive && configSnapshot.quotePackIds) {
      setSelectedQuotePacks(configSnapshot.quotePackIds as QuotePackId[]);
      setUserManuallySelectedPacks(true);
      return;
    }

    if (!configSnapshot.isGameActive) {
      const packs = (configSnapshot.quotePackIds?.length
        ? (configSnapshot.quotePackIds as QuotePackId[])
        : getDefaultQuotePackIds(configSnapshot.themeId ?? selectedTheme));
      if (!userManuallySelectedPacks) {
        setSelectedQuotePacks(packs);
      }
    }
  }, [configSnapshot, selectedTheme, userManuallySelectedPacks]);

  useEffect(() => {
    if (!configSnapshot?.isGameActive && !userManuallySelectedPacks) {
      setSelectedQuotePacks(getDefaultQuotePackIds(selectedTheme));
    }
  }, [selectedTheme, configSnapshot, userManuallySelectedPacks]);

  useEffect(() => {
    if (configSnapshot?.isGameActive) return;
    if (userManuallySelectedJigsaw) return;
    const fallback = defaultJigsawLayoutByTheme[selectedTheme] ?? DEFAULT_JIGSAW_LAYOUT;
    setSelectedJigsawLayout(fallback);
  }, [configSnapshot?.isGameActive, selectedTheme, userManuallySelectedJigsaw]);

  useEffect(() => {
    const unsubscribe = CustomQuotes.subscribe(setCustomQuotes);
    return unsubscribe;
  }, []);

  useEffect(() => {
    setNewQuote((prev) => ({ ...prev, themeId: selectedTheme }));
  }, [selectedTheme]);

  // Update preview immediately when theme changes
  useEffect(() => {
    setPreviewTheme(getThemeConfig(selectedTheme));
  }, [selectedTheme]);

  useEffect(() => {
    if (!configSnapshot?.isGameActive || !configSnapshot.gameEndTime) {
      setRemainingTime(0);
      return;
    }

    const updateTime = () => {
      const remaining = Math.max(0, Math.floor((configSnapshot.gameEndTime! - Date.now()) / 1000));
      setRemainingTime(remaining);
      if (remaining === 0 && configSnapshot.isGameActive) {
        // Timer has expired - properly end the game
        GameSync.endGame();
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

  const handleLayoutChange = (newLayout: BoardLayoutType) => {
    setSelectedBoardLayout(newLayout);
    setUserManuallySelectedLayout(true);

    // Find themes that support this layout
    const compatibleThemes = Object.entries(themeLayoutMapping)
      .filter(([_, layouts]) => layouts.includes(newLayout))
      .map(([themeId, _]) => themeId as ThemeId);

    // If current theme supports this layout, keep it; otherwise switch to first compatible theme
    if (!compatibleThemes.includes(selectedTheme)) {
      const newTheme = compatibleThemes[0];
      if (newTheme) {
        setSelectedTheme(newTheme);
      }
    }

    // Live-sync layout when a game is active so all players switch immediately
    if (configSnapshot?.isGameActive) {
      GameSync.updateConfig({ boardLayout: newLayout });
    }
  };

  const handleJigsawLayoutChange = (newLayout: JigsawLayoutId) => {
    setSelectedJigsawLayout(newLayout);
    setUserManuallySelectedJigsaw(true);
    if (configSnapshot?.isGameActive) {
      GameSync.updateConfig({ jigsawLayout: newLayout, jigsawMode: 'jigsaw' });
    }
  };

  const toggleQuotePack = (packId: QuotePackId) => {
    if (isGameActive) return;
    setUserManuallySelectedPacks(true);
    setSelectedQuotePacks((prev) =>
      prev.includes(packId) ? prev.filter((id) => id !== packId) : [...prev, packId]
    );
  };

  const handleStartGame = async () => {
    const themeDefaultLayout = themeList.find((theme) => theme.id === selectedTheme)?.boardLayout;
    const layoutToUse = userManuallySelectedLayout ? selectedBoardLayout : themeDefaultLayout || selectedBoardLayout;
    const friendlyName = sessionName.trim() || "Current Session";
    const packsToUse = (selectedQuotePacks.length
      ? selectedQuotePacks
      : getDefaultQuotePackIds(selectedTheme)) as QuotePackId[];
    const fallbackJigsawLayout = defaultJigsawLayoutByTheme[selectedTheme] ?? DEFAULT_JIGSAW_LAYOUT;
    const jigsawLayoutToUse = userManuallySelectedJigsaw ? selectedJigsawLayout : fallbackJigsawLayout;
    if (!selectedQuotePacks.length) {
      setSelectedQuotePacks(packsToUse);
    }

    // Optimistically update UI first for immediate feedback
    setIsGameActive(true);

    try {
      // Clear out any stale players from a previous round
      await RealtimeStore.clearActivePlayers();
      setActivePlayers([]);
      GameSync.startGame(
        timeLimit * 60,
        maxQuotes,
        friendlyName,
        selectedTheme,
        layoutToUse,
        gameMode,
        packsToUse,
        jigsawLayoutToUse
      );
      toast.success(`Game session "${friendlyName}" started!`, {
        description: `Theme: ${getThemeConfig(selectedTheme).gameMasterName} • Mode: ${gameMode === 'jigsaw' ? 'Jigsaw' : 'Classic'}`,
      });
    } catch (error) {
      // Revert optimistic update if startGame fails
      setIsGameActive(false);
      toast.error("Failed to start game. Please try again.");
      console.error("Game start failed:", error);
    }
  };

  const handleEndGame = () => {
    const confirmEnd = window.confirm("Are you sure you want to end the game for all players? This will immediately stop their sessions.");
    if (confirmEnd) {
      GameSync.endGame();
      setIsGameActive(false);
      // Reset manual selection flag when game ends so theme defaults apply next time
      setUserManuallySelectedLayout(false);
      setUserManuallySelectedJigsaw(false);
      setUserManuallySelectedPacks(false);
      hydratedFromConfigRef.current = false;
      toast.success("Game session ended.");
    }
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

  // Validation functions
  const validateQuoteText = useCallback((value: string): boolean => {
    if (!value.trim()) {
      setQuoteErrors((prev) => ({ ...prev, text: "Quote text is required" }));
      return false;
    }
    if (value.length > 500) {
      setQuoteErrors((prev) => ({ ...prev, text: "Quote must be 500 characters or less" }));
      return false;
    }
    setQuoteErrors((prev) => ({ ...prev, text: "" }));
    return true;
  }, []);

  const validateQuoteAuthor = useCallback((value: string): boolean => {
    if (!value.trim()) {
      setQuoteErrors((prev) => ({ ...prev, author: "Author name is required" }));
      return false;
    }
    if (value.length > 100) {
      setQuoteErrors((prev) => ({ ...prev, author: "Author name must be 100 characters or less" }));
      return false;
    }
    setQuoteErrors((prev) => ({ ...prev, author: "" }));
    return true;
  }, []);

  const handleAddCustomQuote = () => {
    const isTextValid = validateQuoteText(newQuote.text);
    const isAuthorValid = validateQuoteAuthor(newQuote.author);
    
    if (!isTextValid || !isAuthorValid) {
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
    setQuoteErrors({ text: "", author: "" });
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
    <div className="min-h-screen p-3 sm:p-4 md:p-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-800 flex items-center justify-center gap-2 sm:gap-3">
            <Settings className="w-6 h-6 sm:w-10 sm:h-10" aria-hidden="true" />
            Game Master Control
          </h1>
          <p className="text-sm sm:text-lg text-gray-600">Manage game settings and monitor players</p>
        </header>

        {/* Game Controls */}
        <section className="bg-white border-2 border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl" aria-labelledby="game-settings-heading">
          <h2 id="game-settings-heading" className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            Game Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Time Limit */}
            <div className="space-y-2">
              <label htmlFor="time-limit" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" aria-hidden="true" />
                Time Limit (minutes)
              </label>
              <input
                id="time-limit"
                type="number"
                min="1"
                max="60"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                disabled={isGameActive}
                aria-disabled={isGameActive}
                aria-describedby="time-limit-hint"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
              />
              <p id="time-limit-hint" className="text-xs text-gray-500">1-60 minutes</p>
            </div>

            {/* Number of Quotes */}
            <div className="space-y-2">
              <label htmlFor="max-quotes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" aria-hidden="true" />
                Number of Quotes
              </label>
              <input
                id="max-quotes"
                type="number"
                min="4"
                max="48"
                value={maxQuotes}
                onChange={(e) => setMaxQuotes(Math.max(4, Math.min(48, parseInt(e.target.value) || 4)))}
                disabled={isGameActive}
                aria-disabled={isGameActive}
                aria-describedby="max-quotes-hint"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
              />
              <p id="max-quotes-hint" className="text-xs text-gray-500">4-48 quotes</p>
            </div>

          {/* Theme Selection with Board Layout */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Theme & Board Layout
            </label>
            <div className="flex flex-col gap-3">
              {/* Theme Selection */}
              <div className="flex flex-col md:flex-row gap-3">
                <select
                  value={selectedTheme}
                  onChange={(e) => {
                    const newTheme = e.target.value as ThemeId;
                    setSelectedTheme(newTheme);
                    // Sync to the first available layout for this theme
                    const availableLayouts = themeLayoutMapping[newTheme];
                    if (availableLayouts && availableLayouts.length > 0) {
                      setSelectedBoardLayout(availableLayouts[0]);
                      // Reset manual selection flag when theme changes
                      setUserManuallySelectedLayout(false);
                    }
                  }}
                  disabled={isGameActive}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
                >
                  {Object.values(THEME_CONFIG).map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.gameMasterName}
                    </option>
                  ))}
                </select>
                <div
                  className="flex-1 rounded-lg border-2 border-dashed border-gray-200 p-4 text-sm text-gray-600 bg-gradient-to-r from-gray-50 via-white to-gray-50"
                  style={{ borderColor: previewTheme.badgeColor }}
                >
                  <p className="font-semibold text-gray-800 mb-1">Preview: {previewTheme.gameMasterName}</p>
                  <p>{previewTheme.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Theme ID: {previewTheme.id}
                  </p>
                </div>
              </div>
              
              {/* Board Layout Selection (as part of theme) - Always show all available layouts */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                  <Layout className="w-3 h-3 text-orange-500" />
                  Choose Board Layout Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {Object.values(BOARD_LAYOUTS)
                    .filter((layout) => themeLayoutMapping[selectedTheme]?.includes(layout.type))
                    .map((layout) => {
                    const isSelected = selectedBoardLayout === layout.type;
                    return (
                      <button
                        key={layout.type}
                        type="button"
                        onClick={() => handleLayoutChange(layout.type)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? "border-puzzle-purple bg-puzzle-purple/10 shadow-lg ring-2 ring-puzzle-purple/20"
                            : "border-gray-300 bg-gray-50 hover:border-gray-400"
                        }`}
                      >
                        <div className="font-semibold text-gray-800 text-xs mb-1">
                          {layout.name}
                          {isSelected && " ✓"}
                        </div>
                        <div className="text-[10px] text-gray-600">{layout.description}</div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: <span className="font-semibold">{BOARD_LAYOUTS[selectedBoardLayout].name}</span>
                  {!userManuallySelectedLayout && currentTheme.boardLayout && (
                    <span className="text-gray-400"> (Theme default)</span>
                  )}
                </p>
              </div>

              {gameMode === 'jigsaw' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                    <Puzzle className="w-3 h-3 text-purple-500" />
                    Jigsaw Layout Templates
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {jigsawLayoutOptions.map((layout) => {
                      const isActive = selectedJigsawLayout === layout.id;
                      return (
                        <button
                          key={layout.id}
                          type="button"
                          onClick={() => handleJigsawLayoutChange(layout.id)}
                          className={cn(
                            "rounded-2xl border-2 p-3 text-left transition-all group focus-visible:ring-2 focus-visible:ring-purple-400",
                            isActive
                              ? "border-puzzle-purple bg-puzzle-purple/10 shadow-lg ring-2 ring-puzzle-purple/20"
                              : "border-gray-200 hover:border-puzzle-purple/40"
                          )}
                          aria-pressed={isActive}
                        >
                          <div
                            className="h-24 rounded-xl mb-3 bg-cover bg-center relative overflow-hidden"
                            style={{ backgroundImage: `url(${layout.preview})` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
                            <span className="absolute bottom-2 left-3 text-white text-xs font-semibold flex items-center gap-1">
                              {layout.badgeIcon} {layout.name}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-800">{layout.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{layout.description}</p>
                          <div className="flex items-center gap-1 mt-2">
                            {layout.palette.map((color) => (
                              <span
                                key={`${layout.id}-${color}`}
                                className="h-3 w-3 rounded-full border border-white/40"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          {isActive && (
                            <div className="text-[10px] uppercase text-puzzle-purple font-bold mt-2 flex items-center gap-1">
                              <span className="inline-flex h-2 w-2 rounded-full bg-puzzle-purple animate-pulse" />
                              Active Template
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Selected: <span className="font-semibold">{selectedJigsawLayoutMeta?.name ?? "Aurora Grove"}</span>
                    {!userManuallySelectedJigsaw && (
                      <span className="text-gray-400"> (Theme default)</span>
                    )}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    You can swap jigsaw layouts mid-game and every player board updates instantly. The Pixi jigsaw demo page (/pixi-jigsaw) also syncs with your layout choice.
                  </p>
                </div>
              )}
            </div>

            {/* Jigsaw Puzzle Mode */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Puzzle className="w-4 h-4 text-purple-500" />
                Game Mode
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gameMode"
                    checked={gameMode === 'classic'}
                    onChange={() => setGameMode('classic')}
                    disabled={isGameActive}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Classic Card Sorting</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gameMode"
                    checked={gameMode === 'jigsaw'}
                    onChange={() => setGameMode('jigsaw')}
                    disabled={isGameActive}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Jigsaw Puzzle Mode</span>
                </label>
              </div>
              <p className="text-xs text-gray-500">
                {gameMode === 'jigsaw'
                  ? "Players assemble irregular puzzle pieces on a themed background image"
                  : "Players drag rectangular cards to phase drop zones"}
              </p>
            </div>
            {/* Quote Pack Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-puzzle-purple" />
                Quote Packs
              </label>
              <p className="text-xs text-gray-500">
                Choose the collections of quotes that will appear this round. Recommended packs for the selected theme are highlighted.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {quotePackages.map((pack) => {
                  const isSelected = selectedQuotePacks.includes(pack.id as QuotePackId);
                  const isRecommended = pack.recommendedThemes.includes(selectedTheme);
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => toggleQuotePack(pack.id as QuotePackId)}
                      disabled={isGameActive}
                      className={`text-left border-2 rounded-lg p-3 transition-all ${
                        isSelected
                          ? "border-puzzle-purple bg-puzzle-purple/10 shadow-lg ring-1 ring-puzzle-purple/20"
                          : "border-gray-200 hover:border-gray-400"
                      } ${isGameActive ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
                        <span>{pack.badge ?? "🧩"} {pack.name}</span>
                        {isRecommended && (
                          <span className="text-[10px] uppercase text-sky-600 font-bold">Recommended</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{pack.description}</p>
                      <div className="text-[10px] text-gray-500 mt-2">
                        {pack.quotes.length} quotes
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500">
                Selected:{" "}
                {selectedQuotePackDetails.length
                  ? selectedQuotePackDetails.map((pack) => pack?.name ?? "Unknown").join(", ")
                  : "No packs selected"}
                {" • "}
                {selectedQuotePackCount} quotes in rotation
              </div>
            </div>
          </div>
          </div>

          {/* Session Name */}
          <div className="mb-4 sm:mb-6 space-y-2">
            <label htmlFor="session-name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Settings className="w-4 h-4" aria-hidden="true" />
              Session/Class Name (Optional)
            </label>
            <input
              id="session-name"
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Class A, Session 1, Morning Class"
              disabled={isGameActive}
              aria-disabled={isGameActive}
              aria-describedby="session-name-hint"
              maxLength={100}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
            />
            <p id="session-name-hint" className="text-xs text-gray-500">Leave empty to auto-generate a session ID</p>
          </div>

          {/* Game Status */}
          {isGameActive && (
            <div 
              className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border-2 border-green-500 rounded-lg"
              role="status"
              aria-live="polite"
              aria-label="Game is currently active"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <div className="text-sm text-green-700 font-semibold mb-1">Game Active</div>
                  <div className="text-2xl sm:text-3xl font-bold text-green-700 font-mono">
                    {formatTime(remainingTime * 1000)}
                  </div>
                  <div className="text-xs text-green-600 mt-1">Time Remaining</div>
                  <div className="text-xs text-green-700 mt-2 flex flex-col gap-1">
                    <span>
                      Theme: <span className="font-semibold">{currentTheme.name}</span>
                    </span>
                    {configSnapshot?.boardLayout && (
                      <span>
                        Layout: <span className="font-semibold">{BOARD_LAYOUTS[configSnapshot.boardLayout].name}</span>
                      </span>
                    )}
                    {configSnapshot?.quotePackIds && configSnapshot.quotePackIds.length > 0 && (
                      <span>
                        Quote Packs:{" "}
                        <strong>
                          {configSnapshot.quotePackIds
                            .map((packId) => quotePackagesById[packId as QuotePackId]?.name ?? packId)
                            .join(", ")}
                        </strong>
                      </span>
                    )}
                    {challengeMode !== "normal" && (
                      <span>
                        Challenge:{" "}
                        <strong>
                          {challengeMode === "double-points" ? "Double Points" : "Rapid Fire Quiz"}
                        </strong>
                      </span>
                    )}
                    {configSnapshot?.jigsawMode === "jigsaw" && (
                      <span>
                        Jigsaw Layout:{" "}
                        <span className="font-semibold">{activeJigsawLayoutName}</span>
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleEndGame}
                  variant="destructive"
                  size="lg"
                  className="h-10 sm:h-12 w-full sm:w-auto touch-target"
                  aria-label="End the current game"
                >
                  <Square className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
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
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 sm:h-14 text-base sm:text-lg touch-target"
              aria-label="Start the game session"
            >
              <Play className="w-5 h-5 mr-2" aria-hidden="true" />
              Start Game
            </Button>
          )}

          {/* Game Link */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <div className="text-sm font-semibold text-blue-800 mb-2">Player Link:</div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}/play` : ""}
                className="flex-1 px-3 py-2 rounded border border-blue-300 bg-white text-gray-800 text-sm touch-target"
                aria-label="Player link URL"
              />
              <Button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(`${window.location.origin}/play`);
                    toast.success("Link copied to clipboard!");
                  }
                }}
                variant="outline"
                size="sm"
                className="touch-target"
                aria-label="Copy player link to clipboard"
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-blue-600 mt-2">Share this link with players to join the game</p>
          </div>
        </section>

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
              <div className="space-y-2">
                <label htmlFor="quote-text" className="text-sm font-semibold text-gray-700">
                  Quote <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="quote-text"
                  rows={3}
                  value={newQuote.text}
                  onChange={(e) => {
                    setNewQuote((prev) => ({ ...prev, text: e.target.value }));
                    if (e.target.value.trim()) validateQuoteText(e.target.value);
                  }}
                  onBlur={() => newQuote.text.trim() && validateQuoteText(newQuote.text)}
                  maxLength={500}
                  required
                  aria-required="true"
                  aria-invalid={quoteErrors.text ? "true" : "false"}
                  aria-describedby={quoteErrors.text ? "quote-text-error" : "quote-text-hint"}
                  className={`w-full border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 touch-target ${
                    quoteErrors.text 
                      ? "border-red-400 focus:ring-red-400" 
                      : "border-green-200 focus:ring-green-400"
                  }`}
                  placeholder="Creativity thrives when..."
                />
                {quoteErrors.text ? (
                  <p id="quote-text-error" className="text-sm text-red-600 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {quoteErrors.text}
                  </p>
                ) : (
                  <p id="quote-text-hint" className="text-xs text-gray-500">
                    {newQuote.text.length}/500 characters
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="quote-author" className="text-sm font-semibold text-gray-700">
                  Author <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="quote-author"
                  type="text"
                  value={newQuote.author}
                  onChange={(e) => {
                    setNewQuote((prev) => ({ ...prev, author: e.target.value }));
                    if (e.target.value.trim()) validateQuoteAuthor(e.target.value);
                  }}
                  onBlur={() => newQuote.author.trim() && validateQuoteAuthor(newQuote.author)}
                  maxLength={100}
                  required
                  aria-required="true"
                  aria-invalid={quoteErrors.author ? "true" : "false"}
                  aria-describedby={quoteErrors.author ? "quote-author-error" : "quote-author-hint"}
                  className={`w-full border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 touch-target ${
                    quoteErrors.author 
                      ? "border-red-400 focus:ring-red-400" 
                      : "border-green-200 focus:ring-green-400"
                  }`}
                  placeholder="Author name"
                />
                {quoteErrors.author ? (
                  <p id="quote-author-error" className="text-sm text-red-600 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {quoteErrors.author}
                  </p>
                ) : (
                  <p id="quote-author-hint" className="text-xs text-gray-500">
                    {newQuote.author.length}/100 characters
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="quote-theme" className="text-xs font-semibold text-gray-600">Theme</label>
                  <select
                    id="quote-theme"
                    value={newQuote.themeId}
                    onChange={(e) => setNewQuote((prev) => ({ ...prev, themeId: e.target.value as ThemeId }))}
                    className="w-full border-2 border-green-200 rounded-lg px-3 py-2 touch-target focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    {themeList.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="quote-phase" className="text-xs font-semibold text-gray-600">Phase</label>
                  <select
                    id="quote-phase"
                    value={newQuote.phase}
                    onChange={(e) => setNewQuote((prev) => ({ ...prev, phase: e.target.value as Phase }))}
                    className="w-full border-2 border-green-200 rounded-lg px-3 py-2 capitalize touch-target focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    {phaseOptions.map((phase) => (
                      <option key={phase} value={phase}>
                        {phaseLabels[phase]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button 
                onClick={handleAddCustomQuote} 
                className="w-full touch-target"
                disabled={!!quoteErrors.text || !!quoteErrors.author}
                aria-label="Add custom quote to library"
              >
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

        {/* Active Players */}
        {filteredActivePlayers.length > 0 && (
          <section className="bg-white border-2 border-blue-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl" aria-labelledby="active-players-heading">
            <h2 id="active-players-heading" className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
              Active Players ({filteredActivePlayers.length})
            </h2>
            <div className="space-y-2" role="list" aria-label="List of active players">
              {filteredActivePlayers
                .sort((a, b) => {
                  if (b.points !== a.points) return b.points - a.points;
                  return b.score - a.score;
                })
                .map((player, index) => (
                  <div
                    key={player.name}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-blue-50 border-2 border-blue-200"
                    role="listitem"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-lg sm:text-xl font-bold w-5 sm:w-6">{index + 1}.</span>
                      <div>
                        <div className="font-bold text-base sm:text-lg text-gray-800">{player.name}</div>
                        <div className="text-xs text-gray-600">
                          {player.score} correct • Playing now
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">{player.points}</div>
                      <div className="text-xs text-gray-600">points</div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Leaderboard by Session */}
        <section className="bg-white border-2 border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl" aria-labelledby="leaderboard-heading">
          <h2 id="leaderboard-heading" className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            Final Leaderboard by Session
          </h2>

          {Object.keys(leaderboardBySession).length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
              {activePlayers.length === 0 
                ? "No players yet. Waiting for players to join..."
                : "No completed games yet. Players are still playing..."}
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {Object.entries(leaderboardBySession)
                .sort(([a], [b]) => {
                  // Sort by most recent session first
                  const aTime = Math.max(...leaderboardBySession[a].map(e => e.timestamp));
                  const bTime = Math.max(...leaderboardBySession[b].map(e => e.timestamp));
                  return bTime - aTime;
                })
                .map(([sessionId, entries]) => (
                  <div key={sessionId} className="border-2 border-gray-200 rounded-lg p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-2 sm:mb-3 pb-2 border-b-2 border-gray-300">
                      📚 {getSessionName(sessionId)}
                      <span className="text-xs sm:text-sm font-normal text-gray-500 ml-2">
                        ({entries.length} {entries.length === 1 ? "player" : "players"})
                      </span>
                    </h3>
                    <div className="space-y-2" role="list" aria-label={`Leaderboard for ${getSessionName(sessionId)}`}>
                      {entries.map((entry, index) => {
                        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
                        return (
                          <div
                            key={`${sessionId}-${index}`}
                            className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                              index === 0
                                ? "bg-yellow-50 border-2 border-yellow-400"
                                : index === 1
                                ? "bg-gray-100 border-2 border-gray-400"
                                : index === 2
                                ? "bg-orange-100 border-2 border-orange-400"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                            role="listitem"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span className="text-lg sm:text-xl font-bold w-5 sm:w-6" aria-label={`Rank ${index + 1}`}>{medal}</span>
                              <div>
                                <div className="font-bold text-sm sm:text-base text-gray-800">{entry.name}</div>
                                <div className="text-[10px] sm:text-xs text-gray-600">
                                  {entry.score} correct • {formatTime(entry.time)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg sm:text-xl font-bold text-purple-600">{entry.points}</div>
                              <div className="text-[10px] sm:text-xs text-gray-600">points</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

