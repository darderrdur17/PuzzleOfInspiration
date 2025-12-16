export type BoardLayoutType =
  | 'classic'
  | 'alchemist'
  | 'gardener'
  | 'cyberpunk'
  | 'enchantedForest'
  | 'steampunk'
  | 'elephant';

export interface BoardLayoutConfig {
  type: BoardLayoutType;
  name: string;
  description: string;
  icon?: string;
}

export const BOARD_LAYOUTS: Record<BoardLayoutType, BoardLayoutConfig> = {
  classic: {
    type: 'classic',
    name: 'Classic Puzzle Board',
    description: 'Traditional four-phase drop zone layout',
  },
  elephant: {
    type: 'elephant',
    name: 'Paper Elephant Journey',
    description: 'Original paper-cut elephant board with four cozy drop zones',
  },
  alchemist: {
    type: 'alchemist',
    name: "Alchemist's Astrolabe",
    description: 'Crystal placement on mystical astrolabe with elemental alignment',
  },
  gardener: {
    type: 'gardener',
    name: "Gardener's Garden",
    description: 'Garden beds with seed planting and water flow puzzle',
  },
  cyberpunk: {
    type: 'cyberpunk',
    name: 'Neural Puzzle Matrix',
    description: 'High-tech neon grid with holographic data streams',
  },
  enchantedForest: {
    type: 'enchantedForest',
    name: 'World Tree Puzzle',
    description: 'Mystical leaf-shaped slots with floating fairy particles',
  },
  steampunk: {
    type: 'steampunk',
    name: 'Astrolabe of Ideas',
    description: 'Mechanical gears and brass rivets with steam effects',
  },
};


