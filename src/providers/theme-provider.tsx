'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import {
  applyThemeTokens,
  defaultTheme,
  resolveThemeTokens,
} from '@/lib/theme/default-theme';
import type { ThemeDefinition, ThemeMode } from '@/types/theme';

type ThemeContextValue = {
  mode: ThemeMode;
  theme: ThemeDefinition;
  setMode: (mode: ThemeMode) => void;
};

const THEME_MODE_STORAGE_KEY = 'blog-theme-mode';
const THEME_NAME_STORAGE_KEY = 'blog-theme-name';

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: React.ReactNode;
  initialTheme?: ThemeDefinition;
};

function getResolvedMode(mode: ThemeMode) {
  if (mode !== 'system') {
    return mode;
  }

  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
}

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const storedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);

  if (
    storedMode === 'light' ||
    storedMode === 'dark' ||
    storedMode === 'system'
  ) {
    return storedMode;
  }

  return 'system';
}

export function ThemeProvider({
  children,
  initialTheme = defaultTheme,
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(getInitialThemeMode);
  const [theme] = useState(initialTheme);

  useEffect(() => {
    const resolvedMode = getResolvedMode(mode);
    const resolvedTokens = resolveThemeTokens(theme, resolvedMode);

    document.documentElement.dataset.themeMode = resolvedMode;
    document.documentElement.dataset.themeName = theme.name;
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    window.localStorage.setItem(THEME_NAME_STORAGE_KEY, theme.name);
    applyThemeTokens(resolvedTokens);
  }, [mode, theme]);

  useEffect(() => {
    if (mode !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function syncSystemTheme() {
      const resolvedTokens = resolveThemeTokens(
        theme,
        mediaQuery.matches ? 'dark' : 'light',
      );

      document.documentElement.dataset.themeMode = mediaQuery.matches
        ? 'dark'
        : 'light';
      applyThemeTokens(resolvedTokens);
    }

    syncSystemTheme();
    mediaQuery.addEventListener('change', syncSystemTheme);

    return () => {
      mediaQuery.removeEventListener('change', syncSystemTheme);
    };
  }, [mode, theme]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
