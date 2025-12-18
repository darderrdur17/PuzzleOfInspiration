"use client";

import React, { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { Quote, Phase } from '@/types/game';
import { PuzzlePiece } from './PuzzlePiece';
import { cn } from '@/lib/utils';
import { getThemeConfig } from '@/lib/themeConfig';

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
  onPiecePlaced?: (quoteId: string, phase: Phase) => void;
  onGameComplete?: () => void;
}

// SVG clip-path definitions for jigsaw pieces
const JigsawSVGs = () => (
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
);

// Draggable jigsaw piece component
const DraggableJigsawPiece: React.FC<{
  piece: JigsawPieceData;
  isDragging?: boolean;
}> = ({ piece, isDragging }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: piece.id,
    data: { type: 'jigsaw-piece', piece },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : {};

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        clipPath: `url(#${piece.shapeId})`,
        position: 'absolute',
        width: '180px',
        height: '120px',
        left: piece.position.x,
        top: piece.position.y,
      }}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-transform duration-200",
        isDragging ? "z-50 scale-110" : "hover:scale-105"
      )}
    >
      <PuzzlePiece
        quote={piece.quote}
        variant="orange"
        size="small"
      />
    </div>
  );
};

// Drop zone component for phases
const PhaseDropZone: React.FC<{
  phase: Phase;
  isHighlighted: boolean;
  children?: React.ReactNode;
}> = ({ phase, isHighlighted, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: phase,
    data: { type: 'phase-zone', phase },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute border-2 border-dashed rounded-lg transition-all duration-300 flex items-center justify-center",
        isOver || isHighlighted
          ? "border-green-400 bg-green-400/20 shadow-lg shadow-green-400/50 scale-105 ring-4 ring-green-400/20"
          : "border-white/50 bg-white/10 hover:bg-white/20"
      )}
      style={{
        width: '250px',
        height: '180px',
      }}
    >
      {children}
      {isOver && (
        <div className="text-green-300 font-bold text-sm animate-pulse">
          ✓ Drop Here
        </div>
      )}
    </div>
  );
};

export function JigsawBoard({ quotes, themeId = 'classic', onPiecePlaced, onGameComplete }: JigsawBoardProps) {
  const [placedPieces, setPlacedPieces] = useState<Record<string, { phase: Phase; position: { x: number; y: number } }>>({});
  const [draggedPiece, setDraggedPiece] = useState<JigsawPieceData | null>(null);

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
          x: 50 + (index * 200) % 600, // Spread pieces across the tray
          y: 400 + Math.floor(index / 3) * 140,
        },
        isPlaced: false,
      });
    });
    return pieces;
  }, [quotes]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const piece = jigsawPieces.find(p => p.id === active.id);
    setDraggedPiece(piece || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedPiece(null);

    if (!over) return;

    const pieceId = active.id as string;
    const dropZoneId = over.id as string;

    // Check if dropped on a valid phase zone
    const validPhases: Phase[] = ['preparation', 'incubation', 'illumination', 'verification'];
    const targetPhase = validPhases.find(phase => dropZoneId === phase);

    if (targetPhase) {
      const piece = jigsawPieces.find(p => p.id === pieceId);
      if (piece && piece.phase === targetPhase && !placedPieces[pieceId]) {
        // Correct placement - snap to phase zone
        const zonePositions = {
          preparation: { x: 50, y: 50 },
          incubation: { x: 350, y: 50 },
          illumination: { x: 50, y: 270 },
          verification: { x: 350, y: 270 },
        };

        const basePosition = zonePositions[targetPhase];
        const placedInZone = Object.values(placedPieces).filter(p => p.phase === targetPhase).length;
        const offsetPosition = {
          x: basePosition.x + (placedInZone % 2) * 60,
          y: basePosition.y + Math.floor(placedInZone / 2) * 40,
        };

        setPlacedPieces(prev => ({
          ...prev,
          [pieceId]: { phase: targetPhase, position: offsetPosition }
        }));

        onPiecePlaced?.(pieceId, targetPhase);

        // Check for game completion
        const allPlaced = jigsawPieces.every(p => placedPieces[p.id] || p.id === pieceId);
        if (allPlaced) {
          onGameComplete?.();
        }
      }
    }
  };

  const themeConfig = getThemeConfig(themeId);
  const unplacedPieces = jigsawPieces.filter(piece => !placedPieces[piece.id]);

  return (
    <>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <JigsawSVGs />

        {/* Main game board */}
        <div className="relative w-full h-[500px] bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
          {/* Background with theme styling */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.badgeColor}20, ${themeConfig.badgeColor}10)`,
              }}
            />
          </div>

          {/* Phase drop zones */}
          <PhaseDropZone phase="preparation" isHighlighted={draggedPiece?.phase === 'preparation'}>
            <div className="text-white text-center">
              <div className="font-bold text-lg">Preparation</div>
              <div className="text-sm opacity-80">Research & Planning</div>
            </div>
          </PhaseDropZone>

          <PhaseDropZone phase="incubation" isHighlighted={draggedPiece?.phase === 'incubation'}>
            <div className="text-white text-center">
              <div className="font-bold text-lg">Incubation</div>
              <div className="text-sm opacity-80">Rest & Reflection</div>
            </div>
          </PhaseDropZone>

          <PhaseDropZone phase="illumination" isHighlighted={draggedPiece?.phase === 'illumination'}>
            <div className="text-white text-center">
              <div className="font-bold text-lg">Illumination</div>
              <div className="text-sm opacity-80">The &ldquo;Aha!&rdquo; Moment</div>
            </div>
          </PhaseDropZone>

          <PhaseDropZone phase="verification" isHighlighted={draggedPiece?.phase === 'verification'}>
            <div className="text-white text-center">
              <div className="font-bold text-lg">Verification</div>
              <div className="text-sm opacity-80">Testing & Implementation</div>
            </div>
          </PhaseDropZone>

          {/* Placed pieces */}
          {Object.entries(placedPieces).map(([pieceId, placement]) => {
            const piece = jigsawPieces.find(p => p.id === pieceId);
            if (!piece) return null;

            return (
              <div
                key={pieceId}
                className="absolute animate-pulse"
                style={{
                  left: placement.position.x,
                  top: placement.position.y,
                  clipPath: `url(#${piece.shapeId})`,
                }}
              >
                <PuzzlePiece
                  quote={piece.quote}
                  variant="purple"
                  size="small"
                />
              </div>
            );
          })}
        </div>

        {/* Piece tray */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <h3 className="text-xl font-bold text-white mb-4">Available Pieces</h3>
          <div className="relative min-h-[200px]">
            {unplacedPieces.map((piece) => (
              <DraggableJigsawPiece
                key={piece.id}
                piece={piece}
                isDragging={draggedPiece?.id === piece.id}
              />
            ))}
            {unplacedPieces.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-2xl mb-2">🎉</div>
                  <p className="text-lg font-medium">Puzzle Complete!</p>
                  <p className="text-sm">All pieces have been placed correctly.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {draggedPiece && (
            <div
              style={{
                clipPath: `url(#${draggedPiece.shapeId})`,
                width: '180px',
                height: '120px',
              }}
              className="shadow-2xl rotate-3"
            >
              <PuzzlePiece
                quote={draggedPiece.quote}
                variant="purple"
                size="small"
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
}