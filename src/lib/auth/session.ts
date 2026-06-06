import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';

import { getProfileById } from '@/lib/db/profiles';
import { hasSupabaseEnv } from '@/lib/env';
import type { Locale } from '@/i18n/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AppRole } from '@/types/database';

import { buildLocalePath } from './paths';

export const getCurrentUser = cache(async () => {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return getProfileById(user.id);
});

export async function requireUser(locale: Locale) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLocalePath(locale, '/login'));
  }

  const profile = await getProfileById(user.id);

  if (!profile) {
    redirect(buildLocalePath(locale, '/login'));
  }

  return { user, profile };
}

export async function requireRole(locale: Locale, roles: AppRole[]) {
  const auth = await requireUser(locale);

  if (!roles.includes(auth.profile.role)) {
    redirect(buildLocalePath(locale, '/dashboard'));
  }

  return auth;
}
