/* eslint-disable @next/next/no-img-element */

import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import type { Locale } from '@/i18n/config';
import type {
  ContentCategoryOption,
  ContentMediaOption,
  ContentTagOption,
  ManageablePostEditorRecord,
} from '@/types/content';
import { deletePostAction, savePostAction } from '@/lib/content/actions';

type PostEditorFormProps = {
  locale: Locale;
  post: ManageablePostEditorRecord;
  categories: ContentCategoryOption[];
  tags: ContentTagOption[];
  mediaOptions: ContentMediaOption[];
};

function hasMeaningfulTranslationContent(
  translation: ManageablePostEditorRecord['translations']['en'],
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

function resolveEditorTranslation(
  post: ManageablePostEditorRecord,
  locale: Locale,
) {
  const localizedTranslation = post.translations[locale];

  if (hasMeaningfulTranslationContent(localizedTranslation)) {
    return localizedTranslation;
  }

  return (
    Object.values(post.translations).find((translation) =>
      hasMeaningfulTranslationContent(translation),
    ) ?? localizedTranslation
  );
}

function toDatetimeLocalValue(value: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (part: number) => String(part).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export async function PostEditorForm({
  locale,
  post,
  categories,
  tags,
  mediaOptions,
}: PostEditorFormProps) {
  const messages = await getMessages(locale);
  const isEditing = Boolean(post.id);
  const saveAction = savePostAction.bind(null, locale, isEditing ? post.id : null);
  const deleteAction = isEditing
    ? deletePostAction.bind(null, locale, post.id)
    : null;
  const selectedTagIds = new Set(post.tags.map((tag) => tag.id));
  const translation = resolveEditorTranslation(post, locale);
  const selectedHeroMediaId = post.heroMedia?.id ?? '';

  return (
    <div className="space-y-6">
      <form action={saveAction} className="space-y-6">
        <input
          type="hidden"
          name="returnPath"
          value={isEditing ? `/posts/${post.id}` : '/posts/new'}
        />
        <input type="hidden" name="contentLocale" value={translation.locale} />

        <section className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--theme-foreground)]">
                  {translateMessage(messages, 'content.fields.status')}
                </span>
              <select
                name="status"
                defaultValue={post.status}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              >
                <option value="draft">
                  {translateMessage(messages, 'content.status.draft')}
                </option>
                <option value="scheduled">
                  {translateMessage(messages, 'content.status.scheduled')}
                </option>
                <option value="published">
                  {translateMessage(messages, 'content.status.published')}
                </option>
                <option value="archived">
                  {translateMessage(messages, 'content.status.archived')}
                </option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'content.fields.publishTime')}
              </span>
              <input
                type="datetime-local"
                name="publishedAt"
                defaultValue={toDatetimeLocalValue(post.publishedAt)}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'content.fields.readingTime')}
              </span>
              <input
                type="number"
                min="1"
                name="readingTimeMinutes"
                defaultValue={post.readingTimeMinutes ?? ''}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'content.fields.category')}
              </span>
              <select
                name="categoryId"
                defaultValue={post.category?.id ?? ''}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              >
                <option value="">
                  {translateMessage(messages, 'content.fields.none')}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-3 rounded-full border border-[var(--theme-border)] bg-white/70 px-4 py-2 text-sm text-[var(--theme-foreground)]">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={post.isFeatured}
              />
              {translateMessage(messages, 'content.fields.featured')}
            </label>
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-sm font-medium text-[var(--theme-foreground)]">
              {translateMessage(messages, 'content.fields.changeSummary')}
            </span>
            <input
              type="text"
              name="changeSummary"
              placeholder={translateMessage(
                messages,
                'content.fields.changeSummaryPlaceholder',
              )}
              className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
            />
          </label>

          <fieldset className="mt-5 space-y-3">
            <legend className="text-sm font-medium text-[var(--theme-foreground)]">
              {translateMessage(messages, 'content.fields.tags')}
            </legend>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="inline-flex items-center gap-3 rounded-full border border-[var(--theme-border)] bg-white/70 px-4 py-2 text-sm text-[var(--theme-foreground)]"
                >
                  <input
                    type="checkbox"
                    name="tagIds"
                    value={tag.id}
                    defaultChecked={selectedTagIds.has(tag.id)}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6 space-y-3">
            <legend className="text-sm font-medium text-[var(--theme-foreground)]">
              {translateMessage(messages, 'content.fields.coverImage')}
            </legend>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <label className="flex cursor-pointer flex-col justify-between rounded-[1.5rem] border border-[var(--theme-border)] bg-white/80 p-4 text-sm text-[var(--theme-foreground)]">
                <span className="inline-flex items-center gap-3">
                  <input
                    type="radio"
                    name="heroMediaId"
                    value=""
                    defaultChecked={selectedHeroMediaId === ''}
                  />
                  {translateMessage(messages, 'content.fields.none')}
                </span>
                <span className="mt-6 text-sm text-[var(--theme-muted)]">
                  {translateMessage(messages, 'content.fields.coverImageEmpty')}
                </span>
              </label>

              {mediaOptions.map((mediaOption) => (
                <label
                  key={mediaOption.id}
                  className="flex cursor-pointer flex-col gap-3 rounded-[1.5rem] border border-[var(--theme-border)] bg-white/80 p-4 text-sm text-[var(--theme-foreground)]"
                >
                  <span className="inline-flex items-center gap-3">
                    <input
                      type="radio"
                      name="heroMediaId"
                      value={mediaOption.id}
                      defaultChecked={selectedHeroMediaId === mediaOption.id}
                    />
                    <span className="font-medium">{mediaOption.fileName}</span>
                  </span>
                  <img
                    src={mediaOption.publicUrl}
                    alt={mediaOption.altText || mediaOption.fileName}
                    className="h-40 w-full rounded-[1rem] object-cover"
                  />
                  <div className="space-y-1 text-sm text-[var(--theme-muted)]">
                    <p>{mediaOption.altText || mediaOption.fileName}</p>
                    {mediaOption.caption ? <p>{mediaOption.caption}</p> : null}
                  </div>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'content.fields.title')}
              </span>
              <input
                type="text"
                name="title"
                defaultValue={translation.title}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'content.fields.slug')}
              </span>
              <input
                type="text"
                name="slug"
                defaultValue={translation.slug}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'content.fields.excerpt')}
              </span>
              <textarea
                name="excerpt"
                defaultValue={translation.excerpt}
                rows={3}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'content.fields.content')}
              </span>
              <textarea
                name="contentText"
                defaultValue={translation.contentText}
                rows={14}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm leading-7 text-[var(--theme-foreground)]"
              />
            </label>

            <div className="grid gap-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[var(--theme-foreground)]">
                  {translateMessage(messages, 'content.fields.seoTitle')}
                </span>
                <input
                  type="text"
                  name="seoTitle"
                  defaultValue={translation.seoTitle}
                  className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[var(--theme-foreground)]">
                  {translateMessage(messages, 'content.fields.seoDescription')}
                </span>
                <textarea
                  name="seoDescription"
                  defaultValue={translation.seoDescription}
                  rows={3}
                  className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[var(--theme-foreground)]">
                  {translateMessage(messages, 'content.fields.coverAlt')}
                </span>
                <input
                  type="text"
                  name="coverAlt"
                  defaultValue={translation.coverAlt}
                  className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                />
              </label>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--theme-accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(194,65,12,0.3)] transition hover:-translate-y-0.5"
          >
            {translateMessage(
              messages,
              isEditing ? 'content.savePost' : 'content.createPost',
            )}
          </button>
        </div>
      </form>

      {deleteAction ? (
        <form action={deleteAction}>
          <button
            type="submit"
            className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700"
          >
            {translateMessage(messages, 'content.deletePost')}
          </button>
        </form>
      ) : null}
    </div>
  );
}
