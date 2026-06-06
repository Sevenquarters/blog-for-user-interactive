'use client';

import type { Locale } from '@/i18n/config';
import type { Messages } from '@/i18n/dictionaries';
import { LocaleProvider } from '@/providers/locale-provider';
import { ThemeProvider } from '@/providers/theme-provider';

type AppProvidersProps = {
  children: React.ReactNode;
  locale: Locale;
  messages: Messages;
};

export function AppProviders({
  children,
  locale,
  messages,
}: AppProvidersProps) {
  return (
    <ThemeProvider>
      <LocaleProvider locale={locale} messages={messages}>
        {children}
      </LocaleProvider>
    </ThemeProvider>
  );
}
