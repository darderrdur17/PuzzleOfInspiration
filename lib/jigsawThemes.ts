import { Phase, ThemeId } from "@/types/game";

export type JigsawLayoutId =
  | "auroraGrove"
  | "chronoForge"
  | "tidalCircuit"
  | "lumenBazaar"
  | "mythicAtrium";

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

export const DEFAULT_JIGSAW_LAYOUT: JigsawLayoutId = "auroraGrove";

export const jigsawThemeConfigs: Record<JigsawLayoutId, JigsawThemeConfig> = {
  auroraGrove: {
    id: "auroraGrove",
    name: "Aurora Grove",
    description: "Spiral canopies, glowing moss, and bioluminescent paths inspire organic discovery.",
    mantra: "Let your ideas bend like light across the northern treeline.",
    badgeIcon: "🌌",
    backgroundImage:
      "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.4), transparent 45%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.35), transparent 50%), linear-gradient(145deg, #04131d, #08212c 55%, #0b2c33)",
    overlayGradient: "linear-gradient(135deg, rgba(3,7,18,0.85), rgba(15,118,110,0.45))",
    accentColors: {
      primary: "#34d399",
      secondary: "#22d3ee",
      glow: "rgba(34,211,238,0.45)",
      text: "#d1fae5",
      palette: ["#34d399", "#22d3ee", "#facc15"],
    },
    trayBackground: "linear-gradient(135deg, rgba(3,7,18,0.9), rgba(15,118,110,0.7))",
    trayBorder: "rgba(34,197,94,0.45)",
    pieceVariant: "green",
    grid: { color: "rgba(55,178,177,0.35)", size: 95, opacity: 0.35, angle: 25, speed: 70 },
    floatingOrbs: [
      { top: "12%", left: "15%", size: 160, color: "rgba(34,197,94,0.28)", blur: 55 },
      { top: "65%", left: "65%", size: 150, color: "rgba(14,165,233,0.3)", blur: 45 },
      { top: "30%", left: "75%", size: 110, color: "rgba(250,204,21,0.25)", blur: 40 },
    ],
    phaseZones: {
      preparation: { x: 60, y: 40, width: 200, height: 140, rotate: -8 },
      incubation: { x: 310, y: 30, width: 170, height: 150, rotate: 6 },
      illumination: { x: 80, y: 250, width: 210, height: 150, rotate: -4 },
      verification: { x: 300, y: 250, width: 190, height: 160, rotate: 7 },
    },
    phaseLegends: {
      preparation: { title: "Canopy Survey", hint: "Map stories in the tree rings before sketching solutions.", icon: "🌲" },
      incubation: { title: "Moss Chamber", hint: "Let ideas sponge up stillness in the dim bioluminescent light.", icon: "🪨" },
      illumination: { title: "Aurora Burst", hint: "When the skyline flickers, capture the new colorway immediately.", icon: "✨" },
      verification: { title: "Roots & Rings", hint: "Test the stability; does every branch carry its story?", icon: "🌱" },
    },
  },
  chronoForge: {
    id: "chronoForge",
    name: "Chrono Forge",
    description: "Interlocking rings, copper sparks, and motion arcs keep STEM sessions kinetic.",
    mantra: "Time your prototypes between the ticks of twin metronomes.",
    badgeIcon: "⏳",
    backgroundImage:
      "radial-gradient(circle at 50% 20%, rgba(244,114,182,0.12), transparent 55%), radial-gradient(circle at 10% 80%, rgba(249,115,22,0.28), transparent 50%), linear-gradient(160deg, #090909, #1f1c1c 50%, #2b1c12)",
    overlayGradient: "linear-gradient(145deg, rgba(8,8,12,0.8), rgba(120,53,15,0.55))",
    accentColors: {
      primary: "#f97316",
      secondary: "#fcd34d",
      glow: "rgba(249,115,22,0.45)",
      text: "#fff7ed",
      palette: ["#f97316", "#fcd34d", "#f472b6"],
    },
    trayBackground: "linear-gradient(135deg, rgba(15,15,15,0.95), rgba(120,53,15,0.85))",
    trayBorder: "rgba(249,115,22,0.45)",
    pieceVariant: "orange",
    grid: { color: "rgba(249,115,22,0.3)", size: 80, opacity: 0.3, angle: 60, speed: 40 },
    floatingOrbs: [
      { top: "18%", left: "60%", size: 150, color: "rgba(249,115,22,0.3)", blur: 35 },
      { top: "70%", left: "30%", size: 170, color: "rgba(250,204,21,0.28)", blur: 50 },
    ],
    phaseZones: {
      preparation: { x: 30, y: 70, width: 170, height: 180, rotate: -5 },
      incubation: { x: 260, y: 10, width: 210, height: 150, rotate: 8 },
      illumination: { x: 320, y: 240, width: 180, height: 150, rotate: -7 },
      verification: { x: 80, y: 260, width: 190, height: 160, rotate: 4 },
    },
    phaseLegends: {
      preparation: { title: "Blueprint Bench", hint: "List constraints, calibrate tools, and log assumptions.", icon: "📐" },
      incubation: { title: "Pendulum Pause", hint: "Step away until the oscillation feels predictable again.", icon: "🕰️" },
      illumination: { title: "Spark Chamber", hint: "Record the flash as gears align into a brand-new ratio.", icon: "⚡" },
      verification: { title: "Impact Anvil", hint: "Stress test every rivet, then stamp the iteration.", icon: "🛠️" },
    },
  },
  tidalCircuit: {
    id: "tidalCircuit",
    name: "Tidal Circuit",
    description: "Fluid waveforms braid with luminous circuitry for innovation and strategy sessions.",
    mantra: "Prototype like water, iterate like electricity.",
    badgeIcon: "🌊",
    backgroundImage:
      "radial-gradient(circle at 15% 15%, rgba(56,189,248,0.25), transparent 55%), radial-gradient(circle at 80% 70%, rgba(6,182,212,0.3), transparent 45%), linear-gradient(180deg, #03121f, #021f2d 60%, #092c3a)",
    overlayGradient: "linear-gradient(160deg, rgba(2,6,23,0.85), rgba(6,182,212,0.35))",
    accentColors: {
      primary: "#0ea5e9",
      secondary: "#06b6d4",
      glow: "rgba(14,165,233,0.4)",
      text: "#e0f2fe",
      palette: ["#0ea5e9", "#06b6d4", "#f97316"],
    },
    trayBackground: "linear-gradient(135deg, rgba(3,7,18,0.95), rgba(14,116,144,0.8))",
    trayBorder: "rgba(14,165,233,0.45)",
    pieceVariant: "purple",
    grid: { color: "rgba(14,165,233,0.35)", size: 70, opacity: 0.3, angle: 125, speed: 55 },
    floatingOrbs: [
      { top: "25%", left: "25%", size: 180, color: "rgba(14,165,233,0.28)", blur: 40 },
      { top: "50%", left: "70%", size: 150, color: "rgba(6,182,212,0.22)", blur: 35 },
    ],
    phaseZones: {
      preparation: { x: 100, y: 20, width: 210, height: 140, rotate: -6 },
      incubation: { x: 20, y: 200, width: 180, height: 160, rotate: 5 },
      illumination: { x: 320, y: 190, width: 190, height: 150, rotate: -8 },
      verification: { x: 170, y: 310, width: 220, height: 150, rotate: 3 },
    },
    phaseLegends: {
      preparation: { title: "Current Scan", hint: "Read the market tide charts and policy forecasts.", icon: "📊" },
      incubation: { title: "Subsurface Drift", hint: "Let the model breathe underwater before you rewire it.", icon: "🌧️" },
      illumination: { title: "Pulse Breaker", hint: "Where the wave meets the circuit, note the exact spark.", icon: "💡" },
      verification: { title: "Harbor Test", hint: "Dock, measure metrics, and verify resilience.", icon: "⚓" },
    },
  },
  lumenBazaar: {
    id: "lumenBazaar",
    name: "Lumen Bazaar",
    description: "Floating fabrics, lantern strings, and creative stalls celebrate artistry and storytelling.",
    mantra: "Curate brilliance like a night market vendor.",
    badgeIcon: "🪔",
    backgroundImage:
      "radial-gradient(circle at 30% 10%, rgba(251,191,36,0.35), transparent 50%), radial-gradient(circle at 80% 30%, rgba(249,115,22,0.25), transparent 50%), linear-gradient(140deg, #2c0a22, #4d0c2b 55%, #661333)",
    overlayGradient: "linear-gradient(155deg, rgba(17,6,13,0.85), rgba(236,72,153,0.4))",
    accentColors: {
      primary: "#ec4899",
      secondary: "#f97316",
      glow: "rgba(236,72,153,0.45)",
      text: "#ffe4e6",
      palette: ["#ec4899", "#f97316", "#fde047"],
    },
    trayBackground: "linear-gradient(135deg, rgba(41,6,24,0.95), rgba(236,72,153,0.75))",
    trayBorder: "rgba(236,72,153,0.45)",
    pieceVariant: "orange",
    grid: { color: "rgba(236,72,153,0.35)", size: 75, opacity: 0.35, angle: 90, speed: 60 },
    floatingOrbs: [
      { top: "18%", left: "70%", size: 140, color: "rgba(244,114,182,0.3)", blur: 35 },
      { top: "65%", left: "35%", size: 180, color: "rgba(249,115,22,0.25)", blur: 45 },
      { top: "35%", left: "45%", size: 120, color: "rgba(253,224,71,0.3)", blur: 30 },
    ],
    phaseZones: {
      preparation: { x: 40, y: 70, width: 200, height: 150, rotate: -10 },
      incubation: { x: 290, y: 20, width: 200, height: 140, rotate: 9 },
      illumination: { x: 320, y: 260, width: 170, height: 150, rotate: -6 },
      verification: { x: 80, y: 260, width: 200, height: 160, rotate: 4 },
    },
    phaseLegends: {
      preparation: { title: "Pattern Hunt", hint: "Collect motifs from the cloth-draped stalls.", icon: "🧵" },
      incubation: { title: "Lantern Drift", hint: "Let the idea float overhead while you listen to the crowd.", icon: "🏮" },
      illumination: { title: "Mirror Spark", hint: "When the mirror ball catches you, jot the line immediately.", icon: "🪞" },
      verification: { title: "Showcase Alley", hint: "Set the piece out, invite critique, iterate fast.", icon: "🖼️" },
    },
  },
  mythicAtrium: {
    id: "mythicAtrium",
    name: "Mythic Atrium",
    description: "Marble platforms, holographic constellations, and archival plinths for reflective sessions.",
    mantra: "Present your idea like a relic, refine it like prophecy.",
    badgeIcon: "🏛️",
    backgroundImage:
      "radial-gradient(circle at 50% 0%, rgba(147,197,253,0.25), transparent 55%), radial-gradient(circle at 10% 70%, rgba(148,163,184,0.25), transparent 45%), linear-gradient(150deg, #060b16, #1e2233 60%, #2f2c44)",
    overlayGradient: "linear-gradient(165deg, rgba(6,11,22,0.85), rgba(99,102,241,0.4))",
    accentColors: {
      primary: "#818cf8",
      secondary: "#38bdf8",
      glow: "rgba(129,140,248,0.45)",
      text: "#e0e7ff",
      palette: ["#818cf8", "#38bdf8", "#fef3c7"],
    },
    trayBackground: "linear-gradient(135deg, rgba(5,8,20,0.95), rgba(67,56,202,0.75))",
    trayBorder: "rgba(129,140,248,0.45)",
    pieceVariant: "gold",
    grid: { color: "rgba(129,140,248,0.3)", size: 85, opacity: 0.35, angle: 45, speed: 80 },
    floatingOrbs: [
      { top: "22%", left: "20%", size: 200, color: "rgba(129,140,248,0.3)", blur: 50 },
      { top: "55%", left: "70%", size: 150, color: "rgba(56,189,248,0.25)", blur: 40 },
    ],
    phaseZones: {
      preparation: { x: 80, y: 30, width: 210, height: 130, rotate: -4 },
      incubation: { x: 330, y: 60, width: 180, height: 140, rotate: 7 },
      illumination: { x: 60, y: 260, width: 200, height: 150, rotate: -6 },
      verification: { x: 280, y: 250, width: 200, height: 160, rotate: 6 },
    },
    phaseLegends: {
      preparation: { title: "Archive Walk", hint: "Research past legends until you find the missing page.", icon: "📜" },
      incubation: { title: "Echo Hall", hint: "Let the idea bounce quietly between marble pillars.", icon: "🎐" },
      illumination: { title: "Constellation Beam", hint: "Plot the missing star that unlocks the pattern.", icon: "🌠" },
      verification: { title: "Council Plinth", hint: "Invite the council, defend the prototype, update the lore.", icon: "🗿" },
    },
  },
};

export const jigsawLayoutOrder: JigsawLayoutId[] = [
  "auroraGrove",
  "chronoForge",
  "tidalCircuit",
  "lumenBazaar",
  "mythicAtrium",
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
  classic: "auroraGrove",
  science: "chronoForge",
  art: "lumenBazaar",
  entrepreneurship: "tidalCircuit",
};

