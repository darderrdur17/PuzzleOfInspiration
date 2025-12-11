"use client";

import { useState, useEffect } from "react";
import { Quote, PhaseTitle, Phase } from "@/types/game";
import { QuoteCard } from "./QuoteCard";
import { PuzzlePiece } from "./PuzzlePiece";
import { cn } from "@/lib/utils";
import { CheckCircle2, Cpu, Zap, Wifi, Database } from "lucide-react";

interface CyberpunkBoardProps {
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

const CYBER_PHASES = [
  { 
    id: "preparation" as Phase, 
    label: "Data Initialization", 
    color: "#00ffff",
    icon: Database,
    description: "Neural input streams"
  },
  { 
    id: "incubation" as Phase, 
    label: "Neural Processing", 
    color: "#ff00ff",
    icon: Cpu,
    description: "Background algorithms"
  },
  { 
    id: "illumination" as Phase, 
    label: "Digital Epiphany", 
    color: "#ffff00",
    icon: Zap,
    description: "Code compilation"
  },
  { 
    id: "verification" as Phase, 
    label: "System Verification", 
    color: "#00ff88",
    icon: Wifi,
    description: "Deployment protocol"
  },
];

export function CyberpunkBoard({
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
}: CyberpunkBoardProps) {
  const [hoveredSlot, setHoveredSlot] = useState<Phase | null>(null);
  const [glitchActive, setGlitchActive] = useState(false);
  const progress = (correctPlacements / totalPieces) * 100;

  // Random glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 150);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Progress Bar - Cyber Style */}
      <div className="cyber-progress-container bg-[#0a0e27]/90 border-2 border-cyan-500/50 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <span className="text-sm font-bold text-cyan-400 tracking-wider uppercase font-mono">
            System Progress
          </span>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-cyan-300/80 font-mono">
              [{correctPlacements}/{totalPieces}] DATA NODES ALIGNED
            </span>
            <span
              className={cn(
                "font-mono px-3 py-1 rounded border",
                wrongAttempts > 0
                  ? "border-red-500/60 bg-red-500/20 text-red-400"
                  : "border-cyan-500/40 text-cyan-500/60"
              )}
            >
              ERRORS: {wrongAttempts}
            </span>
          </div>
        </div>
        <div className="relative w-full bg-[#1a1f3a] rounded-full h-4 overflow-hidden border border-cyan-500/30">
          <div
            className="h-full transition-all duration-500 rounded-full relative"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00ffff, #ff00ff, #ffff00)',
              boxShadow: '0 0 20px rgba(0,255,255,0.5), 0 0 40px rgba(255,0,255,0.3)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
          {/* Progress percentage display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-mono text-white/80 font-bold">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Cyberpunk Board */}
      <div
        className={cn(
          "relative rounded-2xl p-6 sm:p-8 min-h-[600px] sm:min-h-[700px] overflow-hidden",
          glitchActive && "animate-glitch"
        )}
        style={{
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2d1f4a 100%)',
        }}
      >
        {/* Animated Grid Background */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,255,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-scroll 20s linear infinite',
          }}
        />

        {/* Circuit Pattern Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 50 L40 50 M60 50 L100 50 M50 0 L50 40 M50 60 L50 100" 
                    stroke="#00ffff" strokeWidth="1" fill="none"/>
              <circle cx="50" cy="50" r="4" fill="#00ffff"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)"/>
        </svg>

        {/* Title */}
        <h2 
          className="relative z-10 text-3xl sm:text-4xl font-bold text-center mb-8 tracking-wider"
          style={{
            fontFamily: "'Orbitron', 'Courier New', monospace",
            color: '#00ffff',
            textShadow: '0 0 20px #00ffff, 0 0 40px #ff00ff, 0 0 60px #00ffff',
            animation: 'neon-flicker 3s infinite alternate',
          }}
        >
          NEURAL PUZZLE MATRIX
        </h2>

        {/* Phase Slots Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {CYBER_PHASES.map((phase) => {
            const title = placedTitles[phase.id];
            const quotes = placedQuotes[phase.id] || [];
            const isHighlighted = highlightedZone === phase.id;
            const isHovered = hoveredSlot === phase.id;
            const Icon = phase.icon;

            return (
              <div
                key={phase.id}
                className="relative"
                onMouseEnter={() => setHoveredSlot(phase.id)}
                onMouseLeave={() => setHoveredSlot(null)}
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
                    "mb-3 p-3 rounded-lg border-2 transition-all duration-300 backdrop-blur-sm",
                    title
                      ? "bg-green-500/20 border-green-500"
                      : "bg-cyan-500/10 border-cyan-500/50 border-dashed"
                  )}
                  style={{
                    boxShadow: title 
                      ? `0 0 20px rgba(0,255,136,0.3)` 
                      : isHovered 
                        ? `0 0 15px ${phase.color}40` 
                        : 'none'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${phase.color}20`,
                        border: `1px solid ${phase.color}60`
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: phase.color }} />
                    </div>
                    <div className="flex-1">
                      {title ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-400 font-mono">{title.title}</span>
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        </div>
                      ) : (
                        <span className="text-cyan-400/70 text-sm font-mono">
                          [DROP: {phase.label}]
                        </span>
                      )}
                      <div className="text-xs text-cyan-500/50 font-mono">{phase.description}</div>
                    </div>
                  </div>
                </div>

                {/* Quote Drop Zone */}
                <div
                  onDragOver={(e) => onDragOver(e, phase.id)}
                  onDrop={(e) => {
                    e.preventDefault();
                    onDrop(phase.id);
                  }}
                  className={cn(
                    "relative min-h-[180px] rounded-xl border-2 p-4 transition-all duration-300",
                    isHighlighted
                      ? "ring-4 ring-cyan-400 ring-offset-2 ring-offset-[#0a0e27] scale-[1.02]"
                      : "",
                    title && quotes.length > 0
                      ? "bg-green-500/10 border-green-500/50"
                      : "bg-[#0a0e27]/80 border-cyan-500/30"
                  )}
                  style={{
                    boxShadow: isHighlighted 
                      ? `0 0 30px ${phase.color}60` 
                      : isHovered 
                        ? `0 0 20px ${phase.color}30, inset 0 0 30px ${phase.color}10` 
                        : `inset 0 0 20px ${phase.color}10`
                  }}
                >
                  {/* Circuit decoration inside */}
                  <svg className="absolute top-2 right-2 w-8 h-8 opacity-40">
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke={phase.color} strokeWidth="1" />
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke={phase.color} strokeWidth="1" />
                    <circle cx="50%" cy="50%" r="20%" fill="none" stroke={phase.color} strokeWidth="1" />
                  </svg>

                  {/* Phase label */}
                  <div className="text-center mb-3">
                    <span 
                      className="text-sm font-bold font-mono tracking-wider"
                      style={{ color: phase.color }}
                    >
                      {phase.label.toUpperCase()}
                    </span>
                  </div>

                  {/* Placed quotes */}
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {quotes.map((quote, index) => {
                      const variants: Array<"purple" | "orange" | "green" | "gold"> = ["purple", "orange", "green", "gold"];
                      const variant = variants[index % variants.length];
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
                      <span className="text-cyan-500/40 text-sm font-mono animate-pulse">
                        [AWAITING DATA INPUT]
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Display */}
        <div 
          className="relative z-10 mt-8 mx-auto max-w-2xl p-4 rounded-xl border-2 border-cyan-500/40 backdrop-blur-sm"
          style={{
            background: 'linear-gradient(90deg, rgba(0,255,255,0.1), rgba(255,0,255,0.1))',
          }}
        >
          <div className="flex items-center justify-between text-sm font-mono">
            <span className="text-cyan-400">
              <span className="text-cyan-500/60">STATUS:</span> {correctPlacements === totalPieces ? 'COMPLETE' : 'PROCESSING'}
            </span>
            <span className="text-magenta-400">
              <span className="text-cyan-500/60">SYNC:</span> {Math.round(progress)}%
            </span>
            <span className={wrongAttempts > 0 ? "text-red-400" : "text-green-400"}>
              <span className="text-cyan-500/60">INTEGRITY:</span> {wrongAttempts === 0 ? 'OPTIMAL' : 'DEGRADED'}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes neon-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        @keyframes grid-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes animate-glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(2px, 2px); }
          100% { transform: translate(0); }
        }
        .animate-glitch {
          animation: animate-glitch 0.15s ease-in-out;
        }
      `}</style>
    </div>
  );
}


