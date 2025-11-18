"use client";

import { Quote, PhaseTitle, Phase } from "@/types/game";
import { QuoteCard } from "./QuoteCard";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface PuzzleBoardProps {
  correctPlacements: number;
  totalPieces: number;
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
    goosePosition: { left: "8%", top: "8%" },
    dropZonePosition: { left: "10%", top: "20%" }
  },
  { 
    id: "incubation", 
    label: "Incubation", 
    color: "#4ECDC4",
    goosePosition: { left: "28%", top: "8%" },
    dropZonePosition: { left: "30%", top: "20%" }
  },
  { 
    id: "illumination", 
    label: "Illumination", 
    color: "#FFE66D",
    goosePosition: { left: "48%", top: "8%" },
    dropZonePosition: { left: "50%", top: "20%" }
  },
  { 
    id: "verification", 
    label: "Verification", 
    color: "#95E1D3",
    goosePosition: { left: "68%", top: "8%" },
    dropZonePosition: { left: "70%", top: "20%" }
  },
] as const;

export function PuzzleBoard({
  correctPlacements,
  totalPieces,
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
  const progress = (correctPlacements / totalPieces) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-card border-2 border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">
            Puzzle Progress
          </span>
          <span className="text-sm text-muted-foreground">
            {correctPlacements}/{totalPieces} pieces placed correctly
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Elephant Puzzle Board with Background Image Design */}
      <div 
        className="relative rounded-2xl p-8 min-h-[700px] overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(/5.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
      {/* Overlay for better drop zone visibility */}
      <div className="absolute inset-0 bg-black/5"></div>

        {/* Four Geese Drop Zones for Phase Titles */}
        {phases.map((phase) => {
          const title = placedTitles[phase.id];
          return (
            <div key={phase.id} className="absolute z-30" style={phase.goosePosition}>
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
                  "w-36 h-14 flex items-center justify-center rounded-lg border-3 transition-all cursor-pointer shadow-xl backdrop-blur-sm",
                  title
                    ? "bg-green-500/40 border-green-600 border-2"
                    : "bg-orange-400/50 border-orange-600 border-2 border-dashed"
                )}
              >
                {title ? (
                  <span className="text-sm font-bold text-green-800">{title.title}</span>
                ) : (
                  <span className="text-xs text-orange-800 font-semibold">Drop &quot;{phase.label}&quot;</span>
                )}
              </div>
              
              {/* Phase Label Below Drop Zone */}
              <div className="text-center mt-2">
                <span className="text-base font-bold px-3 py-1 rounded bg-white/80 shadow-md" style={{ color: phase.color }}>
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

          // Different positions for each phase on the elephant
          const zonePositions = {
            preparation: { left: "12%", top: "35%" },
            incubation: { left: "32%", top: "40%" },
            illumination: { left: "52%", top: "45%" },
            verification: { left: "72%", top: "50%" },
          };

          return (
            <div
              key={phase.id}
              className="absolute z-20"
              style={zonePositions[phase.id as keyof typeof zonePositions]}
            >
              <div
                onDragOver={(e) => onDragOver(e, phase.id as Phase)}
                onDrop={(e) => {
                  e.preventDefault();
                  onDrop(phase.id as Phase);
                }}
                className={cn(
                  "relative min-w-[220px] min-h-[140px] rounded-lg border-2 transition-all p-3 shadow-lg",
                  isHighlighted
                    ? "ring-4 ring-primary ring-offset-2 scale-110 z-30"
                    : "",
                  title && quotes.length > 0
                    ? "bg-green-100/90 border-green-500"
                    : "bg-white/70 border-dashed border-gray-400"
                )}
              >
                {/* Check mark if title is placed */}
                {title && (
                  <div className="absolute -top-3 -right-3 bg-green-500 rounded-full p-1">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Phase indicator */}
                <div className="text-center mb-2">
                  <h3 className="text-sm font-bold text-gray-800">
                    {title ? title.title : phase.label}
                  </h3>
                </div>

                {/* Placed quotes */}
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {quotes.map((quote) => (
                    <div
                      key={quote.id}
                      draggable
                      onDragStart={() => onDragStart(quote)}
                      onDragEnd={onDragEnd}
                      className="cursor-move"
                    >
                      <div className="text-xs bg-white/90 p-2 rounded border border-gray-300 shadow-sm">
                        <div className="font-semibold truncate text-gray-800">{quote.author}</div>
                        <div className="text-gray-600 truncate">&quot;{quote.text.substring(0, 35)}...&quot;</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty state */}
                {title && quotes.length === 0 && (
                  <div className="text-center text-xs text-gray-500 mt-4">
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
