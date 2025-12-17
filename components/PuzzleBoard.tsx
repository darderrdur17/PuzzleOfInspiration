"use client";

import { useState, useEffect } from "react";
import { Quote, PhaseTitle, Phase } from "@/types/game";
import { ThemeConfig } from "@/lib/gameThemes";
import { QuoteCard } from "./QuoteCard";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { AlchemistBoard } from "./AlchemistBoard";
import { GardenerBoard } from "./GardenerBoard";
import { CyberpunkBoard } from "./CyberpunkBoard";
import { EnchantedForestBoard } from "./EnchantedForestBoard";
import { SteampunkBoard } from "./SteampunkBoard";
import { PuzzlePiece } from "./PuzzlePiece";
import { DroppableZone, DraggableQuote, DraggableTitle } from "./DragDropProvider";
import type { BoardLayoutType } from "@/types/boardLayout";
import { ElephantBoard } from "./ElephantBoard";

interface PuzzleBoardProps {
  correctPlacements: number;
  totalPieces: number;
  wrongAttempts: number;
  boardBackground: string;
  placedQuotes: Record<string, Quote[]>;
  placedTitles: Record<string, PhaseTitle | null>;
  onDrop: (phase: Phase) => void;
  onDragOver?: (e: React.DragEvent, zone: Phase) => void;
  highlightedZone: Phase | null;
  onDragStart?: (quote: Quote) => void;
  onDragStartTitle?: (title: PhaseTitle) => void;
  onDragEnd?: () => void;
  draggedQuote: Quote | null;
  draggedTitle: PhaseTitle | null;
  themeConfig?: ThemeConfig;
  boardLayout?: BoardLayoutType;
}

const getPhases = (themeConfig?: ThemeConfig) => [
  {
    id: "preparation",
    label: themeConfig?.mechanics.phaseNames.preparation || "Preparation",
    color: themeConfig?.visualElements.colorScheme.primary || "#FF6B35",
    goosePosition: { left: "5%", top: "5%" },
    goosePositionMobile: { left: "2%", top: "3%" },
    dropZonePosition: { left: "10%", top: "20%" }
  },
  {
    id: "incubation",
    label: themeConfig?.mechanics.phaseNames.incubation || "Incubation",
    color: themeConfig?.visualElements.colorScheme.secondary || "#4ECDC4",
    goosePosition: { left: "25%", top: "5%" },
    goosePositionMobile: { left: "22%", top: "3%" },
    dropZonePosition: { left: "30%", top: "20%" }
  },
  {
    id: "illumination",
    label: themeConfig?.mechanics.phaseNames.illumination || "Illumination",
    color: themeConfig?.visualElements.colorScheme.accent || "#FFE66D",
    goosePosition: { left: "45%", top: "5%" },
    goosePositionMobile: { left: "42%", top: "3%" },
    dropZonePosition: { left: "50%", top: "20%" }
  },
  {
    id: "verification",
    label: themeConfig?.mechanics.phaseNames.verification || "Verification",
    color: themeConfig?.visualElements.colorScheme.secondary || "#95E1D3",
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
  themeConfig,
  boardLayout = "classic",
}: PuzzleBoardProps) {
  // All hooks must be called before any conditional returns
  const phases = getPhases(themeConfig);
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

  // Render different board layouts based on boardLayout prop
  if (boardLayout === "elephant") {
    return (
      <ElephantBoard
        correctPlacements={correctPlacements}
        totalPieces={totalPieces}
        wrongAttempts={wrongAttempts}
        placedQuotes={placedQuotes}
        placedTitles={placedTitles}
        onDrop={onDrop}
        onDragOver={onDragOver}
        highlightedZone={highlightedZone}
        onDragStart={onDragStart}
        onDragStartTitle={onDragStartTitle}
        onDragEnd={onDragEnd}
        draggedQuote={draggedQuote}
        draggedTitle={draggedTitle}
      />
    );
  }

  if (boardLayout === "alchemist") {
    return (
      <AlchemistBoard
        correctPlacements={correctPlacements}
        totalPieces={totalPieces}
        wrongAttempts={wrongAttempts}
        placedQuotes={placedQuotes}
        placedTitles={placedTitles}
        onDrop={onDrop}
        onDragOver={onDragOver}
        highlightedZone={highlightedZone}
        onDragStart={onDragStart}
        onDragStartTitle={onDragStartTitle}
        onDragEnd={onDragEnd}
        draggedQuote={draggedQuote}
        draggedTitle={draggedTitle}
      />
    );
  }

  if (boardLayout === "gardener") {
    return (
      <GardenerBoard
        correctPlacements={correctPlacements}
        totalPieces={totalPieces}
        wrongAttempts={wrongAttempts}
        placedQuotes={placedQuotes}
        placedTitles={placedTitles}
        onDrop={onDrop}
        onDragOver={onDragOver}
        highlightedZone={highlightedZone}
        onDragStart={onDragStart}
        onDragStartTitle={onDragStartTitle}
        onDragEnd={onDragEnd}
        draggedQuote={draggedQuote}
        draggedTitle={draggedTitle}
      />
    );
  }

  if (boardLayout === "cyberpunk") {
    return (
      <CyberpunkBoard
        correctPlacements={correctPlacements}
        totalPieces={totalPieces}
        wrongAttempts={wrongAttempts}
        placedQuotes={placedQuotes}
        placedTitles={placedTitles}
        onDrop={onDrop}
        onDragOver={onDragOver}
        highlightedZone={highlightedZone}
        onDragStart={onDragStart}
        onDragStartTitle={onDragStartTitle}
        onDragEnd={onDragEnd}
        draggedQuote={draggedQuote}
        draggedTitle={draggedTitle}
      />
    );
  }

  if (boardLayout === "enchantedForest") {
    return (
      <EnchantedForestBoard
        correctPlacements={correctPlacements}
        totalPieces={totalPieces}
        wrongAttempts={wrongAttempts}
        placedQuotes={placedQuotes}
        placedTitles={placedTitles}
        onDrop={onDrop}
        onDragOver={onDragOver}
        highlightedZone={highlightedZone}
        onDragStart={onDragStart}
        onDragStartTitle={onDragStartTitle}
        onDragEnd={onDragEnd}
        draggedQuote={draggedQuote}
        draggedTitle={draggedTitle}
      />
    );
  }

  if (boardLayout === "steampunk") {
    return (
      <SteampunkBoard
        correctPlacements={correctPlacements}
        totalPieces={totalPieces}
        wrongAttempts={wrongAttempts}
        placedQuotes={placedQuotes}
        placedTitles={placedTitles}
        onDrop={onDrop}
        onDragOver={onDragOver}
        highlightedZone={highlightedZone}
        onDragStart={onDragStart}
        onDragStartTitle={onDragStartTitle}
        onDragEnd={onDragEnd}
        draggedQuote={draggedQuote}
        draggedTitle={draggedTitle}
      />
    );
  }

  // Classic layout (default)
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
        className="relative rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 lg:p-8 min-h-[500px] sm:min-h-[600px] md:min-h-[700px] overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-green-100"
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
      
      {/* Background Image Placeholder - Elephant Scene */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-6xl sm:text-8xl md:text-9xl">🐘</div>
        </div>
      </div>

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
              <DroppableZone
                id={phase.id}
                onDrop={onDrop}
                className={cn(
                  "w-24 sm:w-28 md:w-32 lg:w-36 h-10 sm:h-12 md:h-14 flex items-center justify-center rounded-lg border-2 transition-all cursor-pointer shadow-xl backdrop-blur-sm touch-manipulation",
                  title
                    ? "bg-green-500/50 border-green-600"
                    : ""
                )}
                style={title ? {} : {
                  backgroundColor: `${phase.color}40`,
                  borderColor: phase.color,
                  borderStyle: 'dashed'
                }}
              >
                {title ? (
                  <span className="text-xs sm:text-sm font-bold text-green-800 text-center px-1">{title.title}</span>
                ) : (
                  <span
                    className="text-[10px] sm:text-xs font-semibold text-center px-1"
                    style={{ color: phase.color }}
                  >
                    Drop &quot;{phase.label}&quot;
                  </span>
                )}
              </DroppableZone>
              
              {/* Phase Label Below Drop Zone */}
              <div className="text-center mt-1 sm:mt-2">
                <span
                  className="text-xs sm:text-sm md:text-base font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded shadow-md"
                  style={{
                    color: phase.color,
                    backgroundColor: title
                      ? `${phase.color}20` // Semi-transparent background when title is placed
                      : 'rgba(255, 255, 255, 0.9)',
                    border: title ? `2px solid ${phase.color}` : 'none'
                  }}
                >
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
              <DroppableZone
                id={phase.id}
                onDrop={onDrop}
                isHighlighted={isHighlighted}
                className={cn(
                  "relative w-full min-w-[140px] sm:min-w-[180px] md:min-w-[220px] min-h-[100px] sm:min-h-[120px] md:min-h-[140px] rounded-lg border-2 transition-all p-2 sm:p-3 shadow-lg touch-manipulation",
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

                {/* Placed quotes as puzzle pieces */}
                <div className="flex flex-wrap gap-2 max-h-32 sm:max-h-40 md:max-h-48 overflow-y-auto">
                  {quotes.map((quote, index) => {
                    const variants: Array<"purple" | "orange" | "green" | "gold"> = ["purple", "orange", "green", "gold"];
                    const variant = variants[index % variants.length];
                    return (
                      <DraggableQuote
                        key={quote.id}
                        quote={quote}
                        id={`quote-${quote.id}`}
                      >
                        <PuzzlePiece
                          quote={quote}
                          variant={variant}
                          size="small"
                          isPlaced={true}
                        />
                      </DraggableQuote>
                    );
                  })}
                </div>

                {/* Empty state */}
                {title && quotes.length === 0 && (
                  <div className="text-center text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-4">
                    Drop quotes here
                  </div>
                )}
              </DroppableZone>
            </div>
          );
        })}
      </div>
    </div>
  );
}
