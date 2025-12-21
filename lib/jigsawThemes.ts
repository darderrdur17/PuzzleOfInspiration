import { Phase, ThemeId } from "@/types/game";

export type JigsawLayoutId =
  | "observatoryOrbit"
  | "crystalLab"
  | "gardenSpiral"
  | "atlasExpedition"
  | "synthwaveGrid";

interface JigsawPhaseZone {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
}

interface JigsawPhaseLegend {
  title: string;
  hint: string;
  icon: string;
}

export interface JigsawThemeConfig {
  id: JigsawLayoutId;
  name: string;
  description: string;
  mantra: string;
  badgeIcon: string;
  backgroundImage: string;
  overlayGradient: string;
  accentColors: {
    primary: string;
    secondary: string;
    glow: string;
    text: string;
    palette: [string, string, string];
  };
  trayBackground: string;
  trayBorder: string;
  pieceVariant: "purple" | "orange" | "green" | "gold";
  grid?: { color: string; size: number; opacity: number; angle?: number; speed?: number };
  floatingOrbs?: Array<{ top: string; left: string; size: number; color: string; blur?: number; opacity?: number }>;
  phaseZones: Record<Phase, JigsawPhaseZone>;
  phaseLegends: Record<Phase, JigsawPhaseLegend>;
}

const phaseOrder: Phase[] = ["preparation", "incubation", "illumination", "verification"];

export const DEFAULT_JIGSAW_LAYOUT: JigsawLayoutId = "observatoryOrbit";

export const jigsawThemeConfigs: Record<JigsawLayoutId, JigsawThemeConfig> = {
  observatoryOrbit: {
    id: "observatoryOrbit",
    name: "Observatory Orbit",
    description: "Constellation-inspired drop zones that orbit a nebula core. Perfect for classic creativity lessons.",
    mantra: "Chart the constellations before you launch ideas.",
    badgeIcon: "🔭",
    backgroundImage: "/images/hub/01_observatory_hub.png",
    overlayGradient: "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(76,29,149,0.7))",
    accentColors: {
      primary: "#a855f7",
      secondary: "#22d3ee",
      glow: "rgba(168,85,247,0.45)",
      text: "#e0f2fe",
      palette: ["#a855f7", "#22d3ee", "#f472b6"],
    },
    trayBackground: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(76,29,149,0.8))",
    trayBorder: "rgba(168,85,247,0.5)",
    pieceVariant: "purple",
    grid: { color: "rgba(94,234,212,0.35)", size: 80, opacity: 0.3, angle: 45, speed: 60 },
    floatingOrbs: [
      { top: "12%", left: "20%", size: 180, color: "rgba(59,130,246,0.25)", blur: 50, opacity: 0.8 },
      { top: "60%", left: "70%", size: 140, color: "rgba(236,72,153,0.25)", blur: 40, opacity: 0.7 },
      { top: "75%", left: "30%", size: 110, color: "rgba(34,197,94,0.2)", blur: 30, opacity: 0.6 },
    ],
    phaseZones: {
      preparation: { x: 40, y: 60, width: 190, height: 130, rotate: -4 },
      incubation: { x: 270, y: 20, width: 200, height: 140, rotate: 6 },
      illumination: { x: 320, y: 250, width: 170, height: 130 },
      verification: { x: 80, y: 290, width: 210, height: 150, rotate: -2 },
    },
    phaseLegends: {
      preparation: {
        title: "Star Charts",
        hint: "Collect research like mapping constellations before a mission.",
        icon: "🛰️",
      },
      incubation: {
        title: "Dark Sky Pause",
        hint: "Let ideas drift while the night sky resets your thinking.",
        icon: "🌌",
      },
      illumination: {
        title: "Nova Spark",
        hint: "Watch for the sudden burst of an idea breaking the horizon.",
        icon: "💫",
      },
      verification: {
        title: "Orbital Check",
        hint: "Re-enter the atmosphere with tests, pilots, and QA.",
        icon: "🧪",
      },
    },
  },
  crystalLab: {
    id: "crystalLab",
    name: "Crystal Lab",
    description: "Diagonal energy channels inspired by alchemist workshops and science labs.",
    mantra: "Distill insights through precise lab rituals.",
    badgeIcon: "⚗️",
    backgroundImage: "/images/alchemist/06_alchemist_preparation_phase.png",
    overlayGradient: "linear-gradient(135deg, rgba(8,47,73,0.9), rgba(14,165,233,0.65))",
    accentColors: {
      primary: "#0ea5e9",
      secondary: "#34d399",
      glow: "rgba(14,165,233,0.45)",
      text: "#ccfbf1",
      palette: ["#0ea5e9", "#34d399", "#facc15"],
    },
    trayBackground: "linear-gradient(135deg, rgba(8,47,73,0.95), rgba(14,165,233,0.75))",
    trayBorder: "rgba(14,165,233,0.4)",
    pieceVariant: "orange",
    grid: { color: "rgba(14,165,233,0.25)", size: 70, opacity: 0.35, angle: 20, speed: 45 },
    floatingOrbs: [
      { top: "18%", left: "60%", size: 140, color: "rgba(14,165,233,0.3)", blur: 35 },
      { top: "65%", left: "25%", size: 160, color: "rgba(52,211,153,0.25)", blur: 45 },
    ],
    phaseZones: {
      preparation: { x: 20, y: 70, width: 170, height: 190, rotate: -6 },
      incubation: { x: 210, y: 20, width: 190, height: 150, rotate: 4 },
      illumination: { x: 240, y: 230, width: 190, height: 150, rotate: -3 },
      verification: { x: 360, y: 110, width: 150, height: 220, rotate: 7 },
    },
    phaseLegends: {
      preparation: {
        title: "Research Bench",
        hint: "Lay out hypotheses, reagents, and reference docs.",
        icon: "📓",
      },
      incubation: {
        title: "Cooling Chamber",
        hint: "Let reactions settle while you step back.",
        icon: "🧊",
      },
      illumination: {
        title: "Beaker Burst",
        hint: "Capture the fizz when data finally aligns.",
        icon: "⚡",
      },
      verification: {
        title: "Peer Review Basin",
        hint: "Repeat, document, and publish your results.",
        icon: "📡",
      },
    },
  },
  gardenSpiral: {
    id: "gardenSpiral",
    name: "Garden Spiral",
    description: "Organic curved beds, mist, and petals for art and design sessions.",
    mantra: "Let ideas bloom in quiet spirals.",
    badgeIcon: "🌿",
    backgroundImage: "/images/gardener/08_gardener_incubation_phase.png",
    overlayGradient: "linear-gradient(135deg, rgba(15,118,110,0.85), rgba(251,191,36,0.65))",
    accentColors: {
      primary: "#22c55e",
      secondary: "#fbbf24",
      glow: "rgba(34,197,94,0.35)",
      text: "#f0fdf4",
      palette: ["#22c55e", "#fbbf24", "#34d399"],
    },
    trayBackground: "linear-gradient(135deg, rgba(6,78,59,0.95), rgba(34,197,94,0.7))",
    trayBorder: "rgba(34,197,94,0.45)",
    pieceVariant: "green",
    grid: { color: "rgba(248,250,252,0.25)", size: 110, opacity: 0.25, angle: 90, speed: 80 },
    floatingOrbs: [
      { top: "15%", left: "15%", size: 170, color: "rgba(16,185,129,0.25)", blur: 40 },
      { top: "55%", left: "70%", size: 150, color: "rgba(251,191,36,0.2)", blur: 35 },
      { top: "70%", left: "35%", size: 120, color: "rgba(244,63,94,0.2)", blur: 30 },
    ],
    phaseZones: {
      preparation: { x: 130, y: 30, width: 210, height: 140, rotate: -8 },
      incubation: { x: 40, y: 210, width: 210, height: 150, rotate: 6 },
      illumination: { x: 310, y: 230, width: 180, height: 150, rotate: -5 },
      verification: { x: 180, y: 160, width: 190, height: 140, rotate: 3 },
    },
    phaseLegends: {
      preparation: {
        title: "Soil Prep",
        hint: "Sketch, mood board, and mix color palettes.",
        icon: "🪴",
      },
      incubation: {
        title: "Quiet Grow",
        hint: "Let unfinished drafts rest like seeds overnight.",
        icon: "🌙",
      },
      illumination: {
        title: "Petal Burst",
        hint: "Capture the exact moment a concept blooms.",
        icon: "🌸",
      },
      verification: {
        title: "Garden Critique",
        hint: "Prune, frame, and ship the final composition.",
        icon: "✂️",
      },
    },
  },
  atlasExpedition: {
    id: "atlasExpedition",
    name: "Atlas Expedition",
    description: "Map grids and compass bearings for entrepreneurial cohorts.",
    mantra: "Navigate ideas like a daring expedition.",
    badgeIcon: "🧭",
    backgroundImage: "/images/explorer/10_explorer_preparation_phase.png",
    overlayGradient: "linear-gradient(145deg, rgba(30,41,59,0.85), rgba(234,179,8,0.55))",
    accentColors: {
      primary: "#f59e0b",
      secondary: "#3b82f6",
      glow: "rgba(250,204,21,0.4)",
      text: "#fef9c3",
      palette: ["#fbbf24", "#f97316", "#3b82f6"],
    },
    trayBackground: "linear-gradient(135deg, rgba(30,41,59,0.95), rgba(249,115,22,0.8))",
    trayBorder: "rgba(249,115,22,0.45)",
    pieceVariant: "gold",
    grid: { color: "rgba(251,191,36,0.25)", size: 90, opacity: 0.3, angle: 0, speed: 70 },
    floatingOrbs: [
      { top: "10%", left: "65%", size: 150, color: "rgba(59,130,246,0.2)", blur: 35 },
      { top: "50%", left: "25%", size: 180, color: "rgba(250,204,21,0.25)", blur: 40 },
    ],
    phaseZones: {
      preparation: { x: 30, y: 50, width: 190, height: 140, rotate: -4 },
      incubation: { x: 300, y: 45, width: 180, height: 130, rotate: 6 },
      illumination: { x: 60, y: 250, width: 190, height: 150, rotate: -3 },
      verification: { x: 310, y: 250, width: 180, height: 150, rotate: 5 },
    },
    phaseLegends: {
      preparation: {
        title: "Survey Route",
        hint: "Interview, investigate, and outline the market terrain.",
        icon: "🗺️",
      },
      incubation: {
        title: "Campfire Downtime",
        hint: "Let the team pause around the map before pivoting.",
        icon: "🔥",
      },
      illumination: {
        title: "Trail Discovery",
        hint: "Spot the shortcut that no competitor saw.",
        icon: "🚩",
      },
      verification: {
        title: "Basecamp Launch",
        hint: "Prototype, iterate, and report back to the crew.",
        icon: "🏕️",
      },
    },
  },
  synthwaveGrid: {
    id: "synthwaveGrid",
    name: "Synthwave Grid",
    description: "Neon dunes, VHS scanlines, and retro-futuristic tiles for high-energy sessions.",
    mantra: "Drop pieces to the beat of neon innovation.",
    badgeIcon: "🎛️",
    backgroundImage: "/images/ui/12_mobile_puzzle_interface.png",
    overlayGradient: "linear-gradient(160deg, rgba(23,23,36,0.9), rgba(244,63,94,0.6))",
    accentColors: {
      primary: "#ec4899",
      secondary: "#22d3ee",
      glow: "rgba(236,72,153,0.45)",
      text: "#fdf2f8",
      palette: ["#ec4899", "#c084fc", "#22d3ee"],
    },
    trayBackground: "linear-gradient(135deg, rgba(20,20,31,0.95), rgba(236,72,153,0.8))",
    trayBorder: "rgba(236,72,153,0.45)",
    pieceVariant: "orange",
    grid: { color: "rgba(236,72,153,0.4)", size: 60, opacity: 0.35, angle: 135, speed: 50 },
    floatingOrbs: [
      { top: "20%", left: "30%", size: 150, color: "rgba(236,72,153,0.3)", blur: 35 },
      { top: "65%", left: "65%", size: 170, color: "rgba(34,211,238,0.25)", blur: 45 },
    ],
    phaseZones: {
      preparation: { x: 140, y: 10, width: 220, height: 130, rotate: -5 },
      incubation: { x: 40, y: 170, width: 200, height: 150, rotate: 6 },
      illumination: { x: 310, y: 170, width: 180, height: 150, rotate: -6 },
      verification: { x: 170, y: 320, width: 220, height: 140, rotate: 4 },
    },
    phaseLegends: {
      preparation: {
        title: "Setlist Planning",
        hint: "Gather playlists, inspirations, and briefs.",
        icon: "🎚️",
      },
      incubation: {
        title: "Lo-Fi Drift",
        hint: "Let the beat loop while your brain decompresses.",
        icon: "🎧",
      },
      illumination: {
        title: "Laser Drop",
        hint: "Capture the exact moment the bass drops into place.",
        icon: "💥",
      },
      verification: {
        title: "Encore QA",
        hint: "Mix, master, and publish the final set.",
        icon: "🎛️",
      },
    },
  },
};

export const jigsawLayoutOrder: JigsawLayoutId[] = [
  "observatoryOrbit",
  "crystalLab",
  "gardenSpiral",
  "atlasExpedition",
  "synthwaveGrid",
];

export const jigsawLayoutOptions = jigsawLayoutOrder.map((layoutId) => {
  const layout = jigsawThemeConfigs[layoutId];
  return {
    id: layoutId,
    name: layout.name,
    description: layout.description,
    mantra: layout.mantra,
    badgeIcon: layout.badgeIcon,
    preview: layout.backgroundImage,
    palette: layout.accentColors.palette,
  };
});

export const defaultJigsawLayoutByTheme: Record<ThemeId, JigsawLayoutId> = {
  classic: "observatoryOrbit",
  science: "crystalLab",
  art: "gardenSpiral",
  entrepreneurship: "atlasExpedition",
};


