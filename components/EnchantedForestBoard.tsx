"use client";

import { useState, useEffect, useMemo } from "react";
import { Quote, PhaseTitle, Phase } from "@/types/game";
import { PuzzlePiece } from "./PuzzlePiece";
import { cn } from "@/lib/utils";
import { CheckCircle2, Leaf, Moon, Sun, Sparkles } from "lucide-react";

interface EnchantedForestBoardProps {
  correctPlacements: number;
  totalPieces: number;
  wrongAttempts: number;
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

const FOREST_PHASES = [
  { 
    id: "preparation" as Phase, 
    label: "Seed Gathering", 
    color: "#4ade80",
    icon: Leaf,
    description: "Collect the seeds of inspiration"
  },
  { 
    id: "incubation" as Phase, 
    label: "Moonlit Growth", 
    color: "#60a5fa",
    icon: Moon,
    description: "Let ideas grow in darkness"
  },
  { 
    id: "illumination" as Phase, 
    label: "Firefly Moment", 
    color: "#fbbf24",
    icon: Sun,
    description: "A flash of clarity"
  },
  { 
    id: "verification" as Phase, 
    label: "Forest Harmony", 
    color: "#a78bfa",
    icon: Sparkles,
    description: "Nature approves your creation"
  },
];

// Generate random floating particles
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
    size: 2 + Math.random() * 4,
  }));
};

export function EnchantedForestBoard({
  correctPlacements,
  totalPieces,
  wrongAttempts,
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
}: EnchantedForestBoardProps) {
  const [activeSlot, setActiveSlot] = useState<Phase | null>(null);
  const progress = (correctPlacements / totalPieces) * 100;
  
  // Memoize particles so they don't regenerate on every render
  const particles = useMemo(() => generateParticles(25), []);

  return (
    <div className="space-y-6">
      {/* Progress Bar - Forest Style */}
      <div className="forest-progress-container bg-[#1a2f1a]/90 border-2 border-green-500/40 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <span className="text-sm font-bold text-green-400 tracking-wide" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
            🌿 Garden Progress
          </span>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-green-300/80">
              {correctPlacements}/{totalPieces} seeds planted
            </span>
            <span
              className={cn(
                "px-3 py-1 rounded-full border",
                wrongAttempts > 0
                  ? "border-red-400/60 bg-red-500/20 text-red-300"
                  : "border-green-500/40 text-green-500/60"
              )}
            >
              {wrongAttempts} withered
            </span>
          </div>
        </div>
        <div className="relative w-full bg-[#0f1f0f] rounded-full h-4 overflow-hidden border border-green-600/30">
          <div
            className="h-full transition-all duration-700 rounded-full relative"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #22c55e, #4ade80, #86efac)',
              boxShadow: '0 0 15px rgba(74,222,128,0.4)'
            }}
          >
            {/* Growing vine effect */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-300 rounded-full animate-pulse" 
                 style={{ boxShadow: '0 0 10px #4ade80' }} />
          </div>
        </div>
      </div>

      {/* Enchanted Forest Board */}
      <div
        className="relative rounded-3xl p-6 sm:p-8 min-h-[600px] sm:min-h-[700px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1a2f1a 0%, #0f1f0f 50%, #1a2f1a 100%)',
        }}
      >
        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: particle.id % 3 === 0 ? '#fbbf24' : particle.id % 2 === 0 ? '#4ade80' : '#60a5fa',
                boxShadow: `0 0 ${particle.size * 2}px ${particle.id % 3 === 0 ? '#fbbf24' : particle.id % 2 === 0 ? '#4ade80' : '#60a5fa'}`,
                animation: `float ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Decorative vines at top */}
        <div 
          className="absolute top-0 left-0 right-0 h-20 opacity-40 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(74,222,128,0.3) 20px, rgba(74,222,128,0.3) 22px)',
          }}
        />

        {/* Title */}
        <h2 
          className="relative z-10 text-3xl sm:text-4xl font-bold text-center mb-8"
          style={{
            fontFamily: "'Cinzel', Georgia, serif",
            color: '#4ade80',
            textShadow: '0 0 20px rgba(74,222,128,0.6)',
          }}
        >
          The World Tree Puzzle
        </h2>

        {/* Phase Slots - Leaf-shaped arrangement */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {FOREST_PHASES.map((phase, index) => {
            const title = placedTitles[phase.id];
            const quotes = placedQuotes[phase.id] || [];
            const isHighlighted = highlightedZone === phase.id;
            const isActive = activeSlot === phase.id;
            const Icon = phase.icon;

            return (
              <div
                key={phase.id}
                className="relative"
                onMouseEnter={() => setActiveSlot(phase.id)}
                onMouseLeave={() => setActiveSlot(null)}
              >
                {/* Title Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedTitle) onDragOver(e, phase.id);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedTitle) onDrop(phase.id);
                  }}
                  className={cn(
                    "mb-3 p-3 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm",
                    title
                      ? "bg-green-500/20 border-green-400"
                      : "bg-green-900/30 border-green-600/40 border-dashed"
                  )}
                  style={{
                    boxShadow: title 
                      ? '0 0 20px rgba(74,222,128,0.4)' 
                      : isActive 
                        ? `0 0 15px ${phase.color}40` 
                        : 'none'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ 
                        background: `radial-gradient(circle, ${phase.color}40, transparent)`,
                        border: `2px solid ${phase.color}60`
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: phase.color }} />
                    </div>
                    <div className="flex-1">
                      {title ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-300" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
                            {title.title}
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        </div>
                      ) : (
                        <span className="text-green-400/60 text-sm italic">
                          Place &ldquo;{phase.label}&rdquo; here
                        </span>
                      )}
                      <div className="text-xs text-green-500/40">{phase.description}</div>
                    </div>
                  </div>
                </div>

                {/* Quote Drop Zone - Leaf shape */}
                <div
                  onDragOver={(e) => onDragOver(e, phase.id)}
                  onDrop={(e) => {
                    e.preventDefault();
                    onDrop(phase.id);
                  }}
                  className={cn(
                    "relative min-h-[180px] p-4 transition-all duration-500",
                    isHighlighted
                      ? "ring-4 ring-amber-400 ring-offset-2 ring-offset-[#1a2f1a] scale-[1.02]"
                      : "",
                    title && quotes.length > 0
                      ? "bg-green-500/15"
                      : "bg-green-900/20"
                  )}
                  style={{
                    borderRadius: '50% 10% 50% 10%',
                    border: `3px solid ${isActive ? phase.color : 'rgba(74,222,128,0.4)'}`,
                    transform: isActive && !isHighlighted ? 'scale(1.02) rotate(2deg)' : 'rotate(0deg)',
                    boxShadow: isActive 
                      ? `0 0 30px ${phase.color}50` 
                      : '0 0 15px rgba(74,222,128,0.2)',
                  }}
                >
                  {/* Rune decoration */}
                  <svg className="absolute top-4 right-4 w-12 h-12 opacity-30" viewBox="0 0 100 100">
                    <path
                      d="M50 10 L60 40 L90 40 L65 60 L75 90 L50 70 L25 90 L35 60 L10 40 L40 40 Z"
                      fill="none"
                      stroke={phase.color}
                      strokeWidth="2"
                    />
                  </svg>

                  {/* Phase label */}
                  <div className="text-center mb-3">
                    <span 
                      className="text-sm font-bold"
                      style={{ 
                        color: phase.color,
                        fontFamily: "'Cinzel', Georgia, serif" 
                      }}
                    >
                      {phase.label}
                    </span>
                  </div>

                  {/* Placed quotes */}
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto justify-center">
                    {quotes.map((quote, idx) => {
                      const variants: Array<"purple" | "orange" | "green" | "gold"> = ["purple", "orange", "green", "gold"];
                      const variant = variants[idx % variants.length];
                      return (
                        <div
                          key={quote.id}
                          draggable
                          onDragStart={() => onDragStart(quote)}
                          onDragEnd={onDragEnd}
                          className="cursor-move touch-manipulation"
                        >
                          <PuzzlePiece
                            quote={quote}
                            variant={variant}
                            size="small"
                            isPlaced={true}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Empty state */}
                  {quotes.length === 0 && (
                    <div className="flex items-center justify-center h-20">
                      <span className="text-green-500/40 text-sm italic">
                        ✨ Awaiting seeds of wisdom...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mystical Quote */}
        <div 
          className="relative z-10 mt-8 mx-auto max-w-xl p-4 rounded-2xl border border-green-600/40"
          style={{
            background: 'linear-gradient(90deg, rgba(74,222,128,0.1), transparent, rgba(74,222,128,0.1))',
          }}
        >
          <p 
            className="text-center text-green-300/80 italic"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
&ldquo;Place each piece where nature intended...&rdquo;
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
            opacity: 0.6;
          }
          25% {
            transform: translateY(-15px) translateX(5px);
            opacity: 0.9;
          }
          50% { 
            transform: translateY(-25px) translateX(-5px); 
            opacity: 1;
          }
          75% {
            transform: translateY(-15px) translateX(5px);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}

