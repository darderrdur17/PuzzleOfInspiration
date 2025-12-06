import { useState, useEffect } from "react";

interface TimerProps {
  startTime: number | null;
  loginTime: number | null;
  isCompleted: boolean;
}

export function Timer({ startTime, loginTime, isCompleted }: TimerProps) {
  const [loginElapsed, setLoginElapsed] = useState(0);
  const [gameElapsed, setGameElapsed] = useState(0);

  useEffect(() => {
    if (!loginTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setLoginElapsed(now - loginTime);
      if (startTime) {
        setGameElapsed(now - startTime);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [loginTime, startTime, isCompleted]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-card border-2 border-border rounded-lg px-3 sm:px-4 md:px-6 py-2 sm:py-3">
      <div className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
        Session Time
      </div>
      <div className="text-xl sm:text-2xl font-bold text-primary font-mono">
        {formatTime(loginElapsed)}
      </div>
      {startTime && (
        <div className="text-xs text-muted-foreground mt-1">
          Game: {formatTime(gameElapsed)}
        </div>
      )}
    </div>
  );
}

