import { useEffect, useState } from "react";
import { Quote, PhaseTitle, Phase } from "@/types/game";
import { cn } from "@/lib/utils";
import { PuzzlePiece } from "./PuzzlePiece";
import { CheckCircle2 } from "lucide-react";

interface ElephantBoardProps {
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

const progressBar = (progress: number, wrongAttempts: number) => (
  <div className="bg-card border-2 border-border rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-3 mb-1 sm:mb-2">
      <span className="text-xs sm:text-sm font-semibold text-foreground">Puzzle Progress</span>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
        <span className="text-muted-foreground">{progress.toFixed(0)}% placed</span>
        <span
          className={`font-semibold px-2 py-0.5 rounded-full border text-[10px] sm:text-xs ${
            wrongAttempts > 0
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-border text-muted-foreground"
          }`}
        >
          {wrongAttempts} wrong attempt{wrongAttempts === 1 ? "" : "s"}
        </span>
      </div>
    </div>
    <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
      <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
    </div>
  </div>
);

export function ElephantBoard(props: ElephantBoardProps) {
  const {
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
  } = props;

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const phases: Array<{
    id: Phase;
    label: string;
    color: string;
    titlePos: { left: string; top: string };
    quotePos: { left: string; top: string; width?: string };
  }> = [
    {
      id: "preparation",
      label: "Preparation",
      color: "#f97316",
      titlePos: { left: "10%", top: isSmallScreen ? "4%" : "6%" },
      quotePos: { left: "18%", top: "48%" },
    },
    {
      id: "incubation",
      label: "Incubation",
      color: "#06b6d4",
      titlePos: { left: "32%", top: isSmallScreen ? "4%" : "5%" },
      quotePos: { left: "40%", top: "40%" },
    },
    {
      id: "illumination",
      label: "Illumination",
      color: "#facc15",
      titlePos: { left: "54%", top: isSmallScreen ? "4%" : "5%" },
      quotePos: { left: "60%", top: "55%" },
    },
    {
      id: "verification",
      label: "Verification",
      color: "#16a34a",
      titlePos: { left: "74%", top: isSmallScreen ? "4%" : "6%" },
      quotePos: { left: "74%", top: "45%" },
    },
  ];

  const progress = (correctPlacements / totalPieces) * 100;

  return (
    <div className="space-y-6">
      {progressBar(progress, wrongAttempts)}

      <div className="relative rounded-2xl p-3 sm:p-5 md:p-8 min-h-[520px] bg-gradient-to-b from-sky-200 via-amber-50 to-green-100 overflow-hidden shadow-inner border-2 border-white/40">
        {/* Subtle texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.2),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.25),transparent_35%)]" />

        {/* Stylised elephant illustration (original vector) */}
        <svg
          viewBox="0 0 900 520"
          className="absolute inset-6 sm:inset-8 md:inset-10 w-auto h-[82%] mx-auto drop-shadow-lg"
          preserveAspectRatio="xMidYMid meet"
        >
          <g fill="#fdf6e3" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* Body */}
            <path d="M150 260c0-95 95-170 240-170 140 0 250 80 250 190 0 105-95 170-235 170-155 0-255-70-255-190z" />
            {/* Head */}
            <circle cx="590" cy="240" r="82" />
            {/* Ear */}
            <path d="M530 190c-25 10-40 36-40 68 0 30 13 56 40 68 42-3 70-40 70-68 0-36-28-64-70-68z" fill="#fdebd4" />
            {/* Trunk */}
            <path d="M660 260c20 0 40 14 40 38 0 26-22 48-52 48h-30c-18 0-32-10-32-26 0-12 10-22 22-22 12 0 22 10 22 22 0 8-2 14-6 20" fill="#fdf6e3" />
            {/* Legs */}
            <path d="M270 360c-4 40-8 80-8 110h44c6-34 12-76 14-110z" />
            <path d="M360 360c0 42-2 78-2 110h48c4-30 8-70 8-110z" />
            <path d="M470 360c4 40 10 78 16 110h46c-2-34-6-72-10-110z" />
            {/* Tail */}
            <path d="M150 270c-22 18-24 42-4 62 10 10 22 16 34 12" />
            <path d="M180 344c-6 10-10 20-8 30l18-6z" />
            {/* Eye */}
            <circle cx="620" cy="230" r="6" fill="#0f172a" />
            <path d="M604 250c12 10 24 10 34 0" strokeWidth="4" />
          </g>

          {/* Ground */}
          <path d="M60 420c80-30 170-46 260-46 110 0 210 22 360 70H60z" fill="url(#groundGrad)" opacity="0.6" />
          <defs>
            <linearGradient id="groundGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#d9f99d" />
              <stop offset="100%" stopColor="#a7f3d0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Title drop zones near the flying birds */}
        {phases.map((phase) => {
          const title = placedTitles[phase.id];
          return (
            <div key={phase.id} className="absolute z-30" style={phase.titlePos}>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedTitle) onDragOver(e, phase.id as Phase);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedTitle) onDrop(phase.id as Phase);
                }}
                className={cn(
                  "w-24 sm:w-28 md:w-32 h-10 sm:h-12 flex items-center justify-center rounded-lg border-2 transition-all cursor-pointer shadow-xl backdrop-blur-sm touch-manipulation",
                  title ? "bg-green-500/60 border-green-700" : "bg-white/70 border-dashed border-sky-400"
                )}
              >
                {title ? (
                  <span className="text-xs sm:text-sm font-bold text-green-900 text-center px-1">{title.title}</span>
                ) : (
                  <span className="text-[10px] sm:text-xs text-sky-700 font-semibold text-center px-1">
                    Drop “{phase.label}”
                  </span>
                )}
              </div>
              <div className="text-center mt-1 sm:mt-2">
                <span
                  className="text-xs sm:text-sm md:text-base font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded bg-white/90 shadow-md"
                  style={{ color: phase.color }}
                >
                  {phase.label}
                </span>
              </div>
            </div>
          );
        })}

        {/* Quote drop zones on the elephant body */}
        {phases.map((phase) => {
          const quotes = placedQuotes[phase.id] || [];
          const title = placedTitles[phase.id];
          const isHighlighted = highlightedZone === phase.id;
          return (
            <div key={phase.id} className="absolute z-20" style={phase.quotePos}>
              <div
                onDragOver={(e) => onDragOver(e, phase.id as Phase)}
                onDrop={(e) => {
                  e.preventDefault();
                  onDrop(phase.id as Phase);
                }}
                className={cn(
                  "relative w-[160px] sm:w-[190px] md:w-[220px] min-h-[110px] sm:min-h-[130px] md:min-h-[150px] rounded-lg border-2 transition-all p-2 sm:p-3 shadow-lg touch-manipulation backdrop-blur-[1px]",
                  isHighlighted ? "ring-4 ring-primary ring-offset-2 scale-105 z-30" : "",
                  title && quotes.length > 0 ? "bg-emerald-50/90 border-emerald-500" : "bg-white/85 border-dashed border-slate-300"
                )}
              >
                {title && (
                  <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-green-500 rounded-full p-0.5 sm:p-1 z-10">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                )}

                <div className="text-center mb-1 sm:mb-2">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-800 truncate">{title ? title.title : phase.label}</h3>
                </div>

                <div className="flex flex-wrap gap-2 max-h-32 sm:max-h-44 md:max-h-52 overflow-y-auto">
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
                        <PuzzlePiece quote={quote} variant={variant} size="small" isPlaced />
                      </div>
                    );
                  })}
                </div>

                {title && quotes.length === 0 && (
                  <div className="text-center text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-4">Drop quotes here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



