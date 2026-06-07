import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ContentFlashMessage } from '@/components/content/content-flash-message';
import { PostEditorForm } from '@/components/content/post-editor-form';
import { isSupportedLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import { buildLocalePath } from '@/lib/auth/paths';
import { requireUser } from '@/lib/auth/session';
import { getManageablePostEditorRecord } from '@/lib/db/content-posts';

type EditPostPageProps = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

const SUCCESS_MESSAGES: Record<string, string> = {
  created: 'content.feedback.created',
  saved: 'content.feedback.saved',
};

const ERROR_MESSAGES: Record<string, string> = {
  invalidStatus: 'content.errors.invalidStatus',
  missingTitles: 'content.errors.missingTitles',
  incompletePublishedTranslations:
    'content.errors.incompletePublishedTranslations',
  missingPublishDate: 'content.errors.missingPublishDate',
  saveFailed: 'content.errors.saveFailed',
  deleteFailed: 'content.errors.deleteFailed',
};

function formatDate(locale: string, value: string) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default async function EditPostPage({
  params,
  searchParams,
}: EditPostPageProps) {
  const { locale, id } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  const { profile } = await requireUser(locale);
  const messages = await getMessages(locale);
  const editorData = await getManageablePostEditorRecord(
    id,
    locale,
    profile.id,
    profile.role,
  );

  if (!editorData) {
    notFound();
  }

  const successPath = resolvedSearchParams.success
    ? SUCCESS_MESSAGES[resolvedSearchParams.success]
    : null;
  const errorPath = resolvedSearchParams.error
    ? ERROR_MESSAGES[resolvedSearchParams.error]
    : null;

  return (
    <section className="w-full space-y-6">
      <div className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
              {translateMessage(messages, 'content.editEyebrow')}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--theme-foreground)]">
              {editorData.post.translations[locale].title ||
                editorData.post.translations.en.title ||
                editorData.post.translations['zh-CN'].title ||
                translateMessage(messages, 'content.untitled')}
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

      <PostEditorForm
        locale={locale}
        post={editorData.post}
        categories={editorData.categories}
        tags={editorData.tags}
      />

      <section className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
        <h2 className="text-2xl font-semibold text-[var(--theme-foreground)]">
          {translateMessage(messages, 'content.revisionsTitle')}
        </h2>
        <div className="mt-5 space-y-4">
          {editorData.post.revisions.length > 0 ? (
            editorData.post.revisions.map((revision) => (
              <article
                key={revision.id}
                className="rounded-[1.5rem] border border-[var(--theme-border)] bg-white/70 p-5"
              >
                <p className="text-sm font-semibold text-[var(--theme-foreground)]">
                  {translateMessage(messages, 'content.revisionLabel')} #
                  {revision.revisionNumber}
                </p>
                <p className="mt-2 text-sm text-[var(--theme-muted)]">
                  {formatDate(locale, revision.createdAt)}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--theme-foreground)]">
                  {revision.changeSummary ||
                    translateMessage(messages, 'content.noRevisionSummary')}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-[var(--theme-muted)]">
              {translateMessage(messages, 'content.noRevisions')}
            </p>
          )}
        </div>
      </section>
    </section>
  );
}
