"use client";

import React, { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { Quote, Phase } from '@/types/game';
import { PuzzlePiece } from './PuzzlePiece';
import { cn } from '@/lib/utils';

interface JigsawPiece {
  id: string;
  quote: Quote;
  phase: Phase;
  shape: string; // CSS clip-path value
  position: { x: number; y: number };
  isPlaced: boolean;
}

interface JigsawBoardProps {
  quotes: Quote[];
  themeConfig: {
    backgroundImage?: string;
    pieceShapes: Record<Phase, string[]>;
    phaseZones: Record<Phase, { x: number; y: number; width: number; height: number }>;
  };
  onPiecePlaced?: (quoteId: string, phase: Phase) => void;
  onGameComplete?: () => void;
}

export function JigsawBoard({ quotes, themeConfig, onPiecePlaced, onGameComplete }: JigsawBoardProps) {
  const [placedPieces, setPlacedPieces] = useState<Record<string, { phase: Phase; position: { x: number; y: number } }>>({});
  const [draggedPiece, setDraggedPiece] = useState<JigsawPiece | null>(null);

  // Generate jigsaw pieces from quotes
  const jigsawPieces = useMemo(() => {
    const pieces: JigsawPiece[] = [];
    const phaseShapes = themeConfig.pieceShapes;

    quotes.forEach((quote, index) => {
      const phase = quote.phase as Phase;
      const shapes = phaseShapes[phase] || [];
      const shapeIndex = index % shapes.length;

      pieces.push({
        id: quote.id,
        quote,
        phase,
        shape: shapes[shapeIndex],
        position: { x: Math.random() * 300, y: Math.random() * 200 }, // Random initial position in tray
        isPlaced: false,
      });
    });

    return pieces;
  }, [quotes, themeConfig.pieceShapes]);

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
        // Correct placement
        const zone = themeConfig.phaseZones[targetPhase];
        const newPosition = {
          x: zone.x + Math.random() * (zone.width - 100), // Random position within zone
          y: zone.y + Math.random() * (zone.height - 100),
        };

        setPlacedPieces(prev => ({
          ...prev,
          [pieceId]: { phase: targetPhase, position: newPosition }
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

  const unplacedPieces = jigsawPieces.filter(piece => !placedPieces[piece.id]);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative w-full h-[600px] sm:h-[700px] bg-gray-100 rounded-lg overflow-hidden">
        {/* Background Image */}
        {themeConfig.backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${themeConfig.backgroundImage})` }}
          />
        )}

        {/* Phase Drop Zones */}
        {Object.entries(themeConfig.phaseZones).map(([phase, zone]) => (
          <div
            key={phase}
            id={phase}
            className="absolute border-2 border-dashed border-white/50 rounded-lg bg-white/10 backdrop-blur-sm"
            style={{
              left: zone.x,
              top: zone.y,
              width: zone.width,
              height: zone.height,
            }}
          >
            <div className="absolute -top-6 left-0 text-white font-bold text-sm bg-black/50 px-2 py-1 rounded">
              {phase.charAt(0).toUpperCase() + phase.slice(1)}
            </div>
          </div>
        ))}

        {/* Placed Pieces */}
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
                clipPath: piece.shape,
              }}
            >
              <PuzzlePiece
                quote={piece.quote}
                variant="purple"
                size="small"
                isPlaced={true}
              />
            </div>
          );
        })}
      </div>

      {/* Piece Tray */}
      <div className="mt-4 p-4 bg-gray-200 rounded-lg">
        <h3 className="text-lg font-bold mb-3">Available Pieces</h3>
        <div className="flex flex-wrap gap-3">
          {unplacedPieces.map((piece) => (
            <div
              key={piece.id}
              id={piece.id}
              draggable
              className={cn(
                "cursor-move transform transition-transform hover:scale-105",
                draggedPiece?.id === piece.id ? "opacity-50" : ""
              )}
              style={{
                clipPath: piece.shape,
              }}
            >
              <PuzzlePiece
                quote={piece.quote}
                variant="orange"
                size="small"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedPiece && (
          <div style={{ clipPath: draggedPiece.shape }}>
            <PuzzlePiece
              quote={draggedPiece.quote}
              variant="purple"
              size="small"
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}