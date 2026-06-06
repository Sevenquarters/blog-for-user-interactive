import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

import { isSupportedLocale } from '@/i18n/config';
import { buildLocalePath, resolveSafeRedirect } from '@/lib/auth/paths';
import { verifyAuthCallback } from '@/lib/auth/actions';

type AuthCallbackRouteProps = {
  params: Promise<{ locale: string }>;
};

export async function GET(
  request: Request,
  { params }: AuthCallbackRouteProps,
) {
  const { locale } = await params;
  const url = new URL(request.url);

  if (!isSupportedLocale(locale)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const verified = await verifyAuthCallback({
    tokenHash: url.searchParams.get('token_hash'),
    type: url.searchParams.get('type') as EmailOtpType | null,
  });

  const redirectTo = verified
    ? resolveSafeRedirect(locale, url.searchParams.get('next'), '/dashboard')
    : buildLocalePath(locale, '/login');

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
