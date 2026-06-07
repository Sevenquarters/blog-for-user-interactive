import { NextRequest, NextResponse } from 'next/server';

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isSupportedLocale,
} from '@/i18n/config';
import { updateSupabaseSession } from '@/lib/supabase/middleware';

function detectBrowserLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieLocale && isSupportedLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage =
    request.headers.get('accept-language')?.toLowerCase() ?? '';

  if (acceptLanguage.includes('zh')) {
    return 'zh-CN';
  }

  if (acceptLanguage.includes('en')) {
    return 'en';
  }

  return DEFAULT_LOCALE;
}

function hasLocalePrefix(pathname: string) {
  const localeSegment = pathname.split('/')[1];

  return isSupportedLocale(localeSegment);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (hasLocalePrefix(pathname)) {
    return updateSupabaseSession(request);
  }

  const locale = detectBrowserLocale(request);
  const url = request.nextUrl.clone();

  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;

  const response = NextResponse.redirect(url);

  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
