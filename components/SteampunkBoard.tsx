"use client";

import { useState, useMemo } from "react";
import { Quote, PhaseTitle, Phase } from "@/types/game";
import { PuzzlePiece } from "./PuzzlePiece";
import { cn } from "@/lib/utils";
import { CheckCircle2, Cog, Gauge, Wrench, Lightbulb } from "lucide-react";

interface SteampunkBoardProps {
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

const STEAM_PHASES = [
  { 
    id: "preparation" as Phase, 
    label: "Blueprint Assembly", 
    color: "#cd7f32",
    icon: Wrench,
    description: "Gather your materials"
  },
  { 
    id: "incubation" as Phase, 
    label: "Pressure Building", 
    color: "#b87333",
    icon: Gauge,
    description: "Let steam build up"
  },
  { 
    id: "illumination" as Phase, 
    label: "Clockwork Epiphany", 
    color: "#ffd700",
    icon: Lightbulb,
    description: "The gears click into place"
  },
  { 
    id: "verification" as Phase, 
    label: "Precision Testing", 
    color: "#8b4513",
    icon: Cog,
    description: "Test every mechanism"
  },
];

// Gear SVG component
const GearIcon = ({ size = 60, color = "#cd7f32", spinning = false }: { size?: number; color?: string; spinning?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={spinning ? "animate-spin-slow" : ""}
    style={{ animationDuration: '8s' }}
  >
    <circle cx="50" cy="50" r="25" fill="#2c1810" stroke={color} strokeWidth="2" />
    {[...Array(8)].map((_, i) => (
      <rect
        key={i}
        x="48"
        y="15"
        width="4"
        height="15"
        fill={color}
        transform={`rotate(${i * 45} 50 50)`}
      />
    ))}
    <circle cx="50" cy="50" r="8" fill={color} />
  </svg>
);

export function SteampunkBoard({
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
}: SteampunkBoardProps) {
  const [rotatingGear, setRotatingGear] = useState<Phase | null>(null);
  const progress = (correctPlacements / totalPieces) * 100;

  // Generate rivet positions
  const rivets = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      top: i < 6 ? '12px' : 'auto',
      bottom: i >= 6 ? '12px' : 'auto',
      left: `${8 + (i % 6) * 16}%`,
    })), 
  []);

  return (
    <div className="space-y-6">
      {/* Progress Bar - Steampunk Style */}
      <div 
        className="steampunk-progress-container rounded-xl p-4 border-4"
        style={{
          background: 'linear-gradient(135deg, #3d2817 0%, #2c1810 100%)',
          borderColor: '#cd7f32',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <span 
            className="text-sm font-bold tracking-wider uppercase"
            style={{ 
              color: '#ffd700',
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: '0.1em'
            }}
          >
            ⚙️ Machine Progress
          </span>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span style={{ color: '#f5e6d3' }}>
              {correctPlacements}/{totalPieces} components installed
            </span>
            <span
              className={cn(
                "px-3 py-1 rounded border-2",
                wrongAttempts > 0
                  ? "border-red-700 bg-red-900/40 text-red-300"
                  : "border-amber-700/40 text-amber-500/60"
              )}
              style={{
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
              }}
            >
              Jams: {wrongAttempts}
            </span>
          </div>
        </div>
        
        {/* Brass pressure gauge style progress */}
        <div 
          className="relative w-full h-6 rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1a0f0a 0%, #2c1810 50%, #1a0f0a 100%)',
            border: '3px solid #cd7f32',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
          }}
        >
          <div
            className="h-full transition-all duration-500 rounded-full relative"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #cd7f32, #ffd700, #cd7f32)',
              boxShadow: '0 0 10px rgba(255,215,0,0.5)',
            }}
          >
            {/* Brass shine effect */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
              }}
            />
          </div>
          
          {/* Gauge marks */}
          {[...Array(11)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-amber-900/50"
              style={{ left: `${i * 10}%` }}
            />
          ))}
        </div>
      </div>

      {/* Steampunk Board */}
      <div
        className="relative rounded-2xl p-6 sm:p-8 min-h-[600px] sm:min-h-[700px] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2c1810 0%, #3d2817 50%, #4a3020 100%)',
          border: '4px solid #cd7f32',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Decorative Rivets */}
        {rivets.map((rivet) => (
          <div
            key={rivet.id}
            className="absolute w-3 h-3 rounded-full"
            style={{
              top: rivet.top,
              bottom: rivet.bottom,
              left: rivet.left,
              background: 'radial-gradient(circle at 30% 30%, #ffd700, #cd7f32, #8b4513)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 1px rgba(255,215,0,0.2)',
            }}
          />
        ))}

        {/* Steam Effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.15) 0%, transparent 50%)',
            animation: 'steam-rise 10s ease-in-out infinite',
          }}
        />

        {/* Title */}
        <h2 
          className="relative z-10 text-3xl sm:text-4xl font-bold text-center mb-8"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: '#ffd700',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            letterSpacing: '0.15em',
          }}
        >
          The Astrolabe of Ideas
        </h2>

        {/* Phase Slots Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {STEAM_PHASES.map((phase) => {
            const title = placedTitles[phase.id];
            const quotes = placedQuotes[phase.id] || [];
            const isHighlighted = highlightedZone === phase.id;
            const isHovered = rotatingGear === phase.id;
            const Icon = phase.icon;

            return (
              <div
                key={phase.id}
                className="relative"
                onMouseEnter={() => setRotatingGear(phase.id)}
                onMouseLeave={() => setRotatingGear(null)}
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
                    "mb-3 p-3 rounded-lg border-2 transition-all duration-300",
                    title
                      ? "bg-amber-900/30 border-amber-500"
                      : "bg-amber-950/30 border-amber-700/50 border-dashed"
                  )}
                  style={{
                    boxShadow: title 
                      ? '0 0 15px rgba(255,215,0,0.3), inset 0 2px 4px rgba(0,0,0,0.3)' 
                      : 'inset 0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${phase.color}40, ${phase.color}20)`,
                        border: `2px solid ${phase.color}`,
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: phase.color }} />
                    </div>
                    <div className="flex-1">
                      {title ? (
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-bold"
                            style={{ 
                              color: '#ffd700',
                              fontFamily: "'Playfair Display', Georgia, serif" 
                            }}
                          >
                            {title.title}
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        </div>
                      ) : (
                        <span className="text-amber-600/60 text-sm">
                          Install: {phase.label}
                        </span>
                      )}
                      <div className="text-xs text-amber-700/40">{phase.description}</div>
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
                    "relative min-h-[180px] rounded-xl border-3 p-4 transition-all duration-300",
                    isHighlighted
                      ? "ring-4 ring-amber-400 ring-offset-2 ring-offset-[#2c1810] scale-[1.02]"
                      : "",
                    title && quotes.length > 0
                      ? "bg-amber-900/20"
                      : "bg-amber-950/20"
                  )}
                  style={{
                    border: `3px solid ${phase.color}`,
                    boxShadow: `
                      0 4px 8px rgba(0,0,0,0.4),
                      inset 0 2px 4px rgba(255,255,255,0.1),
                      inset 0 -2px 4px rgba(0,0,0,0.3)
                      ${isHovered ? `, 0 0 20px ${phase.color}40` : ''}
                    `,
                    transform: isHovered && !isHighlighted ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {/* Gear decoration */}
                  <div className="absolute top-2 right-2 opacity-60">
                    <GearIcon size={40} color={phase.color} spinning={isHovered} />
                  </div>

                  {/* Phase label */}
                  <div className="text-center mb-3">
                    <span 
                      className="text-sm font-bold tracking-wider"
                      style={{ 
                        color: phase.color,
                        fontFamily: "'Playfair Display', Georgia, serif",
                        letterSpacing: '0.05em'
                      }}
                    >
                      {phase.label.toUpperCase()}
                    </span>
                  </div>

                  {/* Placed quotes */}
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
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
                      <span className="text-amber-700/40 text-sm">
                        ⚙️ Insert components...
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
          className="relative z-10 mt-8 mx-auto max-w-2xl p-4 rounded-xl border-2"
          style={{
            background: 'linear-gradient(90deg, #cd7f32, #b87333)',
            borderColor: '#ffd700',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          <div 
            className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold"
            style={{ 
              color: '#f5e6d3',
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: '0.05em'
            }}
          >
            <span>PRESSURE: {progress < 50 ? 'LOW' : progress < 80 ? 'OPTIMAL' : 'HIGH'}</span>
            <span className="text-amber-300">•</span>
            <span>TEMPERATURE: STABLE</span>
            <span className="text-amber-300">•</span>
            <span>STATUS: {correctPlacements === totalPieces ? 'COMPLETE' : 'OPERATIONAL'}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes steam-rise {
          0% { 
            opacity: 0.1; 
            transform: translateY(0); 
          }
          50% { 
            opacity: 0.2; 
            transform: translateY(-30px); 
          }
          100% { 
            opacity: 0.1; 
            transform: translateY(-60px); 
          }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

