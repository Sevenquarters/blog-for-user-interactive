import { Card } from '@/components/ui';
import type { PublicCommentThread } from '@/types/comments';

type PostCommentsProps = {
  title: string;
  emptyState: string;
  replyLabel: string;
  comments: PublicCommentThread[];
};

function CommentBranch({
  comment,
  replyLabel,
  depth = 0,
}: {
  comment: PublicCommentThread;
  replyLabel: string;
  depth?: number;
}) {
  return (
    <div className={depth > 0 ? 'border-l border-[var(--theme-border)] pl-4 sm:pl-5' : ''}>
      <div className="rounded-[1.5rem] bg-white/72 px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-semibold text-[var(--theme-foreground)]">
            {comment.authorName}
          </p>
          <span className="text-sm text-[var(--theme-muted)]">{comment.createdAtLabel}</span>
          {comment.parentAuthorName ? (
            <span className="text-sm text-[var(--theme-muted)]">
              {replyLabel} {comment.parentAuthorName}
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-7 text-[var(--theme-foreground)]">
          {comment.content}
        </p>
      </div>

      {comment.replies.length > 0 ? (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentBranch
              key={reply.id}
              comment={reply}
              replyLabel={replyLabel}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PostComments({
  title,
  emptyState,
  replyLabel,
  comments,
}: PostCommentsProps) {
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-semibold tracking-tight text-[var(--theme-foreground)]">
        {title}
      </h2>

      {comments.length === 0 ? (
        <Card className="p-6 text-base leading-8 text-[var(--theme-muted)]">
          {emptyState}
        </Card>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentBranch key={comment.id} comment={comment} replyLabel={replyLabel} />
          ))}
        </div>
      )}
    </section>
  );
}
