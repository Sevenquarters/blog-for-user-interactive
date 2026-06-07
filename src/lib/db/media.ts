import 'server-only';

import { randomUUID } from 'node:crypto';

import type { Locale } from '@/i18n/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseStoragePublicUrl } from '@/lib/supabase/public';
import type { ContentMediaOption } from '@/types/content';
import type { MediaAssetRecord, MediaTranslationRecord } from '@/types/media';

import { throwIfSupabaseError } from './utils';

type MediaAssetRow = {
  id: string;
  uploaded_by: string;
  bucket_name: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  width: number | null;
  height: number | null;
  created_at: string;
  media_asset_translations:
    | Array<{
        locale: string;
        alt_text: string | null;
        caption: string | null;
      }>
    | null;
};

type SaveMediaInput = {
  uploaderId: string;
  file: File;
  translations: Record<'en' | 'zh-CN', MediaTranslationRecord>;
};

type UpdateMediaTranslationsInput = {
  mediaAssetId: string;
  translations: Record<'en' | 'zh-CN', MediaTranslationRecord>;
};

function sanitizeFileName(fileName: string) {
  const normalized = fileName
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'upload';
}

function buildStoragePath(uploaderId: string, fileName: string) {
  return `users/${uploaderId}/${Date.now()}-${randomUUID()}-${sanitizeFileName(fileName)}`;
}

function buildEmptyTranslations(): Record<'en' | 'zh-CN', MediaTranslationRecord> {
  return {
    en: {
      locale: 'en',
      altText: '',
      caption: '',
    },
    'zh-CN': {
      locale: 'zh-CN',
      altText: '',
      caption: '',
    },
  };
}

function mapMediaAsset(row: MediaAssetRow): MediaAssetRecord {
  const translations = buildEmptyTranslations();

  for (const translation of row.media_asset_translations ?? []) {
    if (translation.locale === 'en' || translation.locale === 'zh-CN') {
      const locale = translation.locale as 'en' | 'zh-CN';

      translations[locale] = {
        locale,
        altText: translation.alt_text ?? '',
        caption: translation.caption ?? '',
      };
    }
  }

  return {
    id: row.id,
    uploadedBy: row.uploaded_by,
    bucketName: row.bucket_name,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
    publicUrl: getSupabaseStoragePublicUrl(row.bucket_name, row.storage_path),
    translations,
  };
}

async function getMediaAssetRow(mediaAssetId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('media_assets')
    .select(
      `
        id,
        uploaded_by,
        bucket_name,
        storage_path,
        file_name,
        mime_type,
        file_size_bytes,
        width,
        height,
        created_at,
        media_asset_translations (
          locale,
          alt_text,
          caption
        )
      `,
    )
    .eq('id', mediaAssetId)
    .maybeSingle();

  throwIfSupabaseError(error, 'Unable to load media asset');

  return (data as MediaAssetRow | null) ?? null;
}

async function upsertMediaTranslations(input: UpdateMediaTranslationsInput) {
  const supabase = await createSupabaseServerClient();
  const rows = (
    Object.values(input.translations).map((translation) => ({
      media_asset_id: input.mediaAssetId,
      locale: translation.locale,
      alt_text: translation.altText.trim() || null,
      caption: translation.caption.trim() || null,
    })) as unknown[]
  ) as never;

  const { error } = await supabase.from('media_asset_translations').upsert(rows, {
    onConflict: 'media_asset_id,locale',
  });

  throwIfSupabaseError(error, 'Unable to save media translations');
}

function resolvePreferredMediaTranslation(
  asset: MediaAssetRecord,
  locale: Locale,
) {
  return asset.translations[locale] ?? asset.translations.en;
}

export async function listMediaAssets(limit?: number) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('media_assets')
    .select(
      `
        id,
        uploaded_by,
        bucket_name,
        storage_path,
        file_name,
        mime_type,
        file_size_bytes,
        width,
        height,
        created_at,
        media_asset_translations (
          locale,
          alt_text,
          caption
        )
      `,
    )
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  throwIfSupabaseError(error, 'Unable to list media assets');

  return ((data ?? []) as MediaAssetRow[]).map(mapMediaAsset);
}

export async function listContentMediaOptions(locale: Locale, limit = 18) {
  const assets = await listMediaAssets(limit);

  return assets.map((asset) => {
    const translation = resolvePreferredMediaTranslation(asset, locale);

    return {
      id: asset.id,
      fileName: asset.fileName,
      publicUrl: asset.publicUrl,
      altText: translation.altText,
      caption: translation.caption,
    } satisfies ContentMediaOption;
  });
}

export async function createMediaAsset(input: SaveMediaInput) {
  if (!input.file.type.startsWith('image/')) {
    throw new Error('Only image uploads are supported');
  }

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const storagePath = buildStoragePath(input.uploaderId, input.file.name);
  const bucketName = 'blog-media';
  const supabase = await createSupabaseServerClient();
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, buffer, {
      contentType: input.file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Unable to upload media file: ${uploadError.message}`);
  }

  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      uploaded_by: input.uploaderId,
      bucket_name: bucketName,
      storage_path: storagePath,
      file_name: input.file.name,
      mime_type: input.file.type,
      file_size_bytes: buffer.byteLength,
      width: null,
      height: null,
    } as never)
    .select('id')
    .single();

  if (error) {
    await supabase.storage.from(bucketName).remove([storagePath]);
    throw new Error(`Unable to create media asset: ${error.message}`);
  }

  const mediaAssetId = String((data as { id: string }).id);
  await upsertMediaTranslations({
    mediaAssetId,
    translations: input.translations,
  });

  return mediaAssetId;
}

export async function updateMediaTranslations(input: UpdateMediaTranslationsInput) {
  await upsertMediaTranslations(input);
}

export async function replaceMediaAssetFile(
  mediaAssetId: string,
  actorId: string,
  file: File,
) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image uploads are supported');
  }

  const existingAsset = await getMediaAssetRow(mediaAssetId);

  if (!existingAsset) {
    throw new Error('Media asset not found');
  }

  const supabase = await createSupabaseServerClient();
  const nextStoragePath = buildStoragePath(actorId, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(existingAsset.bucket_name)
    .upload(nextStoragePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Unable to replace media file: ${uploadError.message}`);
  }

  const { error: updateError } = await supabase
    .from('media_assets')
    .update({
      storage_path: nextStoragePath,
      file_name: file.name,
      mime_type: file.type,
      file_size_bytes: buffer.byteLength,
      width: null,
      height: null,
    } as never)
    .eq('id', mediaAssetId);

  if (updateError) {
    await supabase.storage.from(existingAsset.bucket_name).remove([nextStoragePath]);
    throw new Error(`Unable to update media record: ${updateError.message}`);
  }

  if (existingAsset.storage_path !== nextStoragePath) {
    await supabase.storage
      .from(existingAsset.bucket_name)
      .remove([existingAsset.storage_path]);
  }
}

export async function deleteMediaAsset(mediaAssetId: string) {
  const asset = await getMediaAssetRow(mediaAssetId);

  if (!asset) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const { error: storageError } = await supabase.storage
    .from(asset.bucket_name)
    .remove([asset.storage_path]);

  if (storageError) {
    throw new Error(`Unable to delete media file: ${storageError.message}`);
  }

  const { error } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', mediaAssetId);

  throwIfSupabaseError(error, 'Unable to delete media asset');
}
