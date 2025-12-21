"use client";

import { useEffect, useMemo } from "react";
import { DroppableZone, DraggableQuote } from "./DragDropProvider";
import { Quote, Phase, ThemeId } from "@/types/game";
import { PuzzlePiece } from "./PuzzlePiece";
import { cn } from "@/lib/utils";
import { getThemeConfig } from "@/lib/themeConfig";
import {
  DEFAULT_JIGSAW_LAYOUT,
  defaultJigsawLayoutByTheme,
  jigsawThemeConfigs,
  type JigsawThemeConfig,
  type JigsawLayoutId,
} from "@/lib/jigsawThemes";

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
  themeId?: ThemeId;
  layoutId?: JigsawLayoutId;
  onGameComplete?: () => void;
  placedQuotes: Record<string, Quote[]>;
  hintPhase?: Phase | null;
}

const PHASE_SEQUENCE: Phase[] = ["preparation", "incubation", "illumination", "verification"];

const PhaseDropZone: React.FC<{
  phase: Phase;
  legend: JigsawThemeConfig["phaseLegends"][Phase];
  zone: JigsawThemeConfig["phaseZones"][Phase];
  accentColor: string;
  glowColor: string;
  isHinted?: boolean;
}> = ({ phase, legend, zone, accentColor, glowColor, isHinted = false }) => {
  const { x, y, width, height, rotate } = zone;

  return (
    <DroppableZone
      id={phase}
      isHighlighted={isHinted}
      className={cn(
        "absolute rounded-2xl border-[3px] border-white/20 bg-slate-900/55 text-white flex flex-col justify-center items-start px-4 py-4 transition-all duration-500 backdrop-blur-sm",
        "hover:border-white/50 hover:bg-slate-900/70 shadow-xl",
        isHinted && "hint-glow"
      )}
      style={{
        left: x,
        top: y,
        width,
        height,
        borderColor: accentColor,
        boxShadow: `0 25px 45px ${glowColor}`,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      <span className="text-[11px] uppercase tracking-[0.3em] text-white/60 mb-1">{phase}</span>
      <div className="flex items-center gap-2 text-lg font-semibold">
        <span className="text-2xl" aria-hidden="true">
          {legend.icon}
        </span>
        <span>{legend.title}</span>
      </div>
      <p className="text-xs text-white/80 mt-2 leading-snug">{legend.hint}</p>
      {isHinted && (
        <div className="mt-3 flex items-center gap-2 text-amber-200 text-[11px] font-semibold uppercase tracking-widest">
          <span className="inline-flex h-2 w-2 rounded-full bg-amber-300 animate-pulse" aria-hidden="true" />
          Follow the class hint
        </div>
      )}
    </DroppableZone>
  );
};

const JigsawTrayPiece: React.FC<{
  piece: JigsawPieceData;
  variant: "purple" | "orange" | "green" | "gold";
  glowColor: string;
}> = ({ piece, variant, glowColor }) => (
  <div
    style={{
      position: "absolute",
      width: "180px",
      height: "120px",
      left: piece.position.x,
      top: piece.position.y,
    }}
  >
    <DraggableQuote quote={piece.quote} id={`jigsaw-${piece.id}`}>
      <div
        className="jigsaw-piece w-full h-full"
        style={{
          clipPath: `url(#${piece.shapeId})`,
          boxShadow: `0 10px 25px ${glowColor}`,
        }}
      >
        <PuzzlePiece quote={piece.quote} variant={variant} size="small" />
      </div>
    </DraggableQuote>
  </div>
);

export function JigsawBoard({
  quotes,
  themeId = "classic",
  layoutId,
  onGameComplete,
  placedQuotes,
  hintPhase = null,
}: JigsawBoardProps) {
  const resolvedTheme = (themeId ?? "classic") as ThemeId;
  const derivedLayoutId: JigsawLayoutId =
    layoutId ?? defaultJigsawLayoutByTheme[resolvedTheme] ?? DEFAULT_JIGSAW_LAYOUT;
  const jigsawConfig = jigsawThemeConfigs[derivedLayoutId] ?? jigsawThemeConfigs[DEFAULT_JIGSAW_LAYOUT];
  const themeConfig = getThemeConfig(resolvedTheme);

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

  const placedCount = useMemo(
    () => Object.values(placedQuotes).reduce((total, zone) => total + zone.length, 0),
    [placedQuotes]
  );

  useEffect(() => {
    if (!onGameComplete) return;
    if (placedCount >= quotes.length) {
      onGameComplete();
    }
  }, [onGameComplete, placedCount, quotes.length]);

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border-2 p-4 sm:p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between backdrop-blur-md"
        style={{
          background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.6))",
          borderColor: jigsawConfig.accentColors.primary,
        }}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/70 flex items-center gap-1">
            {jigsawConfig.badgeIcon} Layout Template
          </p>
          <h3 className="text-2xl font-bold text-white mt-1">{jigsawConfig.name}</h3>
          <p className="text-sm text-white/80 mt-1 max-w-2xl">{jigsawConfig.description}</p>
          <p className="text-xs text-white/70 mt-2 italic">“{jigsawConfig.mantra}”</p>
        </div>
        <div className="flex items-center gap-2">
          {jigsawConfig.accentColors.palette.map((color) => (
            <span
              key={color}
              className="h-9 w-9 rounded-full shadow-lg border border-white/30"
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      {/* SVG clip-path definitions */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
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

      <div
        className="relative w-full h-[520px] rounded-2xl overflow-hidden border-4 shadow-[0_25px_70px_rgba(0,0,0,0.45)]"
        style={{
          borderColor: jigsawConfig.accentColors.primary,
          backgroundImage: `url(${jigsawConfig.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: jigsawConfig.overlayGradient,
            mixBlendMode: "soft-light",
          }}
        />

        {jigsawConfig.grid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-70"
            style={{
              backgroundImage: `
                linear-gradient(${jigsawConfig.grid.angle ?? 45}deg, ${jigsawConfig.grid.color} 1px, transparent 1px),
                linear-gradient(${(jigsawConfig.grid.angle ?? 45) + 90}deg, ${jigsawConfig.grid.color} 1px, transparent 1px)
              `,
              backgroundSize: `${jigsawConfig.grid.size}px ${jigsawConfig.grid.size}px`,
              animation: `jigsaw-grid-pan ${jigsawConfig.grid.speed ?? 60}s linear infinite`,
              opacity: jigsawConfig.grid.opacity,
            }}
          />
        )}

        {jigsawConfig.floatingOrbs?.map((orb, index) => (
          <div
            key={`${orb.top}-${orb.left}-${index}`}
            className="absolute rounded-full pointer-events-none blur-3xl"
            style={{
              top: orb.top,
              left: orb.left,
              width: orb.size,
              height: orb.size,
              background: orb.color,
              opacity: orb.opacity ?? 0.7,
              filter: orb.blur ? `blur(${orb.blur}px)` : undefined,
              animation: "orb-drift 18s ease-in-out infinite",
              animationDelay: `${index * 0.8}s`,
            }}
          />
        ))}

        {(Object.keys(jigsawConfig.phaseZones) as Phase[]).map((phaseKey) => (
          <PhaseDropZone
            key={phaseKey}
            phase={phaseKey}
            legend={jigsawConfig.phaseLegends[phaseKey]}
            zone={jigsawConfig.phaseZones[phaseKey]}
            isHinted={hintPhase === phaseKey}
            accentColor={jigsawConfig.accentColors.primary}
            glowColor={jigsawConfig.accentColors.glow}
          />
        ))}

        {Object.entries(placedQuotes).map(([phase, zoneQuotes]) =>
          zoneQuotes.map((quote, idx) => {
            const piece = jigsawPieces.find((p) => p.id === quote.id);
            if (!piece) return null;

            const zone = jigsawConfig.phaseZones[phase as Phase];
            const offset = { x: 10 + (idx % 2) * 40, y: 10 + Math.floor(idx / 2) * 35 };

            return (
              <div
                key={quote.id}
                className="absolute z-30 animate-in fade-in zoom-in duration-300"
                style={{
                  left: zone.x + offset.x,
                  top: zone.y + offset.y,
                  width: "180px",
                  height: "120px",
                }}
              >
                <div
                  className="jigsaw-piece w-full h-full"
                  style={{
                    clipPath: `url(#${piece.shapeId})`,
                    background: `linear-gradient(135deg, ${jigsawConfig.accentColors.primary}, ${jigsawConfig.accentColors.secondary})`,
                    boxShadow: `0 15px 35px ${jigsawConfig.accentColors.glow}`,
                  }}
                >
                  <PuzzlePiece quote={quote} variant={jigsawConfig.pieceVariant} size="small" isPlaced />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PHASE_SEQUENCE.map((phase) => {
          const legend = jigsawConfig.phaseLegends[phase];
          return (
            <div
              key={phase}
              className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/10 to-transparent px-4 py-3 text-white/90 backdrop-blur-md"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-lg" aria-hidden="true">
                  {legend.icon}
                </span>
                {legend.title}
              </div>
              <p className="text-xs text-white/70 mt-1 leading-snug">{legend.hint}</p>
            </div>
          );
        })}
      </div>

      <div
        className="backdrop-blur-md p-4 rounded-2xl border shadow-xl relative overflow-hidden"
        style={{
          background: jigsawConfig.trayBackground,
          borderColor: jigsawConfig.trayBorder,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Available Pieces
            <span className="text-sm font-normal bg-white/10 text-white/80 px-2 py-0.5 rounded-full">
              {unplacedPieces.length} remaining
            </span>
          </h3>
          <div className="text-xs text-white/70 italic">
            Drag pieces to their correct creative phase on the board
          </div>
        </div>

        <div className="relative min-h-[300px] rounded-lg overflow-x-auto bg-black/20 border border-white/10">
          {unplacedPieces.map((piece) => (
            <JigsawTrayPiece
              key={piece.id}
              piece={piece}
              variant={jigsawConfig.pieceVariant}
              glowColor={jigsawConfig.accentColors.glow}
            />
          ))}

          {unplacedPieces.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
              <div className="max-w-xs">
                <div className="text-4xl mb-4">✨</div>
                <h4 className="text-xl font-bold">Tray Empty!</h4>
                <p className="text-sm text-white/80 mt-2">
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



