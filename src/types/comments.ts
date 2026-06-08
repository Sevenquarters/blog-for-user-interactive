export type CommentModerationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'spam';

export type ModerationCommentRecord = {
  id: string;
  status: CommentModerationStatus;
  authorName: string | null;
  authorEmail: string | null;
  authorDisplayName: string | null;
  content: string;
  locale: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
  };
};

export type PublicCommentRecord = {
  id: string;
  parentCommentId: string | null;
  authorName: string;
  parentAuthorName: string | null;
  content: string;
  createdAt: string;
  createdAtLabel: string;
};

export type PublicCommentThread = PublicCommentRecord & {
  replies: PublicCommentThread[];
};
