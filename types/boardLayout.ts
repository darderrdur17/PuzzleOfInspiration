export type BoardLayoutType =
  | 'auroraGrove'
  | 'chronoForge'
  | 'tidalCircuit'
  | 'lumenBazaar'
  | 'mythicAtrium';

export interface BoardLayoutConfig {
  type: BoardLayoutType;
  name: string;
  description: string;
  icon?: string;
}

export const BOARD_LAYOUTS: Record<BoardLayoutType, BoardLayoutConfig> = {
  auroraGrove: {
    type: 'auroraGrove',
    name: 'Aurora Grove',
    description: 'Bioluminescent forest canopy with flowing drop zones',
    icon: '🌌',
  },
  chronoForge: {
    type: 'chronoForge',
    name: 'Chrono Forge',
    description: 'Copper sparks and kinetic rings for STEM-style pacing',
    icon: '⏳',
  },
  tidalCircuit: {
    type: 'tidalCircuit',
    name: 'Tidal Circuit',
    description: 'Waveforms and circuitry interlaced for fluid strategy',
    icon: '🌊',
  },
  lumenBazaar: {
    type: 'lumenBazaar',
    name: 'Lumen Bazaar',
    description: 'Lantern-lit market of ideas with vibrant stalls',
    icon: '🪔',
  },
  mythicAtrium: {
    type: 'mythicAtrium',
    name: 'Mythic Atrium',
    description: 'Marble plinths and constellations for reflective sessions',
    icon: '🏛️',
  },
};


