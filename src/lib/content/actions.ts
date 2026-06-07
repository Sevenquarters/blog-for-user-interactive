'use server';

import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

import type { Locale } from '@/i18n/config';
import { buildLocalePath } from '@/lib/auth/paths';
import { requireUser } from '@/lib/auth/session';
import {
  createEmptyPostEditor,
  deleteManageablePost,
  generateSamplePublishedPosts,
  getManageablePostEditorRecord,
  saveManageablePost,
} from '@/lib/db/content-posts';
import { parsePositiveInteger, resolvePublishedAt, slugify } from '@/lib/content/editor';
import type { PostStatus, PostTranslationEditorRecord } from '@/types/content';

const ALLOWED_STATUSES: PostStatus[] = [
  'draft',
  'scheduled',
  'published',
  'archived',
];

function buildContentPath(locale: Locale, path = '/posts') {
  return buildLocalePath(locale, path);
}

function buildRedirectWithMessage(
  locale: Locale,
  path: string,
  queryKey: string,
  queryValue: string,
) {
  const basePath = buildContentPath(locale, path);
  const separator = basePath.includes('?') ? '&' : '?';

  return `${basePath}${separator}${queryKey}=${encodeURIComponent(queryValue)}`;
}

function readTrimmedValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim();
}

function readTranslation(
  formData: FormData,
  locale: 'en' | 'zh-CN',
): PostTranslationEditorRecord {
  const title = readTrimmedValue(formData, 'title');

  return {
    locale,
    title,
    slug: readTrimmedValue(formData, 'slug') || slugify(title),
    excerpt: readTrimmedValue(formData, 'excerpt'),
    contentText: readTrimmedValue(formData, 'contentText'),
    seoTitle: readTrimmedValue(formData, 'seoTitle'),
    seoDescription: readTrimmedValue(formData, 'seoDescription'),
    coverAlt: readTrimmedValue(formData, 'coverAlt'),
    isComplete: false,
  };
}

function isTranslationPublishReady(translation: PostTranslationEditorRecord) {
  return Boolean(
    translation.title.trim() &&
      translation.slug.trim() &&
      translation.contentText.trim(),
  );
}

function hasAtLeastOnePublishReadyTranslation(
  translations: PostTranslationEditorRecord[],
) {
  return translations.some((translation) =>
    isTranslationPublishReady(translation),
  );
}

function hasAtLeastOneTitledTranslation(
  translations: PostTranslationEditorRecord[],
) {
  return translations.some((translation) => translation.title.trim());
}

function normalizePublishedAtValue(value: string) {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString();
}

export async function savePostAction(
  locale: Locale,
  postId: string | null,
  formData: FormData,
) {
  const { user, profile } = await requireUser(locale);
  const returnPath = readTrimmedValue(formData, 'returnPath') || '/posts';
  const requestedStatus = readTrimmedValue(formData, 'status') as PostStatus;
  const requestedContentLocale = readTrimmedValue(formData, 'contentLocale');
  const contentLocale: 'en' | 'zh-CN' =
    requestedContentLocale === 'en' || requestedContentLocale === 'zh-CN'
      ? requestedContentLocale
      : locale;

  if (!ALLOWED_STATUSES.includes(requestedStatus)) {
    redirect(buildRedirectWithMessage(locale, returnPath, 'error', 'invalidStatus'));
  }

  const selectedTranslation = readTranslation(formData, contentLocale);
  const categoryId = readTrimmedValue(formData, 'categoryId') || null;
  const tagIds = formData
    .getAll('tagIds')
    .map((tagId) => String(tagId))
    .filter(Boolean);
  const readingTimeMinutes = parsePositiveInteger(
    readTrimmedValue(formData, 'readingTimeMinutes'),
  );
  const publishedAtInput = normalizePublishedAtValue(
    readTrimmedValue(formData, 'publishedAt'),
  );
  const isFeatured = formData.get('isFeatured') === 'on';
  const changeSummary = readTrimmedValue(formData, 'changeSummary') || null;

  if (requestedStatus === 'scheduled' && !publishedAtInput) {
    redirect(
      buildRedirectWithMessage(locale, returnPath, 'error', 'missingPublishDate'),
    );
  }

  let existingPostAuthorId = user.id;
  let translations: Record<'en' | 'zh-CN', PostTranslationEditorRecord> = {
    en: {
      locale: 'en',
      title: '',
      slug: '',
      excerpt: '',
      contentText: '',
      seoTitle: '',
      seoDescription: '',
      coverAlt: '',
      isComplete: false,
    },
    'zh-CN': {
      locale: 'zh-CN',
      title: '',
      slug: '',
      excerpt: '',
      contentText: '',
      seoTitle: '',
      seoDescription: '',
      coverAlt: '',
      isComplete: false,
    },
  };

  if (postId) {
    const editorRecord = await getManageablePostEditorRecord(
      postId,
      locale,
      profile.id,
      profile.role,
    );

    if (!editorRecord) {
      redirect(buildRedirectWithMessage(locale, '/posts', 'error', 'postNotFound'));
    }

    existingPostAuthorId = editorRecord.post.authorId;
    translations = editorRecord.post.translations;
  }

  translations = {
    ...translations,
    [contentLocale]: selectedTranslation,
  };

  if (!hasAtLeastOneTitledTranslation(Object.values(translations))) {
    redirect(
      buildRedirectWithMessage(locale, returnPath, 'error', 'missingTitles'),
    );
  }

  if (
    requestedStatus === 'published' &&
    !hasAtLeastOnePublishReadyTranslation(Object.values(translations))
  ) {
    redirect(
      buildRedirectWithMessage(
        locale,
        returnPath,
        'error',
        'incompletePublishedTranslations',
      ),
    );
  }

  try {
    const savedPostId = await saveManageablePost({
      postId: postId ?? undefined,
      postAuthorId: existingPostAuthorId,
      editorId: profile.id,
      categoryId,
      tagIds,
      status: requestedStatus,
      publishedAt: resolvePublishedAt(requestedStatus, publishedAtInput),
      readingTimeMinutes,
      isFeatured,
      changeSummary,
      translations,
    });

    redirect(
      buildRedirectWithMessage(
        locale,
        `/posts/${savedPostId}`,
        'success',
        postId ? 'saved' : 'created',
      ),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(buildRedirectWithMessage(locale, returnPath, 'error', 'saveFailed'));
  }
}

export async function deletePostAction(
  locale: Locale,
  postId: string,
) {
  await requireUser(locale);

  try {
    await deleteManageablePost(postId);
  } catch {
    redirect(buildRedirectWithMessage(locale, `/posts/${postId}`, 'error', 'deleteFailed'));
  }

  redirect(buildRedirectWithMessage(locale, '/posts', 'success', 'deleted'));
}

export async function generateDemoPostsAction(locale: Locale) {
  const { profile } = await requireUser(locale);

  try {
    const result = await generateSamplePublishedPosts(profile.id, locale);

    redirect(
      buildRedirectWithMessage(
        locale,
        '/posts',
        'success',
        result.alreadyExists ? 'demoExists' : 'demoCreated',
      ),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error('Failed to generate demo posts', error);
    redirect(buildRedirectWithMessage(locale, '/posts', 'error', 'demoFailed'));
  }
}

export async function loadNewPostEditor(locale: Locale) {
  return createEmptyPostEditor(locale);
}
