import type { ThemeDefinition, ThemeMode, ThemeTokens } from '@/types/theme';

export const DEFAULT_THEME_ID = '11111111-1111-1111-1111-111111111111';

export const defaultTheme: ThemeDefinition = {
  name: 'editorial-sunrise',
  label: 'Editorial Sunrise',
  tokens: {
    background: '#fffdf8',
    surface: 'rgba(255, 255, 255, 0.88)',
    foreground: '#1f2937',
    muted: '#5b6472',
    accent: '#c2410c',
    border: 'rgba(148, 163, 184, 0.28)',
  },
  darkTokens: {
    background: '#111827',
    surface: 'rgba(17, 24, 39, 0.92)',
    foreground: '#f8fafc',
    muted: '#cbd5e1',
    accent: '#f59e0b',
    border: 'rgba(148, 163, 184, 0.26)',
  },
};

const CSS_VAR_MAP: Record<keyof ThemeTokens, string> = {
  background: '--theme-background',
  surface: '--theme-surface',
  foreground: '--theme-foreground',
  muted: '--theme-muted',
  accent: '--theme-accent',
  border: '--theme-border',
};

export function resolveThemeTokens(
  theme: ThemeDefinition,
  mode: Exclude<ThemeMode, 'system'>,
) {
  return mode === 'dark' ? theme.darkTokens : theme.tokens;
}

export function applyThemeTokens(tokens: ThemeTokens) {
  if (typeof document === 'undefined') {
    return;
  }

  Object.entries(tokens).forEach(([token, value]) => {
    document.documentElement.style.setProperty(
      CSS_VAR_MAP[token as keyof ThemeTokens],
      value as string,
    );
  });
}
