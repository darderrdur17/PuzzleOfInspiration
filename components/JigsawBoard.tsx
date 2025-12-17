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
  const [successAnimation, setSuccessAnimation] = useState<string | null>(null);

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

        // Trigger success animation
        setSuccessAnimation(pieceId);
        setTimeout(() => setSuccessAnimation(null), 1000);

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
    <>
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
            className={cn(
              "absolute border-2 border-dashed rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center justify-center",
              draggedPiece
                ? draggedPiece.phase === phase
                  ? "border-green-400 bg-green-400/30 shadow-lg shadow-green-400/50 scale-105 ring-4 ring-green-400/20"
                  : "border-red-400 bg-red-400/20 shadow-lg shadow-red-400/30 scale-95 opacity-75"
                : "border-white/50 bg-white/10 hover:bg-white/20"
            )}
            style={{
              left: zone.x,
              top: zone.y,
              width: zone.width,
              height: zone.height,
            }}
          >
            {draggedPiece && draggedPiece.phase === phase && (
              <div className="text-green-300 font-bold text-sm animate-pulse">
                ✓ Drop Here
              </div>
            )}
            <div className="absolute -top-6 left-0 text-white font-bold text-sm bg-black/50 px-2 py-1 rounded">
              {phase.charAt(0).toUpperCase() + phase.slice(1)}
              {draggedPiece && draggedPiece.phase === phase && (
                <span className="ml-1 text-green-300">✓</span>
              )}
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
              className={cn(
                "absolute transition-all duration-300 ease-out shadow-lg",
                successAnimation === pieceId ? "animate-bounce scale-110 ring-4 ring-green-400/50" : "hover:scale-105"
              )}
              style={{
                left: placement.position.x,
                top: placement.position.y,
                clipPath: piece.shape,
                filter: successAnimation === pieceId
                  ? 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.6)) brightness(1.1)'
                  : 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
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
      <div className="mt-4 p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300">
        <h3 className="text-lg font-bold mb-3 text-gray-800">Available Pieces</h3>
        <div className="flex flex-wrap gap-3 justify-center">
          {unplacedPieces.map((piece) => (
            <div
              key={piece.id}
              id={piece.id}
              draggable
              className={cn(
                "cursor-move transform transition-all duration-200 hover:scale-110 hover:rotate-1 hover:shadow-lg",
                draggedPiece?.id === piece.id ? "opacity-50 scale-95" : "hover:shadow-xl"
              )}
              style={{
                clipPath: piece.shape,
                filter: draggedPiece?.id === piece.id ? 'none' : 'drop-shadow(1px 1px 3px rgba(0,0,0,0.2))',
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
        {unplacedPieces.length === 0 && (
          <div className="text-center text-gray-600 mt-4">
            <p className="text-lg font-medium">🎉 Puzzle Complete!</p>
            <p className="text-sm">All pieces have been placed correctly.</p>
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedPiece && (
          <div
            className="transform rotate-3 shadow-2xl"
            style={{
              clipPath: draggedPiece.shape,
              filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.4)) brightness(1.1)',
            }}
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