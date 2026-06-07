import Link from 'next/link';

import { ContentFlashMessage } from '@/components/content/content-flash-message';
import { isSupportedLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import {
  deleteCommentAction,
  updateCommentStatusAction,
} from '@/lib/admin/actions';
import { buildLocalePath } from '@/lib/auth/paths';
import { requireRole } from '@/lib/auth/session';
import {
  getCommentModerationCounts,
  listModerationComments,
} from '@/lib/db/comments';
import type { CommentModerationStatus } from '@/types/comments';

type CommentsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    status?: string;
    success?: string;
    error?: string;
  }>;
};

const STATUSES: Array<'all' | CommentModerationStatus> = [
  'all',
  'pending',
  'approved',
  'rejected',
  'spam',
];

const SUCCESS_MESSAGES: Record<string, string> = {
  statusUpdated: 'comments.feedback.statusUpdated',
  deleted: 'comments.feedback.deleted',
};

const ERROR_MESSAGES: Record<string, string> = {
  statusUpdateFailed: 'comments.errors.statusUpdateFailed',
  deleteFailed: 'comments.errors.deleteFailed',
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

function getStatusLabel(messages: Awaited<ReturnType<typeof getMessages>>, status: CommentModerationStatus) {
  return translateMessage(messages, `comments.status.${status}`);
}

export default async function CommentsPage({
  params,
  searchParams,
}: CommentsPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  await requireRole(locale, ['admin', 'editor']);
  const messages = await getMessages(locale);
  const selectedStatus = STATUSES.includes(
    resolvedSearchParams.status as 'all' | CommentModerationStatus,
  )
    ? (resolvedSearchParams.status as 'all' | CommentModerationStatus) || 'all'
    : 'all';
  const [counts, comments] = await Promise.all([
    getCommentModerationCounts(),
    listModerationComments(
      locale,
      selectedStatus === 'all' ? undefined : selectedStatus,
    ),
  ]);
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
          {translateMessage(messages, 'comments.eyebrow')}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--theme-foreground)]">
          {translateMessage(messages, 'comments.title')}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--theme-muted)]">
          {translateMessage(messages, 'comments.description')}
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

      <div className="flex flex-wrap gap-3">
        {STATUSES.map((status) => {
          const isActive = selectedStatus === status;
          const href =
            status === 'all'
              ? buildLocalePath(locale, '/comments')
              : `${buildLocalePath(locale, '/comments')}?status=${status}`;
          const count = status === 'all'
            ? Object.values(counts).reduce((sum, value) => sum + value, 0)
            : counts[status];

          return (
            <Link
              key={status}
              href={href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-[var(--theme-accent)] text-white shadow-[0_12px_28px_rgba(194,65,12,0.2)]'
                  : 'border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-foreground)]'
              }`}
            >
              {status === 'all'
                ? translateMessage(messages, 'comments.filters.all')
                : getStatusLabel(messages, status)}{' '}
              ({count})
            </Link>
          );
        })}
      </div>

      {comments.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 text-base leading-8 text-[var(--theme-muted)]">
          {translateMessage(messages, 'comments.emptyState')}
        </div>
      ) : (
        <div className="grid gap-5">
          {comments.map((comment) => {
            const approveAction = updateCommentStatusAction.bind(
              null,
              locale,
              comment.id,
              'approved',
            );
            const rejectAction = updateCommentStatusAction.bind(
              null,
              locale,
              comment.id,
              'rejected',
            );
            const spamAction = updateCommentStatusAction.bind(
              null,
              locale,
              comment.id,
              'spam',
            );
            const deleteAction = deleteCommentAction.bind(
              null,
              locale,
              comment.id,
            );

            return (
              <article
                key={comment.id}
                className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-white/80 px-3 py-1 text-sm text-[var(--theme-foreground)]">
                        {getStatusLabel(messages, comment.status)}
                      </span>
                      <span className="text-sm text-[var(--theme-muted)]">
                        {translateMessage(messages, 'comments.createdLabel')}:{' '}
                        {formatDate(locale, comment.createdAt)}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-[var(--theme-muted)]">
                      <p>
                        {translateMessage(messages, 'comments.postLabel')}:{' '}
                        <span className="font-medium text-[var(--theme-foreground)]">
                          {comment.post.title}
                        </span>
                      </p>
                      <p>
                        {translateMessage(messages, 'comments.authorLabel')}:{' '}
                        <span className="font-medium text-[var(--theme-foreground)]">
                          {comment.authorDisplayName ||
                            comment.authorName ||
                            comment.authorEmail ||
                            '-'}
                        </span>
                      </p>
                      <p>
                        {translateMessage(messages, 'comments.localeLabel')}:{' '}
                        <span className="font-medium text-[var(--theme-foreground)]">
                          {comment.locale}
                        </span>
                      </p>
                    </div>

                    <p className="max-w-3xl text-base leading-8 text-[var(--theme-foreground)]">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <form action={approveAction}>
                      <button
                        type="submit"
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
                      >
                        {translateMessage(messages, 'comments.approve')}
                      </button>
                    </form>
                    <form action={rejectAction}>
                      <button
                        type="submit"
                        className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700"
                      >
                        {translateMessage(messages, 'comments.reject')}
                      </button>
                    </form>
                    <form action={spamAction}>
                      <button
                        type="submit"
                        className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        {translateMessage(messages, 'comments.markSpam')}
                      </button>
                    </form>
                    <form action={deleteAction}>
                      <button
                        type="submit"
                        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                      >
                        {translateMessage(messages, 'comments.delete')}
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
