import { Phase } from '@/types/game';

export interface JigsawThemeConfig {
  backgroundImage: string;
  pieceShapes: Record<Phase, string[]>;
  phaseZones: Record<Phase, { x: number; y: number; width: number; height: number }>;
}

// SVG clip-path shapes for jigsaw pieces (simplified irregular shapes)
const jigsawShapes = {
  preparation: [
    'polygon(0% 0%, 30% 0%, 40% 20%, 60% 20%, 70% 0%, 100% 0%, 100% 40%, 80% 50%, 100% 70%, 100% 100%, 70% 100%, 50% 80%, 30% 100%, 0% 100%, 0% 60%, 20% 50%)',
    'polygon(0% 0%, 40% 0%, 50% 30%, 70% 20%, 100% 30%, 100% 60%, 70% 70%, 80% 100%, 40% 100%, 20% 70%, 0% 80%)',
    'polygon(0% 20%, 20% 0%, 50% 0%, 70% 20%, 100% 0%, 100% 50%, 80% 70%, 100% 100%, 60% 100%, 40% 80%, 0% 100%, 0% 60%)',
  ],
  incubation: [
    'polygon(0% 0%, 30% 10%, 50% 0%, 80% 10%, 100% 0%, 100% 30%, 70% 40%, 90% 70%, 100% 100%, 70% 90%, 30% 100%, 10% 70%, 0% 80%)',
    'polygon(0% 10%, 25% 0%, 60% 0%, 85% 20%, 100% 10%, 100% 60%, 75% 80%, 85% 100%, 45% 100%, 15% 80%, 0% 90%)',
    'polygon(0% 0%, 35% 0%, 55% 25%, 85% 15%, 100% 35%, 100% 75%, 65% 85%, 75% 100%, 35% 100%, 5% 75%, 0% 55%)',
  ],
  illumination: [
    'polygon(0% 0%, 25% 0%, 45% 15%, 75% 0%, 100% 15%, 100% 45%, 75% 55%, 95% 85%, 100% 100%, 65% 100%, 35% 85%, 5% 100%, 0% 75%, 15% 55%)',
    'polygon(0% 15%, 30% 0%, 65% 0%, 90% 25%, 100% 15%, 100% 55%, 70% 75%, 85% 100%, 50% 100%, 20% 75%, 0% 85%)',
    'polygon(0% 5%, 20% 0%, 55% 5%, 80% 0%, 100% 20%, 100% 65%, 75% 85%, 90% 100%, 55% 95%, 25% 100%, 5% 80%, 0% 60%)',
  ],
  verification: [
    'polygon(0% 0%, 20% 10%, 45% 0%, 75% 10%, 100% 0%, 100% 25%, 75% 35%, 95% 65%, 100% 100%, 75% 90%, 40% 100%, 10% 80%, 0% 85%)',
    'polygon(0% 5%, 35% 0%, 70% 5%, 95% 0%, 100% 30%, 95% 60%, 100% 100%, 70% 100%, 35% 95%, 0% 100%, 0% 70%, 10% 40%)',
    'polygon(0% 0%, 30% 0%, 60% 20%, 90% 10%, 100% 40%, 90% 70%, 100% 100%, 60% 100%, 30% 90%, 0% 100%, 0% 60%, 15% 30%)',
  ],
};

export const jigsawThemeConfigs: Record<string, JigsawThemeConfig> = {
  classic: {
    backgroundImage: '/images/puzzle-design/01_observatory_hub.png',
    pieceShapes: jigsawShapes,
    phaseZones: {
      preparation: { x: 50, y: 50, width: 200, height: 150 },
      incubation: { x: 300, y: 50, width: 200, height: 150 },
      illumination: { x: 50, y: 250, width: 200, height: 150 },
      verification: { x: 300, y: 250, width: 200, height: 150 },
    },
  },
  science: {
    backgroundImage: '/images/alchemist/02_alchemist_workshop.png',
    pieceShapes: jigsawShapes,
    phaseZones: {
      preparation: { x: 50, y: 50, width: 200, height: 150 },
      incubation: { x: 300, y: 50, width: 200, height: 150 },
      illumination: { x: 50, y: 250, width: 200, height: 150 },
      verification: { x: 300, y: 250, width: 200, height: 150 },
    },
  },
  art: {
    backgroundImage: '/images/gardener/03_gardener_journey.png',
    pieceShapes: jigsawShapes,
    phaseZones: {
      preparation: { x: 50, y: 50, width: 200, height: 150 },
      incubation: { x: 300, y: 50, width: 200, height: 150 },
      illumination: { x: 50, y: 250, width: 200, height: 150 },
      verification: { x: 300, y: 250, width: 200, height: 150 },
    },
  },
  entrepreneurship: {
    backgroundImage: '/images/explorer/04_explorer_map.png',
    pieceShapes: jigsawShapes,
    phaseZones: {
      preparation: { x: 50, y: 50, width: 200, height: 150 },
      incubation: { x: 300, y: 50, width: 200, height: 150 },
      illumination: { x: 50, y: 250, width: 200, height: 150 },
      verification: { x: 300, y: 250, width: 200, height: 150 },
    },
  },
};