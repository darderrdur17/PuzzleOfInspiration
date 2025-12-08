"use client";

import { Quote } from "@/types/game";
import { cn } from "@/lib/utils";

interface PuzzlePieceProps {
  quote: Quote;
  isDragging?: boolean;
  isPlaced?: boolean;
  variant?: "purple" | "orange" | "green" | "gold";
  size?: "small" | "medium" | "large";
}

export function PuzzlePiece({ 
  quote, 
  isDragging = false, 
  isPlaced = false,
  variant = "purple",
  size = "medium"
}: PuzzlePieceProps) {
  const sizeClasses = {
    small: "w-24 h-24 text-[8px]",
    medium: "w-32 h-32 sm:w-36 sm:h-36 text-[10px] sm:text-xs",
    large: "w-40 h-40 sm:w-48 sm:h-48 text-xs sm:text-sm",
  };

  const colorClasses = {
    purple: "bg-gradient-to-br from-puzzle-purple to-purple-700 border-puzzle-purple text-white",
    orange: "bg-gradient-to-br from-puzzle-orange to-orange-700 border-puzzle-orange text-white",
    green: "bg-gradient-to-br from-puzzle-green to-green-700 border-puzzle-green text-white",
    gold: "bg-gradient-to-br from-puzzle-gold to-yellow-600 border-puzzle-gold text-gray-900",
  };

  // Generate consistent puzzle tab pattern based on quote ID
  const hash = quote.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const tabs = {
    top: hash % 2 === 0,
    right: (hash >> 1) % 2 === 0,
    bottom: (hash >> 2) % 2 === 0,
    left: (hash >> 3) % 2 === 0,
  };

  return (
    <div
      className={cn(
        "relative cursor-move touch-manipulation transition-all duration-300 rounded-lg border-2 overflow-hidden bg-white/90 backdrop-blur-sm",
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

      {/* Puzzle Tab Indicators */}
      {tabs.top && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-4 rounded-full border-2 border-white/50 bg-white/20"></div>
      )}
      {tabs.right && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-6 rounded-full border-2 border-white/50 bg-white/20"></div>
      )}
      {tabs.bottom && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-4 rounded-full border-2 border-white/50 bg-white/20"></div>
      )}
      {tabs.left && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-6 rounded-full border-2 border-white/50 bg-white/20"></div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-2 text-center">
        <p className={cn(
          "font-semibold leading-tight line-clamp-3 text-[9px] sm:text-[10px]",
          variant === "gold" ? "text-gray-900" : "text-white"
        )}>
          {quote.text.length > 40 ? `${quote.text.substring(0, 40)}...` : quote.text}
        </p>
        <p className={cn(
          "mt-1 font-bold text-[7px] sm:text-[8px]",
          variant === "gold" ? "text-gray-700" : "text-white/90"
        )}>
          — {quote.author}
        </p>
      </div>

      {/* Glow effect when placed */}
      {isPlaced && (
        <div className="absolute inset-0 rounded-lg bg-green-500/20 animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
}

