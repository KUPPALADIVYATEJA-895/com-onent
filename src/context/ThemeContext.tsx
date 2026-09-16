import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme } from '../types';

interface ThemeInfo {
  id: AppTheme;
  name: string;
  subtitle: string;
  badge: string;
  bgHex: string;
  accentHex: string;
  secondaryHex: string;
}

export const THEME_CONFIGS: Record<AppTheme, ThemeInfo> = {
  'industrial-studio': {
    id: 'industrial-studio',
    name: 'The Industrial Studio',
    subtitle: 'Slate Blue-Grey & Warm Sand',
    badge: 'STUDIO HARDWARE',
    bgHex: '#2B303A',
    accentHex: '#E28743', // Structural muted orange
    secondaryHex: '#EAD7C3', // Warm birch sand
  },
  'mission-control': {
    id: 'mission-control',
    name: 'Mission Control (Present)',
    subtitle: 'Obsidian & Deep Space Blue',
    badge: 'AEROSPACE OPS',
    bgHex: '#070B12',
    accentHex: '#3B82F6', // Deep space blue
    secondaryHex: '#06B6D4', // Electric cyan
  },
  'tactical-hazard': {
    id: 'tactical-hazard',
    name: 'Tactical Hazard (Black & Yellow)',
    subtitle: 'Pitch Black, Safety Yellow & Crisp White',
    badge: 'HAZARD SPECS',
    bgHex: '#0A0A0B',
    accentHex: '#FACC15', // High-voltage safety yellow
    secondaryHex: '#FFFFFF', // Crisp titanium white
  },
};

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isIndustrial: boolean;
  isHazard: boolean;
  themeConfig: ThemeInfo;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'aura_spacecraft_theme_v2';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to 'industrial-studio' as requested
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'industrial-studio' || stored === 'mission-control' || stored === 'tactical-hazard') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'industrial-studio';
  });

  const setTheme = (nextTheme: AppTheme) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'tactical-hazard') {
      document.body.style.backgroundColor = '#0A0A0B';
      document.body.style.color = '#FFFFFF';
    } else if (theme === 'industrial-studio') {
      document.body.style.backgroundColor = '#2B303A';
      document.body.style.color = '#EAD7C3';
    } else {
      document.body.style.backgroundColor = '#070B12';
      document.body.style.color = '#E2E8F0';
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    isIndustrial: theme === 'industrial-studio',
    isHazard: theme === 'tactical-hazard',
    themeConfig: THEME_CONFIGS[theme],
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
