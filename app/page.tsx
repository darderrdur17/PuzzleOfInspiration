"use client";

import { useState, useEffect, useCallback } from "react";
import { quotes } from "@/data/quotes";
import { Quote, PhaseTitle, GameState, PlayerScore, Phase } from "@/types/game";
import { StartScreen } from "@/components/StartScreen";
import { EndScreen } from "@/components/EndScreen";
import { QuoteCard } from "@/components/QuoteCard";
import { Timer } from "@/components/Timer";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { GameMaster } from "@/components/GameMaster";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const phaseTitles: PhaseTitle[] = [
  { id: "title-preparation", title: "Preparation", phase: "preparation" },
  { id: "title-incubation", title: "Incubation", phase: "incubation" },
  { id: "title-illumination", title: "Illumination", phase: "illumination" },
  { id: "title-verification", title: "Verification", phase: "verification" },
];

export default function Home() {
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
  const [gameEndedByMaster, setGameEndedByMaster] = useState(false);

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

  useEffect(() => {
    // Load leaderboard from session storage
    const stored = sessionStorage.getItem("creativity-leaderboard");
    if (stored) {
      try {
        setLeaderboard(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse leaderboard", e);
      }
    }
  }, []);

  const handleStart = (name: string, answer: string) => {
    // Create user's puzzle piece for incubation phase
    const userQuote: Quote = {
      id: "user-answer",
      text: answer,
      author: name,
      phase: "incubation",
    };

    setPlayerName(name);
    setUserPuzzlePiece(userQuote);
    setAvailableQuotes([...quotes]);
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

    toast.success("Game started! Drag titles and quotes to the correct phases.");
  };

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
      // Handle title drop
      setAvailableTitles((prev) => prev.filter((t) => t.id !== draggedTitle.id));

      setPlacedTitles((prev) => {
        const newPlacements = { ...prev };

        // Remove from any previous zone
        Object.keys(newPlacements).forEach((key) => {
          if (newPlacements[key]?.id === draggedTitle.id) {
            newPlacements[key] = null;
          }
        });

        // Add to new zone
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

      setDraggedTitle(null);
      setHighlightedZone(null);
      toast.success(`Title placed in ${phase}!`);
      return;
    }

    if (!draggedQuote) return;

    // Remove from available or previous placement
    setAvailableQuotes((prev) => prev.filter((q) => q.id !== draggedQuote.id));

    setPlacedQuotes((prev) => {
      const newPlacements = { ...prev };

      // Remove from any previous zone
      Object.keys(newPlacements).forEach((key) => {
        newPlacements[key] = newPlacements[key].filter((q) => q.id !== draggedQuote.id);
      });

      // Add to new zone
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

    setDraggedQuote(null);
    setHighlightedZone(null);
  };

  const handleDropUserPiece = (phase: Phase) => {
    if (userPuzzlePiece && !gameState.placements["user-answer"]) {
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
      toast.success("Great! Now sort the rest of the quotes.");
    }
  };

  // Calculate points in real-time
  const calculatePoints = useCallback(() => {
    let points = 0;
    
    // Points for correct quote placements (10 points each)
    quotes.forEach((quote) => {
      if (gameState.placements[quote.id] === quote.phase) {
        points += 10;
      }
    });

    // Points for correct title placements (20 points each)
    phaseTitles.forEach((title) => {
      if (gameState.titlePlacements[title.id] === title.phase) {
        points += 20;
      }
    });

    // User piece in correct phase (10 points)
    if (gameState.placements["user-answer"] === "incubation") {
      points += 10;
    }

    return points;
  }, [gameState.placements, gameState.titlePlacements]);

  // Update points whenever placements change
  useEffect(() => {
    if (gameState.isStarted && !gameState.isCompleted) {
      const newPoints = calculatePoints();
      setGameState((prev) => ({ ...prev, points: newPoints }));
    }
  }, [gameState.placements, gameState.titlePlacements, gameState.isStarted, gameState.isCompleted, calculatePoints]);

  const checkCompletion = useCallback(() => {
    const totalItems = quotes.length + 1 + phaseTitles.length; // +1 for user piece, +4 for titles
    const placedCount =
      Object.keys(gameState.placements).length + Object.keys(gameState.titlePlacements).length;

    if (placedCount === totalItems && !gameState.isCompleted) {
      const endTime = Date.now();
      const totalTime = endTime - (gameState.startTime || endTime);

      // Calculate score
      let correctCount = 0;
      quotes.forEach((quote) => {
        if (gameState.placements[quote.id] === quote.phase) {
          correctCount++;
        }
      });

      // Check titles
      phaseTitles.forEach((title) => {
        if (gameState.titlePlacements[title.id] === title.phase) {
          correctCount++;
        }
      });

      // User piece should be in incubation
      if (gameState.placements["user-answer"] === "incubation") {
        correctCount++;
      }

      // Calculate final points (with time bonus)
      const basePoints = calculatePoints();
      const timeBonus = Math.max(0, Math.floor((300000 - totalTime) / 1000)); // Bonus for speed
      const finalPoints = basePoints + timeBonus;

      // Update leaderboard
      const newScore: PlayerScore = {
        name: playerName,
        score: correctCount,
        points: finalPoints,
        time: totalTime,
        timestamp: Date.now(),
      };

      const updatedLeaderboard = [...leaderboard, newScore]
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.score !== a.score) return b.score - a.score;
          return a.time - b.time;
        })
        .slice(0, 10);

      setLeaderboard(updatedLeaderboard);
      sessionStorage.setItem("creativity-leaderboard", JSON.stringify(updatedLeaderboard));

      setGameState((prev) => ({
        ...prev,
        isCompleted: true,
        endTime,
        points: finalPoints,
      }));

      setTimeout(() => {
        toast.success(`Puzzle complete! ${correctCount}/${totalItems} correct! ${finalPoints} points!`);
      }, 500);
    }
  }, [gameState.placements, gameState.titlePlacements, gameState.isCompleted, gameState.startTime, playerName, leaderboard, calculatePoints]);

  useEffect(() => {
    if (gameState.isStarted && !gameState.isCompleted) {
      checkCompletion();
    }
  }, [gameState.isStarted, gameState.isCompleted, checkCompletion]);

  // Check for game master time end
  useEffect(() => {
    if (gameState.isStarted && !gameState.isCompleted) {
      const checkGameEnd = setInterval(() => {
        const endTime = localStorage.getItem("game-end-time");
        if (endTime && parseInt(endTime) <= Date.now()) {
          setGameEndedByMaster(true);
          const totalTime = Date.now() - (gameState.startTime || Date.now());
          const finalPoints = calculatePoints();
          
          const newScore: PlayerScore = {
            name: playerName,
            score: Object.keys(gameState.placements).filter((id) => {
              if (id === "user-answer") return gameState.placements[id] === "incubation";
              const quote = quotes.find((q) => q.id === id);
              return quote && gameState.placements[id] === quote.phase;
            }).length + Object.keys(gameState.titlePlacements).filter((id) => {
              const title = phaseTitles.find((t) => t.id === id);
              return title && gameState.titlePlacements[id] === title.phase;
            }).length,
            points: finalPoints,
            time: totalTime,
            timestamp: Date.now(),
          };

          const updatedLeaderboard = [...leaderboard, newScore]
            .sort((a, b) => {
              if (b.points !== a.points) return b.points - a.points;
              if (b.score !== a.score) return b.score - a.score;
              return a.time - b.time;
            })
            .slice(0, 10);

          setLeaderboard(updatedLeaderboard);
          sessionStorage.setItem("creativity-leaderboard", JSON.stringify(updatedLeaderboard));

          setGameState((prev) => ({
            ...prev,
            isCompleted: true,
            endTime: Date.now(),
            points: finalPoints,
          }));
        }
      }, 1000);

      return () => clearInterval(checkGameEnd);
    }
  }, [gameState.isStarted, gameState.isCompleted, gameState.startTime, gameState.placements, gameState.titlePlacements, playerName, leaderboard, calculatePoints]);

  const handleGameMasterTimeEnd = () => {
    setGameEndedByMaster(true);
  };

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
  };

  if (!gameState.isStarted) {
    return <StartScreen onStart={handleStart} />;
  }

  if (gameState.isCompleted) {
    let score = Object.keys(gameState.placements).filter((id) => {
      if (id === "user-answer") return gameState.placements[id] === "incubation";
      const quote = quotes.find((q) => q.id === id);
      return quote && gameState.placements[id] === quote.phase;
    }).length;

    // Add title scores
    score += Object.keys(gameState.titlePlacements).filter((id) => {
      const title = phaseTitles.find((t) => t.id === id);
      return title && gameState.titlePlacements[id] === title.phase;
    }).length;

    return (
      <EndScreen
        score={score}
        points={gameState.points}
        time={gameState.endTime! - gameState.startTime!}
        totalQuotes={quotes.length + 1 + phaseTitles.length}
        onRestart={handleRestart}
        leaderboard={leaderboard}
        showTop5={gameEndedByMaster}
      />
    );
  }

  // Calculate correct placements for puzzle progress
  let correctPlacements = Object.keys(gameState.placements).filter((id) => {
    if (id === "user-answer") return gameState.placements[id] === "incubation";
    const quote = quotes.find((q) => q.id === id);
    return quote && gameState.placements[id] === quote.phase;
  }).length;

  // Add correct title placements
  correctPlacements += Object.keys(gameState.titlePlacements).filter((id) => {
    const title = phaseTitles.find((t) => t.id === id);
    return title && gameState.titlePlacements[id] === title.phase;
  }).length;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-background via-primary/5 to-accent/5 relative">
      <GameMaster onTimeEnd={handleGameMasterTimeEnd} />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Creativity is...
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Sort the quotes into the correct creative phases
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Timer startTime={gameState.startTime} isCompleted={gameState.isCompleted} />
            <div className="bg-card border-2 border-border rounded-lg px-6 py-3 text-center">
              <div className="text-sm text-muted-foreground mb-1">Points</div>
              <div className="text-2xl font-bold text-primary font-mono">
                {gameState.points}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Items sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
            {/* Phase titles to sort */}
            {availableTitles.length > 0 && (
              <div className="bg-accent/20 border-2 border-accent rounded-xl p-4">
                <h3 className="text-sm font-bold text-foreground mb-2">
                  Phase Titles ({availableTitles.length})
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Drag titles to the correct phases first
                </p>
                <div className="space-y-2">
                  {availableTitles.map((title) => (
                    <div
                      key={title.id}
                      draggable
                      onDragStart={() => handleDragStartTitle(title)}
                      onDragEnd={handleDragEnd}
                      className="cursor-move touch-manipulation bg-accent/30 border-2 border-accent rounded-lg p-3 text-center font-bold hover:bg-accent/40 transition-colors active:scale-95"
                      style={{ opacity: draggedTitle?.id === title.id ? 0.5 : 1 }}
                    >
                      {title.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User's puzzle piece (before placement) */}
            {userPuzzlePiece && (
              <div className="bg-primary/10 border-2 border-primary rounded-xl p-4">
                <h3 className="text-sm font-bold text-primary mb-3">
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

            {/* Available quotes to sort */}
            {availableQuotes.length > 0 && (
              <div className="bg-card/50 rounded-xl p-4 border-2 border-border max-h-[500px] overflow-y-auto">
                <h3 className="text-sm font-bold text-foreground mb-2">
                  Quotes to Sort ({availableQuotes.length})
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Drag to the correct phase
                </p>
                <div className="space-y-2 pr-2">
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

          {/* Interactive Jigsaw Puzzle Board */}
          <div className="flex-1 w-full">
            <PuzzleBoard
              correctPlacements={correctPlacements}
              totalPieces={quotes.length + 1 + phaseTitles.length}
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

