"use client";

import { useState, useEffect, useCallback } from "react";
import { quotes } from "@/data/quotes";
import { Quote, PhaseTitle, GameState, PlayerScore, Phase } from "@/types/game";
import { StartScreen } from "@/components/StartScreen";
import { EndScreen } from "@/components/EndScreen";
import { QuoteCard } from "@/components/QuoteCard";
import { Timer } from "@/components/Timer";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { GameGuide } from "@/components/GameGuide";
import { GameSync } from "@/lib/gameSync";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  const [wrongPlacements, setWrongPlacements] = useState<Set<string>>(new Set());

  // Track wrong placements for penalty calculation
  const [placementHistory, setPlacementHistory] = useState<Record<string, Phase[]>>({});

  useEffect(() => {
    // Load leaderboard
    const stored = sessionStorage.getItem("creativity-leaderboard");
    if (stored) {
      try {
        setLeaderboard(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse leaderboard", e);
      }
    }

    // Subscribe to game config changes
    const unsubscribe = GameSync.subscribe((config) => {
      setGameConfig(config);
      
      // Auto-end game when time runs out or game master ends it
      if (!config?.isGameActive && gameState.isStarted && !gameState.isCompleted) {
        handleGameEnd();
      }
    });

    return unsubscribe;
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

  const handleStart = (name: string, answer: string) => {
    const config = GameSync.getConfig();
    if (!config || !config.isGameActive) {
      toast.error("Game master has not started the game yet!");
      return;
    }

    // Select random quotes based on maxQuotes setting
    const shuffled = [...quotes].sort(() => Math.random() - 0.5);
    const selectedQuotes = shuffled.slice(0, Math.min(config.maxQuotes - 4, quotes.length)); // -4 for titles

    const userQuote: Quote = {
      id: "user-answer",
      text: answer,
      author: name,
      phase: "incubation",
    };

    setPlayerName(name);
    setUserPuzzlePiece(userQuote);
    setAvailableQuotes(selectedQuotes);
    setAvailableTitles([...phaseTitles]);
    setGameState({
      isStarted: true,
      isCompleted: false,
      startTime: Date.now(),
      endTime: null,
      userAnswer: answer,
      placements: {},
      titlePlacements: {},
      points: 0,
    });
    setWrongPlacements(new Set());
    setPlacementHistory({});

    toast.success("Game started! Drag titles and quotes to the correct phases.");
  };

  const calculateCorrectCount = useCallback((): number => {
    let count = 0;
    
    availableQuotes.forEach((quote) => {
      if (gameState.placements[quote.id] === quote.phase) {
        count++;
      }
    });

    phaseTitles.forEach((title) => {
      if (gameState.titlePlacements[title.id] === title.phase) {
        count++;
      }
    });

    if (gameState.placements["user-answer"] === "incubation") {
      count++;
    }

    return count;
  }, [gameState.placements, gameState.titlePlacements, availableQuotes]);

  const calculatePoints = useCallback((): number => {
    let points = 0;

    // Points for correct quote placements
    availableQuotes.forEach((quote) => {
      if (gameState.placements[quote.id] === quote.phase) {
        points += POINTS_CORRECT_QUOTE;
      } else if (gameState.placements[quote.id]) {
        // Wrong placement - track for penalty
        if (!wrongPlacements.has(quote.id)) {
          points += POINTS_PENALTY_WRONG;
        }
      }
    });

    // Points for correct title placements
    phaseTitles.forEach((title) => {
      if (gameState.titlePlacements[title.id] === title.phase) {
        points += POINTS_CORRECT_TITLE;
      } else if (gameState.titlePlacements[title.id]) {
        // Wrong placement
        if (!wrongPlacements.has(title.id)) {
          points += POINTS_PENALTY_WRONG;
        }
      }
    });

    // User piece in correct phase
    if (gameState.placements["user-answer"] === "incubation") {
      points += POINTS_USER_PIECE;
    } else if (gameState.placements["user-answer"]) {
      // Wrong placement
      if (!wrongPlacements.has("user-answer")) {
        points += POINTS_PENALTY_WRONG;
      }
    }

    return Math.max(0, points); // Don't go below 0
  }, [gameState.placements, gameState.titlePlacements, availableQuotes, wrongPlacements]);

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

  const handleGameEnd = useCallback(() => {
    if (gameState.isCompleted) return;

    const endTime = Date.now();
    const totalTime = endTime - (gameState.startTime || endTime);
    const finalPoints = calculateFinalPoints(totalTime);

    const correctCount = calculateCorrectCount();

    const newScore: PlayerScore = {
      name: playerName,
      score: correctCount,
      points: finalPoints,
      time: totalTime,
      timestamp: Date.now(),
    };

    setLeaderboard((prev) => {
      const updated = [...prev, newScore]
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.score !== a.score) return b.score - a.score;
          return a.time - b.time;
        })
        .slice(0, 10);
      sessionStorage.setItem("creativity-leaderboard", JSON.stringify(updated));
      return updated;
    });

    setGameState((prev) => ({
      ...prev,
      isCompleted: true,
      endTime,
      points: finalPoints,
    }));

    toast.success(`Time's up! Final score: ${finalPoints} points!`);
  }, [gameState.isCompleted, gameState.startTime, playerName, calculateFinalPoints, calculateCorrectCount]);

  // Update points and track wrong placements
  useEffect(() => {
    if (gameState.isStarted && !gameState.isCompleted) {
      const newPoints = calculatePoints();
      
      // Track wrong placements for penalty (only penalize once per item)
      const newWrongPlacements = new Set(wrongPlacements);
      availableQuotes.forEach((quote) => {
        if (gameState.placements[quote.id] && gameState.placements[quote.id] !== quote.phase) {
          newWrongPlacements.add(quote.id);
        }
      });
      phaseTitles.forEach((title) => {
        if (gameState.titlePlacements[title.id] && gameState.titlePlacements[title.id] !== title.phase) {
          newWrongPlacements.add(title.id);
        }
      });
      if (gameState.placements["user-answer"] && gameState.placements["user-answer"] !== "incubation") {
        newWrongPlacements.add("user-answer");
      }

      setWrongPlacements(newWrongPlacements);
      setGameState((prev) => ({ ...prev, points: newPoints }));
    }
  }, [gameState.placements, gameState.titlePlacements, gameState.isStarted, gameState.isCompleted, calculatePoints, availableQuotes, wrongPlacements]);

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
          const newPlacements = { ...prev.titlePlacements };
          delete newPlacements[draggedTitle.id];
          return {
            ...prev,
            titlePlacements: newPlacements,
          };
        });
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

      setGameState((prev) => ({
        ...prev,
        placements: {
          ...prev.placements,
          [draggedQuote.id]: phase,
        },
      }));

      toast.success(`Correct! +${POINTS_CORRECT_QUOTE} points`);
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
    } else {
      // Wrong placement - keep it in the initial box
      toast.error(`Wrong placement! ${POINTS_PENALTY_WRONG} points. Your creative moment should go in Incubation!`);
    }
  };

  const checkCompletion = useCallback(() => {
    const totalItems = availableQuotes.length + 1 + phaseTitles.length;
    const placedCount =
      Object.keys(gameState.placements).length + Object.keys(gameState.titlePlacements).length;

    if (placedCount === totalItems && !gameState.isCompleted) {
      handleGameEnd();
    }
  }, [gameState.placements, gameState.titlePlacements, gameState.isCompleted, availableQuotes.length]);

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
    setWrongPlacements(new Set());
    setPlacementHistory({});
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
        totalQuotes={availableQuotes.length + 1 + phaseTitles.length}
        onRestart={handleRestart}
        leaderboard={leaderboard}
        showTop5={true}
      />
    );
  }

  let correctPlacements = Object.keys(gameState.placements).filter((id) => {
    if (id === "user-answer") return gameState.placements[id] === "incubation";
    const quote = availableQuotes.find((q) => q.id === id);
    return quote && gameState.placements[id] === quote.phase;
  }).length;

  correctPlacements += Object.keys(gameState.titlePlacements).filter((id) => {
    const title = phaseTitles.find((t) => t.id === id);
    return title && gameState.titlePlacements[id] === title.phase;
  }).length;

  // Get remaining time from game config
  const remainingTime = gameConfig?.gameEndTime 
    ? Math.max(0, Math.floor((gameConfig.gameEndTime - Date.now()) / 1000))
    : null;

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background via-primary/5 to-accent/5 relative">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1 sm:mb-2">
              Creativity is...
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Sort the quotes into the correct creative phases
            </p>
          </div>
          <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
            <Timer startTime={gameState.startTime} isCompleted={gameState.isCompleted} />
            <div className="bg-card border-2 border-border rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-center flex-1 sm:flex-none">
              <div className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Points</div>
              <div className="text-xl sm:text-2xl font-bold text-primary font-mono">
                {gameState.points}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6 items-start">
          <div className="w-full lg:w-80 flex-shrink-0 space-y-3 sm:space-y-4">
            {/* Game Guide */}
            <GameGuide />

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
            <PuzzleBoard
              correctPlacements={correctPlacements}
              totalPieces={availableQuotes.length + 1 + phaseTitles.length}
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

