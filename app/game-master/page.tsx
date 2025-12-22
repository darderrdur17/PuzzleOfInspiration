"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { GameSync, type GameConfig } from "@/lib/gameSync";
import { PlayerScore, type ThemeId, type Phase } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Clock, Users, Settings, Trophy, Play, Square, Zap, Sparkles, Lightbulb, AlertCircle, Puzzle } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { themeList, getRandomRapidFireQuestion } from "@/data/themes";
import { CustomQuotes, type CustomQuote } from "@/lib/customQuotes";
import { toast } from "sonner";
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

export default function GameMasterPage() {
  const [timeLimit, setTimeLimit] = useState(5); // minutes
  const [maxQuotes, setMaxQuotes] = useState(20);
  const [isGameActive, setIsGameActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("classic");
  const [selectedJigsawLayout, setSelectedJigsawLayout] = useState<JigsawLayoutId>(DEFAULT_JIGSAW_LAYOUT);
  const [userManuallySelectedLayout, setUserManuallySelectedLayout] = useState(false);
  const [userManuallySelectedJigsaw, setUserManuallySelectedJigsaw] = useState(false);
  const [gameMode, setGameMode] = useState<'classic' | 'jigsaw'>('jigsaw');
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
          const layoutToUse =
            (config.jigsawLayout as JigsawLayoutId) ||
            defaultJigsawLayoutByTheme[(config.themeId ?? "classic") as ThemeId] ||
            DEFAULT_JIGSAW_LAYOUT;
          setSelectedJigsawLayout(layoutToUse);
          if (config.jigsawMode !== "jigsaw") {
            GameSync.updateConfig({ jigsawMode: "jigsaw" });
          }
          setGameMode("jigsaw");
          if (config.sessionName) {
            setSessionName(config.sessionName);
          }
        }
        return;
      }

      // Game is active: enforce synced theme/layout
      setIsGameActive(true);
      setSelectedTheme(config.themeId);
      if (config.jigsawMode !== "jigsaw") {
        GameSync.updateConfig({ jigsawMode: "jigsaw" });
      }
      setGameMode("jigsaw");
      if (config?.jigsawLayout) {
        setSelectedJigsawLayout(config.jigsawLayout);
        setUserManuallySelectedJigsaw(true);
      } else {
        const fallback =
          defaultJigsawLayoutByTheme[(config.themeId ?? "classic") as ThemeId] || DEFAULT_JIGSAW_LAYOUT;
        GameSync.updateConfig({ jigsawLayout: fallback, boardLayout: fallback });
        setSelectedJigsawLayout(fallback);
      }
    });

    return unsubscribe;
  }, []);

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

  const handleJigsawLayoutChange = (newLayout: JigsawLayoutId) => {
    setSelectedJigsawLayout(newLayout);
    setUserManuallySelectedJigsaw(true);
    if (configSnapshot?.isGameActive) {
      GameSync.updateConfig({ jigsawLayout: newLayout, boardLayout: newLayout, jigsawMode: 'jigsaw' });
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
    const layoutToUse = selectedJigsawLayout;
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
        "jigsaw",
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

  const renderWithShell = (content: React.ReactElement) => (
    <div className="relative min-h-screen quest-body overflow-hidden">
      <div className="quest-ambient" />
      <div className="quest-orb animate-pulse" style={{ top: "12%", left: "8%" }} />
      <div className="quest-orb animate-pulse" style={{ bottom: "10%", right: "6%" }} />
      <div className="relative">{content}</div>
    </div>
  );

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

  return renderWithShell(
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Game Master Control</h1>
          <p>Game master interface coming soon...</p>
            </div>
            </div>
                </div>
  );
}
