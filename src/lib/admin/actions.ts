'use server';

import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

import type { Locale } from '@/i18n/config';
import { buildLocalePath } from '@/lib/auth/paths';
import { requireRole } from '@/lib/auth/session';
import { deleteComment, updateCommentStatus } from '@/lib/db/comments';
import {
  createMediaAsset,
  deleteMediaAsset,
  isSupportedMediaMimeType,
  replaceMediaAssetFile,
  updateMediaTranslations,
} from '@/lib/db/media';
import {
  updateActiveThemeSetting,
  updateSiteSettings,
} from '@/lib/db/site-settings';
import { activateTheme, updateThemeTokens } from '@/lib/db/themes';
import type { CommentModerationStatus } from '@/types/comments';
import type { MediaTranslationRecord } from '@/types/media';
import type { ThemeTokens } from '@/types/theme';

function buildRedirectWithMessage(
  locale: Locale,
  path: string,
  queryKey: string,
  queryValue: string,
) {
  const basePath = buildLocalePath(locale, path);
  const separator = basePath.includes('?') ? '&' : '?';

  return `${basePath}${separator}${queryKey}=${encodeURIComponent(queryValue)}`;
}

function readTrimmedValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim();
}

function readMediaTranslations(formData: FormData) {
  return {
    en: {
      locale: 'en',
      altText: readTrimmedValue(formData, 'altTextEn'),
      caption: readTrimmedValue(formData, 'captionEn'),
    },
    'zh-CN': {
      locale: 'zh-CN',
      altText: readTrimmedValue(formData, 'altTextZhCn'),
      caption: readTrimmedValue(formData, 'captionZhCn'),
    },
  } satisfies Record<'en' | 'zh-CN', MediaTranslationRecord>;
}

function readThemeTokens(formData: FormData, prefix: 'light' | 'dark') {
  const suffix = prefix === 'light' ? 'Light' : 'Dark';

  return {
    background: readTrimmedValue(formData, `background${suffix}`),
    surface: readTrimmedValue(formData, `surface${suffix}`),
    foreground: readTrimmedValue(formData, `foreground${suffix}`),
    muted: readTrimmedValue(formData, `muted${suffix}`),
    accent: readTrimmedValue(formData, `accent${suffix}`),
    border: readTrimmedValue(formData, `border${suffix}`),
  } satisfies ThemeTokens;
}

function isThemeTokensComplete(tokens: ThemeTokens) {
  return Object.values(tokens).every((value) => value.trim());
}

function normalizePostsPerPage(value: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 10;
  }

  return parsed;
}

export async function uploadMediaAction(locale: Locale, formData: FormData) {
  const { profile } = await requireRole(locale, ['admin', 'editor']);
  const file = formData.get('file');

  if (
    !(file instanceof File) ||
    file.size === 0 ||
    !isSupportedMediaMimeType(file.type)
  ) {
    redirect(buildRedirectWithMessage(locale, '/media', 'error', 'invalidImage'));
  }

  try {
    await createMediaAsset({
      uploaderId: profile.id,
      file,
      translations: readMediaTranslations(formData),
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(buildRedirectWithMessage(locale, '/media', 'error', 'uploadFailed'));
  }

  redirect(buildRedirectWithMessage(locale, '/media', 'success', 'uploaded'));
}

export async function updateMediaCopyAction(
  locale: Locale,
  mediaAssetId: string,
  formData: FormData,
) {
  await requireRole(locale, ['admin', 'editor']);

  try {
    await updateMediaTranslations({
      mediaAssetId,
      translations: readMediaTranslations(formData),
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(buildRedirectWithMessage(locale, '/media', 'error', 'updateFailed'));
  }

  redirect(buildRedirectWithMessage(locale, '/media', 'success', 'updated'));
}

export async function replaceMediaFileAction(
  locale: Locale,
  mediaAssetId: string,
  formData: FormData,
) {
  const { profile } = await requireRole(locale, ['admin', 'editor']);
  const file = formData.get('file');

  if (
    !(file instanceof File) ||
    file.size === 0 ||
    !isSupportedMediaMimeType(file.type)
  ) {
    redirect(buildRedirectWithMessage(locale, '/media', 'error', 'invalidImage'));
  }

  try {
    await replaceMediaAssetFile(mediaAssetId, profile.id, file);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(buildRedirectWithMessage(locale, '/media', 'error', 'replaceFailed'));
  }

  redirect(buildRedirectWithMessage(locale, '/media', 'success', 'replaced'));
}

export async function deleteMediaAction(locale: Locale, mediaAssetId: string) {
  await requireRole(locale, ['admin', 'editor']);

  try {
    await deleteMediaAsset(mediaAssetId);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(buildRedirectWithMessage(locale, '/media', 'error', 'deleteFailed'));
  }

  redirect(buildRedirectWithMessage(locale, '/media', 'success', 'deleted'));
}

export async function updateSiteSettingsAction(
  locale: Locale,
  formData: FormData,
) {
  const { profile } = await requireRole(locale, ['admin']);
  const defaultLocale = readTrimmedValue(formData, 'defaultLocale') || 'zh-CN';
  const activeThemeId = readTrimmedValue(formData, 'activeThemeId') || null;
  const postsPerPage = normalizePostsPerPage(
    readTrimmedValue(formData, 'postsPerPage'),
  );

  try {
    await updateSiteSettings({
      editorId: profile.id,
      defaultLocale,
      activeThemeId,
      postsPerPage,
      translations: {
        en: {
          siteName: readTrimmedValue(formData, 'siteNameEn'),
          siteDescription: readTrimmedValue(formData, 'siteDescriptionEn'),
        },
        'zh-CN': {
          siteName: readTrimmedValue(formData, 'siteNameZhCn'),
          siteDescription: readTrimmedValue(formData, 'siteDescriptionZhCn'),
        },
      },
    });

    if (activeThemeId) {
      await activateTheme(activeThemeId);
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(buildRedirectWithMessage(locale, '/admin', 'error', 'saveFailed'));
  }

  redirect(buildRedirectWithMessage(locale, '/admin', 'success', 'saved'));
}

export async function updateThemeTokensAction(
  locale: Locale,
  themeId: string,
  formData: FormData,
) {
  await requireRole(locale, ['admin']);
  const lightTokens = readThemeTokens(formData, 'light');
  const darkTokens = readThemeTokens(formData, 'dark');

  if (
    !isThemeTokensComplete(lightTokens) ||
    !isThemeTokensComplete(darkTokens)
  ) {
    redirect(buildRedirectWithMessage(locale, '/admin', 'error', 'themeIncomplete'));
  }

  try {
    await updateThemeTokens({
      themeId,
      lightTokens,
      darkTokens,
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildRedirectWithMessage(locale, '/admin', 'error', 'themeSaveFailed'),
    );
  }

  redirect(buildRedirectWithMessage(locale, '/admin', 'success', 'themeSaved'));
}

export async function activateThemeAction(locale: Locale, themeId: string) {
  const { profile } = await requireRole(locale, ['admin']);

  try {
    await activateTheme(themeId);
    await updateActiveThemeSetting(profile.id, themeId);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildRedirectWithMessage(locale, '/admin', 'error', 'themeActivateFailed'),
    );
  }

  redirect(buildRedirectWithMessage(locale, '/admin', 'success', 'themeActivated'));
}

export async function updateCommentStatusAction(
  locale: Locale,
  commentId: string,
  status: CommentModerationStatus,
) {
  await requireRole(locale, ['admin', 'editor']);

  try {
    await updateCommentStatus(commentId, status);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildRedirectWithMessage(locale, '/comments', 'error', 'statusUpdateFailed'),
    );
  }

  redirect(buildRedirectWithMessage(locale, '/comments', 'success', 'statusUpdated'));
}

export async function deleteCommentAction(locale: Locale, commentId: string) {
  await requireRole(locale, ['admin', 'editor']);

  try {
    await deleteComment(commentId);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildRedirectWithMessage(locale, '/comments', 'error', 'deleteFailed'),
    );
  }

  redirect(buildRedirectWithMessage(locale, '/comments', 'success', 'deleted'));
}
