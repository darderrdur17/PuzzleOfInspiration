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
    color: "#FF6B6B",
    birdPosition: { top: "15%", left: "10%" },
    arrowPosition: { top: "5%", left: "12%" }
  },
  { 
    id: "incubation", 
    label: "Incubation", 
    color: "#4ECDC4",
    birdPosition: { top: "25%", left: "30%" },
    arrowPosition: { top: "5%", left: "32%" }
  },
  { 
    id: "illumination", 
    label: "Illumination", 
    color: "#FFE66D",
    birdPosition: { top: "35%", left: "50%" },
    arrowPosition: { top: "5%", left: "52%" }
  },
  { 
    id: "verification", 
    label: "Verification", 
    color: "#95E1D3",
    birdPosition: { top: "45%", left: "70%" },
    arrowPosition: { top: "5%", left: "72%" }
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

      {/* Elephant Puzzle Board */}
      <div className="relative bg-gradient-to-b from-sky-200 to-amber-100 rounded-2xl p-8 min-h-[600px] overflow-hidden">
        {/* Ground line */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-amber-700/30"></div>
        
        {/* Cloud */}
        <div className="absolute top-4 right-8 w-24 h-16 bg-white/60 rounded-full opacity-70">
          <div className="absolute -left-4 top-2 w-16 h-12 bg-white/60 rounded-full"></div>
          <div className="absolute -right-4 top-2 w-16 h-12 bg-white/60 rounded-full"></div>
        </div>

        {/* Phase Title Drop Zones (Arrows) */}
        <div className="absolute top-4 left-0 right-0 flex justify-around z-10">
          {phases.map((phase) => {
            const title = placedTitles[phase.id];
            return (
              <div
                key={phase.id}
                className="relative"
                style={{ left: phase.arrowPosition.left }}
              >
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
                    "w-24 h-16 flex items-center justify-center rounded-lg border-2 transition-all cursor-pointer",
                    title
                      ? "bg-green-500/30 border-green-500"
                      : "bg-orange-400/40 border-orange-500 border-dashed"
                  )}
                >
                  {title ? (
                    <span className="text-xs font-bold text-green-700">{title.title}</span>
                  ) : (
                    <span className="text-xs text-orange-700">Drop title</span>
                  )}
                </div>
                {/* Arrow pointer */}
                <div
                  className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8"
                  style={{ borderTopColor: title ? "#10b981" : "#f97316" }}
                />
              </div>
            );
          })}
        </div>

        {/* Elephant SVG */}
        <svg
          viewBox="0 0 400 300"
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-2xl h-auto opacity-90"
          style={{ maxHeight: "70%" }}
        >
          {/* Elephant body */}
          <ellipse cx="200" cy="200" rx="120" ry="80" fill="white" stroke="#666" strokeWidth="3" />
          {/* Elephant head */}
          <ellipse cx="280" cy="180" rx="60" ry="50" fill="white" stroke="#666" strokeWidth="3" />
          {/* Elephant trunk */}
          <path
            d="M 280 180 Q 300 170 310 160 Q 315 150 310 140"
            fill="none"
            stroke="#666"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Elephant ear */}
          <ellipse cx="240" cy="160" rx="40" ry="50" fill="white" stroke="#666" strokeWidth="2" />
          {/* Elephant legs */}
          <ellipse cx="140" cy="250" rx="20" ry="30" fill="white" stroke="#666" strokeWidth="2" />
          <ellipse cx="180" cy="250" rx="20" ry="30" fill="white" stroke="#666" strokeWidth="2" />
          <ellipse cx="220" cy="250" rx="20" ry="30" fill="white" stroke="#666" strokeWidth="2" />
          <ellipse cx="260" cy="250" rx="20" ry="30" fill="white" stroke="#666" strokeWidth="2" />
        </svg>

        {/* Bird Drop Zones on Elephant */}
        {phases.map((phase) => {
          const quotes = placedQuotes[phase.id] || [];
          const title = placedTitles[phase.id];
          const isHighlighted = highlightedZone === phase.id;

          return (
            <div
              key={phase.id}
              className="absolute z-20"
              style={phase.birdPosition}
            >
              <div
                onDragOver={(e) => onDragOver(e, phase.id as Phase)}
                onDrop={(e) => {
                  e.preventDefault();
                  onDrop(phase.id as Phase);
                }}
                className={cn(
                  "relative min-w-[200px] min-h-[120px] rounded-lg border-2 transition-all p-3",
                  isHighlighted
                    ? "ring-4 ring-primary ring-offset-2 scale-110"
                    : "",
                  title && quotes.length > 0
                    ? "bg-green-100/80 border-green-500"
                    : "bg-white/60 border-dashed border-gray-400"
                )}
              >
                {/* Bird icon */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: phase.color }}
                  >
                    🐦
                  </div>
                </div>

                {/* Phase label */}
                <div className="text-center mb-2">
                  <h3 className="text-sm font-bold text-gray-800">
                    {title ? title.title : phase.label}
                  </h3>
                  {title && <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mt-1" />}
                </div>

                {/* Placed quotes */}
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {quotes.map((quote) => (
                    <div
                      key={quote.id}
                      draggable
                      onDragStart={() => onDragStart(quote)}
                      onDragEnd={onDragEnd}
                      className="cursor-move"
                    >
                      <div className="text-xs bg-white/80 p-1 rounded border border-gray-300">
                        <div className="font-semibold truncate">{quote.author}</div>
                        <div className="text-gray-600 truncate">&quot;{quote.text.substring(0, 30)}...&quot;</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty state */}
                {title && quotes.length === 0 && (
                  <div className="text-center text-xs text-gray-500 mt-2">
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
