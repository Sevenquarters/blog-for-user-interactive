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
