// Centralized theme configuration to ensure naming consistency
export interface ThemeConfig {
  id: string;
  gameMasterName: string; // What Game Master sees in dropdown
  playerOverrideName?: string; // What player sees when overridden by GM (optional)
  playerSelectName?: string; // What player sees when selecting theme (optional)
  description: string;
  badgeColor: string;
}

export const THEME_CONFIG: Record<string, ThemeConfig> = {
  classic: {
    id: 'classic',
    gameMasterName: 'Classic Creativity',
    playerOverrideName: 'Paper Elephant',
    playerSelectName: 'UI Theme',
    description: 'Original classroom set with the watercolor elephant board.',
    badgeColor: '#f97316'
  },
  science: {
    id: 'science',
    gameMasterName: 'Science Lab',
    playerOverrideName: 'Alchemist',
    playerSelectName: 'Cyberpunk City',
    description: 'STEM-focused quotes with cool blue-green gradients.',
    badgeColor: '#0ea5e9'
  },
  art: {
    id: 'art',
    gameMasterName: 'Art Studio',
    playerOverrideName: 'Gardener',
    playerSelectName: 'Enchanted Forest',
    description: 'Color-forward set perfect for design or art history lessons.',
    badgeColor: '#ec4899'
  },
  entrepreneurship: {
    id: 'entrepreneurship',
    gameMasterName: 'Startup Sprint',
    playerOverrideName: 'Explorer',
    playerSelectName: 'Steampunk Workshop',
    description: 'Business and innovation quotes with bold gradients.',
    badgeColor: '#6366f1'
  }
};

export const getThemeConfig = (themeId: string): ThemeConfig => {
  return THEME_CONFIG[themeId] || THEME_CONFIG.classic;
};

export const getGameMasterThemeName = (themeId: string): string => {
  return getThemeConfig(themeId).gameMasterName;
};

export const getPlayerOverrideName = (themeId: string): string | undefined => {
  return getThemeConfig(themeId).playerOverrideName;
};

export const getPlayerSelectName = (themeId: string): string | undefined => {
  return getThemeConfig(themeId).playerSelectName;
};