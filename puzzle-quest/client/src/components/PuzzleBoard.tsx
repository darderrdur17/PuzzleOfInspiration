import { useState, useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { PuzzlePiece as PieceType, generatePuzzle, isCloseEnough } from '@/lib/puzzle';
import { PuzzlePiece } from './PuzzlePiece';
import { PuzzleTheme } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PuzzleBoardProps {
  theme: PuzzleTheme;
  rows?: number;
  cols?: number;
  onComplete?: () => void;
}

export function PuzzleBoard({ theme, rows = 3, cols = 4, onComplete }: PuzzleBoardProps) {
  const [pieces, setPieces] = useState<PieceType[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardDimensions, setBoardDimensions] = useState({ width: 800, height: 600 });
  const [isInitialized, setIsInitialized] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  // Initialize puzzle
  useEffect(() => {
    // Small delay to ensure layout is stable
    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      const initPuzzle = () => {
        // If container has no width yet (e.g. hidden or initializing), default to a reasonable size
        const offsetWidth = containerRef.current?.offsetWidth || 800;
        
        // Calculate height based on aspect ratio of standard landscape (4:3)
        const width = Math.min(offsetWidth, 1000); // Max width
        const height = width * 0.75; 
        
        setBoardDimensions({ width, height });

        const newPieces = generatePuzzle(
          { rows, cols, width, height },
          theme.quotes
        );

        // Scatter pieces initially
        const scatteredPieces = newPieces.map(p => ({
          ...p,
          currentX: Math.random() * (width - p.width),
          currentY: Math.random() * (height - p.height),
        }));

        setPieces(scatteredPieces);
        setIsCompleted(false);
        setIsInitialized(true);
      };

      initPuzzle();
      
      window.addEventListener('resize', initPuzzle);
      return () => window.removeEventListener('resize', initPuzzle);
    }, 100);

    return () => clearTimeout(timer);
  }, [theme, rows, cols]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    setActiveId(null);

    setPieces(prev => {
      const newPieces = prev.map(piece => {
        if (piece.id === active.id) {
          const newX = piece.currentX + delta.x;
          const newY = piece.currentY + delta.y;
          
          // Check if close to correct position
          const targetX = piece.left;
          const targetY = piece.top;
          
          if (isCloseEnough({ x: newX, y: newY }, { x: targetX, y: targetY }, 40)) {
            // Snap!
            // Play sound effect here if we had audio
            return { ...piece, currentX: targetX, currentY: targetY, isPlaced: true };
          }
          
          // Keep within bounds
          return { 
            ...piece, 
            currentX: Math.max(0, Math.min(boardDimensions.width - piece.width, newX)),
            currentY: Math.max(0, Math.min(boardDimensions.height - piece.height, newY))
          };
        }
        return piece;
      });

      // Check completion
      if (newPieces.every(p => p.isPlaced)) {
        if (!isCompleted) {
          setIsCompleted(true);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: [theme.primaryColor, theme.accentColor, '#ffffff']
          });
          onComplete?.();
        }
      }

      return newPieces;
    });
  };

  return (
    <div className="flex flex-col items-center w-full">
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="text-white font-fantasy animate-pulse">Loading Magic...</div>
        </div>
      )}
      <div 
        ref={containerRef}
        className="relative bg-black/30 backdrop-blur-sm rounded-xl border-2 border-white/10 shadow-2xl overflow-hidden transition-all duration-500"
        style={{ 
          width: boardDimensions.width, 
          height: boardDimensions.height,
          boxShadow: isCompleted ? `0 0 50px ${theme.primaryColor}` : 'none'
        }}
      >
        {/* Background Guide (faint) */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url(${theme.image})`,
            backgroundSize: '100% 100%',
            opacity: isCompleted ? 1 : 0.1
          }}
        />

        {/* Grid Guide (optional, helps placement) */}
        {!isCompleted && (
          <div className="absolute inset-0 grid pointer-events-none opacity-10" 
               style={{ 
                 gridTemplateColumns: `repeat(${cols}, 1fr)`,
                 gridTemplateRows: `repeat(${rows}, 1fr)`
               }}>
            {Array.from({ length: rows * cols }).map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>
        )}

        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          {pieces.map(piece => (
            <PuzzlePiece 
              key={piece.id} 
              piece={piece} 
              image={theme.image}
              themeColor={theme.accentColor}
              isDragging={activeId === piece.id}
            />
          ))}
        </DndContext>

        {/* Completion Overlay */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
            >
              <div className="text-center p-8 bg-black/60 border border-white/20 rounded-2xl shadow-2xl glow-box">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-yellow-400 animate-pulse" />
                <h2 className="text-4xl font-fantasy text-white mb-2 glow-text">Masterpiece Restored!</h2>
                <p className="text-lg text-white/80 font-body max-w-md">
                  The {theme.name} has been revealed in all its glory.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-white/60 text-sm font-body">
        <CheckCircle2 className="w-4 h-4" />
        <span>Drag pieces to their correct locations. They will snap when close.</span>
      </div>
    </div>
  );
}
