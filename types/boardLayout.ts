export type BoardLayoutType = 'classic' | 'alchemist' | 'gardener';

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
};


