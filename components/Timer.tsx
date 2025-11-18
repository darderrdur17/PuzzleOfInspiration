import { useState, useEffect } from "react";

interface TimerProps {
  startTime: number | null;
  isCompleted: boolean;
}

export function Timer({ startTime, isCompleted }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime || isCompleted) return;

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, isCompleted]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-card border-2 border-border rounded-lg px-6 py-3">
      <div className="text-sm text-muted-foreground mb-1">Time</div>
      <div className="text-2xl font-bold text-foreground font-mono">
        {formatTime(elapsed)}
      </div>
    </div>
  );
}

