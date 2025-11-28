"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { StartScreen } from "@/components/StartScreen";
import { EndScreen } from "@/components/EndScreen";
import { QuoteCard } from "@/components/QuoteCard";
import { Timer } from "@/components/Timer";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { GameGuide } from "@/components/GameGuide";
import { GameSync } from "@/lib/gameSync";
import { CustomQuotes } from "@/lib/customQuotes";
import { playSuccessTone, playErrorTone, playAlertTone } from "@/lib/soundboard";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";

const phaseTitles: PhaseTitle[] = [
  { id: "title-preparation", title: "Preparation", phase: "preparation" },
  { id: "title-incubation", title: "Incubation", phase: "incubation" },
  { id: "title-illumination", title: "Illumination", phase: "illumination" },
  { id: "title-verification", title: "Verification", phase: "verification" },
];

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
  const [scoreFlash, setScoreFlash] = useState(false);
  const [comboGlow, setComboGlow] = useState(false);
  const challengeModeRef = useRef<ChallengeMode | null>(null);
  const rapidFireRef = useRef<string | null>(null);
  const hintRef = useRef<string | null>(null);

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
    
    loadLeaderboard();
    
    // Listen for leaderboard updates from other tabs
    const handleLeaderboardUpdate = () => {
      loadLeaderboard();
    };
    
    window.addEventListener("leaderboardUpdated", handleLeaderboardUpdate);
    window.addEventListener("storage", handleLeaderboardUpdate);

    // Subscribe to game config changes
    const unsubscribe = GameSync.subscribe((config) => {
      setGameConfig(config);
      
      // Auto-end game when time runs out or game master ends it
      if (!config?.isGameActive && gameState.isStarted && !gameState.isCompleted) {
        handleGameEnd();
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener("leaderboardUpdated", handleLeaderboardUpdate);
      window.removeEventListener("storage", handleLeaderboardUpdate);
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
  }, [gameConfig?.themeId]);

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

  const handleStart = (name: string, answer: string) => {
    const config = GameSync.getConfig();
    if (!config || !config.isGameActive) {
      toast.error("Game master has not started the game yet!");
      return;
    }

    const activeThemeId = config.themeId ?? "classic";
    const themeDefinition = themeLibrary[activeThemeId] ?? themeLibrary.classic;

    const customQuotes = CustomQuotes.byTheme(activeThemeId);
    const quotePool = [...themeDefinition.quotes, ...customQuotes];
    const shuffled = [...quotePool].sort(() => Math.random() - 0.5);
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
    setUserPuzzlePiece(userQuote);
    setPuzzleQuotes(selectedQuotes);
    setAvailableQuotes(selectedQuotes);
    setAvailableTitles([...phaseTitles]);
    const startTime = Date.now();
    setGameState({
      isStarted: true,
      isCompleted: false,
      startTime,
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

    // Register as active player
    const activePlayer = {
      name,
      points: 0,
      score: 0,
      startTime,
      lastUpdate: startTime,
    };
    const activePlayers = JSON.parse(localStorage.getItem("creativity-active-players") || "[]");
    const updatedActivePlayers = activePlayers.filter((p: any) => p.name !== name);
    updatedActivePlayers.push(activePlayer);
    localStorage.setItem("creativity-active-players", JSON.stringify(updatedActivePlayers));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("activePlayersUpdated"));
    }

    toast.success("Game started! Drag titles and quotes to the correct phases.");
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
    // Bonus decreases as time increases
    const config = GameSync.getConfig();
    const maxTime = config?.timeLimit ? config.timeLimit * 1000 : 300000; // 5 min default
    const timeSaved = Math.max(0, maxTime - totalTime);
    const speedBonus = Math.floor(timeSaved * SPEED_BONUS_MULTIPLIER / 1000);

    return basePoints + speedBonus;
  }, [calculatePoints]);

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

          // Remove from active players
          const activePlayers = JSON.parse(localStorage.getItem("creativity-active-players") || "[]");
          const updatedActivePlayers = activePlayers.filter((p: any) => p.name !== playerName);
          localStorage.setItem("creativity-active-players", JSON.stringify(updatedActivePlayers));
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("activePlayersUpdated"));
          }

          setLeaderboard((prev) => {
            // Keep all entries (don't limit to 10) so we can group by session
            const updated = [...prev, newScore]
              .sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.score !== a.score) return b.score - a.score;
                return a.time - b.time;
              });
            // Use localStorage for cross-tab sync
            localStorage.setItem("creativity-leaderboard", JSON.stringify(updated));
            // Also keep in sessionStorage for backward compatibility
            sessionStorage.setItem("creativity-leaderboard", JSON.stringify(updated));
            // Trigger custom event for real-time sync
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("leaderboardUpdated"));
            }
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
  useEffect(() => {
    if (!gameState.isStarted) return;
    const recalculatedPoints = calculatePoints();
    if (Math.abs(recalculatedPoints - gameState.points) > 0.1) {
      setGameState((prev) => ({
        ...prev,
        points: recalculatedPoints,
      }));
    }
  }, [gameState.isStarted, calculatePoints, gameState.points]);

  // Update active player status in real-time
  useEffect(() => {
    if (gameState.isStarted && !gameState.isCompleted && playerName) {
      const updateActivePlayer = () => {
        const activePlayers = JSON.parse(localStorage.getItem("creativity-active-players") || "[]");
        const playerIndex = activePlayers.findIndex((p: any) => p.name === playerName);
        const correctCount = calculateCorrectCount();
        
        if (playerIndex >= 0) {
          activePlayers[playerIndex] = {
            ...activePlayers[playerIndex],
            points: gameState.points,
            score: correctCount,
            lastUpdate: Date.now(),
          };
        } else {
          activePlayers.push({
            name: playerName,
            points: gameState.points,
            score: correctCount,
            startTime: gameState.startTime || Date.now(),
            lastUpdate: Date.now(),
          });
        }
        
        localStorage.setItem("creativity-active-players", JSON.stringify(activePlayers));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("activePlayersUpdated"));
        }
      };
      
      updateActivePlayer();
      const interval = setInterval(updateActivePlayer, 2000); // Update every 2 seconds
      return () => clearInterval(interval);
    }
  }, [gameState.points, gameState.placements, gameState.titlePlacements, gameState.isStarted, gameState.isCompleted, playerName, gameState.startTime, calculateCorrectCount]);

  const handleDragStart = (quote: Quote) => {
    setDraggedQuote(quote);
    setDraggedTitle(null);
  };

  const handleDragStartTitle = (title: PhaseTitle) => {
    setDraggedTitle(title);
    setDraggedQuote(null);
  };

  const handleDragEnd = () => {
    setDraggedQuote(null);
    setDraggedTitle(null);
    setHighlightedZone(null);
  };

  const handleDragOver = (e: React.DragEvent, zone: Phase) => {
    e.preventDefault();
    setHighlightedZone(zone);
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

    const hintMessage =
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
      `Hint unlocked for ${PHASE_LABELS[selectedHintPhase]}! -${HINT_COST} points`,
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
    return <StartScreen onStart={handleStart} />;
  }

  if (gameState.isCompleted) {
    let score = calculateCorrectCount();

    return (
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
  const activeHint = gameConfig?.activeHint ?? null;

  return (
    <div
      className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 relative"
      style={{ background: activeTheme.background }}
    >
      {/* Game Master Timer Display */}
      {gameConfig?.isGameActive && remainingTime !== null && (
        <div className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg shadow-xl border-2 border-red-700 max-w-[90vw]">
          <div className="text-center">
            <div className="text-[10px] sm:text-xs font-semibold mb-0.5 sm:mb-1">Game Master Timer</div>
            <div className={`text-xl sm:text-2xl md:text-3xl font-bold font-mono ${remainingTime <= 30 ? "animate-pulse" : ""}`}>
              {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, "0")}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
        {challengeMode === "double-points" && (
          <div className="bg-amber-500/90 border-2 border-amber-600 rounded-xl text-white px-4 py-3 flex items-center gap-3 shadow-lg">
            <Zap className="w-5 h-5" />
            <div className="text-sm sm:text-base font-semibold">
              Double Points Round Active! Every correct placement counts twice.
            </div>
          </div>
        )}

        {isRapidFireActive && rapidFireQuestion && !hasAnsweredRapidFire && (
          <div className="bg-purple-600/90 border-2 border-purple-700 rounded-xl text-white p-4 space-y-3 shadow-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg font-bold">Rapid Fire Question!</h3>
            </div>
            <p className="text-sm">{rapidFireQuestion.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rapidFireQuestion.options.map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleRapidFireAnswer(index)}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/80">
              Correct answers earn +{QUIZ_BONUS_POINTS} bonus points for your team.
            </p>
          </div>
        )}

        {isRapidFireActive && hasAnsweredRapidFire && (
          <div className="bg-purple-100 border-2 border-purple-300 rounded-xl p-3 text-sm text-purple-900">
            Rapid fire answered! Watch for the next Kahoot-style challenge from the game master.
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
              Creativity is...
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Sort the quotes into the correct creative phases
            </p>
            <div className="text-xs sm:text-sm font-semibold mt-1" style={{ color: activeTheme.badgeColor }}>
              Theme: {activeTheme.name}
            </div>
          </div>
          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
            <Timer startTime={gameState.startTime} isCompleted={gameState.isCompleted} />
            <div
              className={`bg-card rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center flex-1 sm:flex-none border-2 transition-all ${
                scoreFlash
                  ? "border-primary shadow-[0_0_0_4px_rgba(249,115,22,0.25)] scale-[1.02]"
                  : "border-border"
              }`}
            >
              <div className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Points</div>
              <div className="text-xl sm:text-2xl font-bold text-primary font-mono">
                {gameState.points}
              </div>
            </div>
            <div
              className={`bg-card border-2 rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center flex-1 sm:flex-none transition-colors ${
                wrongAttempts > 0 ? "border-destructive/60 shadow-lg shadow-destructive/10" : "border-border"
              }`}
              aria-live="polite"
            >
              <div className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
                Wrong Attempts
              </div>
              <div
                className={`text-xl sm:text-2xl font-bold font-mono ${
                  wrongAttempts > 0 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {wrongAttempts}
              </div>
              <div
                className={`text-[10px] sm:text-xs font-semibold ${
                  wrongAttempts > 0 ? "text-destructive/80" : "text-muted-foreground"
                }`}
              >
                -5 pts each
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6 items-start">
          <div className="w-full lg:w-80 flex-shrink-0 space-y-3 sm:space-y-4">
            {/* Game Guide */}
            <GameGuide />

            <div
              className={`bg-card border-2 rounded-lg p-3 sm:p-4 transition-all ${
                comboGlow ? "border-amber-400 shadow-lg shadow-amber-100" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-bold text-foreground">Phase Streaks</h3>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  Combo: {comboCounter}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PHASE_ORDER.map((phase) => (
                  <div
                    key={phase}
                    className="rounded-lg border border-border px-2 py-2 text-center text-[11px] sm:text-xs"
                  >
                    <div className="font-semibold text-foreground">{PHASE_LABELS[phase]}</div>
                    <div className="text-lg font-bold" style={{ color: activeTheme.badgeColor }}>
                      {phaseStreaks[phase]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 sm:p-4 space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-orange-700">
                Collaborative Hint (-{HINT_COST} pts)
              </h3>
              <p className="text-[10px] sm:text-xs text-orange-700/80">
                Spend points like a Kahoot power-up to reveal a class-wide hint.
              </p>
              <select
                className="w-full border-2 border-orange-200 rounded-lg px-2 py-2 text-xs"
                value={selectedHintPhase}
                onChange={(e) => setSelectedHintPhase(e.target.value as Phase)}
                disabled={!!activeHint}
              >
                {PHASE_ORDER.map((phase) => (
                  <option key={phase} value={phase}>
                    {PHASE_LABELS[phase]}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleUnlockHint}
                disabled={!!activeHint || gameState.points < HINT_COST}
                className="w-full"
              >
                {activeHint ? "Hint Active" : "Unlock Hint"}
              </Button>
              {gameState.points < HINT_COST && (
                <p className="text-[11px] text-orange-600">Earn {HINT_COST - gameState.points} more points.</p>
              )}
            </div>

            {availableTitles.length > 0 && (
              <div className="bg-accent/20 border-2 border-accent rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1 sm:mb-2">
                  Phase Titles ({availableTitles.length})
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
                  Drag titles to the correct phases first
                </p>
                <div className="space-y-1.5 sm:space-y-2">
                  {availableTitles.map((title) => (
                    <div
                      key={title.id}
                      draggable
                      onDragStart={() => handleDragStartTitle(title)}
                      onDragEnd={handleDragEnd}
                      className="cursor-move touch-manipulation bg-accent/30 border-2 border-accent rounded-lg p-2 sm:p-3 text-center font-bold text-xs sm:text-sm hover:bg-accent/40 transition-colors active:scale-95"
                      style={{ opacity: draggedTitle?.id === title.id ? 0.5 : 1 }}
                    >
                      {title.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userPuzzlePiece && (
              <div className="bg-primary/10 border-2 border-primary rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-bold text-primary mb-2 sm:mb-3">
                  Your Creative Moment
                </h3>
                <div
                  draggable
                  onDragStart={() => setDraggedQuote(userPuzzlePiece)}
                  onDragEnd={handleDragEnd}
                  className="cursor-move touch-manipulation active:scale-95"
                >
                  <QuoteCard
                    quote={userPuzzlePiece}
                    isDragging={draggedQuote?.id === userPuzzlePiece.id}
                  />
                </div>
              </div>
            )}

            {availableQuotes.length > 0 && (
              <div className="bg-card/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-border max-h-[300px] sm:max-h-[400px] md:max-h-[500px] overflow-y-auto">
                <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1 sm:mb-2">
                  Quotes to Sort ({availableQuotes.length})
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">
                  Drag to the correct phase
                </p>
                <div className="space-y-1.5 sm:space-y-2 pr-1 sm:pr-2">
                  {availableQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      draggable
                      onDragStart={() => handleDragStart(quote)}
                      onDragEnd={handleDragEnd}
                      className="cursor-move touch-manipulation active:scale-95"
                    >
                      <QuoteCard
                        quote={quote}
                        isDragging={draggedQuote?.id === quote.id}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 w-full">
            {activeHint && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 sm:p-4 mb-3">
                <div className="text-xs sm:text-sm font-semibold text-yellow-800">
                  Shared Hint • {PHASE_LABELS[activeHint.phase]}
                </div>
                <p className="text-sm text-yellow-900 mt-1">{activeHint.message}</p>
                <p className="text-[10px] text-yellow-700 mt-1">
                  Triggered by {activeHint.activatedBy}
                </p>
              </div>
            )}
            <PuzzleBoard
              correctPlacements={correctPlacements}
              totalPieces={puzzleQuotes.length + 1 + phaseTitles.length}
              wrongAttempts={wrongAttempts}
              boardBackground={activeTheme.boardBackground}
              placedQuotes={placedQuotes}
              placedTitles={placedTitles}
              onDrop={
                userPuzzlePiece && draggedQuote?.id === "user-answer"
                  ? handleDropUserPiece
                  : handleDrop
              }
              onDragOver={handleDragOver}
              highlightedZone={highlightedZone}
              onDragStart={handleDragStart}
              onDragStartTitle={handleDragStartTitle}
              onDragEnd={handleDragEnd}
              draggedQuote={draggedQuote}
              draggedTitle={draggedTitle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

