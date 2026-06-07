import 'server-only';

import { listCategories, listTags } from '@/lib/db/taxonomy';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n/config';
import {
  SAMPLE_POST_DEFINITIONS,
  blocksToContentText,
  buildDefaultTranslation,
  contentTextToBlocks,
  isTranslationComplete,
  resolvePublishedAt,
  slugify,
} from '@/lib/content/editor';
import type {
  ContentCategoryOption,
  ContentRevisionRecord,
  ContentScopeSummary,
  ContentTagOption,
  ManageablePostEditorRecord,
  ManageablePostListItem,
  PostStatus,
  PostTranslationEditorRecord,
} from '@/types/content';
import type { AppRole } from '@/types/database';

import { throwIfSupabaseError } from './utils';

type ContentTranslationRow = {
  id?: string;
  locale: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: unknown;
  seo_title: string | null;
  seo_description: string | null;
  cover_alt: string | null;
  is_complete: boolean;
};

type TaxonomyTranslationRow = {
  locale: string;
  name: string;
  slug: string;
  description?: string | null;
};

type RawManageablePostRow = {
  id: string;
  author_id: string;
  status: PostStatus;
  published_at: string | null;
  updated_at: string;
  reading_time_minutes: number | null;
  is_featured: boolean;
  categories:
    | Array<{
        id: string;
        category_translations: TaxonomyTranslationRow[] | null;
      }>
    | null;
  post_translations: ContentTranslationRow[] | null;
  post_tags:
    | Array<{
        tags:
          | {
              id: string;
              tag_translations: TaxonomyTranslationRow[] | null;
            }
          | null;
      }>
    | null;
};

type RawRevisionRow = {
  id: string;
  revision_number: number;
  change_summary: string | null;
  created_at: string;
  edited_by: string;
};

type SavePostInput = {
  postId?: string;
  postAuthorId: string;
  editorId: string;
  categoryId: string | null;
  tagIds: string[];
  status: PostStatus;
  publishedAt: string | null;
  readingTimeMinutes: number | null;
  isFeatured: boolean;
  changeSummary: string | null;
  translations: Record<'en' | 'zh-CN', PostTranslationEditorRecord>;
};

const MANAGEABLE_POST_SELECT = `
  id,
  author_id,
  status,
  published_at,
  updated_at,
  reading_time_minutes,
  is_featured,
  categories (
    id,
    category_translations (
      locale,
      name,
      slug,
      description
    )
  ),
  post_translations (
    id,
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

function mapCategoryOption(
  row:
    | Array<{
        id: string;
        category_translations: TaxonomyTranslationRow[] | null;
      }>
    | {
        id: string;
        category_translations: TaxonomyTranslationRow[] | null;
      }
    | null
    | undefined,
  locale: Locale,
): ContentCategoryOption | null {
  if (!row) {
    return null;
  }

  const resolvedRow = Array.isArray(row) ? row[0] : row;

  if (!resolvedRow) {
    return null;
  }

  const translation =
    resolvedRow.category_translations?.find((item) => item.locale === locale) ??
    resolvedRow.category_translations?.[0];

  if (!translation) {
    return null;
  }

  return {
    id: resolvedRow.id,
    slug: translation.slug,
    name: translation.name,
  };
}

function mapTagOptions(
  rows: RawManageablePostRow['post_tags'],
  locale: Locale,
): ContentTagOption[] {
  return (rows ?? [])
    .flatMap((row) => {
      const tag = row.tags;

      if (!tag) {
        return [];
      }

      const translation =
        tag.tag_translations?.find((item) => item.locale === locale) ??
        tag.tag_translations?.[0];

      if (!translation) {
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

function mapEditorTranslation(
  translation: ContentTranslationRow | null | undefined,
  locale: 'en' | 'zh-CN',
): PostTranslationEditorRecord {
  if (!translation) {
    return buildDefaultTranslation(locale);
  }

  const editorRecord = {
    locale,
    title: translation.title,
    slug: translation.slug,
    excerpt: translation.excerpt ?? '',
    contentText: blocksToContentText(translation.content),
    seoTitle: translation.seo_title ?? '',
    seoDescription: translation.seo_description ?? '',
    coverAlt: translation.cover_alt ?? '',
    isComplete: translation.is_complete,
  } satisfies PostTranslationEditorRecord;

  return editorRecord;
}

function mapManageablePost(
  row: RawManageablePostRow,
  locale: Locale,
): ManageablePostListItem {
  const enTranslation = row.post_translations?.find(
    (translation) => translation.locale === 'en',
  );
  const zhTranslation = row.post_translations?.find(
    (translation) => translation.locale === 'zh-CN',
  );

  return {
    id: row.id,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    readingTimeMinutes: row.reading_time_minutes,
    isFeatured: row.is_featured,
    category: mapCategoryOption(row.categories, locale),
    tags: mapTagOptions(row.post_tags, locale),
    translations: {
      en: mapEditorTranslation(enTranslation, 'en'),
      'zh-CN': mapEditorTranslation(zhTranslation, 'zh-CN'),
    },
  };
}

async function getPostRevisions(postId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('post_revisions')
    .select('id, revision_number, change_summary, created_at, edited_by')
    .eq('post_id', postId)
    .order('revision_number', { ascending: false });

  throwIfSupabaseError(error, 'Unable to load post revisions');

  return ((data ?? []) as RawRevisionRow[]).map(
    (revision) =>
      ({
        id: revision.id,
        revisionNumber: revision.revision_number,
        changeSummary: revision.change_summary,
        createdAt: revision.created_at,
        editedBy: revision.edited_by,
      }) satisfies ContentRevisionRecord,
  );
}

async function getNextRevisionNumber(postId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('post_revisions')
    .select('revision_number')
    .eq('post_id', postId)
    .order('revision_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to resolve next post revision number');

  return (
    Number((data as { revision_number?: number } | null)?.revision_number ?? 0) +
    1
  );
}

async function insertRevision(
  postId: string,
  input: SavePostInput,
) {
  const supabase = await createSupabaseServerClient();
  const revisionNumber = await getNextRevisionNumber(postId);
  const snapshot = {
    post: {
      status: input.status,
      publishedAt: input.publishedAt,
      readingTimeMinutes: input.readingTimeMinutes,
      isFeatured: input.isFeatured,
      categoryId: input.categoryId,
      tagIds: input.tagIds,
    },
    translations: {
      en: input.translations.en,
      'zh-CN': input.translations['zh-CN'],
    },
  };

  const { error } = await supabase.from('post_revisions').insert({
    post_id: postId,
    translation_id: null,
    revision_number: revisionNumber,
    edited_by: input.editorId,
    snapshot,
    change_summary: input.changeSummary,
  });

  throwIfSupabaseError(error, 'Unable to create post revision');
}

function buildScopeSummary(role: AppRole): ContentScopeSummary {
  return {
    role,
    canManageAllPosts: role === 'admin' || role === 'editor',
  };
}

function buildSavedTranslation(
  translation: PostTranslationEditorRecord,
): ContentTranslationRow {
  const normalizedTitle = translation.title.trim();
  const normalizedSlug = (
    translation.slug.trim() || slugify(normalizedTitle)
  ).trim();
  const contentText = translation.contentText.trim();

  return {
    locale: translation.locale,
    title: normalizedTitle,
    slug: normalizedSlug,
    excerpt: translation.excerpt.trim() || null,
    content: contentTextToBlocks(contentText),
    seo_title: translation.seoTitle.trim() || null,
    seo_description: translation.seoDescription.trim() || null,
    cover_alt: translation.coverAlt.trim() || null,
    is_complete: isTranslationComplete({
      title: normalizedTitle,
      slug: normalizedSlug,
      excerpt: translation.excerpt,
      contentText,
      seoTitle: translation.seoTitle,
      seoDescription: translation.seoDescription,
      coverAlt: translation.coverAlt,
    }),
  };
}

function hasMeaningfulTranslationContent(
  translation: PostTranslationEditorRecord,
) {
  return Boolean(
    translation.title.trim() ||
      translation.slug.trim() ||
      translation.excerpt.trim() ||
      translation.contentText.trim() ||
      translation.seoTitle.trim() ||
      translation.seoDescription.trim() ||
      translation.coverAlt.trim(),
  );
}

async function syncPostTags(postId: string, tagIds: string[]) {
  const supabase = await createSupabaseServerClient();
  const { error: deleteError } = await supabase
    .from('post_tags')
    .delete()
    .eq('post_id', postId);

  throwIfSupabaseError(deleteError, 'Unable to reset post tags');

  if (tagIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from('post_tags').insert(
    tagIds.map((tagId) => ({
      post_id: postId,
      tag_id: tagId,
    })) as never,
  );

  throwIfSupabaseError(insertError, 'Unable to save post tags');
}

async function createOrUpdatePostRecord(input: SavePostInput) {
  const supabase = await createSupabaseServerClient();

  if (!input.postId) {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: input.postAuthorId,
        category_id: input.categoryId,
        status: input.status,
        published_at: input.publishedAt,
        is_featured: input.isFeatured,
        reading_time_minutes: input.readingTimeMinutes,
      } as never)
      .select('id')
      .single();

    throwIfSupabaseError(error, 'Unable to create post');

    return String((data as { id: string }).id);
  }

  const { error } = await supabase
    .from('posts')
    .update({
      category_id: input.categoryId,
      status: input.status,
      published_at: input.publishedAt,
      is_featured: input.isFeatured,
      reading_time_minutes: input.readingTimeMinutes,
    } as never)
    .eq('id', input.postId);

  throwIfSupabaseError(error, 'Unable to update post');

  return input.postId;
}

async function upsertTranslations(
  postId: string,
  translations: SavePostInput['translations'],
) {
  const supabase = await createSupabaseServerClient();
  const preparedTranslations = Object.values(translations)
    .filter((translation) => hasMeaningfulTranslationContent(translation))
    .map((translation) => buildSavedTranslation(translation));
  const localesToKeep = new Set(preparedTranslations.map((row) => row.locale));

  for (const locale of ['en', 'zh-CN'] as const) {
    if (localesToKeep.has(locale)) {
      continue;
    }

    const { error: deleteError } = await supabase
      .from('post_translations')
      .delete()
      .eq('post_id', postId)
      .eq('locale', locale);

    throwIfSupabaseError(deleteError, 'Unable to prune empty post translations');
  }

  if (preparedTranslations.length === 0) {
    return;
  }

  const translationRows = (preparedTranslations.map((row) => ({
    post_id: postId,
    locale: row.locale,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    cover_alt: row.cover_alt,
    is_complete: row.is_complete,
  })) as unknown[]) as never;

  const { error } = await supabase.from('post_translations').upsert(
    translationRows,
    {
      onConflict: 'post_id,locale',
    },
  );

  throwIfSupabaseError(error, 'Unable to save post translations');
}

export async function listManageablePosts(
  locale: Locale,
  actorId: string,
  role: AppRole,
) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('posts')
    .select(MANAGEABLE_POST_SELECT)
    .order('updated_at', { ascending: false });

  if (role === 'author') {
    query = query.eq('author_id', actorId);
  }

  const { data, error } = await query;

  throwIfSupabaseError(error, 'Unable to load manageable posts');

  return {
    posts: ((data ?? []) as unknown as RawManageablePostRow[]).map((row) =>
      mapManageablePost(row, locale),
    ),
    scope: buildScopeSummary(role),
  };
}

export async function getPostEditorOptions(locale: Locale) {
  const [categories, tags] = await Promise.all([
    listCategories(locale),
    listTags(locale),
  ]);

  return {
    categories: categories.map(
      (category) =>
        ({
          id: category.id,
          slug: category.slug,
          name: category.name,
        }) satisfies ContentCategoryOption,
    ),
    tags: tags.map(
      (tag) =>
        ({
          id: tag.id,
          slug: tag.slug,
          name: tag.name,
        }) satisfies ContentTagOption,
    ),
  };
}

export async function getManageablePostEditorRecord(
  postId: string,
  locale: Locale,
  actorId: string,
  role: AppRole,
) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('posts')
    .select(MANAGEABLE_POST_SELECT)
    .eq('id', postId);

  if (role === 'author') {
    query = query.eq('author_id', actorId);
  }

  const { data, error } = await query.maybeSingle();

  throwIfSupabaseError(error, 'Unable to load editable post');

  if (!data) {
    return null;
  }

  const post = data as unknown as RawManageablePostRow;
  const [editorOptions, revisions] = await Promise.all([
    getPostEditorOptions(locale),
    getPostRevisions(postId),
  ]);

  return {
    post: {
      ...mapManageablePost(post, locale),
      authorId: post.author_id,
      revisions,
    } satisfies ManageablePostEditorRecord,
    ...editorOptions,
  };
}

export async function createEmptyPostEditor(locale: Locale) {
  const editorOptions = await getPostEditorOptions(locale);

  return {
    post: {
      id: '',
      authorId: '',
      status: 'draft',
      publishedAt: null,
      updatedAt: new Date().toISOString(),
      readingTimeMinutes: null,
      isFeatured: false,
      category: null,
      tags: [],
      translations: {
        en: buildDefaultTranslation('en'),
        'zh-CN': buildDefaultTranslation('zh-CN'),
      },
      revisions: [],
    } satisfies ManageablePostEditorRecord,
    ...editorOptions,
  };
}

export async function saveManageablePost(input: SavePostInput) {
  const postId = await createOrUpdatePostRecord(input);

  await upsertTranslations(postId, input.translations);
  await syncPostTags(postId, input.tagIds);
  await insertRevision(postId, input);

  return postId;
}

export async function deleteManageablePost(postId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('posts').delete().eq('id', postId);

  throwIfSupabaseError(error, 'Unable to delete post');
}

function buildSampleSlug(baseSlug: string, authorId: string, index: number) {
  return `${baseSlug}-${authorId.slice(0, 6)}-${index + 1}`;
}

export async function generateSamplePublishedPosts(
  authorId: string,
  locale: Locale,
) {
  const existingPosts = await listManageablePosts(locale, authorId, 'author');
  const { categories, tags } = await getPostEditorOptions(locale);
  const existingSlugs = new Set(
    existingPosts.posts.flatMap((post) => [
      post.translations.en.slug,
      post.translations['zh-CN'].slug,
    ]),
  );

  let createdCount = 0;

  for (const [index, samplePost] of SAMPLE_POST_DEFINITIONS.entries()) {
    const categoryId = samplePost.categorySlug
      ? categories.find((category) => category.slug === samplePost.categorySlug)?.id ??
        null
      : null;
    const tagIds = samplePost.tagSlugs
      .map((tagSlug) => tags.find((tag) => tag.slug === tagSlug)?.id ?? null)
      .filter((tagId): tagId is string => Boolean(tagId));
    const expectedEnSlug = buildSampleSlug(
      samplePost.translations.en.slug,
      authorId,
      index,
    );
    const expectedZhSlug = buildSampleSlug(
      samplePost.translations['zh-CN'].slug,
      authorId,
      index,
    );

    if (existingSlugs.has(expectedEnSlug) || existingSlugs.has(expectedZhSlug)) {
      continue;
    }

    const translations = {
      en: {
        locale: 'en',
        title: samplePost.translations.en.title,
        slug: expectedEnSlug,
        excerpt: samplePost.translations.en.excerpt,
        contentText: samplePost.translations.en.contentText,
        seoTitle: samplePost.translations.en.seoTitle,
        seoDescription: samplePost.translations.en.seoDescription,
        coverAlt: samplePost.translations.en.coverAlt,
        isComplete: true,
      },
      'zh-CN': {
        locale: 'zh-CN',
        title: samplePost.translations['zh-CN'].title,
        slug: expectedZhSlug,
        excerpt: samplePost.translations['zh-CN'].excerpt,
        contentText: samplePost.translations['zh-CN'].contentText,
        seoTitle: samplePost.translations['zh-CN'].seoTitle,
        seoDescription: samplePost.translations['zh-CN'].seoDescription,
        coverAlt: samplePost.translations['zh-CN'].coverAlt,
        isComplete: true,
      },
    } satisfies SavePostInput['translations'];

    await saveManageablePost({
      postAuthorId: authorId,
      editorId: authorId,
      categoryId,
      tagIds,
      status: samplePost.status,
      publishedAt: resolvePublishedAt(samplePost.status, samplePost.publishedAt),
      readingTimeMinutes: samplePost.readingTimeMinutes,
      isFeatured: samplePost.isFeatured,
      changeSummary: samplePost.changeSummary,
      translations,
    });

    createdCount += 1;
  }

  return {
    createdCount,
    alreadyExists: createdCount === 0,
  };
}
