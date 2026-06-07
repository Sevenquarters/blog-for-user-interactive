'use client';

import type { Locale } from '@/i18n/config';
import type { Messages } from '@/i18n/dictionaries';
import { LocaleProvider } from '@/providers/locale-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import type { ThemeDefinition } from '@/types/theme';

type AppProvidersProps = {
  children: React.ReactNode;
  locale: Locale;
  messages: Messages;
  initialTheme?: ThemeDefinition;
};

export function AppProviders({
  children,
  locale,
  messages,
  initialTheme,
}: AppProvidersProps) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <LocaleProvider locale={locale} messages={messages}>
        {children}
      </LocaleProvider>
    </ThemeProvider>
  );
}
