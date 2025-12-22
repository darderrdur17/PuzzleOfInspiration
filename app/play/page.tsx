"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { themeLibrary } from "@/data/themes";
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
import { ThemeSelector } from "@/components/ThemeSelector";
import { DragDropProvider, DraggableQuote, DraggableTitle } from "@/components/DragDropProvider";
import { JigsawBoard } from "@/components/JigsawBoard";
import { GameSync } from "@/lib/gameSync";
import { CustomQuotes } from "@/lib/customQuotes";
import { playSuccessTone, playErrorTone, playAlertTone } from "@/lib/soundboard";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Palette } from "lucide-react";
import { RealtimeStore } from "@/lib/realtimeStore";
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { quotePackagesById, getDefaultQuotePackIds, type QuotePackId } from "@/data/quotePackages";
import {
  DEFAULT_JIGSAW_LAYOUT,
  defaultJigsawLayoutByTheme,
  jigsawThemeConfigs,
  type JigsawLayoutId,
} from "@/lib/jigsawThemes";

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
const POINTS_CORRECT_QUOTE = 10;
const POINTS_CORRECT_TITLE = 20;
const POINTS_USER_PIECE = 10;
const POINTS_PENALTY_WRONG = -5; // Penalty for wrong placement
const SPEED_BONUS_MULTIPLIER = 0.1; // Bonus points per second saved
const HINT_COST = 15;
const COMBO_BONUS_POINTS = 5;
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

    // Speed bonus: faster completion = more bonus points
    // Game master controls the official timing through timeLimit
    const config = GameSync.getConfig();
    if (config?.timeLimit) {
      // Game master has set a time limit - use it for speed bonus calculation
      const maxTime = config.timeLimit * 1000;
      const timeSaved = Math.max(0, maxTime - totalTime);
      const speedBonus = Math.floor(timeSaved * SPEED_BONUS_MULTIPLIER / 1000);
      return basePoints + speedBonus;
    }

    // No game master time limit - return base points only
    return basePoints;
  }, [calculatePoints]);

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
      setPhaseStreaks((prev) => ({
        ...prev,
        [phase]: prev[phase] + 1,
      }));
      setComboCounter((prev) => {
        const next = prev + 1;
        if (next > 0 && next % 3 === 0) {
          const reward =
            COMBO_BONUS_POINTS * (gameConfig?.challengeMode === "double-points" ? 2 : 1);
          setBonusAdjustments((adj) => adj + reward);
          toast.success(`Combo streak! +${reward} bonus points`);
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

            toast.success(`Correct! +${POINTS_CORRECT_TITLE} points`);
            recordCorrectPlacement(data.title.phase);
          } else {
            // Wrong placement - return to available titles
            toast.error(`Wrong placement! ${POINTS_PENALTY_WRONG} points. Try again!`);

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

        toast.success(`Correct! +${POINTS_CORRECT_TITLE} points`);
        recordCorrectPlacement(draggedTitle.phase);
      } else {
        // Wrong placement - return to available titles
        toast.error(`Wrong placement! ${POINTS_PENALTY_WRONG} points. Try again!`);
        
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

      toast.success(`Correct! +${draggedQuote.id === "user-answer" ? POINTS_USER_PIECE : POINTS_CORRECT_QUOTE} points`);
      recordCorrectPlacement(draggedQuote.phase);
    } else {
      // Wrong placement - return to available quotes
      toast.error(`Wrong placement! ${POINTS_PENALTY_WRONG} points. Try again!`);
      
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
      recordCorrectPlacement("incubation");
    } else {
      // Wrong placement - keep it in the initial box
      registerWrongAttempt(phase);
      toast.error(`Wrong placement! ${POINTS_PENALTY_WRONG} points. Your creative moment should go in Incubation!`);
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
    setSelectedHintPhase("preparation");
    setAnsweredQuizzes([]);
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
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          <div className="text-center">
          <h1 className="text-2xl font-bold">Puzzle Quest Player</h1>
          <p>Player interface coming soon...</p>
            </div>
          </div>
        </div>
  );
}
