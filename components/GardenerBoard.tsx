"use client";

import { useState, useEffect } from "react";
import { Quote, PhaseTitle, Phase } from "@/types/game";
import { cn } from "@/lib/utils";
import { CheckCircle2, Droplets, Flower2 } from "lucide-react";
import { PuzzlePiece } from "./PuzzlePiece";

interface GardenerBoardProps {
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

const GARDEN_BEDS = [
  { id: "preparation", label: "Seed Bed", icon: "🌱", position: { top: "5%", left: "5%" } },
  { id: "incubation", label: "Water Flow", icon: "💧", position: { top: "5%", right: "5%" } },
  { id: "illumination", label: "Bloom Garden", icon: "🌸", position: { bottom: "5%", left: "5%" } },
  { id: "verification", label: "Harmony Plot", icon: "🌺", position: { bottom: "5%", right: "5%" } },
] as const;

export function GardenerBoard({
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
}: GardenerBoardProps) {
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
            Garden Growth Progress
          </span>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
            <span className="text-muted-foreground">
              {correctPlacements}/{totalPieces} plots cultivated
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
            className="h-full bg-gradient-to-r from-gardener-green via-gardener-pink to-puzzle-gold transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Garden Board */}
      <div className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 min-h-[600px] sm:min-h-[700px] md:min-h-[800px] overflow-hidden bg-gradient-to-b from-gardener-sky via-gardener-green to-gardener-brown">
        {/* Garden Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-brown-500/20"></div>
        
        {/* Background Image Placeholder - Garden Scene */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl sm:text-8xl md:text-9xl">🌱</div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 opacity-20">
          <Flower2 className="w-full h-full text-gardener-pink animate-float" />
        </div>
        <div className="absolute bottom-20 right-20 w-16 h-16 opacity-20">
          <Droplets className="w-full h-full text-gardener-sky animate-float" style={{ animationDelay: "1s" }} />
        </div>

        {/* Four Garden Beds */}
        {GARDEN_BEDS.map((bed) => {
          const phase = bed.id as Phase;
          const quotes = placedQuotes[phase] || [];
          const title = placedTitles[phase];
          const isHighlighted = highlightedZone === phase;

          return (
            <div
              key={bed.id}
              className="absolute z-20"
              style={isMobile ? {
                ...("top" in bed.position ? { top: bed.position.top } : {}),
                ...("bottom" in bed.position ? { bottom: bed.position.bottom } : {}),
                ...("left" in bed.position ? { left: bed.position.left } : {}),
                ...("right" in bed.position ? { right: bed.position.right } : {}),
              } : bed.position}
            >
              {/* Garden Bed Container */}
              <div className="relative">
                {/* Highlight Glow */}
                {isHighlighted && (
                  <div className="absolute inset-0 rounded-xl blur-xl bg-gardener-green/50 animate-pulse"></div>
                )}

                {/* Garden Bed Drop Zone */}
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
                    "relative w-48 sm:w-56 md:w-64 min-h-[200px] sm:min-h-[220px] rounded-xl border-2 transition-all shadow-xl backdrop-blur-sm",
                    title && quotes.length > 0
                      ? "bg-gardener-green/40 border-gardener-green"
                      : "bg-gardener-brown/30 border-gardener-brown border-dashed",
                    isHighlighted && "ring-4 ring-primary ring-offset-2 scale-105 z-30"
                  )}
                >
                  {/* Soil Texture */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gardener-brown/20 to-gardener-brown/40 rounded-xl"></div>

                  {/* Title Drop Zone */}
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
                      "mb-2 p-2 rounded-lg border-2 text-center transition-all relative z-10",
                      title
                        ? "bg-green-500/50 border-green-600"
                        : "bg-orange-400/60 border-orange-600 border-dashed"
                    )}
                  >
                    <span className="text-lg sm:text-xl mr-2">{bed.icon}</span>
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

                  {/* Bed Label */}
                  <div className="text-center mb-2 relative z-10">
                    <span className="text-xs sm:text-sm font-bold text-white bg-gardener-brown/50 px-2 py-1 rounded">
                      {bed.label}
                    </span>
                  </div>

                  {/* Quotes Container as Puzzle Pieces (Seeds/Plants) */}
                  <div className="flex flex-wrap gap-2 max-h-32 sm:max-h-40 overflow-y-auto justify-center relative z-10">
                    {quotes.map((quote, index) => {
                      const variants: Array<"purple" | "orange" | "green" | "gold"> = ["green", "gold", "purple", "orange"];
                      const variant = variants[index % variants.length];
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
                    <div className="text-center text-[10px] sm:text-xs text-white/70 mt-2 relative z-10">
                      Drop quotes here to plant seeds
                    </div>
                  )}

                  {/* Decorative Plant Sprouts */}
                  {quotes.length > 0 && (
                    <div className="absolute bottom-2 left-2 flex gap-1 opacity-50">
                      {quotes.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-gardener-green rounded-full"></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

