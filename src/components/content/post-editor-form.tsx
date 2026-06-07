import { RichPostEditor } from '@/components/content/rich-post-editor';
import type { Locale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import { deletePostAction, savePostAction } from '@/lib/content/actions';
import type {
  ContentCategoryOption,
  ContentMediaOption,
  ContentTagOption,
  ManageablePostEditorRecord,
} from '@/types/content';

type PostEditorFormProps = {
  locale: Locale;
  post: ManageablePostEditorRecord;
  categories: ContentCategoryOption[];
  tags: ContentTagOption[];
  mediaOptions: ContentMediaOption[];
};

function resolveEditorTranslation(
  post: ManageablePostEditorRecord,
  locale: Locale,
) {
  return post.translations[locale];
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
  const editorLabels = {
    paragraph: translateMessage(messages, 'content.editor.paragraph'),
    heading1: translateMessage(messages, 'content.editor.heading1'),
    heading2: translateMessage(messages, 'content.editor.heading2'),
    heading3: translateMessage(messages, 'content.editor.heading3'),
    bold: translateMessage(messages, 'content.editor.bold'),
    italic: translateMessage(messages, 'content.editor.italic'),
    underline: translateMessage(messages, 'content.editor.underline'),
    link: translateMessage(messages, 'content.editor.link'),
    blockquote: translateMessage(messages, 'content.editor.blockquote'),
    codeBlock: translateMessage(messages, 'content.editor.codeBlock'),
    bulletList: translateMessage(messages, 'content.editor.bulletList'),
    orderedList: translateMessage(messages, 'content.editor.orderedList'),
    horizontalRule: translateMessage(messages, 'content.editor.horizontalRule'),
    media: translateMessage(messages, 'content.editor.media'),
    emoji: translateMessage(messages, 'content.editor.emoji'),
    imageDialogTitle: translateMessage(messages, 'content.editor.imageDialogTitle'),
    imageDialogClose: translateMessage(messages, 'content.editor.imageDialogClose'),
    imageDialogExisting: translateMessage(
      messages,
      'content.editor.imageDialogExisting',
    ),
    imageDialogEmpty: translateMessage(messages, 'content.editor.imageDialogEmpty'),
    imageDialogInsert: translateMessage(
      messages,
      'content.editor.imageDialogInsert',
    ),
    imageDialogFilterAll: translateMessage(
      messages,
      'content.editor.imageDialogFilterAll',
    ),
    imageDialogFilterImages: translateMessage(
      messages,
      'content.editor.imageDialogFilterImages',
    ),
    imageDialogFilterVideos: translateMessage(
      messages,
      'content.editor.imageDialogFilterVideos',
    ),
    linkBubbleUrl: translateMessage(messages, 'content.editor.linkBubbleUrl'),
    linkBubbleSave: translateMessage(messages, 'content.editor.linkBubbleSave'),
    linkBubbleRemove: translateMessage(
      messages,
      'content.editor.linkBubbleRemove',
    ),
    linkBubbleClose: translateMessage(messages, 'content.editor.linkBubbleClose'),
    emojiPickerTitle: translateMessage(
      messages,
      'content.editor.emojiPickerTitle',
    ),
    hashtagSuggestionsTitle: translateMessage(
      messages,
      'content.editor.hashtagSuggestionsTitle',
    ),
    uploadStatusUploading: translateMessage(
      messages,
      'content.editor.uploadStatusUploading',
    ),
    uploadStatusComplete: translateMessage(
      messages,
      'content.editor.uploadStatusComplete',
    ),
    uploadStatusFailed: translateMessage(
      messages,
      'content.editor.uploadStatusFailed',
    ),
    uploadZoneTitle: translateMessage(messages, 'content.editor.uploadZoneTitle'),
    uploadZoneDescription: translateMessage(
      messages,
      'content.editor.uploadZoneDescription',
    ),
    uploadZoneButton: translateMessage(
      messages,
      'content.editor.uploadZoneButton',
    ),
  };

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
                {translateMessage(messages, 'content.fields.content')}
              </span>
              <RichPostEditor
                key={`${post.id || 'new'}-${translation.locale}-${post.updatedAt}`}
                initialContent={translation.contentJson}
                locale={translation.locale}
                mediaOptions={mediaOptions}
                tags={tags}
                labels={editorLabels}
              />
            </label>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
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

            <div className="rounded-[1.5rem] border border-[var(--theme-border)] bg-white/70 p-4">
              <label className="inline-flex items-center gap-3 rounded-full border border-[var(--theme-border)] bg-white px-4 py-2 text-sm text-[var(--theme-foreground)]">
                <input
                  type="checkbox"
                  name="isFeatured"
                  defaultChecked={post.isFeatured}
                />
                {translateMessage(messages, 'content.fields.featured')}
              </label>

              <label className="mt-4 block space-y-2">
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
            </div>
          </div>

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
        </section>

        <input type="hidden" name="heroMediaId" value={selectedHeroMediaId} />
        <input type="hidden" name="slug" value={translation.slug} />
        <input type="hidden" name="excerpt" value={translation.excerpt} />
        <input type="hidden" name="seoTitle" value={translation.seoTitle} />
        <input
          type="hidden"
          name="seoDescription"
          value={translation.seoDescription}
        />
        <input type="hidden" name="coverAlt" value={translation.coverAlt} />

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
