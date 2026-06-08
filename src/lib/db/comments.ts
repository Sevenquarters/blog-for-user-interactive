import 'server-only';

import type { Locale } from '@/i18n/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabasePublicClient } from '@/lib/supabase/public';
import type {
  CommentModerationStatus,
  ModerationCommentRecord,
  PublicCommentRecord,
  PublicCommentThread,
} from '@/types/comments';

import { throwIfSupabaseError } from './utils';

type CommentRow = {
  id: string;
  status: CommentModerationStatus;
  author_name: string | null;
  author_email: string | null;
  content: string;
  locale: string;
  created_at: string;
  profiles:
    | Array<{
        display_name: string | null;
      }>
    | null;
  posts:
    | Array<{
        id: string;
        post_translations:
          | Array<{
              locale: string;
              title: string;
            }>
          | null;
      }>
    | null;
};

type PublicCommentRow = {
  id: string;
  parent_comment_id: string | null;
  author_name: string | null;
  author_email: string | null;
  content: string;
  created_at: string;
};

export async function listModerationComments(
  locale: Locale,
  status?: CommentModerationStatus,
) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('comments')
    .select(
      `
        id,
        status,
        author_name,
        author_email,
        content,
        locale,
        created_at,
        profiles:author_id (
          display_name
        ),
        posts!inner (
          id,
          post_translations (
            locale,
            title
          )
        )
      `,
    )
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  throwIfSupabaseError(error, 'Unable to load moderation comments');

  return ((data ?? []) as unknown as CommentRow[]).map((comment) => {
    const post = comment.posts?.[0];
    const preferredTranslation =
      post?.post_translations?.find(
        (translation) => translation.locale === locale,
      ) ?? post?.post_translations?.[0];

    return {
      id: comment.id,
      status: comment.status,
      authorName: comment.author_name,
      authorEmail: comment.author_email,
      authorDisplayName: comment.profiles?.[0]?.display_name ?? null,
      content: comment.content,
      locale: comment.locale,
      createdAt: comment.created_at,
      post: {
        id: post?.id ?? '',
        title: preferredTranslation?.title ?? 'Untitled post',
      },
    } satisfies ModerationCommentRecord;
  });
}

export async function getCommentModerationCounts() {
  const supabase = await createSupabaseServerClient();
  const statuses: CommentModerationStatus[] = [
    'pending',
    'approved',
    'rejected',
    'spam',
  ];

  const entries = await Promise.all(
    statuses.map(async (status) => {
      const { count, error } = await supabase
        .from('comments')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('status', status);

      throwIfSupabaseError(error, `Unable to count ${status} comments`);

      return [status, count ?? 0] as const;
    }),
  );

  return Object.fromEntries(entries) as Record<CommentModerationStatus, number>;
}

export async function updateCommentStatus(
  commentId: string,
  status: CommentModerationStatus,
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('comments')
    .update({ status } as never)
    .eq('id', commentId);

  throwIfSupabaseError(error, 'Unable to update comment status');
}

export async function deleteComment(commentId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  throwIfSupabaseError(error, 'Unable to delete comment');
}

function formatPublicCommentDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export async function listApprovedCommentsForPost(
  locale: Locale,
  postId: string,
) {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from('comments')
    .select(
      `
        id,
        parent_comment_id,
        author_name,
        author_email,
        content,
        created_at
      `,
    )
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  throwIfSupabaseError(error, 'Unable to load public comments');

  const comments = ((data ?? []) as PublicCommentRow[]).map((comment) => ({
    id: comment.id,
    parentCommentId: comment.parent_comment_id,
    authorName:
      comment.author_name?.trim() ||
      comment.author_email?.split('@')[0]?.trim() ||
      (locale === 'zh-CN' ? '匿名读者' : 'Guest reader'),
    parentAuthorName: null,
    content: comment.content,
    createdAt: comment.created_at,
    createdAtLabel: formatPublicCommentDate(locale, comment.created_at),
  })) satisfies PublicCommentRecord[];

  const commentMap = new Map<string, PublicCommentThread>(
    comments.map((comment) => [
      comment.id,
      {
        ...comment,
        replies: [],
      },
    ]),
  );
  const roots: PublicCommentThread[] = [];

  for (const comment of commentMap.values()) {
    if (!comment.parentCommentId) {
      roots.push(comment);
      continue;
    }

    const parentComment = commentMap.get(comment.parentCommentId);

    if (!parentComment) {
      roots.push(comment);
      continue;
    }

    comment.parentAuthorName = parentComment.authorName;
    parentComment.replies.push(comment);
  }

  return roots;
}
