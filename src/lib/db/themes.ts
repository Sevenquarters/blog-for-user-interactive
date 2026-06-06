import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ThemeRecord } from '@/types/database';

import { throwIfSupabaseError } from './utils';

export async function getActiveThemeRecord() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('themes')
    .select(
      'id, name, slug, is_active, tokens, created_by, created_at, updated_at',
    )
    .eq('is_active', true)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to load active theme');

  return (data as ThemeRecord | null) ?? null;
}
