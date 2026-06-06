import type { Locale } from '@/i18n/config';

export function buildLocalePath(locale: Locale, path = '') {
  if (!path) {
    return `/${locale}`;
  }

  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}

export function resolveSafeRedirect(
  locale: Locale,
  nextPath: FormDataEntryValue | string | null | undefined,
  fallbackPath: string,
) {
  if (typeof nextPath === 'string' && nextPath.startsWith('/')) {
    const localePrefix = `/${locale}`;

    if (nextPath === localePrefix || nextPath.startsWith(`${localePrefix}/`)) {
      return nextPath;
    }

    return buildLocalePath(locale, nextPath);
  }

  return buildLocalePath(locale, fallbackPath);
}
