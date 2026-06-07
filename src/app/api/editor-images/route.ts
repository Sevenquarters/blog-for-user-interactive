import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getProfileById } from '@/lib/db/profiles';
import {
  createMediaAsset,
  getMediaAssetById,
  isSupportedMediaMimeType,
  mapMediaAssetToEditorMediaOption,
} from '@/lib/db/media';
import type { Locale } from '@/i18n/config';
import type { MediaTranslationRecord } from '@/types/media';

function readTrimmedValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim();
}

function readLocale(formData: FormData): Locale {
  const value = readTrimmedValue(formData, 'locale');

  return value === 'en' ? 'en' : 'zh-CN';
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

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getProfileById(user.id);

    if (
      !profile ||
      (profile.role !== 'admin' &&
        profile.role !== 'editor' &&
        profile.role !== 'author')
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File) || file.size === 0 || !isSupportedMediaMimeType(file.type)) {
      return NextResponse.json({ error: 'Invalid media file' }, { status: 400 });
    }

    const locale = readLocale(formData);
    const mediaAssetId = await createMediaAsset({
      uploaderId: profile.id,
      file,
      translations: readMediaTranslations(formData),
    });
    const mediaAsset = await getMediaAssetById(mediaAssetId);

    if (!mediaAsset) {
      return NextResponse.json(
        { error: 'Created media asset could not be reloaded' },
        { status: 500 },
      );
    }

    const mediaOption = mapMediaAssetToEditorMediaOption(mediaAsset, locale);

    return NextResponse.json({ media: mediaOption });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to upload media';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
