import 'server-only';

import type { Locale } from '@/i18n/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { TaxonomyItem } from '@/types/database';

import { throwIfSupabaseError } from './utils';

type TranslatedTaxonomyRow = {
  id: string;
  category_translations?: Array<{
    slug: string;
    name: string;
    description: string | null;
  }>;
  tag_translations?: Array<{
    slug: string;
    name: string;
  }>;
};

export async function listCategories(locale: Locale) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('categories')
    .select(
      `
        id,
        category_translations!inner (
          slug,
          name,
          description
        )
      `,
    )
    .eq('category_translations.locale', locale)
    .order('sort_order', { ascending: true });

  throwIfSupabaseError(error, 'Unable to load categories');

  return ((data ?? []) as TranslatedTaxonomyRow[]).map((row) => ({
    id: row.id,
    slug: row.category_translations?.[0]?.slug ?? '',
    name: row.category_translations?.[0]?.name ?? '',
    description: row.category_translations?.[0]?.description ?? null,
  })) satisfies TaxonomyItem[];
}

export async function listTags(locale: Locale) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('tags')
    .select(
      `
        id,
        tag_translations!inner (
          slug,
          name
        )
      `,
    )
    .eq('tag_translations.locale', locale)
    .order('created_at', { ascending: true });

  throwIfSupabaseError(error, 'Unable to load tags');

  return ((data ?? []) as TranslatedTaxonomyRow[]).map((row) => ({
    id: row.id,
    slug: row.tag_translations?.[0]?.slug ?? '',
    name: row.tag_translations?.[0]?.name ?? '',
  })) satisfies TaxonomyItem[];
}
