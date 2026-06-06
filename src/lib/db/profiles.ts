import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
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
