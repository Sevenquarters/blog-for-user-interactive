import 'server-only';

import type { Locale } from '@/i18n/config';
import {
  buildExcerptFromContent,
  extractPreviewImageFromContent,
} from '@/lib/blog/content';
import { extractContentText } from '@/lib/content/content-format';
import {
  createSupabasePublicClient,
  getSupabaseStoragePublicUrl,
} from '@/lib/supabase/public';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type {
  BlogHeroImage,
  BlogPostDetail,
  BlogPostListItem,
  BlogPostTag,
  BlogTaxonomy,
  ResolvedLocalizedRecord,
  SearchableBlogPost,
} from '@/types/blog';

import { throwIfSupabaseError } from './utils';

type TranslationRow = {
  locale: string;
  title?: string;
  slug: string;
  excerpt?: string | null;
  content?: unknown;
  seo_title?: string | null;
  seo_description?: string | null;
  cover_alt?: string | null;
  is_complete?: boolean;
  name?: string;
  description?: string | null;
  alt_text?: string | null;
  caption?: string | null;
};

type PostRow = {
  id: string;
  author_id: string | null;
  published_at: string;
  is_featured: boolean;
  reading_time_minutes: number | null;
  profiles:
    | {
        display_name: string | null;
        avatar_url: string | null;
      }
    | null;
  post_translations: TranslationRow[] | null;
  categories:
    | {
        id: string;
        category_translations: TranslationRow[] | null;
      }
    | null;
  media_assets:
    | {
        bucket_name: string;
        storage_path: string;
        width: number | null;
        height: number | null;
        media_asset_translations: TranslationRow[] | null;
      }
    | null;
  post_tags:
    | Array<{
        tags:
          | {
              id: string;
              tag_translations: TranslationRow[] | null;
            }
          | null;
      }>
    | null;
};

type TranslationLookupRow = {
  post_id?: string;
  category_id?: string;
  tag_id?: string;
  locale: string;
  slug: string;
};

type SiteSettingsRow = {
  posts_per_page: number;
  site_setting_translations: Array<{
    locale: string;
    site_name: string;
    site_description: string | null;
  }> | null;
};

type PublicSiteSettings = {
  postsPerPage: number;
  siteName: string;
  siteDescription: string | null;
};

export type PaginatedPublishedPosts = {
  items: BlogPostListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

const PUBLIC_POST_SELECT = `
  id,
  author_id,
  published_at,
  is_featured,
  reading_time_minutes,
  profiles:author_id (
    display_name,
    avatar_url
  ),
  post_translations (
    locale,
    title,
    slug,
    excerpt,
    content,
    seo_title,
    seo_description,
    cover_alt,
    is_complete
  ),
  categories (
    id,
    category_translations (
      locale,
      name,
      slug,
      description
    )
  ),
  media_assets (
    bucket_name,
    storage_path,
    width,
    height,
    media_asset_translations (
      locale,
      alt_text,
      caption
    )
  ),
  post_tags (
    tags (
      id,
      tag_translations (
        locale,
        name,
        slug
      )
    )
  )
`;

function buildSlugCandidates(slug: string) {
  const candidates = new Set<string>();
  const values = [slug];

  try {
    values.push(decodeURIComponent(slug));
  } catch {
    // Keep the original slug when it is already decoded or malformed.
  }

  for (const value of values) {
    const trimmed = value.trim();

    if (!trimmed) {
      continue;
    }

    candidates.add(trimmed);
    candidates.add(trimmed.normalize('NFC'));
    candidates.add(trimmed.normalize('NFD'));
  }

  return Array.from(candidates);
}

function pickMatchingLookupRow(
  rows: TranslationLookupRow[],
  candidates: string[],
  locale?: Locale,
) {
  for (const candidate of candidates) {
    const localeMatch = locale
      ? rows.find(
          (row) => row.locale === locale && row.slug.normalize('NFC') === candidate.normalize('NFC'),
        )
      : null;

    if (localeMatch) {
      return localeMatch;
    }

    const match = rows.find(
      (row) => row.slug.normalize('NFC') === candidate.normalize('NFC'),
    );

    if (match) {
      return match;
    }
  }

  return null;
}

function matchesSlugCandidate(slug: string, candidates: string[]) {
  const normalizedSlug = slug.normalize('NFC');

  return candidates.some(
    (candidate) => candidate.normalize('NFC') === normalizedSlug,
  );
}

function findPreferredTranslation(
  translations: TranslationRow[] | null | undefined,
  locale: Locale,
) {
  const completeTranslations =
    translations?.filter(
      (translation) =>
        translation.is_complete === undefined || translation.is_complete,
    ) ?? [];

  return (
    completeTranslations.find((translation) => translation.locale === locale) ??
    completeTranslations[0] ??
    translations?.find((translation) => translation.locale === locale) ??
    translations?.[0] ??
    null
  );
}

function mapCategory(
  translations: TranslationRow[] | null | undefined,
  locale: Locale,
): BlogTaxonomy | null {
  const translation = findPreferredTranslation(translations, locale);

  if (!translation?.name) {
    return null;
  }

  return {
    id: '',
    slug: translation.slug,
    name: translation.name,
    description: translation.description ?? null,
  };
}

function mapHeroImage(
  mediaAsset:
    | {
        bucket_name: string;
        storage_path: string;
        width: number | null;
        height: number | null;
        media_asset_translations: TranslationRow[] | null;
      }
    | null
    | undefined,
  locale: Locale,
  coverAlt: string | null,
): BlogHeroImage | null {
  if (!mediaAsset) {
    return null;
  }

  const translation =
    mediaAsset.media_asset_translations?.find(
      (item) => item.locale === locale,
    ) ?? mediaAsset.media_asset_translations?.[0];

  return {
    url: getSupabaseStoragePublicUrl(
      mediaAsset.bucket_name,
      mediaAsset.storage_path,
    ),
    alt: translation?.alt_text ?? coverAlt ?? null,
    caption: translation?.caption ?? null,
    width: mediaAsset.width,
    height: mediaAsset.height,
  };
}

function mapTags(
  postTags: PostRow['post_tags'],
  locale: Locale,
): BlogPostTag[] {
  return (postTags ?? [])
    .flatMap((postTag) => {
      const tag = postTag.tags;

      if (!tag) {
        return [];
      }

      const translation = findPreferredTranslation(tag.tag_translations, locale);

      if (!translation?.name) {
        return [];
      }

      return [
        {
          id: tag.id,
          slug: translation.slug,
          name: translation.name,
        },
      ];
    })
    .filter(
      (tag, index, allTags) =>
        allTags.findIndex((candidate) => candidate.id === tag.id) === index,
    );
}

function mapPostListItem(row: PostRow, locale: Locale): BlogPostListItem | null {
  const translation = findPreferredTranslation(row.post_translations, locale);

  if (!translation?.title) {
    return null;
  }

  const category = mapCategory(
    row.categories?.category_translations ?? null,
    locale,
  );
  const excerpt =
    translation.excerpt?.trim() ||
    buildExcerptFromContent(translation.content) ||
    null;

  return {
    id: row.id,
    slug: translation.slug,
    title: translation.title,
    excerpt,
    publishedAt: row.published_at,
    readingTimeMinutes: row.reading_time_minutes,
    isFeatured: row.is_featured,
    category:
      category && row.categories
        ? {
            ...category,
            id: row.categories.id,
          }
        : null,
    tags: mapTags(row.post_tags, locale),
    heroImage: mapHeroImage(
      row.media_assets,
      locale,
      translation.cover_alt ?? null,
    ),
    previewImage:
      mapHeroImage(row.media_assets, locale, translation.cover_alt ?? null) ??
      extractPreviewImageFromContent(translation.content),
  };
}

function mapPostDetail(row: PostRow, locale: Locale): BlogPostDetail | null {
  const listItem = mapPostListItem(row, locale);
  const translation = findPreferredTranslation(row.post_translations, locale);

  if (!listItem || !translation) {
    return null;
  }

  const alternateSlugs = Object.fromEntries(
    (row.post_translations ?? [])
      .filter(
        (item) =>
          (item.locale === 'en' || item.locale === 'zh-CN') &&
          item.is_complete,
      )
      .map((item) => [item.locale, item.slug]),
  ) as BlogPostDetail['alternateSlugs'];

  return {
    ...listItem,
    content: translation.content ?? [],
    seoTitle: translation.seo_title ?? null,
    seoDescription:
      translation.seo_description ??
      translation.excerpt ??
      buildExcerptFromContent(translation.content),
    alternateSlugs,
    author: row.author_id
      ? {
          id: row.author_id,
          displayName: row.profiles?.display_name ?? null,
          avatarUrl: row.profiles?.avatar_url ?? null,
        }
      : null,
  };
}

function filterPosts(
  posts: BlogPostListItem[],
  options: {
    categorySlug?: string;
    tagSlug?: string;
    featuredOnly?: boolean;
    limit?: number;
    excludePostId?: string;
  },
) {
  const filtered = posts.filter((post) => {
    if (options.excludePostId && post.id === options.excludePostId) {
      return false;
    }

    if (options.featuredOnly && !post.isFeatured) {
      return false;
    }

    if (options.categorySlug && post.category?.slug !== options.categorySlug) {
      return false;
    }

    if (
      options.tagSlug &&
      !post.tags.some((tag) => tag.slug === options.tagSlug)
    ) {
      return false;
    }

    return true;
  });

  if (options.limit) {
    return filtered.slice(0, options.limit);
  }

  return filtered;
}

export async function getPublicSiteSettings(locale: Locale) {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from('site_settings')
    .select(
      `
        posts_per_page,
        site_setting_translations (
          locale,
          site_name,
          site_description
        )
      `,
    )
    .eq('id', 1)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to load public site settings');

  if (!data) {
    return {
      postsPerPage: 10,
      siteName: 'PeppaBlog',
      siteDescription: null,
    } satisfies PublicSiteSettings;
  }

  const row = data as unknown as SiteSettingsRow;
  const translation =
    row.site_setting_translations?.find((item) => item.locale === locale) ??
    row.site_setting_translations?.[0];

  return {
    postsPerPage: row.posts_per_page,
    siteName: translation?.site_name ?? 'PeppaBlog',
    siteDescription: translation?.site_description ?? null,
  } satisfies PublicSiteSettings;
}

export async function listPublicCategories(locale: Locale) {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from('categories')
    .select(
      `
        id,
        sort_order,
        category_translations (
          locale,
          name,
          slug,
          description
        )
      `,
    )
    .order('sort_order', { ascending: true });

  throwIfSupabaseError(error, 'Unable to load public categories');

  return ((data ?? []) as Array<{
    id: string;
    category_translations: TranslationRow[] | null;
  }>)
    .flatMap((row) => {
      const translation = findPreferredTranslation(
        row.category_translations,
        locale,
      );

      if (!translation?.name) {
        return [];
      }

      return [
        {
          id: row.id,
          slug: translation.slug,
          name: translation.name,
          description: translation.description ?? null,
        },
      ];
    })
    .filter(Boolean) satisfies BlogTaxonomy[];
}

export async function listPublicTags(locale: Locale) {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from('tags')
    .select(
      `
        id,
        tag_translations (
          locale,
          name,
          slug
        )
      `,
    )
    .order('created_at', { ascending: true });

  throwIfSupabaseError(error, 'Unable to load public tags');

  return ((data ?? []) as Array<{
    id: string;
    tag_translations: TranslationRow[] | null;
  }>)
    .flatMap((row) => {
      const translation = findPreferredTranslation(row.tag_translations, locale);

      if (!translation?.name) {
        return [];
      }

      return [
        {
          id: row.id,
          slug: translation.slug,
          name: translation.name,
        },
      ];
    })
    .filter(Boolean) satisfies BlogTaxonomy[];
}

export async function listPublishedPosts(
  locale: Locale,
  options: {
    categorySlug?: string;
    tagSlug?: string;
    featuredOnly?: boolean;
    limit?: number;
    excludePostId?: string;
  } = {},
) {
  const supabase = createSupabasePublicClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('posts')
    .select(PUBLIC_POST_SELECT)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', now)
    .order('published_at', { ascending: false });

  throwIfSupabaseError(error, 'Unable to load published posts');

  const posts = ((data ?? []) as PostRow[])
    .map((row) => mapPostListItem(row, locale))
    .filter((post): post is BlogPostListItem => Boolean(post));

  return filterPosts(posts, options);
}

export async function listPublishedPostsPage(
  locale: Locale,
  options: {
    page: number;
    pageSize: number;
  },
): Promise<PaginatedPublishedPosts> {
  const supabase = createSupabasePublicClient();
  const now = new Date().toISOString();
  const safePage = Math.max(1, Math.floor(options.page));
  const safePageSize = Math.max(1, Math.floor(options.pageSize));
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;
  const { data, error, count } = await supabase
    .from('posts')
    .select(PUBLIC_POST_SELECT, {
      count: 'exact',
    })
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', now)
    .order('published_at', { ascending: false })
    .range(from, to);

  throwIfSupabaseError(error, 'Unable to load paginated published posts');

  const items = ((data ?? []) as PostRow[])
    .map((row) => mapPostListItem(row, locale))
    .filter((post): post is BlogPostListItem => Boolean(post));
  const totalCount = count ?? 0;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / safePageSize) : 1;

  return {
    items,
    page: safePage,
    pageSize: safePageSize,
    totalCount,
    totalPages,
  };
}

export async function listSearchablePublishedPosts(locale: Locale) {
  const supabase = createSupabasePublicClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('posts')
    .select(PUBLIC_POST_SELECT)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', now)
    .order('published_at', { ascending: false });

  throwIfSupabaseError(error, 'Unable to load searchable published posts');

  return ((data ?? []) as PostRow[])
    .flatMap((row) => {
      const listItem = mapPostListItem(row, locale);
      const translation = findPreferredTranslation(row.post_translations, locale);

      if (!listItem || !translation) {
        return [];
      }

      return [
        {
          ...listItem,
          searchText: extractContentText(translation.content) ?? '',
        } satisfies SearchableBlogPost,
      ];
    })
    .filter(Boolean);
}

async function getPublishedPostRowById(postId: string) {
  const supabase = createSupabasePublicClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('posts')
    .select(PUBLIC_POST_SELECT)
    .eq('id', postId)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', now)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to load published post');

  return (data as PostRow | null) ?? null;
}

export async function resolvePublishedPost(
  locale: Locale,
  slug: string,
): Promise<ResolvedLocalizedRecord<BlogPostDetail>> {
  const supabase = createSupabasePublicClient();
  const slugCandidates = buildSlugCandidates(slug);
  const { data: localizedData, error: localizedError } = await supabase
    .from('post_translations')
    .select('post_id, locale, slug')
    .eq('locale', locale)
    .in('slug', slugCandidates);

  throwIfSupabaseError(
    localizedError,
    'Unable to resolve published post slug for locale',
  );

  const localizedRows = (localizedData ?? []) as TranslationLookupRow[];
  let postId =
    pickMatchingLookupRow(localizedRows, slugCandidates, locale)?.post_id ?? null;

  if (!postId) {
    const { data, error } = await supabase
      .from('post_translations')
      .select('post_id, locale, slug')
      .in('slug', slugCandidates);

    throwIfSupabaseError(error, 'Unable to resolve published post slug');

    postId =
      pickMatchingLookupRow(
        (data ?? []) as TranslationLookupRow[],
        slugCandidates,
      )?.post_id ?? null;
  }

  if (!postId) {
    return { status: 'notFound' };
  }

  const postRow = await getPublishedPostRowById(postId);

  if (!postRow) {
    return { status: 'notFound' };
  }

  const detail = mapPostDetail(postRow, locale);

  if (!detail) {
    return { status: 'notFound' };
  }

  if (!matchesSlugCandidate(detail.slug, slugCandidates)) {
    return {
      status: 'redirect',
      slug: encodeURIComponent(detail.slug),
    };
  }

  return {
    status: 'found',
    record: detail,
  };
}

export async function resolveCategory(
  locale: Locale,
  slug: string,
): Promise<ResolvedLocalizedRecord<BlogTaxonomy>> {
  const supabase = createSupabasePublicClient();
  const slugCandidates = buildSlugCandidates(slug);
  const { data: localizedData, error: localizedError } = await supabase
    .from('category_translations')
    .select('category_id, locale, slug')
    .eq('locale', locale)
    .in('slug', slugCandidates);

  throwIfSupabaseError(localizedError, 'Unable to resolve category slug');

  let categoryId =
    pickMatchingLookupRow(
      (localizedData ?? []) as TranslationLookupRow[],
      slugCandidates,
      locale,
    )?.category_id ?? null;

  if (!categoryId) {
    const { data, error } = await supabase
      .from('category_translations')
      .select('category_id, locale, slug')
      .in('slug', slugCandidates);

    throwIfSupabaseError(error, 'Unable to resolve category slug');

    categoryId =
      pickMatchingLookupRow(
        (data ?? []) as TranslationLookupRow[],
        slugCandidates,
      )?.category_id ?? null;
  }

  if (!categoryId) {
    return { status: 'notFound' };
  }

  const categories = await listPublicCategories(locale);
  const category = categories.find((item) => item.id === categoryId);

  if (!category) {
    return { status: 'notFound' };
  }

  if (!matchesSlugCandidate(category.slug, slugCandidates)) {
    return {
      status: 'redirect',
      slug: category.slug,
    };
  }

  return {
    status: 'found',
    record: category,
  };
}

export async function resolveTag(
  locale: Locale,
  slug: string,
): Promise<ResolvedLocalizedRecord<BlogTaxonomy>> {
  const supabase = createSupabasePublicClient();
  const slugCandidates = buildSlugCandidates(slug);
  const { data: localizedData, error: localizedError } = await supabase
    .from('tag_translations')
    .select('tag_id, locale, slug')
    .eq('locale', locale)
    .in('slug', slugCandidates);

  throwIfSupabaseError(localizedError, 'Unable to resolve tag slug');

  let tagId =
    pickMatchingLookupRow(
      (localizedData ?? []) as TranslationLookupRow[],
      slugCandidates,
      locale,
    )?.tag_id ?? null;

  if (!tagId) {
    const { data, error } = await supabase
      .from('tag_translations')
      .select('tag_id, locale, slug')
      .in('slug', slugCandidates);

    throwIfSupabaseError(error, 'Unable to resolve tag slug');

    tagId =
      pickMatchingLookupRow(
        (data ?? []) as TranslationLookupRow[],
        slugCandidates,
      )?.tag_id ?? null;
  }

  if (!tagId) {
    return { status: 'notFound' };
  }

  const tags = await listPublicTags(locale);
  const tag = tags.find((item) => item.id === tagId);

  if (!tag) {
    return { status: 'notFound' };
  }

  if (!matchesSlugCandidate(tag.slug, slugCandidates)) {
    return {
      status: 'redirect',
      slug: tag.slug,
    };
  }

  return {
    status: 'found',
    record: tag,
  };
}

export async function getPublicPostViewCount(postId: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { count, error } = await supabase
    .from('post_views')
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('post_id', postId);

  throwIfSupabaseError(error, 'Unable to load post view count');

  return count ?? 0;
}
