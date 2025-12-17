"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type HomepageTheme = 'default' | 'cyberpunk' | 'enchanted' | 'steampunk';

interface ThemeContextType {
  homepageTheme: HomepageTheme;
  setHomepageTheme: (theme: HomepageTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  homepageTheme: 'default',
  setHomepageTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [homepageTheme, setHomepageTheme] = useState<HomepageTheme>('default');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('homepage-theme') as HomepageTheme;
    if (savedTheme && ['default', 'cyberpunk', 'enchanted', 'steampunk'].includes(savedTheme)) {
      setHomepageTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  const updateTheme = (theme: HomepageTheme) => {
    setHomepageTheme(theme);
    localStorage.setItem('homepage-theme', theme);
  };

  return (
    <ThemeContext.Provider value={{ homepageTheme, setHomepageTheme: updateTheme }}>
      <div data-homepage-theme={homepageTheme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};