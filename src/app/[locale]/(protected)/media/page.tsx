/* eslint-disable @next/next/no-img-element */

import { ContentFlashMessage } from '@/components/content/content-flash-message';
import { Button, Card, Input, Textarea, cardClassName } from '@/components/ui';
import { isSupportedLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import {
  deleteMediaAction,
  replaceMediaFileAction,
  updateMediaCopyAction,
  uploadMediaAction,
} from '@/lib/admin/actions';
import { requireRole } from '@/lib/auth/session';
import { listMediaAssets } from '@/lib/db/media';

type MediaPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

const SUCCESS_MESSAGES: Record<string, string> = {
  uploaded: 'media.feedback.uploaded',
  updated: 'media.feedback.updated',
  replaced: 'media.feedback.replaced',
  deleted: 'media.feedback.deleted',
};

const ERROR_MESSAGES: Record<string, string> = {
  invalidImage: 'media.errors.invalidImage',
  uploadFailed: 'media.errors.uploadFailed',
  updateFailed: 'media.errors.updateFailed',
  replaceFailed: 'media.errors.replaceFailed',
  deleteFailed: 'media.errors.deleteFailed',
};

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(locale: string, value: string) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function renderMediaPreview(
  publicUrl: string,
  mimeType: string,
  altText: string,
) {
  if (mimeType.startsWith('video/')) {
    return (
      <video
        src={publicUrl}
        controls
        preload="metadata"
        className="h-64 w-full rounded-[1.5rem] bg-slate-950 object-cover"
      />
    );
  }

  return (
    <img
      src={publicUrl}
      alt={altText}
      className="h-64 w-full rounded-[1.5rem] object-cover"
    />
  );
}

export default async function MediaPage({
  params,
  searchParams,
}: MediaPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  await requireRole(locale, ['admin', 'editor']);
  const messages = await getMessages(locale);
  const mediaAssets = await listMediaAssets();
  const uploadAction = uploadMediaAction.bind(null, locale);
  const successPath = resolvedSearchParams.success
    ? SUCCESS_MESSAGES[resolvedSearchParams.success]
    : null;
  const errorPath = resolvedSearchParams.error
    ? ERROR_MESSAGES[resolvedSearchParams.error]
    : null;

  return (
    <section className="w-full space-y-6">
      <Card tone="hero" className="p-8">
        <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
          {translateMessage(messages, 'media.eyebrow')}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--theme-foreground)]">
          {translateMessage(messages, 'media.title')}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--theme-muted)]">
          {translateMessage(messages, 'media.description')}
        </p>
      </Card>

      {successPath ? (
        <ContentFlashMessage
          tone="success"
          message={translateMessage(messages, successPath)}
        />
      ) : null}
      {errorPath ? (
        <ContentFlashMessage
          tone="error"
          message={translateMessage(messages, errorPath)}
        />
      ) : null}

      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-[var(--theme-foreground)]">
          {translateMessage(messages, 'media.uploadTitle')}
        </h2>
        <form action={uploadAction} className="mt-5 grid gap-4">
          <label className={cardClassName({ tone: 'dashed', className: 'space-y-3 rounded-[1.75rem] p-6' })}>
            <span className="text-sm font-semibold tracking-[0.12em] text-[var(--theme-accent)] uppercase">
              {translateMessage(messages, 'media.fileLabel')}
            </span>
            <span className="block text-sm leading-7 text-[var(--theme-muted)]">
              {translateMessage(messages, 'media.description')}
            </span>
            <Input
              type="file"
              name="file"
              accept="image/*,video/*"
              className="file:mr-4 file:rounded-full file:border-0 file:bg-[var(--theme-accent)] file:px-4 file:py-2 file:font-semibold file:text-white"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'media.altTextEnLabel')}
              </span>
              <Input
                type="text"
                name="altTextEn"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'media.altTextZhCnLabel')}
              </span>
              <Input
                type="text"
                name="altTextZhCn"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'media.captionEnLabel')}
              </span>
              <Textarea
                name="captionEn"
                rows={3}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'media.captionZhCnLabel')}
              </span>
              <Textarea
                name="captionZhCn"
                rows={3}
              />
            </label>
          </div>

          <div>
            <Button type="submit" variant="primary" size="lg">
              {translateMessage(messages, 'media.uploadButton')}
            </Button>
          </div>
        </form>
      </Card>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold text-[var(--theme-foreground)]">
          {translateMessage(messages, 'media.libraryTitle')}
        </h2>

        {mediaAssets.length === 0 ? (
          <div className={cardClassName({ tone: 'dashed', className: 'p-8 text-base leading-8 text-[var(--theme-muted)]' })}>
            {translateMessage(messages, 'media.emptyState')}
          </div>
        ) : (
          <div className="grid gap-5">
            {mediaAssets.map((mediaAsset) => {
              const updateCopy = updateMediaCopyAction.bind(
                null,
                locale,
                mediaAsset.id,
              );
              const replaceFile = replaceMediaFileAction.bind(
                null,
                locale,
                mediaAsset.id,
              );
              const deleteAsset = deleteMediaAction.bind(null, locale, mediaAsset.id);

              return (
                <Card
                  key={mediaAsset.id}
                  as="article"
                  className="grid gap-6 p-6 lg:grid-cols-[20rem_1fr]"
                >
                  <div className="space-y-4">
                    {renderMediaPreview(
                      mediaAsset.publicUrl,
                      mediaAsset.mimeType,
                      mediaAsset.translations[locale].altText ||
                        mediaAsset.fileName,
                    )}
                    <div className="space-y-1 text-sm text-[var(--theme-muted)]">
                      <p>{mediaAsset.fileName}</p>
                      <p>{mediaAsset.mimeType}</p>
                      <p>{formatFileSize(mediaAsset.fileSizeBytes)}</p>
                      <p>
                        {translateMessage(messages, 'media.createdLabel')}:{' '}
                        {formatDate(locale, mediaAsset.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <form action={updateCopy} className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'media.altTextEnLabel')}
                          </span>
                          <Input
                            type="text"
                            name="altTextEn"
                            defaultValue={mediaAsset.translations.en.altText}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'media.altTextZhCnLabel')}
                          </span>
                          <Input
                            type="text"
                            name="altTextZhCn"
                            defaultValue={mediaAsset.translations['zh-CN'].altText}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'media.captionEnLabel')}
                          </span>
                          <Textarea
                            name="captionEn"
                            rows={3}
                            defaultValue={mediaAsset.translations.en.caption}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'media.captionZhCnLabel')}
                          </span>
                          <Textarea
                            name="captionZhCn"
                            rows={3}
                            defaultValue={mediaAsset.translations['zh-CN'].caption}
                          />
                        </label>
                      </div>
                      <div>
                        <Button type="submit" variant="secondary" size="md">
                          {translateMessage(messages, 'media.saveCopyButton')}
                        </Button>
                      </div>
                    </form>

                    <form action={replaceFile} className="flex flex-wrap items-end gap-3">
                      <label className="grow space-y-2">
                        <span className="text-sm font-medium text-[var(--theme-foreground)]">
                          {translateMessage(messages, 'media.replaceFileLabel')}
                        </span>
                        <Input
                          type="file"
                          name="file"
                          accept="image/*,video/*"
                          className="file:mr-4 file:rounded-full file:border-0 file:bg-[var(--theme-accent)] file:px-4 file:py-2 file:font-semibold file:text-white"
                        />
                      </label>
                      <Button type="submit" variant="secondary" size="md">
                        {translateMessage(messages, 'media.replaceButton')}
                      </Button>
                    </form>

                    <form action={deleteAsset}>
                      <Button type="submit" variant="danger" size="md">
                        {translateMessage(messages, 'media.deleteButton')}
                      </Button>
                    </form>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
