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
      <div className="relative rounded-2xl p-8 min-h-[700px] overflow-hidden" style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 50%, #90EE90 100%)' }}>
        {/* Sky Background */}
        <div className="absolute inset-0">
          {/* Clouds */}
          <div className="absolute top-4 left-4 w-32 h-20 bg-white/70 rounded-full opacity-80">
            <div className="absolute -left-8 top-4 w-24 h-16 bg-white/70 rounded-full"></div>
            <div className="absolute -right-8 top-4 w-24 h-16 bg-white/70 rounded-full"></div>
          </div>
          <div className="absolute top-8 right-12 w-40 h-24 bg-white/70 rounded-full opacity-80">
            <div className="absolute -left-10 top-6 w-32 h-20 bg-white/70 rounded-full"></div>
            <div className="absolute -right-10 top-6 w-32 h-20 bg-white/70 rounded-full"></div>
          </div>
        </div>

        {/* Ground Line */}
        <div className="absolute bottom-0 left-0 right-0 h-20" style={{ background: 'linear-gradient(to top, #90EE90 0%, #FFFFE0 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-300/50"></div>
        </div>

        {/* Title Cloud */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-white/90 rounded-full px-6 py-3 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800">Creativity is...</h2>
          </div>
        </div>

        {/* Credits */}
        <div className="absolute top-2 left-2 z-20">
          <div className="bg-orange-500 rounded-full px-3 py-1.5 mb-1 shadow-md">
            <div className="text-xs text-white font-semibold">
              Product Concept:<br />
              Chai Kah Hin, PhD
            </div>
          </div>
          <div className="bg-white/90 rounded-full px-3 py-1.5 shadow-md">
            <div className="text-xs text-gray-700 font-semibold">
              Graphic Design:<br />
              Fan Jing
            </div>
          </div>
        </div>

        {/* Four Geese with Phase Labels */}
        {phases.map((phase) => {
          const title = placedTitles[phase.id];
          return (
            <div key={phase.id} className="absolute z-30" style={phase.goosePosition}>
              {/* Goose SVG */}
              <svg width="80" height="50" viewBox="0 0 80 50" className="mb-2">
                <path
                  d="M 10 25 Q 20 15 30 25 Q 40 15 50 25 Q 60 15 70 25"
                  fill="white"
                  stroke="#333"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="70" cy="25" r="5" fill="white" stroke="#333" strokeWidth="2" />
                <circle cx="70" cy="25" r="3" fill="#ff4444" />
                <path
                  d="M 70 25 L 75 23 L 75 27 Z"
                  fill="#ff4444"
                />
                <path
                  d="M 72 22 L 74 20 L 72 18"
                  fill="none"
                  stroke="#ff4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Phase Label Drop Zone */}
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
                  "w-32 h-12 flex items-center justify-center rounded-lg border-2 transition-all cursor-pointer shadow-lg",
                  title
                    ? "bg-green-500/30 border-green-500"
                    : "bg-orange-400/40 border-orange-500 border-dashed"
                )}
              >
                {title ? (
                  <span className="text-sm font-bold text-green-700">{title.title}</span>
                ) : (
                  <span className="text-xs text-orange-700 font-semibold">Drop &quot;{phase.label}&quot;</span>
                )}
              </div>
              
              {/* Phase Label Below Goose */}
              <div className="text-center mt-1">
                <span className="text-sm font-bold" style={{ color: phase.color }}>
                  {phase.label}
                </span>
              </div>
            </div>
          );
        })}

        {/* Elephant SVG - Large Background */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-5xl h-4/5 pointer-events-none z-10">
          <svg 
            viewBox="0 0 500 400" 
            className="w-full h-full"
            preserveAspectRatio="xMidYMax meet"
          >
            {/* Elephant Body */}
            <ellipse cx="250" cy="280" rx="180" ry="110" fill="white" stroke="#333" strokeWidth="5" />
            
            {/* Elephant Head */}
            <ellipse cx="380" cy="240" rx="90" ry="75" fill="white" stroke="#333" strokeWidth="5" />
            
            {/* Elephant Trunk */}
            <path
              d="M 380 240 Q 410 230 440 220 Q 455 210 450 200"
              fill="none"
              stroke="#333"
              strokeWidth="5"
              strokeLinecap="round"
            />
            
            {/* Elephant Ear */}
            <ellipse cx="320" cy="220" rx="65" ry="75" fill="white" stroke="#333" strokeWidth="4" />
            
            {/* Elephant Legs */}
            <ellipse cx="160" cy="350" rx="30" ry="45" fill="white" stroke="#333" strokeWidth="4" />
            <ellipse cx="220" cy="350" rx="30" ry="45" fill="white" stroke="#333" strokeWidth="4" />
            <ellipse cx="280" cy="350" rx="30" ry="45" fill="white" stroke="#333" strokeWidth="4" />
            <ellipse cx="340" cy="350" rx="30" ry="45" fill="white" stroke="#333" strokeWidth="4" />
          </svg>
        </div>

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
