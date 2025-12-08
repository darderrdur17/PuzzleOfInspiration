"use client";

import { useState, useEffect } from "react";
import { Quote, PhaseTitle, Phase } from "@/types/game";
import { cn } from "@/lib/utils";
import { CheckCircle2, Sparkles } from "lucide-react";
import { PuzzlePiece } from "./PuzzlePiece";

interface AlchemistBoardProps {
  correctPlacements: number;
  totalPieces: number;
  wrongAttempts: number;
  placedQuotes: Record<string, Quote[]>;
  placedTitles: Record<string, PhaseTitle | null>;
  onDrop: (phase: Phase) => void;
  onDragOver: (e: React.DragEvent, zone: Phase) => void;
  highlightedZone: Phase | null;
  onDragStart: (quote: Quote) => void;
  onDragStartTitle: (title: PhaseTitle) => void;
  onDragEnd: () => void;
  draggedQuote: Quote | null;
  draggedTitle: PhaseTitle | null;
}

const ELEMENTS = [
  { id: "preparation", element: "fire", colorClass: "purple", position: { top: "10%", left: "10%" } },
  { id: "incubation", element: "water", colorClass: "blue", position: { top: "10%", right: "10%" } },
  { id: "illumination", element: "earth", colorClass: "green", position: { bottom: "10%", left: "10%" } },
  { id: "verification", element: "air", colorClass: "gold", position: { bottom: "10%", right: "10%" } },
] as const;

const getColorClasses = (colorClass: string) => {
  switch (colorClass) {
    case "purple":
      return {
        bg: "bg-puzzle-purple/30",
        border: "border-puzzle-purple",
        borderLight: "border-puzzle-purple/50",
        text: "text-puzzle-purple",
        glow: "bg-puzzle-purple/50",
      };
    case "blue":
      return {
        bg: "bg-blue-500/30",
        border: "border-blue-400",
        borderLight: "border-blue-500/50",
        text: "text-blue-400",
        glow: "bg-blue-500/50",
      };
    case "green":
      return {
        bg: "bg-puzzle-green/30",
        border: "border-puzzle-green",
        borderLight: "border-puzzle-green/50",
        text: "text-puzzle-green",
        glow: "bg-puzzle-green/50",
      };
    case "gold":
      return {
        bg: "bg-puzzle-gold/30",
        border: "border-puzzle-gold",
        borderLight: "border-puzzle-gold/50",
        text: "text-puzzle-gold",
        glow: "bg-puzzle-gold/50",
      };
    default:
      return {
        bg: "bg-gray-500/30",
        border: "border-gray-400",
        borderLight: "border-gray-500/50",
        text: "text-gray-400",
        glow: "bg-gray-500/50",
      };
  }
};

export function AlchemistBoard({
  correctPlacements,
  totalPieces,
  wrongAttempts,
  placedQuotes,
  placedTitles,
  onDrop,
  onDragOver,
  highlightedZone,
  onDragStart,
  onDragStartTitle,
  onDragEnd,
  draggedQuote,
  draggedTitle,
}: AlchemistBoardProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const progress = (correctPlacements / totalPieces) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-card border-2 border-border rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-3 mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            Elemental Alignment Progress
          </span>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
            <span className="text-muted-foreground">
              {correctPlacements}/{totalPieces} elements aligned
            </span>
            {wrongAttempts > 0 && (
              <span className="font-semibold px-2 py-0.5 rounded-full border border-destructive/40 bg-destructive/10 text-destructive text-[10px] sm:text-xs">
                {wrongAttempts} wrong attempt{wrongAttempts === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-puzzle-purple via-puzzle-orange to-puzzle-gold transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Alchemist Astrolabe Board */}
      <div
        className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 min-h-[600px] sm:min-h-[700px] md:min-h-[800px] overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(160deg, rgba(34,12,54,0.82), rgba(9,40,68,0.82)),
            url('/images/ui/05_ui_elements_collection.png'),
            url('/images/alchemist/06_alchemist_preparation_phase.png')
          `,
          backgroundSize: "cover, cover, cover",
          backgroundPosition: "center, center, center",
          backgroundRepeat: "no-repeat, no-repeat, no-repeat",
        }}
      >
        {/* Soft overlay for readability */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
        
        {/* Central Astrolabe Circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
          <div className="relative w-full h-full">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-puzzle-gold/30 animate-pulse-glow"></div>
            {/* Inner Ring */}
            <div className="absolute inset-4 rounded-full border-2 border-puzzle-purple/50"></div>
            {/* Center Point */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-puzzle-gold shadow-glow-gold"></div>
          </div>
        </div>

        {/* Four Elemental Crystals/Slots */}
        {ELEMENTS.map((elem) => {
          const phase = elem.id as Phase;
          const quotes = placedQuotes[phase] || [];
          const title = placedTitles[phase];
          const isHighlighted = highlightedZone === phase;
          const colors = getColorClasses(elem.colorClass);

          return (
            <div
              key={elem.id}
              className="absolute z-20"
              style={isMobile ? {
                ...("top" in elem.position ? { top: elem.position.top } : {}),
                ...("bottom" in elem.position ? { bottom: elem.position.bottom } : {}),
                ...("left" in elem.position ? { left: elem.position.left } : {}),
                ...("right" in elem.position ? { right: elem.position.right } : {}),
              } : elem.position}
            >
              {/* Crystal Container */}
              <div className="relative">
                {/* Crystal Glow Effect */}
                {isHighlighted && (
                  <div className={cn("absolute inset-0 rounded-lg blur-xl animate-pulse", colors.glow)}></div>
                )}

                {/* Crystal Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedTitle) onDragOver(e, phase);
                    if (draggedQuote) onDragOver(e, phase);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    onDrop(phase);
                  }}
                  className={cn(
                    "relative w-48 sm:w-56 md:w-64 min-h-[180px] sm:min-h-[200px] rounded-xl border-2 transition-all shadow-xl backdrop-blur-sm",
                    title && quotes.length > 0
                      ? cn(colors.bg, colors.border)
                      : cn(colors.bg.replace("/30", "/20"), colors.borderLight, "border-dashed"),
                    isHighlighted && "ring-4 ring-primary ring-offset-2 scale-105 z-30",
                    "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.05),transparent_40%)]"
                  )}
                >
                  {/* Title Drop Zone at Top */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedTitle) onDragOver(e, phase);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedTitle) onDrop(phase);
                    }}
                    className={cn(
                      "mb-2 p-2 rounded-lg border-2 text-center transition-all",
                      title
                        ? "bg-green-500/50 border-green-600"
                        : "bg-orange-400/60 border-orange-600 border-dashed"
                    )}
                  >
                    {title ? (
                      <span className="text-xs sm:text-sm font-bold text-green-800">{title.title}</span>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-orange-800 font-semibold">
                        Drop Phase Title
                      </span>
                    )}
                  </div>

                  {/* Check Mark */}
                  {title && (
                    <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-green-500 rounded-full p-0.5 sm:p-1 z-10">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  )}

                  {/* Element Icon */}
                  <div className="text-center mb-2">
                    <Sparkles className={cn("w-6 h-6 sm:w-8 sm:h-8 mx-auto", colors.text)} />
                    <span className="text-xs sm:text-sm font-bold text-white capitalize">{elem.element}</span>
                  </div>

                  {/* Quotes Container as Puzzle Pieces */}
                  <div className="flex flex-wrap gap-2 max-h-32 sm:max-h-40 overflow-y-auto justify-center">
                    {quotes.map((quote, index) => {
                      const variants: Array<"purple" | "orange" | "green" | "gold"> = ["purple", "orange", "green", "gold"];
                      const variantMap: Record<string, "purple" | "orange" | "green" | "gold"> = {
                        purple: "purple",
                        blue: "purple", // Use purple for blue variant (alchemist blue element)
                        green: "green",
                        gold: "gold",
                      };
                      const variant = variantMap[elem.colorClass] || variants[index % variants.length];
                      return (
                        <div
                          key={quote.id}
                          draggable
                          onDragStart={() => onDragStart(quote)}
                          onDragEnd={onDragEnd}
                          className="cursor-move touch-manipulation"
                        >
                          <PuzzlePiece
                            quote={quote}
                            variant={variant}
                            size="small"
                            isPlaced={true}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Empty State */}
                  {title && quotes.length === 0 && (
                    <div className="text-center text-[10px] sm:text-xs text-white/70 mt-2">
                      Drop quotes here
                    </div>
                  )}
                </div>

                {/* Connecting Line to Center (Visual) */}
                <div className="absolute top-1/2 left-1/2 w-px h-32 sm:h-40 bg-gradient-to-b from-transparent via-puzzle-gold/50 to-transparent transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

