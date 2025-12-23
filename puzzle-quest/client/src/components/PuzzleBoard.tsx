import { useState, useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { PuzzlePiece as PieceType, generatePuzzle, isCloseEnough } from '@/lib/puzzle';
import { PuzzlePiece } from './PuzzlePiece';
import { PuzzleTheme } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Flame, Sparkles, Target, Timer, Trophy, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

type ScoreEvent = { type: 'hit' | 'miss' | 'complete'; delta: number; streak?: number };

interface PuzzleBoardProps {
  theme: PuzzleTheme;
  rows?: number;
  cols?: number;
  onComplete?: () => void;
  elapsedSeconds?: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

export function PuzzleBoard({ theme, rows = 3, cols = 4, onComplete, elapsedSeconds = 0 }: PuzzleBoardProps) {
  const [pieces, setPieces] = useState<PieceType[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardDimensions, setBoardDimensions] = useState({ width: 800, height: 600 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [scoreState, setScoreState] = useState({
    score: 0,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    wrong: 0,
  });
  const [lastEvent, setLastEvent] = useState<ScoreEvent | null>(null);

  const BASE_REWARD = 120;
  const STREAK_BONUS = 15;
  const WRONG_PENALTY = 10;
  const COMPLETION_BONUS = 400;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  const totalPieces = rows * cols;
  const placedPieces = pieces.filter(p => p.isPlaced).length;
  const attempts = scoreState.correct + scoreState.wrong;
  const accuracy = attempts ? Math.round((scoreState.correct / attempts) * 100) : 100;
  const progressPct = totalPieces ? Math.round((placedPieces / totalPieces) * 100) : 0;

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
        setScoreState({
          score: 0,
          streak: 0,
          bestStreak: 0,
          correct: 0,
          wrong: 0,
        });
        setLastEvent(null);
        setIsCompleted(false);
        setIsInitialized(true);
      };

      initPuzzle();
      
      window.addEventListener('resize', initPuzzle);
      return () => window.removeEventListener('resize', initPuzzle);
    }, 100);

    return () => clearTimeout(timer);
  }, [theme, rows, cols]);

  useEffect(() => {
    if (!lastEvent) return;
    const timer = setTimeout(() => setLastEvent(null), 1800);
    return () => clearTimeout(timer);
  }, [lastEvent]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    setActiveId(null);

    const movedEnough = Math.abs(delta.x) > 1 || Math.abs(delta.y) > 1;
    let outcome: 'hit' | 'miss' | 'none' = 'none';
    let completionTriggered = false;

    setPieces(prev => {
      const newPieces = prev.map(piece => {
        if (piece.id === active.id) {
          if (piece.isPlaced) {
            return piece;
          }
          const newX = piece.currentX + delta.x;
          const newY = piece.currentY + delta.y;
          
          // Check if close to correct position
          const targetX = piece.left;
          const targetY = piece.top;
          
          if (isCloseEnough({ x: newX, y: newY }, { x: targetX, y: targetY }, 40)) {
            // Snap!
            // Play sound effect here if we had audio
            outcome = 'hit';
            return { ...piece, currentX: targetX, currentY: targetY, isPlaced: true };
          }
          
          if (movedEnough) {
            outcome = 'miss';
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
          completionTriggered = true;
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

    let nextEvent: ScoreEvent | null = null;

    setScoreState(prev => {
      let next = { ...prev };

      if (outcome === 'hit') {
        const newStreak = prev.streak + 1;
        const deltaScore = BASE_REWARD + newStreak * STREAK_BONUS;
        next = {
          ...next,
          score: prev.score + deltaScore,
          streak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
          correct: prev.correct + 1,
        };
        nextEvent = { type: 'hit', delta: deltaScore, streak: newStreak };
      } else if (outcome === 'miss') {
        const deltaScore = -WRONG_PENALTY;
        next = {
          ...next,
          score: Math.max(0, prev.score + deltaScore),
          streak: 0,
          wrong: prev.wrong + 1,
        };
        nextEvent = { type: 'miss', delta: deltaScore };
      }

      if (completionTriggered) {
        const streakBoost = next.streak || next.bestStreak;
        const completionDelta = COMPLETION_BONUS + streakBoost * 20;
        next = { ...next, score: next.score + completionDelta };
        nextEvent = { type: 'complete', delta: completionDelta, streak: streakBoost };
      }

      return next;
    });

    if (nextEvent) {
      setLastEvent(nextEvent);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="text-white font-fantasy animate-pulse">Loading Magic...</div>
        </div>
      )}

      <div className="w-full max-w-5xl mb-4">
        <div className="glass-panel rounded-2xl border-white/10 px-4 py-3 text-white shadow-2xl">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Timer className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Game Master Timer</div>
                <div className="text-xl font-fantasy">{formatTime(elapsedSeconds)}</div>
                <div className="text-[11px] text-white/50">Running</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Sparkles className="w-5 h-5 text-[var(--magical-glow)]" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Score</div>
                <div className="text-xl font-fantasy">{scoreState.score.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Flame className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Streak</div>
                <div className="text-xl font-fantasy">{scoreState.streak}x</div>
                <div className="text-[11px] text-white/50">Best {scoreState.bestStreak}x</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Target className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Accuracy</div>
                <div className="text-xl font-fantasy">{accuracy}%</div>
                <div className="text-[11px] text-white/50">{scoreState.correct} / {attempts || 0} moves</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <XCircle className="w-5 h-5 text-red-300" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/60">Mistakes</div>
                <div className="text-xl font-fantasy">{scoreState.wrong}</div>
                <div className="text-[11px] text-white/50">{placedPieces}/{totalPieces} placed</div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--magical-glow)] via-[var(--primary)] to-[var(--magical-accent)] shadow-[0_0_12px_var(--magical-glow)] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-white/60 flex justify-between">
              <span>{placedPieces}/{totalPieces} pieces aligned</span>
              <span>{progressPct}% revealed</span>
            </div>
          </div>

          <AnimatePresence>
            {lastEvent && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                className="mt-3 px-3 py-2 rounded-lg border border-white/15 bg-white/10 flex items-center gap-2 shadow-lg"
              >
                {lastEvent.type === 'hit' && <Sparkles className="w-4 h-4 text-[var(--magical-glow)]" />}
                {lastEvent.type === 'miss' && <XCircle className="w-4 h-4 text-red-300" />}
                {lastEvent.type === 'complete' && <Trophy className="w-4 h-4 text-yellow-300" />}
                <span className="text-sm font-medium">
                  {lastEvent.type === 'hit' && `+${lastEvent.delta} resonance!${lastEvent.streak ? ` Streak ${lastEvent.streak}x` : ''}`}
                  {lastEvent.type === 'miss' && `${lastEvent.delta} misplaced. Realign and try again.`}
                  {lastEvent.type === 'complete' && `+${lastEvent.delta} Realm restored!`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
              rows={rows}
              cols={cols}
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
