"use client";

import { Quote, PhaseTitle, Phase } from "@/types/game";
import { QuoteCard } from "./QuoteCard";
import { cn } from "@/lib/utils";
import { Bird, CheckCircle2 } from "lucide-react";

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
  { id: "preparation", label: "Preparation", color: "primary", borderColor: "border-primary", bgColor: "bg-primary/5", icon: "📚" },
  { id: "incubation", label: "Incubation", color: "accent", borderColor: "border-accent", bgColor: "bg-accent/5", icon: "💭" },
  { id: "illumination", label: "Illumination", color: "secondary", borderColor: "border-yellow-500", bgColor: "bg-yellow-500/5", icon: "💡" },
  { id: "verification", label: "Verification", color: "muted", borderColor: "border-muted", bgColor: "bg-muted/5", icon: "✅" },
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
            {correctPlacements}/{totalPieces} pieces
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Puzzle Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {phases.map((phase) => {
          const quotes = placedQuotes[phase.id] || [];
          const title = placedTitles[phase.id];
          const isHighlighted = highlightedZone === phase.id;
          const hasTitle = title !== null;

          return (
            <div
              key={phase.id}
              onDragOver={(e) => onDragOver(e, phase.id as Phase)}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(phase.id as Phase);
              }}
              className={cn(
                "border-2 rounded-xl p-4 min-h-[300px] transition-all duration-200 touch-manipulation",
                phase.borderColor,
                phase.bgColor,
                {
                  "ring-4 ring-primary ring-offset-2 scale-105": isHighlighted,
                  "border-green-500 bg-green-50 dark:bg-green-950": hasTitle && quotes.length > 0,
                }
              )}
            >
              {/* Phase Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{phase.icon}</span>
                  <h3 className="text-lg font-bold text-foreground">
                    {hasTitle ? title.title : phase.label}
                  </h3>
                </div>
                {hasTitle && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </div>

              {/* Drop Zone Indicator */}
              {!hasTitle && (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg mb-4 bg-background/50">
                  <Bird className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground font-medium">
                    Drop &quot;{phase.label}&quot; title here
                  </p>
                </div>
              )}

              {/* Placed Quotes */}
              {quotes.length > 0 && (
                <div className="space-y-2">
                  {quotes.map((quote) => (
                    <div
                      key={quote.id}
                      draggable
                      onDragStart={() => onDragStart(quote)}
                      onDragEnd={onDragEnd}
                      className="cursor-move"
                    >
                      <QuoteCard
                        quote={quote}
                        isDragging={draggedQuote?.id === quote.id}
                        isPlaced={true}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {hasTitle && quotes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-lg bg-background/30">
                  <p className="text-sm font-medium">Drop quotes here</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

