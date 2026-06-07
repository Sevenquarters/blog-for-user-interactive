import 'server-only';

import { DEFAULT_THEME_ID, defaultTheme } from '@/lib/theme/default-theme';
import { hasSupabaseEnv } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ThemeRecord } from '@/types/database';
import type { ThemeDefinition, ThemeTokens } from '@/types/theme';

import { throwIfSupabaseError } from './utils';

type ThemeRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  tokens: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type EditableThemeInput = {
  themeId: string;
  lightTokens: ThemeTokens;
  darkTokens: ThemeTokens;
};

function buildFallbackThemeTokens() {
  return {
    ...defaultTheme.tokens,
    dark: defaultTheme.darkTokens,
  };
}

function buildFallbackThemeRow(): ThemeRow {
  const now = new Date().toISOString();

  return {
    id: DEFAULT_THEME_ID,
    name: defaultTheme.label,
    slug: defaultTheme.name,
    is_active: true,
    tokens: buildFallbackThemeTokens(),
    created_by: null,
    created_at: now,
    updated_at: now,
  };
}

async function ensureDefaultThemeRow() {
  const supabase = await createSupabaseServerClient();
  const fallbackRow = buildFallbackThemeRow();
  const { error } = await supabase.from('themes').upsert(
    {
      id: fallbackRow.id,
      name: fallbackRow.name,
      slug: fallbackRow.slug,
      is_active: fallbackRow.is_active,
      tokens: fallbackRow.tokens,
      created_by: fallbackRow.created_by,
    } as never,
    {
      onConflict: 'id',
    },
  );

  throwIfSupabaseError(error, 'Unable to bootstrap default theme');
}

function isTokenRecord(value: unknown): value is Record<string, string> {
  return typeof value === 'object' && value !== null;
}

function readTokenValue(
  source: Record<string, unknown> | undefined,
  key: keyof ThemeTokens,
  fallback: string,
) {
  const value = source?.[key];

  return typeof value === 'string' && value.trim() ? value : fallback;
}

function normalizeThemeTokens(tokens: Record<string, unknown> | null | undefined) {
  const lightSource = isTokenRecord(tokens) ? tokens : undefined;
  const darkSource =
    lightSource && isTokenRecord(lightSource.dark) ? lightSource.dark : undefined;

  return {
    lightTokens: {
      background: readTokenValue(
        lightSource,
        'background',
        defaultTheme.tokens.background,
      ),
      surface: readTokenValue(lightSource, 'surface', defaultTheme.tokens.surface),
      foreground: readTokenValue(
        lightSource,
        'foreground',
        defaultTheme.tokens.foreground,
      ),
      muted: readTokenValue(lightSource, 'muted', defaultTheme.tokens.muted),
      accent: readTokenValue(lightSource, 'accent', defaultTheme.tokens.accent),
      border: readTokenValue(lightSource, 'border', defaultTheme.tokens.border),
    } satisfies ThemeTokens,
    darkTokens: {
      background: readTokenValue(
        darkSource,
        'background',
        defaultTheme.darkTokens.background,
      ),
      surface: readTokenValue(
        darkSource,
        'surface',
        defaultTheme.darkTokens.surface,
      ),
      foreground: readTokenValue(
        darkSource,
        'foreground',
        defaultTheme.darkTokens.foreground,
      ),
      muted: readTokenValue(darkSource, 'muted', defaultTheme.darkTokens.muted),
      accent: readTokenValue(darkSource, 'accent', defaultTheme.darkTokens.accent),
      border: readTokenValue(darkSource, 'border', defaultTheme.darkTokens.border),
    } satisfies ThemeTokens,
  };
}

function mapThemeRecord(row: ThemeRow): ThemeRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    is_active: row.is_active,
    tokens: row.tokens,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapThemeDefinition(row: ThemeRow): ThemeDefinition {
  const normalized = normalizeThemeTokens(row.tokens);

  return {
    name: row.slug,
    label: row.name,
    tokens: normalized.lightTokens,
    darkTokens: normalized.darkTokens,
  };
}

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

  if (data) {
    return mapThemeRecord(data as ThemeRow);
  }

  const { data: firstTheme, error: firstThemeError } = await supabase
    .from('themes')
    .select(
      'id, name, slug, is_active, tokens, created_by, created_at, updated_at',
    )
    .order('name', { ascending: true })
    .limit(1)
    .maybeSingle();

  throwIfSupabaseError(firstThemeError, 'Unable to load fallback theme');

  return firstTheme
    ? mapThemeRecord(firstTheme as ThemeRow)
    : mapThemeRecord(buildFallbackThemeRow());
}

export async function getActiveThemeDefinition() {
  if (!hasSupabaseEnv()) {
    return defaultTheme;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('themes')
    .select(
      'id, name, slug, is_active, tokens, created_by, created_at, updated_at',
    )
    .eq('is_active', true)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to load active theme definition');

  if (!data) {
    const { data: firstTheme, error: firstThemeError } = await supabase
      .from('themes')
      .select(
        'id, name, slug, is_active, tokens, created_by, created_at, updated_at',
      )
      .order('name', { ascending: true })
      .limit(1)
      .maybeSingle();

    throwIfSupabaseError(
      firstThemeError,
      'Unable to load fallback theme definition',
    );

    return firstTheme ? mapThemeDefinition(firstTheme as ThemeRow) : defaultTheme;
  }

  return mapThemeDefinition(data as ThemeRow);
}

export async function listThemeRecords() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('themes')
    .select(
      'id, name, slug, is_active, tokens, created_by, created_at, updated_at',
    )
    .order('name', { ascending: true });

  throwIfSupabaseError(error, 'Unable to load themes');

  const rows = ((data ?? []) as ThemeRow[]).length
    ? ((data ?? []) as ThemeRow[])
    : [buildFallbackThemeRow()];

  return rows.map((row) => ({
    record: mapThemeRecord(row),
    definition: mapThemeDefinition(row),
  }));
}

export async function activateTheme(themeId: string) {
  if (themeId === DEFAULT_THEME_ID) {
    await ensureDefaultThemeRow();
  }

  const supabase = await createSupabaseServerClient();

  const { error: resetError } = await supabase
    .from('themes')
    .update({ is_active: false } as never)
    .eq('is_active', true);

  throwIfSupabaseError(resetError, 'Unable to clear active theme');

  const { error: activateError } = await supabase
    .from('themes')
    .update({ is_active: true } as never)
    .eq('id', themeId);

  throwIfSupabaseError(activateError, 'Unable to activate theme');
}

export async function updateThemeTokens(input: EditableThemeInput) {
  if (input.themeId === DEFAULT_THEME_ID) {
    await ensureDefaultThemeRow();
  }

  const supabase = await createSupabaseServerClient();
  const tokens = {
    ...input.lightTokens,
    dark: input.darkTokens,
  };

  const { error } = await supabase
    .from('themes')
    .update({ tokens } as never)
    .eq('id', input.themeId);

  throwIfSupabaseError(error, 'Unable to update theme tokens');
}
