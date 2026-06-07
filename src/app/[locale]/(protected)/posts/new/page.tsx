import Link from 'next/link';

import { ContentFlashMessage } from '@/components/content/content-flash-message';
import { PostEditorForm } from '@/components/content/post-editor-form';
import { isSupportedLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import { buildLocalePath } from '@/lib/auth/paths';
import { loadNewPostEditor } from '@/lib/content/actions';
import { requireUser } from '@/lib/auth/session';

type NewPostPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  invalidStatus: 'content.errors.invalidStatus',
  missingTitles: 'content.errors.missingTitles',
  incompletePublishedTranslations:
    'content.errors.incompletePublishedTranslations',
  missingPublishDate: 'content.errors.missingPublishDate',
  saveFailed: 'content.errors.saveFailed',
};

export default async function NewPostPage({
  params,
  searchParams,
}: NewPostPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  await requireUser(locale);
  const messages = await getMessages(locale);
  const editorData = await loadNewPostEditor(locale);
  const errorPath = resolvedSearchParams.error
    ? ERROR_MESSAGES[resolvedSearchParams.error]
    : null;

  return (
    <section className="w-full space-y-6">
      <div className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
              {translateMessage(messages, 'content.createEyebrow')}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--theme-foreground)]">
              {translateMessage(messages, 'content.createTitle')}
            </h1>
          </div>

          <Link
            href={buildLocalePath(locale, '/posts')}
            className="rounded-full border border-[var(--theme-border)] px-4 py-2 text-sm font-medium text-[var(--theme-foreground)]"
          >
            {translateMessage(messages, 'content.backToPosts')}
          </Link>
        </div>
      </div>

      {errorPath ? (
        <ContentFlashMessage
          tone="error"
          message={translateMessage(messages, errorPath)}
        />
      ) : null}

      <PostEditorForm
        locale={locale}
        post={editorData.post}
        categories={editorData.categories}
        tags={editorData.tags}
      />
    </section>
  );
}
