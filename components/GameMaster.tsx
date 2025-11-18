"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, Square } from "lucide-react";

interface GameMasterProps {
  onTimeEnd: () => void;
  onTimeUpdate?: (remaining: number) => void;
}

export function GameMaster({ onTimeEnd, onTimeUpdate }: GameMasterProps) {
  const [isGameMaster, setIsGameMaster] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number>(300); // 5 minutes default
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  useEffect(() => {
    // Check if user is game master (stored in localStorage)
    const stored = localStorage.getItem("game-master-active");
    if (stored === "true") {
      setIsGameMaster(true);
      const endTime = localStorage.getItem("game-end-time");
      if (endTime) {
        const end = parseInt(endTime);
        if (end > Date.now()) {
          setRemainingTime(Math.floor((end - Date.now()) / 1000));
          setIsRunning(true);
        } else {
          setGameEnded(true);
          onTimeEnd();
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isRunning && remainingTime !== null && remainingTime > 0) {
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev === null || prev <= 1) {
            setIsRunning(false);
            setGameEnded(true);
            localStorage.removeItem("game-end-time");
            localStorage.removeItem("game-master-active");
            onTimeEnd();
            return 0;
          }
          const newTime = prev - 1;
          onTimeUpdate?.(newTime);
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, remainingTime]);

  const handleStartGame = () => {
    const endTime = Date.now() + timeLimit * 1000;
    localStorage.setItem("game-end-time", endTime.toString());
    localStorage.setItem("game-master-active", "true");
    setRemainingTime(timeLimit);
    setIsRunning(true);
    setIsGameMaster(true);
  };

  const handleStopGame = () => {
    setIsRunning(false);
    setRemainingTime(null);
    localStorage.removeItem("game-end-time");
    localStorage.removeItem("game-master-active");
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isGameMaster && !gameEnded) {
    return (
      <div className="fixed bottom-4 right-4 bg-card border-2 border-border rounded-lg p-4 shadow-lg z-50">
        <Button
          onClick={() => setIsGameMaster(true)}
          variant="outline"
          size="sm"
        >
          Become Game Master
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-card border-2 border-primary rounded-lg p-4 shadow-xl z-50 min-w-[250px]">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">Game Master</h3>
      </div>

      {!isRunning && remainingTime === null && (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={Math.floor(timeLimit / 60)}
              onChange={(e) => setTimeLimit(parseInt(e.target.value) * 60)}
              className="w-full px-3 py-2 border border-input rounded-lg"
            />
          </div>
          <Button onClick={handleStartGame} className="w-full" size="sm">
            <Play className="w-4 h-4 mr-2" />
            Start Game
          </Button>
        </div>
      )}

      {isRunning && remainingTime !== null && (
        <div className="space-y-3">
          <div className="text-center">
            <div className={`text-3xl font-bold ${remainingTime <= 30 ? "text-destructive" : "text-primary"}`}>
              {formatTime(remainingTime)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Time Remaining</div>
          </div>
          <Button onClick={handleStopGame} variant="destructive" className="w-full" size="sm">
            <Square className="w-4 h-4 mr-2" />
            End Game
          </Button>
        </div>
      )}

      {gameEnded && (
        <div className="text-center text-destructive font-bold">
          Game Ended!
        </div>
      )}
    </div>
  );
}

