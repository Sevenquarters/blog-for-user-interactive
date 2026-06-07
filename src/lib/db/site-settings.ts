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
  site_setting_translations:
    | Array<{
        locale: string;
        site_name: string;
        site_description: string | null;
      }>
    | null;
};

export type EditableSiteSettings = {
  id: number;
  defaultLocale: string;
  activeThemeId: string | null;
  postsPerPage: number;
  updatedBy: string | null;
  updatedAt: string;
  translations: Record<
    'en' | 'zh-CN',
    {
      siteName: string;
      siteDescription: string;
    }
  >;
};

type UpdateSiteSettingsInput = {
  editorId: string;
  defaultLocale: string;
  activeThemeId: string | null;
  postsPerPage: number;
  translations: EditableSiteSettings['translations'];
};

function buildDefaultTranslation(locale: 'en' | 'zh-CN') {
  if (locale === 'zh-CN') {
    return {
      siteName: '交互式博客平台',
      siteDescription: '一个基于 Supabase 与 Next.js 构建的交互式博客平台。',
    };
  }

  return {
    siteName: 'Blog For User Interactive',
    siteDescription:
      'An interactive blog platform powered by Supabase and Next.js.',
  };
}

function normalizeTranslation(
  locale: 'en' | 'zh-CN',
  siteName: string | null | undefined,
  siteDescription: string | null | undefined,
) {
  const fallback = buildDefaultTranslation(locale);

  return {
    siteName: siteName?.trim() || fallback.siteName,
    siteDescription: siteDescription?.trim() || fallback.siteDescription,
  };
}

function buildEmptyTranslations() {
  return {
    en: buildDefaultTranslation('en'),
    'zh-CN': buildDefaultTranslation('zh-CN'),
  } satisfies EditableSiteSettings['translations'];
}

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
        site_setting_translations (
          locale,
          site_name,
          site_description
        )
      `,
    )
    .eq('id', 1)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to load site settings');

  if (!data) {
    const fallbackTranslation = buildDefaultTranslation(locale);

    return {
      id: 1,
      default_locale: 'zh-CN',
      active_theme_id: null,
      posts_per_page: 10,
      updated_by: null,
      updated_at: new Date().toISOString(),
      site_name: fallbackTranslation.siteName,
      site_description: fallbackTranslation.siteDescription,
    } satisfies SiteSettings;
  }

  const row = data as unknown as SiteSettingsRow;
  const translation =
    row.site_setting_translations?.find((entry) => entry.locale === locale) ??
    null;
  const normalizedTranslation = normalizeTranslation(
    locale,
    translation?.site_name,
    translation?.site_description,
  );

  return {
    id: row.id,
    default_locale: row.default_locale,
    active_theme_id: row.active_theme_id,
    posts_per_page: row.posts_per_page,
    updated_by: row.updated_by,
    updated_at: row.updated_at,
    site_name: normalizedTranslation.siteName,
    site_description: normalizedTranslation.siteDescription,
  } satisfies SiteSettings;
}

export async function getEditableSiteSettings() {
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
        site_setting_translations (
          locale,
          site_name,
          site_description
        )
      `,
    )
    .eq('id', 1)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to load editable site settings');

  if (!data) {
    return {
      id: 1,
      defaultLocale: 'zh-CN',
      activeThemeId: null,
      postsPerPage: 10,
      updatedBy: null,
      updatedAt: new Date().toISOString(),
      translations: buildEmptyTranslations(),
    } satisfies EditableSiteSettings;
  }

  const row = data as unknown as SiteSettingsRow;
  const translations = buildEmptyTranslations();

  for (const translation of row.site_setting_translations ?? []) {
    if (translation.locale === 'en' || translation.locale === 'zh-CN') {
      translations[translation.locale] = normalizeTranslation(
        translation.locale,
        translation.site_name,
        translation.site_description,
      );
    }
  }

  return {
    id: row.id,
    defaultLocale: row.default_locale,
    activeThemeId: row.active_theme_id,
    postsPerPage: row.posts_per_page,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
    translations,
  } satisfies EditableSiteSettings;
}

export async function updateSiteSettings(input: UpdateSiteSettingsInput) {
  const supabase = await createSupabaseServerClient();
  const { error: settingsError } = await supabase.from('site_settings').upsert(
    {
      id: 1,
      default_locale: input.defaultLocale,
      active_theme_id: input.activeThemeId,
      posts_per_page: input.postsPerPage,
      updated_by: input.editorId,
    } as never,
    {
      onConflict: 'id',
    },
  );

  throwIfSupabaseError(settingsError, 'Unable to update site settings');

  const translationRows = (
    Object.entries(input.translations).map(([locale, translation]) => ({
      site_settings_id: 1,
      locale,
      site_name: normalizeTranslation(
        locale as 'en' | 'zh-CN',
        translation.siteName,
        translation.siteDescription,
      ).siteName,
      site_description:
        normalizeTranslation(
          locale as 'en' | 'zh-CN',
          translation.siteName,
          translation.siteDescription,
        ).siteDescription || null,
    })) as unknown[]
  ) as never;

  const { error: translationsError } = await supabase
    .from('site_setting_translations')
    .upsert(translationRows, {
      onConflict: 'site_settings_id,locale',
    });

  throwIfSupabaseError(
    translationsError,
    'Unable to update site setting translations',
  );
}

export async function updateActiveThemeSetting(
  editorId: string,
  activeThemeId: string | null,
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('site_settings')
    .update({
      active_theme_id: activeThemeId,
      updated_by: editorId,
    } as never)
    .eq('id', 1);

  throwIfSupabaseError(error, 'Unable to update active theme setting');
}
