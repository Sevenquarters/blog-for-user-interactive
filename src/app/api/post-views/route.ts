import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';

import { isSupportedLocale } from '@/i18n/config';
import { hasSupabaseEnv } from '@/lib/env';
import { createSupabasePublicClient } from '@/lib/supabase/public';

function buildViewerHash(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for') ?? '';
  const userAgent = request.headers.get('user-agent') ?? '';
  const value = `${forwardedFor}|${userAgent}`;

  if (!value.trim()) {
    return null;
  }

  return createHash('sha256').update(value).digest('hex');
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ ok: true });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const postId =
    typeof (payload as { postId?: unknown })?.postId === 'string'
      ? (payload as { postId: string }).postId
      : null;
  const locale =
    typeof (payload as { locale?: unknown })?.locale === 'string'
      ? (payload as { locale: string }).locale
      : null;

  if (!postId || !locale || !isSupportedLocale(locale)) {
    return NextResponse.json({ error: 'Invalid post view payload.' }, { status: 400 });
  }

  const supabase = createSupabasePublicClient();
  const { error } = await supabase.from('post_views').insert({
    post_id: postId,
    locale,
    viewer_hash: buildViewerHash(request),
    referrer: request.headers.get('referer'),
    user_agent: request.headers.get('user-agent'),
  } as never);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
