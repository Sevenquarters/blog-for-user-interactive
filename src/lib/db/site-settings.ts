import 'server-only';

import type { Locale } from '@/i18n/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { SiteSettings } from '@/types/database';

import { throwIfSupabaseError } from './utils';

type SiteSettingsRow = {
  id: number;
  default_locale: string;
  active_theme_id: string | null;
  posts_per_page: number;
  updated_by: string | null;
  updated_at: string;
  site_setting_translations: Array<{
    site_name: string;
    site_description: string | null;
  }> | null;
};

export async function getSiteSettings(locale: Locale) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select(
      `
        id,
        default_locale,
        active_theme_id,
        posts_per_page,
        updated_by,
        updated_at,
        site_setting_translations!inner (
          site_name,
          site_description
        )
      `,
    )
    .eq('id', 1)
    .eq('site_setting_translations.locale', locale)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to load site settings');

  if (!data) {
    return null;
  }

  const row = data as unknown as SiteSettingsRow;
  const translation = row.site_setting_translations?.[0];

  return {
    id: row.id,
    default_locale: row.default_locale,
    active_theme_id: row.active_theme_id,
    posts_per_page: row.posts_per_page,
    updated_by: row.updated_by,
    updated_at: row.updated_at,
    site_name: translation?.site_name ?? 'Blog For User Interactive',
    site_description: translation?.site_description ?? null,
  } satisfies SiteSettings;
}
