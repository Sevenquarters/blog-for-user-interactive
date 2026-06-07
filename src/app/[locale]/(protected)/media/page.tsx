/* eslint-disable @next/next/no-img-element */

import { ContentFlashMessage } from '@/components/content/content-flash-message';
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
      <div className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
          {translateMessage(messages, 'media.eyebrow')}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--theme-foreground)]">
          {translateMessage(messages, 'media.title')}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--theme-muted)]">
          {translateMessage(messages, 'media.description')}
        </p>
      </div>

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

      <section className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
        <h2 className="text-2xl font-semibold text-[var(--theme-foreground)]">
          {translateMessage(messages, 'media.uploadTitle')}
        </h2>
        <form action={uploadAction} className="mt-5 grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--theme-foreground)]">
              {translateMessage(messages, 'media.fileLabel')}
            </span>
            <input
              type="file"
              name="file"
              accept="image/*"
              className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'media.altTextEnLabel')}
              </span>
              <input
                type="text"
                name="altTextEn"
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'media.altTextZhCnLabel')}
              </span>
              <input
                type="text"
                name="altTextZhCn"
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'media.captionEnLabel')}
              </span>
              <textarea
                name="captionEn"
                rows={3}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'media.captionZhCnLabel')}
              </span>
              <textarea
                name="captionZhCn"
                rows={3}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              />
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--theme-accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(194,65,12,0.3)] transition hover:-translate-y-0.5"
            >
              {translateMessage(messages, 'media.uploadButton')}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold text-[var(--theme-foreground)]">
          {translateMessage(messages, 'media.libraryTitle')}
        </h2>

        {mediaAssets.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 text-base leading-8 text-[var(--theme-muted)]">
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
                <article
                  key={mediaAsset.id}
                  className="grid gap-6 rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] lg:grid-cols-[20rem_1fr]"
                >
                  <div className="space-y-4">
                    <img
                      src={mediaAsset.publicUrl}
                      alt={
                        mediaAsset.translations[locale].altText ||
                        mediaAsset.fileName
                      }
                      className="h-64 w-full rounded-[1.5rem] object-cover"
                    />
                    <div className="space-y-1 text-sm text-[var(--theme-muted)]">
                      <p>{mediaAsset.fileName}</p>
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
                          <input
                            type="text"
                            name="altTextEn"
                            defaultValue={mediaAsset.translations.en.altText}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'media.altTextZhCnLabel')}
                          </span>
                          <input
                            type="text"
                            name="altTextZhCn"
                            defaultValue={mediaAsset.translations['zh-CN'].altText}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'media.captionEnLabel')}
                          </span>
                          <textarea
                            name="captionEn"
                            rows={3}
                            defaultValue={mediaAsset.translations.en.caption}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'media.captionZhCnLabel')}
                          </span>
                          <textarea
                            name="captionZhCn"
                            rows={3}
                            defaultValue={mediaAsset.translations['zh-CN'].caption}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                      </div>
                      <div>
                        <button
                          type="submit"
                          className="rounded-full border border-[var(--theme-border)] px-5 py-3 text-sm font-semibold text-[var(--theme-foreground)]"
                        >
                          {translateMessage(messages, 'media.saveCopyButton')}
                        </button>
                      </div>
                    </form>

                    <form action={replaceFile} className="flex flex-wrap items-end gap-3">
                      <label className="grow space-y-2">
                        <span className="text-sm font-medium text-[var(--theme-foreground)]">
                          {translateMessage(messages, 'media.replaceFileLabel')}
                        </span>
                        <input
                          type="file"
                          name="file"
                          accept="image/*"
                          className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                        />
                      </label>
                      <button
                        type="submit"
                        className="rounded-full border border-[var(--theme-border)] px-5 py-3 text-sm font-semibold text-[var(--theme-foreground)]"
                      >
                        {translateMessage(messages, 'media.replaceButton')}
                      </button>
                    </form>

                    <form action={deleteAsset}>
                      <button
                        type="submit"
                        className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700"
                      >
                        {translateMessage(messages, 'media.deleteButton')}
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
