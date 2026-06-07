import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

import { throwIfSupabaseError } from './utils';

export async function getProfileById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, email, display_name, role, preferred_locale, preferred_theme_mode, avatar_url, created_at, updated_at',
    )
    .eq('id', id)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to load profile');

  return (data as Profile | null) ?? null;
}

export async function ensureProfileForUser(user: User) {
  const existingProfile = await getProfileById(user.id);

  if (existingProfile) {
    return existingProfile;
  }

  const supabase = await createSupabaseServerClient();
  const displayName =
    typeof user.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name
      : (user.email?.split('@')[0] ?? null);

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    email: user.email ?? null,
    display_name: displayName,
  });

  throwIfSupabaseError(error, 'Unable to create missing profile');

  return getProfileById(user.id);
}
