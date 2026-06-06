'use client';

import { createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import {
  LOCALE_COOKIE_NAME,
  isSupportedLocale,
  type Locale,
} from '@/i18n/config';
import type { Messages } from '@/i18n/dictionaries';

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
  switchLocale: (nextLocale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  children: React.ReactNode;
  locale: Locale;
  messages: Messages;
};

function getMessageValue(messages: Record<string, unknown>, path: string) {
  return path.split('.').reduce<unknown>((value, key) => {
    if (typeof value !== 'object' || value === null) {
      return undefined;
    }

    return (value as Record<string, unknown>)[key];
  }, messages);
}

function replaceLocaleSegment(pathname: string, locale: Locale) {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return `/${locale}`;
  }

  if (isSupportedLocale(segments[0])) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }

  return `/${segments.join('/')}`;
}

export function LocaleProvider({
  children,
  locale,
  messages,
}: LocaleProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(nextLocale: Locale) {
    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.replace(replaceLocaleSegment(pathname, nextLocale));
  }

  return (
    <LocaleContext.Provider
      value={{
        locale,
        messages,
        switchLocale,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }

  return context;
}

export function useTranslations() {
  const { messages } = useLocale();

  return (path: string) => {
    const result = getMessageValue(messages as Record<string, unknown>, path);

    return typeof result === 'string' ? result : path;
  };
}
