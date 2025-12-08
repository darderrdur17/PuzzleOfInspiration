export type GameTheme = 'observatory' | 'alchemist' | 'gardener' | 'explorer' | 'ui';

export interface ThemeConfig {
  id: GameTheme;
  name: string;
  description: string;
  background: string;
  boardBackground: string;
  badgeColor: string;
  phaseHints: Record<string, string>;
  visualElements: {
    backgroundImage?: string;
    phaseImages?: {
      preparation?: string;
      incubation?: string;
      illumination?: string;
      verification?: string;
    };
    particleEffects?: boolean;
    specialAnimations?: string[];
    colorScheme: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
  };
  mechanics: {
    phaseNames: Record<string, string>;
    specialFeatures?: string[];
    puzzleVariants?: string[];
  };
  quotes: Array<{
    id: string;
    text: string;
    author: string;
    phase: number;
  }>;
}

export const gameThemes: Record<GameTheme, ThemeConfig> = {
  observatory: {
    id: 'observatory',
    name: 'Observatory of Ideas',
    description: 'A cosmic journey through the universe of creativity',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #ec4899 100%)',
    boardBackground: 'radial-gradient(circle at center, #1e3a8a 0%, #0f172a 100%)',
    badgeColor: '#fcd34d',
    phaseHints: {
      preparation: 'Like astronomers gathering data, collect information and prepare your creative foundation.',
      incubation: 'Let ideas incubate in the vastness of space, making unexpected connections.',
      illumination: 'A moment of cosmic insight - the "aha!" that lights up the universe.',
      verification: 'Test your creative discoveries against the laws of reality.'
    },
    visualElements: {
      backgroundImage: '/images/hub/01_observatory_hub.png',
      phaseImages: {
        preparation: '/images/ui/11_desktop_hub_interface.png',
        incubation: '/images/ui/12_mobile_puzzle_interface.png',
        illumination: '/images/ui/14_desktop_explorer_fullscreen.png',
        verification: '/images/ui/15_responsive_ui_components.png'
      },
      particleEffects: true,
      specialAnimations: ['starfield', 'cosmic-glow'],
      colorScheme: {
        primary: '#7c3aed',
        secondary: '#ec4899',
        accent: '#fcd34d',
        background: '#0f172a',
        text: '#f8fafc'
      }
    },
    mechanics: {
      phaseNames: {
        preparation: 'Cosmic Preparation',
        incubation: 'Stellar Incubation',
        illumination: 'Nebula Illumination',
        verification: 'Galactic Verification'
      },
      specialFeatures: ['starfield-background', 'cosmic-particles'],
      puzzleVariants: ['astronomical-alignment', 'constellation-matching']
    },
    quotes: [
      { id: 'obs1', text: 'The universe is full of magical things patiently waiting for our wits to grow sharper.', author: 'Eden Phillpotts', phase: 1 },
      { id: 'obs2', text: 'Imagination is the beginning of creation.', author: 'George Bernard Shaw', phase: 2 },
      { id: 'obs3', text: 'Every great dream begins with a dreamer.', author: 'Harriet Tubman', phase: 3 },
      { id: 'obs4', text: 'The important thing is not to stop questioning.', author: 'Albert Einstein', phase: 4 },
    ]
  },

  alchemist: {
    id: 'alchemist',
    name: "Alchemist's Workshop",
    description: 'Transform base ideas into golden insights through magical alchemy',
    background: 'linear-gradient(135deg, #6b21a8 0%, #059669 50%, #d97706 100%)',
    boardBackground: 'radial-gradient(circle at center, #6b21a8 0%, #1a1a2e 100%)',
    badgeColor: '#d97706',
    phaseHints: {
      preparation: 'Like alchemists gathering ingredients, assemble your creative elements.',
      incubation: 'Let the mixture simmer and transform in the alchemical vessel.',
      illumination: 'The moment of transmutation - when lead becomes gold.',
      verification: 'Test the purity of your creation and refine as needed.'
    },
    visualElements: {
      backgroundImage: '/images/alchemist/02_alchemist_workshop.png',
      phaseImages: {
        preparation: '/images/alchemist/06_alchemist_preparation_phase.png',
        incubation: '/images/ui/05_ui_elements_collection.png',
        illumination: '/images/alchemist/07_alchemist_illumination_phase.png',
        verification: '/images/ui/12_mobile_puzzle_interface.png'
      },
      particleEffects: true,
      specialAnimations: ['potion-bubble', 'alchemical-glow', 'transformation-sparkle'],
      colorScheme: {
        primary: '#6b21a8',
        secondary: '#059669',
        accent: '#d97706',
        background: '#1a1a2e',
        text: '#f8fafc'
      }
    },
    mechanics: {
      phaseNames: {
        preparation: 'Elemental Gathering',
        incubation: 'Alchemical Reaction',
        illumination: 'Philosopher\'s Stone',
        verification: 'Transmutation Test'
      },
      specialFeatures: ['bubbling-potions', 'magical-transformation'],
      puzzleVariants: ['element-mixing', 'potion-crafting', 'crystal-alignment']
    },
    quotes: [
      { id: 'alc1', text: 'Creativity is intelligence having fun.', author: 'Albert Einstein', phase: 1 },
      { id: 'alc2', text: 'The best way to predict the future is to create it.', author: 'Peter Drucker', phase: 2 },
      { id: 'alc3', text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs', phase: 3 },
      { id: 'alc4', text: 'Creativity takes courage.', author: 'Henri Matisse', phase: 4 },
    ]
  },

  gardener: {
    id: 'gardener',
    name: "Gardener's Journey",
    description: 'Cultivate creativity through organic growth and natural cycles',
    background: 'linear-gradient(135deg, #92400e 0%, #16a34a 50%, #f472b6 100%)',
    boardBackground: 'radial-gradient(circle at center, #92400e 0%, #1a2e1a 100%)',
    badgeColor: '#16a34a',
    phaseHints: {
      preparation: 'Like planting seeds, sow the initial ideas in fertile soil.',
      incubation: 'Water and nurture your ideas as they grow beneath the surface.',
      illumination: 'The moment of blooming - when flowers burst into color.',
      verification: 'Arrange the flowers into a beautiful, balanced arrangement.'
    },
    visualElements: {
      backgroundImage: '/images/gardener/03_gardener_journey.png',
      phaseImages: {
        preparation: '/images/ui/05_ui_elements_collection.png',
        incubation: '/images/gardener/08_gardener_incubation_phase.png',
        illumination: '/images/ui/13_tablet_garden_interface.png',
        verification: '/images/gardener/09_gardener_verification_phase.png'
      },
      particleEffects: true,
      specialAnimations: ['flower-bloom', 'water-ripple', 'leaf-growth'],
      colorScheme: {
        primary: '#16a34a',
        secondary: '#f472b6',
        accent: '#38bdf8',
        background: '#1a2e1a',
        text: '#f8fafc'
      }
    },
    mechanics: {
      phaseNames: {
        preparation: 'Seed Planting',
        incubation: 'Growth Cultivation',
        illumination: 'Flower Blooming',
        verification: 'Garden Harmony'
      },
      specialFeatures: ['watering-system', 'growth-animation', 'seasonal-effects'],
      puzzleVariants: ['seed-placement', 'water-routing', 'flower-arrangement']
    },
    quotes: [
      { id: 'gard1', text: 'Creativity is a wild mind and a disciplined eye.', author: 'Dorothy Parker', phase: 1 },
      { id: 'gard2', text: 'The earth laughs in flowers.', author: 'Ralph Waldo Emerson', phase: 2 },
      { id: 'gard3', text: 'Every flower must grow through dirt.', author: 'Laurie Jean Sennott', phase: 3 },
      { id: 'gard4', text: 'The more you prune, the more you grow.', author: 'Anonymous', phase: 4 },
    ]
  },

  explorer: {
    id: 'explorer',
    name: "Explorer's Map",
    description: 'Chart unknown territories and discover creative frontiers',
    background: 'linear-gradient(135deg, #fef3c7 0%, #ca8a04 50%, #0284c7 100%)',
    boardBackground: 'radial-gradient(circle at center, #fef3c7 0%, #2e2e2e 100%)',
    badgeColor: '#ca8a04',
    phaseHints: {
      preparation: 'Like explorers mapping new lands, chart your creative territory.',
      incubation: 'Navigate through fog and uncertainty to find hidden paths.',
      illumination: 'The moment of discovery - finding treasure in unexpected places.',
      verification: 'Solve ancient riddles to unlock the true meaning of your journey.'
    },
    visualElements: {
      backgroundImage: '/images/explorer/04_explorer_map.png',
      phaseImages: {
        preparation: '/images/explorer/10_explorer_preparation_phase.png',
        incubation: '/images/ui/05_ui_elements_collection.png',
        illumination: '/images/ui/14_desktop_explorer_fullscreen.png',
        verification: '/images/ui/15_responsive_ui_components.png'
      },
      particleEffects: true,
      specialAnimations: ['map-reveal', 'fog-dissipation', 'treasure-sparkle'],
      colorScheme: {
        primary: '#ca8a04',
        secondary: '#0284c7',
        accent: '#15803d',
        background: '#2e2e2e',
        text: '#f8fafc'
      }
    },
    mechanics: {
      phaseNames: {
        preparation: 'Map Assembly',
        incubation: 'Fog Navigation',
        illumination: 'Treasure Discovery',
        verification: 'Ancient Riddle'
      },
      specialFeatures: ['fog-of-war', 'map-pieces', 'compass-navigation'],
      puzzleVariants: ['map-puzzle', 'path-finding', 'riddle-solving']
    },
    quotes: [
      { id: 'exp1', text: 'The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.', author: 'Marcel Proust', phase: 1 },
      { id: 'exp2', text: 'Adventure is not outside man; it is within.', author: 'George Eliot', phase: 2 },
      { id: 'exp3', text: 'Discovery consists of seeing what everybody has seen and thinking what nobody has thought.', author: 'Albert Szent-Gyorgyi', phase: 3 },
      { id: 'exp4', text: 'The important thing is not to stop questioning.', author: 'Albert Einstein', phase: 4 },
    ]
  },

  ui: {
    id: 'ui',
    name: "UI Lab",
    description: 'Modern responsive interface lab inspired by the component library',
    background: 'linear-gradient(135deg, #fce8d5 0%, #fef3e9 45%, #f3e8ff 100%)',
    boardBackground: 'url(/images/ui/15_responsive_ui_components.png)',
    badgeColor: '#6c5ce7',
    phaseHints: {
      preparation: 'Collect UI building blocks, colors, and layouts before assembling.',
      incubation: 'Let patterns and layouts mix; experiment with spacing and hierarchy.',
      illumination: 'The “aha!” comes when the interface clicks and feels effortless.',
      verification: 'Test responsiveness across devices and refine the interaction polish.'
    },
    visualElements: {
      backgroundImage: '/images/ui/15_responsive_ui_components.png',
      phaseImages: {
        preparation: '/images/ui/05_ui_elements_collection.png',
        incubation: '/images/ui/11_desktop_hub_interface.png',
        illumination: '/images/ui/12_mobile_puzzle_interface.png',
        verification: '/images/ui/13_tablet_garden_interface.png'
      },
      particleEffects: true,
      specialAnimations: ['glassmorphism-glow', 'gradient-sweep'],
      colorScheme: {
        primary: '#6c5ce7',      // Royal Purple
        secondary: '#ff8a3d',    // Sunset Orange
        accent: '#2bb673',       // Emerald Green
        background: '#fce8d5',   // Light Peach
        text: '#2e2e2e'          // Dark Grey
      }
    },
    mechanics: {
      phaseNames: {
        preparation: 'Component Prep',
        incubation: 'Layout Incubation',
        illumination: 'Interaction Spark',
        verification: 'Responsive Check'
      },
      specialFeatures: ['responsive-preview', 'glass-panels', 'gradient-progress'],
      puzzleVariants: ['grid-alignment', 'icon-matching', 'colorway-build']
    },
    quotes: [
      { id: 'ui1', text: 'Design is not just what it looks like and feels like. Design is how it works.', author: 'Steve Jobs', phase: 1 },
      { id: 'ui2', text: 'Details are not details. They make the design.', author: 'Charles Eames', phase: 2 },
      { id: 'ui3', text: 'Good design is obvious. Great design is transparent.', author: 'Joe Sparano', phase: 3 },
      { id: 'ui4', text: 'Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.', author: 'Antoine de Saint-Exupéry', phase: 4 },
    ]
  }
};

export function getThemeConfig(themeId: GameTheme): ThemeConfig {
  return gameThemes[themeId] || gameThemes.observatory;
}

export function getRandomTheme(): GameTheme {
  const themes = Object.keys(gameThemes) as GameTheme[];
  return themes[Math.floor(Math.random() * themes.length)];
}
