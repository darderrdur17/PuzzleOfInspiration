"use client";

import { cn } from "@/lib/utils";

interface WordPuzzlePieceProps {
  word: string;
  isDragging?: boolean;
  isPlaced?: boolean;
  variant?: "purple" | "orange" | "green" | "gold";
  size?: "small" | "medium" | "large";
}

export function WordPuzzlePiece({ 
  word, 
  isDragging = false, 
  isPlaced = false,
  variant = "purple",
  size = "medium"
}: WordPuzzlePieceProps) {
  const sizeClasses = {
    small: "w-16 h-16 text-xs px-2",
    medium: "w-20 h-20 sm:w-24 sm:h-24 text-sm sm:text-base px-2 sm:px-3",
    large: "w-28 h-28 sm:w-32 sm:h-32 text-base sm:text-lg px-3 sm:px-4",
  };

  const colorClasses = {
    purple: "bg-gradient-to-br from-puzzle-purple to-purple-700 border-puzzle-purple text-white shadow-glow-purple",
    orange: "bg-gradient-to-br from-puzzle-orange to-orange-700 border-puzzle-orange text-white shadow-glow-orange",
    green: "bg-gradient-to-br from-puzzle-green to-green-700 border-puzzle-green text-white shadow-glow-green",
    gold: "bg-gradient-to-br from-puzzle-gold to-yellow-600 border-puzzle-gold text-gray-900 shadow-glow-gold",
  };

  // Simple puzzle piece shape with one tab
  const tabPosition = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left

  return (
    <div
      className={cn(
        "relative cursor-move touch-manipulation transition-all duration-300 flex items-center justify-center font-bold border-2 rounded-lg",
        sizeClasses[size],
        colorClasses[variant],
        {
          "opacity-50 scale-90": isDragging,
          "scale-105 shadow-xl": !isDragging && !isPlaced,
          "shadow-lg ring-2 ring-green-500": isPlaced,
        }
      )}
      draggable
    >
      {/* Puzzle tab indicator */}
      <div className={cn(
        "absolute w-4 h-4 rounded-full border-2 border-white/50",
        tabPosition === 0 && "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
        tabPosition === 1 && "right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
        tabPosition === 2 && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
        tabPosition === 3 && "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2",
        variant === "gold" ? "bg-gray-900/30" : "bg-white/30"
      )}></div>

      {/* Word text */}
      <span className="relative z-10 text-center break-words">
        {word}
      </span>

      {/* Glow effect when placed */}
      {isPlaced && (
        <div className="absolute inset-0 rounded-lg bg-green-500/30 animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
}








