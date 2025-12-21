"use client";

import React, { useState, useMemo } from 'react';
import { DroppableZone, DraggableQuote } from './DragDropProvider';
import { Quote, Phase } from '@/types/game';
import { PuzzlePiece } from './PuzzlePiece';
import { cn } from '@/lib/utils';
import { getThemeConfig } from '@/lib/themeConfig';
import { jigsawThemeConfigs } from '@/lib/jigsawThemes';

interface JigsawPieceData {
  id: string;
  quote: Quote;
  phase: Phase;
  shapeId: string;
  position: { x: number; y: number };
  isPlaced: boolean;
}

interface JigsawBoardProps {
  quotes: Quote[];
  themeId?: string;
  onGameComplete?: () => void;
  placedQuotes: Record<string, Quote[]>;
  hintPhase?: Phase | null;
}

// Jigsaw piece component for the tray
const JigsawTrayPiece: React.FC<{
  piece: JigsawPieceData;
}> = ({ piece }) => {
  return (
    <div
      style={{
        position: 'absolute',
        width: '180px',
        height: '120px',
        left: piece.position.x,
        top: piece.position.y,
      }}
    >
      <DraggableQuote
        quote={piece.quote}
        id={`jigsaw-${piece.id}`}
      >
        <div
          className="jigsaw-piece w-full h-full hover:shadow-purple-500/30"
          style={{ clipPath: `url(#${piece.shapeId})` }}
        >
          <PuzzlePiece
            quote={piece.quote}
            variant="orange"
            size="small"
          />
        </div>
      </DraggableQuote>
    </div>
  );
};

// Drop zone component for phases
const PhaseDropZone: React.FC<{
  phase: Phase;
  label: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isHinted?: boolean;
}> = ({ phase, label, description, x, y, width, height, isHinted = false }) => {
  return (
    <DroppableZone
      id={phase}
      isHighlighted={isHinted}
      className={cn(
        "absolute border-2 border-dashed rounded-lg transition-all duration-300 flex flex-col items-center justify-center p-2 text-center border-white/30 bg-black/20 hover:bg-black/30",
        isHinted && "hint-glow"
      )}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    >
      <div className="text-white font-bold text-lg leading-tight">{label}</div>
      <div className="text-white/70 text-xs mt-1">{description}</div>
    </DroppableZone>
  );
};

export function JigsawBoard({ quotes, themeId = 'classic', onGameComplete, placedQuotes, hintPhase = null }: JigsawBoardProps) {
  // Use theme config for background and zones
  const jigsawConfig = jigsawThemeConfigs[themeId] || jigsawThemeConfigs.classic;
  const themeConfig = getThemeConfig(themeId);

  // Generate jigsaw pieces from quotes
  const jigsawPieces = useMemo(() => {
    const pieces: JigsawPieceData[] = [];
    quotes.forEach((quote, index) => {
      pieces.push({
        id: quote.id,
        quote,
        phase: quote.phase as Phase,
        shapeId: `jigsaw-${((index % 3) + 1)}`, // Cycle through 3 different shapes
        position: {
          x: 20 + (index * 190) % 580, // Spread pieces across the tray
          y: 20 + Math.floor(index / 3) * 130,
        },
        isPlaced: false,
      });
    });
    return pieces;
  }, [quotes]);

  // Identify which pieces are already placed based on parent state
  const unplacedPieces = jigsawPieces.filter(piece => {
    const phaseQuotes = placedQuotes[piece.phase] || [];
    return !phaseQuotes.some(q => q.id === piece.id);
  });

  const phaseLabels: Record<Phase, { label: string; desc: string }> = {
    preparation: { label: 'Preparation', desc: 'Gathering & Research' },
    incubation: { label: 'Incubation', desc: 'Rest & Reflection' },
    illumination: { label: 'Illumination', desc: 'Flash of Insight' },
    verification: { label: 'Verification', desc: 'Testing & Polish' },
  };

  return (
    <div className="space-y-4">
      {/* SVG clip-path definitions */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="jigsaw-1" clipPathUnits="objectBoundingBox">
            <path d="M0.001,0.202 C0.001,0.32,0.001,0.68,0.001,0.801 C0.001,0.922,0.081,1,0.203,1 C0.324,1,0.675,1,0.796,1 C0.917,1,1,0.922,1,0.801 C1,0.68,1,0.32,1,0.202 C1,0.081,0.917,0,0.796,0 C0.675,0,0.551,0,0.499,0 C0.443,0,0.44,0.054,0.499,0.054 C0.563,0.054,0.563,0,0.621,0 C0.676,0,0.324,0,0.203,0 C0.081,0,0.001,0.081,0.001,0.202 Z" />
          </clipPath>
          <clipPath id="jigsaw-2" clipPathUnits="objectBoundingBox">
            <path d="M0,0.2 C0,0.089,0.089,0,0.2,0 H0.8 C0.911,0,1,0.089,1,0.2 V0.5 C1,0.444,0.946,0.44,0.946,0.5 C0.946,0.556,1,0.552,1,0.6 V0.8 C1,0.911,0.911,1,0.8,1 H0.5 C0.556,1,0.56,0.946,0.5,0.946 C0.444,0.946,0.448,1,0.4,1 H0.2 C0.089,1,0,0.911,0,0.8 V0.2 Z" />
          </clipPath>
          <clipPath id="jigsaw-3" clipPathUnits="objectBoundingBox">
            <path d="M0.1,0.1 C0.1,0,0.2,0,0.3,0 C0.4,0,0.7,0,0.8,0 C0.9,0,1,0.1,1,0.2 C1,0.3,1,0.4,1,0.5 C1,0.6,0.9,0.7,0.9,0.7 C0.9,0.8,1,0.8,1,0.9 C1,1,0.9,1,0.8,1 C0.7,1,0.4,1,0.3,1 C0.2,1,0.1,0.9,0.1,0.9 C0,0.9,0,0.8,0,0.7 C0,0.6,0.1,0.5,0.1,0.5 C0.1,0.4,0.1,0.3,0.1,0.2 C0.1,0.1,0.1,0.1,0.1,0.1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Main game board */}
      <div
        className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-2xl bg-gray-900 border-4 border-white/20"
        style={{
          backgroundImage: `url(${jigsawConfig.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for better drop zone visibility */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

        {/* Phase drop zones */}
        {(Object.keys(jigsawConfig.phaseZones) as Phase[]).map(phaseId => {
          const zone = jigsawConfig.phaseZones[phaseId];
          const label = phaseLabels[phaseId];
          return (
            <PhaseDropZone
              key={phaseId}
              phase={phaseId}
              label={label.label}
              description={label.desc}
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
            />
          );
        })}

        {/* Placed pieces */}
        {Object.entries(placedQuotes).map(([phase, quotes]) => (
          quotes.map((quote, idx) => {
            const piece = jigsawPieces.find(p => p.id === quote.id);
            if (!piece) return null;

            const zone = jigsawConfig.phaseZones[phase as Phase];
            // Snap to zone with slight offset for multiple pieces
            const offset = {
              x: 10 + (idx % 2) * 40,
              y: 10 + Math.floor(idx / 2) * 30
            };

            return (
              <div
                key={quote.id}
                className="absolute z-20 animate-in fade-in zoom-in duration-300"
                style={{
                  left: zone.x + offset.x,
                  top: zone.y + offset.y,
                  width: '180px',
                  height: '120px',
                }}
              >
                <div
                  className="jigsaw-piece w-full h-full bg-gradient-to-br from-purple-600/90 to-blue-600/70 text-white"
                  style={{ clipPath: `url(#${piece.shapeId})` }}
                >
                  <PuzzlePiece
                    quote={quote}
                    variant="purple"
                    size="small"
                    isPlaced={true}
                  />
                </div>
              </div>
            );
          })
        ))}
      </div>

      {/* Piece tray */}
      <div className="bg-card/80 backdrop-blur-sm p-4 rounded-xl border-2 border-border shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            Available Pieces
            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {unplacedPieces.length} remaining
            </span>
          </h3>
          <div className="text-xs text-muted-foreground italic">
            Drag pieces to their correct creative phase on the board
          </div>
        </div>

        <div className="relative min-h-[300px] bg-muted/30 rounded-lg overflow-x-auto">
          {unplacedPieces.map((piece) => (
            <JigsawTrayPiece
              key={piece.id}
              piece={piece}
            />
          ))}

          {unplacedPieces.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
              <div className="max-w-xs">
                <div className="text-4xl mb-4">✨</div>
                <h4 className="text-xl font-bold text-foreground">Tray Empty!</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  All pieces have been moved to the board. Great work!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



