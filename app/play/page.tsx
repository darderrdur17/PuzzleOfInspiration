"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { themeList, themeLibrary } from "@/data/themes";
import {
  Quote,
  PhaseTitle,
  GameState,
  PlayerScore,
  Phase,
  ThemeId,
  ChallengeMode,
} from "@/types/game";
import { GameTheme, gameThemes, getThemeConfig } from "@/lib/gameThemes";
import { StartScreen } from "@/components/StartScreen";
import { EndScreen } from "@/components/EndScreen";
import { QuoteCard } from "@/components/QuoteCard";
import { PuzzlePiece } from "@/components/PuzzlePiece";
import { Timer } from "@/components/Timer";
import { GameGuide } from "@/components/GameGuide";
import { DragDropProvider, DraggableQuote, DraggableTitle } from "@/components/DragDropProvider";
import { JigsawBoard } from "@/components/JigsawBoard";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameSync } from "@/lib/gameSync";
import { CustomQuotes } from "@/lib/customQuotes";
import { playSuccessTone, playErrorTone, playAlertTone } from "@/lib/soundboard";
import { toast } from "sonner";
import { Zap, Palette } from "lucide-react";
import { RealtimeStore } from "@/lib/realtimeStore";
import { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { quotePackagesById, getDefaultQuotePackIds, type QuotePackId } from "@/data/quotePackages";
import {
  DEFAULT_JIGSAW_LAYOUT,
  defaultJigsawLayoutByTheme,
  jigsawThemeConfigs,
  type JigsawLayoutId,
} from "@/lib/jigsawThemes";
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Flame, Target, XCircle } from 'lucide-react';

const phaseTitles: PhaseTitle[] = [
  { id: "title-preparation", title: "Preparation", phase: "preparation" },
  { id: "title-incubation", title: "Incubation", phase: "incubation" },
  { id: "title-illumination", title: "Illumination", phase: "illumination" },
  { id: "title-verification", title: "Verification", phase: "verification" },
];

const themeToWorld: Record<ThemeId, GameTheme> = {
  classic: "ui",
  science: "alchemist",
  art: "gardener",
  entrepreneurship: "explorer",
};

const deriveGameTheme = (themeId: ThemeId): GameTheme => {
  return themeToWorld[themeId] || "observatory";
};

const dedupeQuotes = (quotes: Quote[]): Quote[] => {
  const seen = new Map<string, Quote>();
  quotes.forEach((quote) => {
    const key = `${quote.text.trim().toLowerCase()}::${(quote.author ?? "").trim().toLowerCase()}`;
    if (!seen.has(key)) {
      seen.set(key, quote);
    }
  });
  return Array.from(seen.values());
};

const getQuotesFromPackIds = (packIds: string[] | undefined, themeId: ThemeId): Quote[] => {
  const fallbackIds = packIds?.length ? packIds : getDefaultQuotePackIds(themeId);
  const uniqueIds = Array.from(new Set(fallbackIds));
  return uniqueIds.flatMap((id) => quotePackagesById[id as QuotePackId]?.quotes ?? []);
};

const mulberry32 = (seed: number) => {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

const shuffleWithSeed = (items: Quote[], seed: number): Quote[] => {
  const random = mulberry32(seed);
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Scoring constants
const POINTS_CORRECT_QUOTE = 120;
const POINTS_CORRECT_TITLE = 150;
const POINTS_USER_PIECE = 140;
const POINTS_PENALTY_WRONG = -20; // Penalty for wrong placement
const STREAK_BONUS_STEP = 15;
const STREAK_MILESTONE = 5;
const STREAK_MILESTONE_BONUS = 75;
const COMPLETION_BONUS = 200;
const STREAK_FINISH_BONUS = 25;
const ACCURACY_BONUS_PER_PERCENT = 2;
const SPEED_BONUS_MULTIPLIER = 0.1; // Bonus points per second saved
const HINT_COST = 15;
const QUIZ_BONUS_POINTS = 20;
const PHASE_ORDER: Phase[] = ["preparation", "incubation", "illumination", "verification"];
const PHASE_LABELS: Record<Phase, string> = {
  preparation: "Preparation",
  incubation: "Incubation",
  illumination: "Illumination",
  verification: "Verification",
};
const EMPTY_STREAKS: Record<Phase, number> = {
  preparation: 0,
  incubation: 0,
  illumination: 0,
  verification: 0,
};

export default function PlayPage() {
  const [gameState, setGameState] = useState<GameState>({
    isStarted: false,
    isCompleted: false,
    startTime: null,
    endTime: null,
    userAnswer: "",
    placements: {},
    titlePlacements: {},
    points: 0,
  });

  const [playerName, setPlayerName] = useState("");
  const [puzzleQuotes, setPuzzleQuotes] = useState<Quote[]>([]);
  const [availableQuotes, setAvailableQuotes] = useState<Quote[]>([]);
  const [availableTitles, setAvailableTitles] = useState<PhaseTitle[]>([]);
  const [placedQuotes, setPlacedQuotes] = useState<Record<string, Quote[]>>({
    preparation: [],
    incubation: [],
    illumination: [],
    verification: [],
  });
  const [placedTitles, setPlacedTitles] = useState<Record<string, PhaseTitle | null>>({
    preparation: null,
    incubation: null,
    illumination: null,
    verification: null,
  });
  const [draggedQuote, setDraggedQuote] = useState<Quote | null>(null);
  const [draggedTitle, setDraggedTitle] = useState<PhaseTitle | null>(null);
  const [highlightedZone, setHighlightedZone] = useState<Phase | null>(null);
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [userPuzzlePiece, setUserPuzzlePiece] = useState<Quote | null>(null);
  const [gameConfig, setGameConfig] = useState<ReturnType<typeof GameSync.getConfig>>(null);
  const [themeId, setThemeId] = useState<ThemeId>("classic");
  const [gameTheme, setGameTheme] = useState<GameTheme>("observatory");
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [phaseStreaks, setPhaseStreaks] = useState<Record<Phase, number>>(() => ({ ...EMPTY_STREAKS }));
  const [comboCounter, setComboCounter] = useState(0);
  const [bonusAdjustments, setBonusAdjustments] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastEvent, setLastEvent] = useState<{ type: 'hit' | 'miss' | 'complete'; delta: number; streak?: number } | null>(null);
  const [selectedHintPhase, setSelectedHintPhase] = useState<Phase>("preparation");
  const [answeredQuizzes, setAnsweredQuizzes] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(sessionStorage.getItem("creativity-rapid-fire") || "[]");
    } catch {
      return [];
    }
  });

  const activeTheme = themeLibrary[themeId] ?? themeLibrary.classic;
  const activeHint = gameConfig?.activeHint ?? null;
  const isJigsawMode = gameConfig?.jigsawMode === 'jigsaw';
  const resolvedJigsawLayout: JigsawLayoutId =
    (gameConfig?.jigsawLayout as JigsawLayoutId) ??
    defaultJigsawLayoutByTheme[(gameConfig?.themeId ?? themeId) as ThemeId] ??
    DEFAULT_JIGSAW_LAYOUT;
  const activeJigsawName = jigsawThemeConfigs[resolvedJigsawLayout]?.name ?? "Aurora Grove";

  // Memoized component callbacks for drag and drop - must be defined before any conditional returns
  const quoteComponent = useCallback(({ quote, isDragging }: { quote: Quote; isDragging?: boolean }) => {
    // If it's a jigsaw piece, we want to render it with a clip-path if we're in jigsaw mode
    const isJigsawPiece = gameConfig?.jigsawMode === 'jigsaw';
    if (isJigsawPiece) {
      // Get the jigsaw layout config to determine piece variant and shape
      const layoutConfig = jigsawThemeConfigs[resolvedJigsawLayout];

      // Find the shape for this quote (use all available quotes for consistent indexing)
      const allQuotes = [...puzzleQuotes, ...(userPuzzlePiece ? [userPuzzlePiece] : [])];
      const index = allQuotes.findIndex(q => q.id === quote.id);
      const shapeId = `jigsaw-${((index % 3) + 1)}`;

      return (
        <div
          style={{
            width: '180px',
            height: '120px',
            clipPath: `url(#${shapeId})`,
          }}
          className="shadow-2xl"
          role="button"
          aria-label={`Drag ${quote.text.substring(0, 20)}... to a phase zone`}
          tabIndex={0}
        >
          <PuzzlePiece
            quote={quote}
            isDragging={isDragging}
            size="small"
            variant={layoutConfig.pieceVariant}
          />
        </div>
      );
    }
    return <PuzzlePiece quote={quote} isDragging={isDragging} />;
  }, [gameConfig?.jigsawMode, resolvedJigsawLayout, puzzleQuotes, userPuzzlePiece]);

  const titleComponent = useCallback(({ title, isDragging }: { title: PhaseTitle; isDragging?: boolean }) => (
    <div
      className={`bg-accent/30 border-2 border-accent rounded-lg p-2 sm:p-3 text-center font-bold text-xs sm:text-sm hover:bg-accent/40 transition-colors ${isDragging ? 'opacity-50' : ''}`}
      role="button"
      aria-label={`Drag ${title.title} title to a phase zone`}
      tabIndex={0}
    >
      {title.title}
    </div>
  ), []);

  const resolvedGameTheme = deriveGameTheme(gameConfig?.themeId ?? themeId);
  const visualTheme = gameConfig ? resolvedGameTheme : gameTheme;
  const themeConfig = getThemeConfig(visualTheme);
  const sessionQuotePackIds = useMemo(() => {
    if (gameConfig?.quotePackIds?.length) {
      return gameConfig.quotePackIds as QuotePackId[];
    }
    return getDefaultQuotePackIds(gameConfig?.themeId ?? themeId);
  }, [gameConfig?.quotePackIds, gameConfig?.themeId, themeId]);
  const sessionQuotePackNames = sessionQuotePackIds
    .map((id) => quotePackagesById[id as QuotePackId]?.name ?? "Classic Core");
  const [scoreFlash, setScoreFlash] = useState(false);
  const [comboGlow, setComboGlow] = useState(false);
  const challengeModeRef = useRef<ChallengeMode | null>(null);
  const rapidFireRef = useRef<string | null>(null);
  const hintRef = useRef<string | null>(null);

  useEffect(() => {
    const stopLeaderboard = RealtimeStore.subscribeLeaderboard(setLeaderboard);

    const unsubscribe = GameSync.subscribe((config) => {
      setGameConfig(config);
      
      // Auto-end game when time runs out or game master ends it
      if (!config?.isGameActive && gameState.isStarted && !gameState.isCompleted) {
        handleGameEnd();
      }

      // Backfill missing board layout so players don't fall back to theme defaults
      if (config && !config.boardLayout) {
        const themeDef = themeLibrary[config.themeId] ?? themeLibrary.classic;
        const fallbackLayout =
          defaultJigsawLayoutByTheme[(config.themeId as ThemeId) ?? "classic"] ?? DEFAULT_JIGSAW_LAYOUT;
        GameSync.updateConfig({ boardLayout: fallbackLayout });
      }
      
      // Migrate legacy layouts to the default jigsaw template
      if (
        config &&
        config.boardLayout &&
        ['classic', 'alchemist', 'gardener', 'cyberpunk', 'enchantedForest', 'steampunk', 'elephant'].includes(
          config.boardLayout as string
        )
      ) {
        GameSync.updateConfig({ boardLayout: DEFAULT_JIGSAW_LAYOUT });
      }
    });

    return () => {
      stopLeaderboard?.();
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.isStarted, gameState.isCompleted]);

  // Check for game end due to time limit
  useEffect(() => {
    if (gameState.isStarted && !gameState.isCompleted && gameConfig?.isGameActive) {
      const checkInterval = setInterval(() => {
        const remaining = GameSync.getRemainingTime();
        if (remaining <= 0) {
          handleGameEnd();
        }
      }, 1000);

      return () => clearInterval(checkInterval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.isStarted, gameState.isCompleted, gameConfig]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("creativity-rapid-fire", JSON.stringify(answeredQuizzes));
  }, [answeredQuizzes]);

  useEffect(() => {
    if (!gameConfig) return;
    const resolved = deriveGameTheme(gameConfig.themeId ?? themeId);
    if (resolved !== gameTheme) {
      setGameTheme(resolved);
    }
  }, [gameConfig, themeId, gameTheme]);

  useEffect(() => {
    if (!gameState.isStarted) return;
    setScoreFlash(true);
    const timer = setTimeout(() => setScoreFlash(false), 400);
    return () => clearTimeout(timer);
  }, [gameState.points, gameState.isStarted]);

  useEffect(() => {
    if (comboCounter === 0) {
      setComboGlow(false);
      return;
    }
    setComboGlow(true);
    const timer = setTimeout(() => setComboGlow(false), 500);
    return () => clearTimeout(timer);
  }, [comboCounter]);

  useEffect(() => {
    if (!lastEvent) return;
    const timer = setTimeout(() => setLastEvent(null), 1800);
    return () => clearTimeout(timer);
  }, [lastEvent]);

  useEffect(() => {
    if (gameConfig?.themeId) {
      setThemeId(gameConfig.themeId);
    }
    // Sync layout from game config (cross-device sync) via jigsaw layout
  }, [gameConfig?.themeId, gameConfig?.boardLayout]);

  useEffect(() => {
    const currentMode = gameConfig?.challengeMode ?? "normal";
    if (challengeModeRef.current && challengeModeRef.current !== currentMode) {
      playAlertTone();
    }
    challengeModeRef.current = currentMode;
  }, [gameConfig?.challengeMode]);

  useEffect(() => {
    const currentRapid = gameConfig?.rapidFireQuestion?.id || null;
    if (currentRapid && currentRapid !== rapidFireRef.current) {
      playAlertTone();
    }
    rapidFireRef.current = currentRapid;
  }, [gameConfig?.rapidFireQuestion?.id]);

  useEffect(() => {
    const hintId = gameConfig?.activeHint?.id || null;
    if (hintId && hintId !== hintRef.current) {
      playAlertTone();
    }
    hintRef.current = hintId;
  }, [gameConfig?.activeHint?.id]);

  const handleStart = async (name: string, answer: string, theme?: GameTheme) => {
    // Force refresh the config from server to avoid stale state issues
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure state is current

    const config = GameSync.getConfig();
    if (!config || !config.isGameActive) {
      toast.error("Game master has not started the game yet!");
      return;
    }

    // Additional validation: check if timer has expired
    const remainingTime = GameSync.getRemainingTime();
    if (remainingTime <= 0) {
      toast.error("The game session has expired. Please wait for the Game Master to start a new game.");
      return;
    }

    const activeThemeId = config.themeId ?? "classic";
    const themeDefinition = themeLibrary[activeThemeId] ?? themeLibrary.classic;
    const resolvedTheme = deriveGameTheme(activeThemeId);
    const themeConfig = getThemeConfig(resolvedTheme);
    const gameJigsawMode = config.jigsawMode === 'jigsaw';

    // Use theme-specific quotes mixed with general quotes
    const customQuotes = CustomQuotes.byTheme(activeThemeId);
    const packQuotes = getQuotesFromPackIds(config.quotePackIds, activeThemeId);
    const themeQuotes = themeConfig.quotes.map(q => ({
      id: q.id,
      text: q.text,
      author: q.author,
      phase: ["preparation", "incubation", "illumination", "verification"][q.phase - 1] as Phase
    }));

    const quotePool = dedupeQuotes([...packQuotes, ...customQuotes, ...themeQuotes]);
    const shuffleSeed = config.gameStartTime ?? Date.now();
    const shuffled = shuffleWithSeed(quotePool, shuffleSeed);
    const requested = Math.max(4, config.maxQuotes - 4);
    const sliceCount = Math.min(requested, quotePool.length);
    const selectedQuotes = shuffled.slice(0, sliceCount); // -4 reserved for titles

    const userQuote: Quote = {
      id: "user-answer",
      text: answer,
      author: name,
      phase: "incubation",
    };

    setPlayerName(name);
    setThemeId(activeThemeId);
    setGameTheme(resolvedTheme);
    setUserPuzzlePiece(userQuote);
    setPuzzleQuotes(selectedQuotes);
    setAvailableQuotes(selectedQuotes);
    setAvailableTitles([...phaseTitles]);

    // Timer starts NOW when player begins the game (after game master started)
    const gameStartTime = Date.now();
    setGameState({
      isStarted: true,
      isCompleted: false,
      startTime: gameStartTime,
      endTime: null,
      userAnswer: answer,
      placements: {},
      titlePlacements: {},
      points: 0,
    });
    setWrongAttempts(0);
    setPhaseStreaks({ ...EMPTY_STREAKS });
    setComboCounter(0);
    setBonusAdjustments(0);
    setBestStreak(0);
    setAnsweredQuizzes([]);
    setSelectedHintPhase("preparation");

    // Register as active player with game start time
    const activePlayer = {
      name,
      points: 0,
      score: 0,
      startTime: gameStartTime,
      lastUpdate: gameStartTime,
    };
    void RealtimeStore.upsertActivePlayer(activePlayer);

    toast.success(`Welcome to ${themeConfig.name}! Drag titles and quotes to the correct phases.`);
  };

  const calculateCorrectCount = useCallback((): number => {
    const correctQuotes = puzzleQuotes.reduce((count, quote) => {
      return count + (gameState.placements[quote.id] === quote.phase ? 1 : 0);
    }, 0);

    const correctTitles = phaseTitles.reduce((count, title) => {
      return count + (gameState.titlePlacements[title.id] === title.phase ? 1 : 0);
    }, 0);

    const userPiece = gameState.placements["user-answer"] === "incubation" ? 1 : 0;

    return correctQuotes + correctTitles + userPiece;
  }, [gameState.placements, gameState.titlePlacements, puzzleQuotes]);

  const calculatePoints = useCallback((): number => {
    const multiplier = gameConfig?.challengeMode === "double-points" ? 2 : 1;
    const quotePoints = puzzleQuotes.reduce((total, quote) => {
      return total + (gameState.placements[quote.id] === quote.phase ? POINTS_CORRECT_QUOTE : 0);
    }, 0);

    const titlePoints = phaseTitles.reduce((total, title) => {
      return total + (gameState.titlePlacements[title.id] === title.phase ? POINTS_CORRECT_TITLE : 0);
    }, 0);

    const userPiecePoints = gameState.placements["user-answer"] === "incubation" ? POINTS_USER_PIECE : 0;
    const penaltyPoints = wrongAttempts * POINTS_PENALTY_WRONG;
    const base = (quotePoints + titlePoints + userPiecePoints) * multiplier;

    return Math.max(0, base + penaltyPoints + bonusAdjustments);
  }, [
    gameConfig?.challengeMode,
    gameState.placements,
    gameState.titlePlacements,
    puzzleQuotes,
    wrongAttempts,
    bonusAdjustments,
  ]);

  const calculateFinalPoints = useCallback((totalTime: number): number => {
    const basePoints = calculatePoints();
    const correctCount = calculateCorrectCount();
    const attempts = correctCount + wrongAttempts;
    const accuracyPct = attempts ? Math.round((correctCount / attempts) * 100) : 100;

    const streakFinishBonus = bestStreak * STREAK_FINISH_BONUS;
    const accuracyBonus = accuracyPct * ACCURACY_BONUS_PER_PERCENT;
    const completionBonus = correctCount > 0 ? COMPLETION_BONUS : 0;

    let total = basePoints + accuracyBonus + streakFinishBonus + completionBonus;

    // Speed bonus: faster completion = more bonus points
    // Game master controls the official timing through timeLimit
    const config = GameSync.getConfig();
    if (config?.timeLimit) {
      // Game master has set a time limit - use it for speed bonus calculation
      const maxTime = config.timeLimit * 1000;
      const timeSaved = Math.max(0, maxTime - totalTime);
      const speedBonus = Math.floor(timeSaved * SPEED_BONUS_MULTIPLIER / 1000);
      total += speedBonus;
    }

    // No game master time limit - return base points only
    return Math.max(0, total);
  }, [calculatePoints, calculateCorrectCount, bestStreak, wrongAttempts]);

  const renderWithShell = (content: JSX.Element) => (
    <div className="relative min-h-screen quest-body overflow-hidden">
      <div className="quest-ambient" />
      <div className="quest-orb animate-pulse" style={{ top: "10%", left: "8%" }} />
      <div className="quest-orb animate-pulse" style={{ bottom: "12%", right: "6%" }} />
      <div className="relative">{content}</div>
    </div>
  );

  const recordCorrectPlacement = useCallback(
    (phase: Phase) => {
      playSuccessTone();
      const multiplier = gameConfig?.challengeMode === "double-points" ? 2 : 1;
      setPhaseStreaks((prev) => ({
        ...prev,
        [phase]: prev[phase] + 1,
      }));
      setComboCounter((prev) => {
        const next = prev + 1;
        const streakReward = next * STREAK_BONUS_STEP * multiplier;
        const milestoneReward = next % STREAK_MILESTONE === 0 ? STREAK_MILESTONE_BONUS * multiplier : 0;
        setBonusAdjustments((adj) => adj + streakReward + milestoneReward);
        setBestStreak((best) => Math.max(best, next));
        if (milestoneReward > 0) {
          toast.success(`Streak ${next}x! +${streakReward + milestoneReward} bonus`);
          setLastEvent({ type: 'hit', delta: streakReward + milestoneReward, streak: next });
        }
        return next;
      });
    },
    [gameConfig?.challengeMode]
  );

  const recordWrongPlacement = useCallback((phase?: Phase) => {
    if (phase) {
      setPhaseStreaks((prev) => ({
        ...prev,
        [phase]: 0,
      }));
    }
    setComboCounter(0);
  }, []);

  const registerWrongAttempt = useCallback(
    (phase?: Phase) => {
      playErrorTone();
      setWrongAttempts((prev) => prev + 1);
      recordWrongPlacement(phase);
    },
    [recordWrongPlacement]
  );

  const handleGameEnd = useCallback(() => {
    if (gameState.isCompleted) return;

    const endTime = Date.now();
    const totalTime = endTime - (gameState.startTime || endTime);
    const finalPoints = calculateFinalPoints(totalTime);

    const correctCount = calculateCorrectCount();

    const sessionId = gameConfig?.sessionId || `session-${Date.now()}`;
    const newScore: PlayerScore = {
      name: playerName,
      score: correctCount,
      points: finalPoints,
      time: totalTime,
      timestamp: Date.now(),
      sessionId,
    };

          // Remove from active players and push leaderboard to Supabase
          void RealtimeStore.removeActivePlayer(playerName);

          setLeaderboard((prev) => {
            const updated = [...prev, newScore].sort((a, b) => {
              if (b.points !== a.points) return b.points - a.points;
              if (b.score !== a.score) return b.score - a.score;
              return a.time - b.time;
            });
            void RealtimeStore.addLeaderboardEntry(newScore);
            return updated;
          });

    setGameState((prev) => ({
      ...prev,
      isCompleted: true,
      endTime,
      points: finalPoints,
    }));

    toast.success(`Time's up! Final score: ${finalPoints} points!`);
  }, [gameState.isCompleted, gameState.startTime, playerName, calculateFinalPoints, calculateCorrectCount, gameConfig?.sessionId]);

  // Recalculate points whenever placements change to ensure accuracy
  // Note: Intentionally omit gameState.points from deps to prevent infinite loops
  useEffect(() => {
    if (!gameState.isStarted) return;
    const recalculatedPoints = calculatePoints();
    // Use a more precise comparison to avoid floating point issues
    if (Math.abs(recalculatedPoints - gameState.points) > 0.01) {
      setGameState((prev) => ({
        ...prev,
        points: recalculatedPoints,
      }));
    }
  }, [gameState.isStarted, calculatePoints, gameState.placements, gameState.titlePlacements, wrongAttempts, bonusAdjustments]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update active player status in real-time
  useEffect(() => {
    if (gameState.isStarted && !gameState.isCompleted && playerName) {
      const updateActivePlayer = () => {
        const correctCount = calculateCorrectCount();
        void RealtimeStore.upsertActivePlayer({
          name: playerName,
          points: gameState.points,
          score: correctCount,
          startTime: gameState.startTime || Date.now(),
          lastUpdate: Date.now(),
        });
      };
      
      updateActivePlayer();
      const interval = setInterval(updateActivePlayer, 2000); // Update every 2 seconds
      return () => clearInterval(interval);
    }
  }, [gameState.points, gameState.placements, gameState.titlePlacements, gameState.isStarted, gameState.isCompleted, playerName, gameState.startTime, calculateCorrectCount]);

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over if needed
  };

  const handleTitleSelect = (title: PhaseTitle) => {
    // Handle title selection
    console.log('Selected title:', title);
  };

  // Calculate current phase streak
  const phaseStreak = Math.max(...Object.values(phaseStreaks));


  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;

    if (data?.type === 'quote') {
      setDraggedQuote(data.quote);
      setDraggedTitle(null);
    } else if (data?.type === 'title') {
      setDraggedTitle(data.title);
      setDraggedQuote(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const data = active.data.current;

    if (over && data) {
      const dropZoneData = over.data.current;
      if (dropZoneData?.type === 'drop-zone') {
        const phase = dropZoneData.phase as Phase;

        if (data.type === 'quote') {
          handleDrop(phase);
        } else if (data.type === 'title') {
          // Handle title drop
          const isCorrect = data.title.phase === phase;

          if (isCorrect) {
            // Correct placement - keep it there
            setAvailableTitles((prev) => prev.filter((t) => t.id !== data.title.id));

            setPlacedTitles((prev) => {
              const newPlacements = { ...prev };
              Object.keys(newPlacements).forEach((key) => {
                if (newPlacements[key]?.id === data.title.id) {
                  newPlacements[key] = null;
                }
              });
              newPlacements[phase] = data.title;
              return newPlacements;
            });

            setGameState((prev) => ({
              ...prev,
              titlePlacements: {
                ...prev.titlePlacements,
                [data.title.id]: phase,
              },
            }));

            const projectedStreak = comboCounter + 1;
            const streakBonus = projectedStreak * STREAK_BONUS_STEP * (gameConfig?.challengeMode === "double-points" ? 2 : 1);
            const milestoneBonus =
              projectedStreak % STREAK_MILESTONE === 0
                ? STREAK_MILESTONE_BONUS * (gameConfig?.challengeMode === "double-points" ? 2 : 1)
                : 0;
            toast.success(`Correct! +${POINTS_CORRECT_TITLE + streakBonus + milestoneBonus} points`);
            setLastEvent({ type: 'hit', delta: POINTS_CORRECT_TITLE + streakBonus + milestoneBonus, streak: projectedStreak });
            recordCorrectPlacement(data.title.phase);
          } else {
            // Wrong placement - return to available titles
            toast.error(`Wrong placement! -${Math.abs(POINTS_PENALTY_WRONG)} points. Try again!`);
            setLastEvent({ type: 'miss', delta: -Math.abs(POINTS_PENALTY_WRONG) });

            // Remove from any previous placement
            setPlacedTitles((prev) => {
              const newPlacements = { ...prev };
              Object.keys(newPlacements).forEach((key) => {
                if (newPlacements[key]?.id === data.title.id) {
                  newPlacements[key] = null;
                }
              });
              return newPlacements;
            });

            setGameState((prev) => {
              const newTitlePlacements = { ...prev.titlePlacements };
              delete newTitlePlacements[data.title.id];
              return {
                ...prev,
                titlePlacements: newTitlePlacements,
              };
            });

            registerWrongAttempt(phase);
          }
        }
      }
    }

    setDraggedQuote(null);
    setDraggedTitle(null);
    setHighlightedZone(null);
  };

  const handleDrop = (phase: Phase) => {
    if (draggedTitle) {
      const isCorrect = draggedTitle.phase === phase;
      
      if (isCorrect) {
        // Correct placement - keep it there
        setAvailableTitles((prev) => prev.filter((t) => t.id !== draggedTitle.id));

        setPlacedTitles((prev) => {
          const newPlacements = { ...prev };
          Object.keys(newPlacements).forEach((key) => {
            if (newPlacements[key]?.id === draggedTitle.id) {
              newPlacements[key] = null;
            }
          });
          newPlacements[phase] = draggedTitle;
          return newPlacements;
        });

        setGameState((prev) => ({
          ...prev,
          titlePlacements: {
            ...prev.titlePlacements,
            [draggedTitle.id]: phase,
          },
        }));

        const projectedStreak = comboCounter + 1;
        const streakBonus = projectedStreak * STREAK_BONUS_STEP * (gameConfig?.challengeMode === "double-points" ? 2 : 1);
        const milestoneBonus =
          projectedStreak % STREAK_MILESTONE === 0
            ? STREAK_MILESTONE_BONUS * (gameConfig?.challengeMode === "double-points" ? 2 : 1)
            : 0;
        toast.success(`Correct! +${POINTS_CORRECT_TITLE + streakBonus + milestoneBonus} points`);
        recordCorrectPlacement(draggedTitle.phase);
      } else {
        // Wrong placement - return to available titles
        toast.error(`Wrong placement! -${Math.abs(POINTS_PENALTY_WRONG)} points. Try again!`);
        setLastEvent({ type: 'miss', delta: -Math.abs(POINTS_PENALTY_WRONG) });

        // Remove from any previous placement
        setPlacedTitles((prev) => {
          const newPlacements = { ...prev };
          Object.keys(newPlacements).forEach((key) => {
            if (newPlacements[key]?.id === draggedTitle.id) {
              newPlacements[key] = null;
            }
          });
          return newPlacements;
        });

        setGameState((prev) => {
          const newTitlePlacements = { ...prev.titlePlacements };
          delete newTitlePlacements[draggedTitle.id];
          return {
            ...prev,
            titlePlacements: newTitlePlacements,
          };
        });

        registerWrongAttempt(phase);
      }

      setDraggedTitle(null);
      setHighlightedZone(null);
      return;
    }

    if (!draggedQuote) return;

    const isCorrect = draggedQuote.phase === phase;

    if (isCorrect) {
      // Correct placement - keep it there
      setAvailableQuotes((prev) => prev.filter((q) => q.id !== draggedQuote.id));

      setPlacedQuotes((prev) => {
        const newPlacements = { ...prev };
        Object.keys(newPlacements).forEach((key) => {
          newPlacements[key] = newPlacements[key].filter((q) => q.id !== draggedQuote.id);
        });
        newPlacements[phase] = [...newPlacements[phase], draggedQuote];
        return newPlacements;
      });

      setGameState((prev) => {
        const newPlacements = {
          ...prev.placements,
          [draggedQuote.id]: phase,
        };
        return {
          ...prev,
          placements: newPlacements,
        };
      });

      const projectedStreak = comboCounter + 1;
      const streakBonus = projectedStreak * STREAK_BONUS_STEP * (gameConfig?.challengeMode === "double-points" ? 2 : 1);
      const milestoneBonus =
        projectedStreak % STREAK_MILESTONE === 0
          ? STREAK_MILESTONE_BONUS * (gameConfig?.challengeMode === "double-points" ? 2 : 1)
          : 0;
      const baseReward = draggedQuote.id === "user-answer" ? POINTS_USER_PIECE : POINTS_CORRECT_QUOTE;
      toast.success(`Correct! +${baseReward + streakBonus + milestoneBonus} points`);
      setLastEvent({ type: 'hit', delta: baseReward + streakBonus + milestoneBonus, streak: projectedStreak });
      recordCorrectPlacement(draggedQuote.phase);
    } else {
      // Wrong placement - return to available quotes
      toast.error(`Wrong placement! -${Math.abs(POINTS_PENALTY_WRONG)} points. Try again!`);
      setLastEvent({ type: 'miss', delta: -Math.abs(POINTS_PENALTY_WRONG) });

      // Remove from any previous placement
      setPlacedQuotes((prev) => {
        const newPlacements = { ...prev };
        Object.keys(newPlacements).forEach((key) => {
          newPlacements[key] = newPlacements[key].filter((q) => q.id !== draggedQuote.id);
        });
        return newPlacements;
      });

      setGameState((prev) => {
        const newPlacements = { ...prev.placements };
        delete newPlacements[draggedQuote.id];
        return {
          ...prev,
          placements: newPlacements,
        };
      });

      registerWrongAttempt(phase);
    }

    setDraggedQuote(null);
    setHighlightedZone(null);
  };

  const handleDropUserPiece = (phase: Phase) => {
    if (!userPuzzlePiece) return;

    const isCorrect = phase === "incubation";

    if (isCorrect) {
      // Correct placement - keep it there
      setPlacedQuotes((prev) => ({
        ...prev,
        [phase]: [...prev[phase], userPuzzlePiece],
      }));

      setGameState((prev) => ({
        ...prev,
        placements: {
          ...prev.placements,
          "user-answer": phase,
        },
      }));

      setUserPuzzlePiece(null);
      toast.success(`Correct! +${POINTS_USER_PIECE} points`);
      setLastEvent({ type: 'hit', delta: POINTS_USER_PIECE });
      recordCorrectPlacement("incubation");
    } else {
      // Wrong placement - keep it in the initial box
      registerWrongAttempt(phase);
      toast.error(`Wrong placement! -${Math.abs(POINTS_PENALTY_WRONG)} points. Your creative moment should go in Incubation!`);
      setLastEvent({ type: 'miss', delta: -Math.abs(POINTS_PENALTY_WRONG) });
    }
  };

  const handleUnlockHint = () => {
    if (!gameConfig?.isGameActive) {
      toast.error("Wait for the game master to start the round.");
      return;
    }
    if (gameConfig.activeHint) {
      toast.info("A hint is already active for the class.");
      return;
    }
    if (gameState.points < HINT_COST) {
      toast.error(`You need at least ${HINT_COST} points to unlock a hint.`);
      return;
    }

    // Use theme-specific hints, fallback to classic theme hints
    const hintMessage =
      themeConfig.phaseHints[selectedHintPhase] ||
      activeTheme.phaseHints[selectedHintPhase] ||
      "Focus on the keywords that describe this phase.";

    GameSync.updateConfig({
      activeHint: {
        id: `hint-${Date.now()}`,
        phase: selectedHintPhase,
        message: hintMessage,
        activatedBy: playerName || "A teammate",
        cost: HINT_COST,
        timestamp: Date.now(),
      },
    });

    setBonusAdjustments((prev) => prev - HINT_COST);
    toast.success(
      `Hint unlocked for ${themeConfig.mechanics.phaseNames[selectedHintPhase] || PHASE_LABELS[selectedHintPhase]}! -${HINT_COST} points`,
      {
        description: "Everyone can see it for the next few moves.",
      }
    );
    playAlertTone();
  };

  const handleRapidFireAnswer = (choiceIndex: number) => {
    const question = gameConfig?.rapidFireQuestion;
    if (!question) return;
    if (answeredQuizzes.includes(question.id)) return;

    if (choiceIndex === question.answerIndex) {
      setBonusAdjustments((prev) => prev + QUIZ_BONUS_POINTS);
      toast.success(`Rapid-fire correct! +${QUIZ_BONUS_POINTS} points`);
      playSuccessTone();
    } else {
      toast.error("Not quite! Keep sorting for clues.");
      if (question.phase) {
        recordWrongPlacement(question.phase);
      } else {
        setComboCounter(0);
      }
      playErrorTone();
    }

    setAnsweredQuizzes((prev) => [...prev, question.id]);
  };

  const checkCompletion = useCallback(() => {
    const totalItems = puzzleQuotes.length + 1 + phaseTitles.length;
    const placedCount =
      Object.keys(gameState.placements).length + Object.keys(gameState.titlePlacements).length;

    if (placedCount === totalItems && !gameState.isCompleted) {
      handleGameEnd();
    }
  }, [gameState.placements, gameState.titlePlacements, gameState.isCompleted, puzzleQuotes.length, handleGameEnd]);

  useEffect(() => {
    if (gameState.isStarted && !gameState.isCompleted) {
      checkCompletion();
    }
  }, [gameState.isStarted, gameState.isCompleted, checkCompletion]);

  const handleRestart = () => {
    setGameState({
      isStarted: false,
      isCompleted: false,
      startTime: null,
      endTime: null,
      userAnswer: "",
      placements: {},
      titlePlacements: {},
      points: 0,
    });
    setPuzzleQuotes([]);
    setAvailableQuotes([]);
    setAvailableTitles([]);
    setPlacedQuotes({
      preparation: [],
      incubation: [],
      illumination: [],
      verification: [],
    });
    setPlacedTitles({
      preparation: null,
      incubation: null,
      illumination: null,
      verification: null,
    });
    setPlayerName("");
    setUserPuzzlePiece(null);
    setWrongAttempts(0);
    setPhaseStreaks({ ...EMPTY_STREAKS });
    setComboCounter(0);
    setBonusAdjustments(0);
    setBestStreak(0);
    setSelectedHintPhase("preparation");
    setAnsweredQuizzes([]);
    setLastEvent(null);
  };

  if (!gameState.isStarted) {
    return renderWithShell(<StartScreen onStart={handleStart} />);
  }

  if (gameState.isCompleted) {
    let score = calculateCorrectCount();

    return renderWithShell(
      <EndScreen
        score={score}
        points={gameState.points}
        time={gameState.endTime! - gameState.startTime!}
        totalQuotes={puzzleQuotes.length + 1 + phaseTitles.length}
        onRestart={handleRestart}
        leaderboard={leaderboard}
        showTop5={true}
        userAnswer={gameState.userAnswer}
      />
    );
  }

  const correctPlacements = calculateCorrectCount();
  const totalAttempts = correctPlacements + wrongAttempts;
  const accuracy = totalAttempts ? Math.round((correctPlacements / totalAttempts) * 100) : 100;
  const currentStreak = comboCounter;
  // Get remaining time from game config
  const remainingTime = gameConfig?.gameEndTime
    ? Math.max(0, Math.floor((gameConfig.gameEndTime - Date.now()) / 1000))
    : null;
  const challengeMode = gameConfig?.challengeMode ?? "normal";
  const rapidFireQuestion = gameConfig?.rapidFireQuestion ?? null;
  const isRapidFireActive = challengeMode === "rapid-fire" && !!rapidFireQuestion;
  const hasAnsweredRapidFire =
    isRapidFireActive && rapidFireQuestion ? answeredQuizzes.includes(rapidFireQuestion.id) : false;


  return renderWithShell(
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      draggedQuote={draggedQuote}
      draggedTitle={draggedTitle}
      quoteComponent={quoteComponent}
      titleComponent={titleComponent}
    >
      {/* Jigsaw SVGs */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <path id="jigsaw-piece-1" d="M 0 0 L 100 0 L 100 20 L 90 20 Q 95 10 90 10 Q 95 0 90 0 L 80 0 Q 85 -5 80 -5 Q 85 -15 80 -15 L 70 -15 Q 75 -20 70 -20 Q 65 -15 70 -15 L 60 -15 Q 65 -5 60 -5 Q 55 0 60 0 L 50 0 Q 55 -5 50 -5 Q 45 0 50 0 L 40 0 Q 45 -5 40 -5 Q 35 0 40 0 L 30 0 Q 35 -5 30 -5 Q 25 0 30 0 L 20 0 Q 25 -5 20 -5 Q 15 0 20 0 L 10 0 Q 15 -5 10 -5 Q 5 0 10 0 L 0 0 Z M 0 20 L 0 100 L 20 100 L 20 90 Q 10 95 10 90 Q 0 95 0 90 L 0 80 Q -5 85 -5 80 Q -15 85 -15 80 L -15 70 Q -20 75 -20 70 Q -15 65 -15 70 L -15 60 Q -5 65 -5 60 Q 0 55 0 60 L 0 50 Q -5 55 -5 50 Q 0 45 0 50 L 0 40 Q -5 45 -5 40 Q 0 35 0 40 L 0 30 Q -5 35 -5 30 Q 0 25 0 30 L 0 20 Z" />
        </defs>
      </svg>

      <ThemeSelector
        selectedTheme={gameTheme}
        onThemeSelect={setGameTheme}
        isVisible={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />

      <div className="quest-body">
        {/* Game Master Timer Display */}
        {gameConfig?.isGameActive && remainingTime !== null && (
          <div className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg shadow-xl border-2 border-red-700 max-w-[90vw]">
            <div className="text-center">
              <div className="text-[10px] sm:text-xs font-semibold mb-0.5 sm:mb-1 text-red-200">Game Master Timer</div>
              <div className={`text-xl sm:text-2xl md:text-3xl font-bold font-mono text-white ${remainingTime <= 30 ? "animate-pulse" : ""}`}>
                {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, "0")}
              </div>
            </div>
          </div>
        )}

        {/* Challenge Banners */}
        {challengeMode === "double-points" && (
          <div className="bg-yellow-500/90 border-2 border-yellow-600 rounded-xl text-white px-4 py-3 flex items-center gap-3 shadow-lg">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="font-bold">Double Points Mode!</div>
              <div className="text-sm opacity-90">All correct placements worth 2x points</div>
            </div>
          </div>
        )}

        {isRapidFireActive && rapidFireQuestion && !hasAnsweredRapidFire && (
          <div className="bg-purple-500/90 border-2 border-purple-600 rounded-xl text-white p-4 space-y-3 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="font-bold">Rapid Fire Question!</div>
                <div className="text-sm opacity-90">Answer quickly for bonus points</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">{rapidFireQuestion.question}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rapidFireQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleRapidFireAnswer(index)}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Stats Panel - Full Ethereal Codex Layout */}
        <div className="w-full max-w-5xl mb-4">
          <div className="glass-panel rounded-2xl border-white/10 px-4 py-3 text-white shadow-2xl">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <Sparkles className="w-5 h-5 text-[var(--magical-glow)]" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/60">Points</div>
                  <div className="text-xl font-fantasy">{gameState.points.toLocaleString()}</div>
                  <div className="text-[11px] text-white/50">Base + streak + speed</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <Flame className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/60">Streak</div>
                  <div className="text-xl font-fantasy">{currentStreak}x</div>
                  <div className="text-[11px] text-white/50">Best {bestStreak}x</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <Target className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/60">Accuracy</div>
                  <div className="text-xl font-fantasy">{accuracy}%</div>
                  <div className="text-[11px] text-white/50">{correctPlacements} / {totalAttempts || 0} moves</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <XCircle className="w-5 h-5 text-red-300" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/60">Mistakes</div>
                  <div className="text-xl font-fantasy">{wrongAttempts}</div>
                  <div className="text-[11px] text-white/50">{Math.abs(POINTS_PENALTY_WRONG)}pts penalty each</div>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--magical-glow)] via-[var(--primary)] to-[var(--magical-accent)] shadow-[0_0_12px_var(--magical-glow)] transition-all duration-500"
                  style={{ width: `${Math.min(100, (correctPlacements / Math.max(1, puzzleQuotes.length + phaseTitles.length + 1)) * 100)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-white/60 flex justify-between">
                <span>{correctPlacements}/{puzzleQuotes.length + phaseTitles.length + 1} pieces aligned</span>
                <span>{Math.round((correctPlacements / Math.max(1, puzzleQuotes.length + phaseTitles.length + 1)) * 100)}% complete</span>
              </div>
            </div>

            {/* Event Notifications */}
            <AnimatePresence>
              {lastEvent && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  className="mt-3 px-3 py-2 rounded-lg border border-white/15 bg-white/10 flex items-center gap-2 shadow-lg"
                >
                  {lastEvent.type === 'hit' && <Sparkles className="w-4 h-4 text-[var(--magical-glow)]" />}
                  {lastEvent.type === 'miss' && <XCircle className="w-4 h-4 text-red-300" />}
                  {lastEvent.type === 'complete' && <Trophy className="w-4 h-4 text-yellow-300" />}
                  <span className="text-sm font-medium">
                    {lastEvent.type === 'hit' && `+${lastEvent.delta} resonance!${lastEvent.streak ? ` Streak ${lastEvent.streak}x` : ''}`}
                    {lastEvent.type === 'miss' && `${lastEvent.delta} misplaced. Realign and try again.`}
                    {lastEvent.type === 'complete' && `+${lastEvent.delta} Realm restored!`}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                Puzzle Quest
              </h1>
              {gameConfig?.themeId && (
                <Badge variant="secondary" className="text-xs">
                  {themeList.find(t => t.id === gameConfig.themeId)?.name || gameConfig.themeId}
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowThemeSelector(true)}
              disabled={!!gameConfig?.jigsawLayout}
              className="text-xs px-2 py-1 h-auto quest-glass-button"
            >
              <Palette className="w-3 h-3 mr-1" />
              {gameConfig?.jigsawLayout ? "Layout Locked" : "Change Theme"}
            </Button>
          </div>

          {/* Sidebar and Jigsaw Board */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6 items-start">
            <div className="w-full lg:w-80 flex-shrink-0 space-y-3 sm:space-y-4">
              {/* Game Guide */}
              <GameGuide />

              {/* Phase Streaks */}
              <div className={`quest-surface rounded-lg p-3 sm:p-4 transition-all ${comboGlow ? "border-yellow-400 shadow-lg shadow-yellow-400/20" : "border-white/10"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🔥</span>
                  <h3 className="font-semibold text-white">Phase Streak</h3>
                </div>
                <div className="text-2xl font-bold text-yellow-400">{phaseStreak}</div>
                <div className="text-sm text-gray-300">Perfect phases in a row</div>
              </div>

              {/* Collaborative Hint */}
              <div className="quest-surface rounded-lg p-3 sm:p-4 space-y-3 border-orange-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  <h3 className="font-semibold text-white">Collaborative Hint</h3>
                </div>
                {activeHint ? (
                  <div className="space-y-2">
                    <div className="text-sm text-orange-300 font-medium">
                      Hint for {activeHint.phase} phase:
                    </div>
                    <div className="text-sm text-white bg-orange-500/20 p-2 rounded">
                      {activeHint.message}
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleUnlockHint}
                    disabled={!!activeHint || gameState.points < HINT_COST}
                    className="w-full quest-glass-button"
                  >
                    {activeHint ? "Hint Active" : "Unlock Hint"}
                    <span className="ml-2 text-xs">({HINT_COST} pts)</span>
                  </Button>
                )}
              </div>

              {/* Available Titles */}
              {availableTitles.length > 0 && (
                <div className="quest-surface rounded-lg sm:rounded-xl p-3 sm:p-4 border-purple-500/20">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-lg">🏆</span>
                    Available Titles
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableTitles.map((title) => (
                      <div
                        key={title.id}
                        className="flex items-center justify-between p-2 bg-purple-500/10 rounded border border-purple-500/20"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-purple-300">{title.title}</div>
                          <div className="text-xs text-gray-400">{title.phase} phase title</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleTitleSelect(title)}
                          className="ml-2 quest-glass-button text-xs"
                        >
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Puzzle Piece */}
              {userPuzzlePiece && (
                <div className="quest-surface rounded-lg sm:rounded-xl p-3 sm:p-4 border-purple-500/20">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-lg">🧩</span>
                    Your Special Piece
                  </h3>
                  <div className="text-sm text-purple-300 mb-2">
                    Drag this piece to complete the puzzle:
                  </div>
                  <div className="bg-purple-500/10 p-2 rounded border border-purple-500/20">
                    <QuoteCard
                      quote={userPuzzlePiece}
                      isDragging={false}
                    />
                  </div>
                </div>
              )}

              {/* Available Quotes */}
              {availableQuotes.length > 0 && (
                <div className="quest-surface rounded-lg sm:rounded-xl p-3 sm:p-4 border-white/10 max-h-[300px] sm:max-h-[400px] md:max-h-[500px] overflow-y-auto">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-lg">📚</span>
                    Available Quotes ({availableQuotes.length})
                  </h3>
                  <div className="space-y-2">
                    {availableQuotes.map((quote) => (
                      <QuoteCard
                        key={quote.id}
                        quote={quote}
                        isDragging={draggedQuote?.id === quote.id}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 w-full">
              {activeHint && (
                <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-3 sm:p-4 mb-3 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">💡</span>
                    <span className="font-semibold">Active Hint</span>
                  </div>
                  <div className="text-sm">
                    <strong>{activeHint.phase} Phase:</strong> {activeHint.message}
                  </div>
                </div>
              )}

              <JigsawBoard
                quotes={puzzleQuotes}
                themeId={gameConfig?.themeId ?? themeId}
                layoutId={resolvedJigsawLayout}
                placedQuotes={placedQuotes}
                onGameComplete={handleGameEnd}
                hintPhase={activeHint?.phase ?? null}
              />
            </div>
          </div>
        </div>
      </div>
    </DragDropProvider>
  );
}
