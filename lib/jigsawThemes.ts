import { Phase } from '@/types/game';

export interface JigsawThemeConfig {
  backgroundImage: string;
  pieceShapes: Record<Phase, string[]>;
  phaseZones: Record<Phase, { x: number; y: number; width: number; height: number }>;
}

// CSS clip-path shapes for jigsaw pieces (more realistic interlocking shapes)
const jigsawShapes = {
  preparation: [
    // Top-left corner piece with tab on bottom
    'polygon(0% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%)',
    // Top-middle piece with tab on right and bottom
    'polygon(15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%, 0% 15%, 15% 15%)',
    // Top-right corner piece with tab on left and bottom
    'polygon(15% 0%, 100% 0%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%, 0% 15%, 15% 15%)',
  ],
  incubation: [
    // Left-middle piece with tab on right
    'polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%)',
    // Middle piece with tabs on all sides
    'polygon(15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%, 0% 15%)',
    // Right-middle piece with tab on left
    'polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 100%, 85% 100%, 85% 85%, 15% 85%, 15% 100%, 0% 100%, 0% 85%)',
  ],
  illumination: [
    // Left-bottom piece with tab on top and right
    'polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 0% 100%)',
    // Bottom-middle piece with tabs on top and sides
    'polygon(15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%, 0% 15%)',
    // Right-bottom piece with tabs on top and left
    'polygon(0% 15%, 15% 15%, 15% 0%, 100% 0%, 100% 85%, 85% 85%, 85% 100%, 0% 100%)',
  ],
  verification: [
    // Complex piece with multiple interlocking features
    'polygon(0% 20%, 15% 20%, 15% 0%, 35% 0%, 35% 15%, 50% 15%, 50% 0%, 70% 0%, 70% 15%, 85% 15%, 85% 0%, 100% 0%, 100% 20%, 85% 20%, 85% 35%, 100% 35%, 100% 65%, 85% 65%, 85% 80%, 100% 80%, 100% 100%, 70% 100%, 70% 85%, 50% 85%, 50% 100%, 30% 100%, 30% 85%, 15% 85%, 15% 100%, 0% 100%, 0% 80%, 15% 80%, 15% 65%, 0% 65%, 0% 35%, 15% 35%)',
    // Alternative complex piece
    'polygon(0% 15%, 15% 15%, 15% 0%, 85% 0%, 85% 15%, 100% 15%, 100% 50%, 85% 50%, 85% 65%, 100% 65%, 100% 85%, 85% 85%, 85% 100%, 15% 100%, 15% 85%, 0% 85%, 0% 50%, 15% 50%)',
    // Triple-tab piece
    'polygon(15% 15%, 15% 0%, 35% 0%, 35% 15%, 50% 15%, 50% 0%, 70% 0%, 70% 15%, 85% 15%, 85% 0%, 100% 0%, 100% 20%, 85% 20%, 85% 35%, 100% 35%, 100% 65%, 85% 65%, 85% 80%, 100% 80%, 100% 100%, 70% 100%, 70% 85%, 50% 85%, 50% 100%, 30% 100%, 30% 85%, 15% 85%, 15% 100%, 0% 100%, 0% 80%, 15% 80%, 15% 65%, 0% 65%, 0% 35%, 15% 35%)',
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


