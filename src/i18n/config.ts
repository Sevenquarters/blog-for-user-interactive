export const SUPPORTED_LOCALES = ['en', 'zh-CN'] as const;
export const DEFAULT_LOCALE = 'zh-CN';
export const LOCALE_COOKIE_NAME = 'blog-locale';

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}
