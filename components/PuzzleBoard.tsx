"use client";

import { useState, useEffect } from "react";
import { Quote, PhaseTitle, Phase } from "@/types/game";
import { QuoteCard } from "./QuoteCard";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface PuzzleBoardProps {
  correctPlacements: number;
  totalPieces: number;
  wrongAttempts: number;
  boardBackground: string;
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

const phases = [
  { 
    id: "preparation", 
    label: "Preparation", 
    color: "#FF6B35",
    goosePosition: { left: "5%", top: "5%" },
    goosePositionMobile: { left: "2%", top: "3%" },
    dropZonePosition: { left: "10%", top: "20%" }
  },
  { 
    id: "incubation", 
    label: "Incubation", 
    color: "#4ECDC4",
    goosePosition: { left: "25%", top: "5%" },
    goosePositionMobile: { left: "22%", top: "3%" },
    dropZonePosition: { left: "30%", top: "20%" }
  },
  { 
    id: "illumination", 
    label: "Illumination", 
    color: "#FFE66D",
    goosePosition: { left: "45%", top: "5%" },
    goosePositionMobile: { left: "42%", top: "3%" },
    dropZonePosition: { left: "50%", top: "20%" }
  },
  { 
    id: "verification", 
    label: "Verification", 
    color: "#95E1D3",
    goosePosition: { left: "65%", top: "5%" },
    goosePositionMobile: { left: "62%", top: "3%" },
    dropZonePosition: { left: "70%", top: "20%" }
  },
] as const;

export function PuzzleBoard({
  correctPlacements,
  totalPieces,
  wrongAttempts,
  boardBackground,
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
}: PuzzleBoardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallScreen(window.innerWidth < 640);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const progress = (correctPlacements / totalPieces) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-card border-2 border-border rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-3 mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            Puzzle Progress
          </span>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
            <span className="text-muted-foreground">
              {correctPlacements}/{totalPieces} pieces placed correctly
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full border text-[10px] sm:text-xs ${
                wrongAttempts > 0
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-border text-muted-foreground"
              }`}
            >
              {wrongAttempts} wrong attempt{wrongAttempts === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Elephant Puzzle Board with Background Image Design */}
      <div 
        className="relative rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 lg:p-8 min-h-[500px] sm:min-h-[600px] md:min-h-[700px] overflow-hidden"
        style={
          boardBackground.includes("url(")
            ? {
                backgroundImage: boardBackground,
                backgroundSize: "cover",
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
              }
            : { background: boardBackground }
        }
      >
      {/* Overlay for better drop zone visibility */}
      <div className="absolute inset-0 bg-black/5"></div>

        {/* Four Geese Drop Zones for Phase Titles */}
        {phases.map((phase) => {
          const title = placedTitles[phase.id];
          return (
            <div 
              key={phase.id} 
              className="absolute z-30"
              style={isSmallScreen ? phase.goosePositionMobile : phase.goosePosition}
            >
              {/* Phase Label Drop Zone - positioned near geese in image */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedTitle) onDragOver(e, phase.id as Phase);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedTitle) onDrop(phase.id as Phase);
                }}
                className={cn(
                  "w-24 sm:w-28 md:w-32 lg:w-36 h-10 sm:h-12 md:h-14 flex items-center justify-center rounded-lg border-2 transition-all cursor-pointer shadow-xl backdrop-blur-sm touch-manipulation",
                  title
                    ? "bg-green-500/50 border-green-600"
                    : "bg-orange-400/60 border-orange-600 border-dashed"
                )}
              >
                {title ? (
                  <span className="text-xs sm:text-sm font-bold text-green-800 text-center px-1">{title.title}</span>
                ) : (
                  <span className="text-[10px] sm:text-xs text-orange-800 font-semibold text-center px-1">Drop &quot;{phase.label}&quot;</span>
                )}
              </div>
              
              {/* Phase Label Below Drop Zone */}
              <div className="text-center mt-1 sm:mt-2">
                <span className="text-xs sm:text-sm md:text-base font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded bg-white/90 shadow-md" style={{ color: phase.color }}>
                  {phase.label}
                </span>
              </div>
            </div>
          );
        })}

        {/* Drop Zones for Quotes - Positioned on Elephant Body */}
        {phases.map((phase) => {
          const quotes = placedQuotes[phase.id] || [];
          const title = placedTitles[phase.id];
          const isHighlighted = highlightedZone === phase.id;

          // Different positions for each phase on the elephant - responsive
          const zonePositions = isMobile ? {
            preparation: { left: "2%", top: "30%", width: "46%" },
            incubation: { left: "52%", top: "30%", width: "46%" },
            illumination: { left: "2%", top: "55%", width: "46%" },
            verification: { left: "52%", top: "55%", width: "46%" },
          } : {
            preparation: { left: "12%", top: "35%" },
            incubation: { left: "32%", top: "40%" },
            illumination: { left: "52%", top: "45%" },
            verification: { left: "72%", top: "50%" },
          };

          const position = zonePositions[phase.id as keyof typeof zonePositions];
          return (
            <div
              key={phase.id}
              className="absolute z-20"
              style={position}
            >
              <div
                onDragOver={(e) => onDragOver(e, phase.id as Phase)}
                onDrop={(e) => {
                  e.preventDefault();
                  onDrop(phase.id as Phase);
                }}
                className={cn(
                  "relative w-full min-w-[140px] sm:min-w-[180px] md:min-w-[220px] min-h-[100px] sm:min-h-[120px] md:min-h-[140px] rounded-lg border-2 transition-all p-2 sm:p-3 shadow-lg touch-manipulation",
                  isHighlighted
                    ? "ring-4 ring-primary ring-offset-2 scale-105 sm:scale-110 z-30"
                    : "",
                  title && quotes.length > 0
                    ? "bg-green-100/90 border-green-500"
                    : "bg-white/80 border-dashed border-gray-400"
                )}
              >
                {/* Check mark if title is placed */}
                {title && (
                  <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-green-500 rounded-full p-0.5 sm:p-1 z-10">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                )}

                {/* Phase indicator */}
                <div className="text-center mb-1 sm:mb-2">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-800 truncate">
                    {title ? title.title : phase.label}
                  </h3>
                </div>

                {/* Placed quotes */}
                <div className="space-y-1 max-h-24 sm:max-h-28 md:max-h-32 overflow-y-auto">
                  {quotes.map((quote) => (
                    <div
                      key={quote.id}
                      draggable
                      onDragStart={() => onDragStart(quote)}
                      onDragEnd={onDragEnd}
                      className="cursor-move touch-manipulation"
                    >
                      <div className="text-[10px] sm:text-xs bg-white/95 p-1.5 sm:p-2 rounded border border-gray-300 shadow-sm">
                        <div className="font-semibold truncate text-gray-800">{quote.author}</div>
                        <div className="text-gray-600 truncate text-[9px] sm:text-xs">&quot;{quote.text.substring(0, isMobile ? 25 : 35)}...&quot;</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty state */}
                {title && quotes.length === 0 && (
                  <div className="text-center text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-4">
                    Drop quotes here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
