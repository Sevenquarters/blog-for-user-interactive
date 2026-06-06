export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeTokens = {
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  accent: string;
  border: string;
};

export type ThemeDefinition = {
  name: string;
  label: string;
  tokens: ThemeTokens;
  darkTokens: ThemeTokens;
};
