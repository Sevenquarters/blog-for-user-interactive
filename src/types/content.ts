import type { AppRole } from '@/types/database';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type PostTranslationEditorRecord = {
  locale: 'en' | 'zh-CN';
  title: string;
  slug: string;
  excerpt: string;
  contentText: string;
  seoTitle: string;
  seoDescription: string;
  coverAlt: string;
  isComplete: boolean;
};

export type ContentCategoryOption = {
  id: string;
  slug: string;
  name: string;
};

export type ContentTagOption = {
  id: string;
  slug: string;
  name: string;
};

export type ContentRevisionRecord = {
  id: string;
  revisionNumber: number;
  changeSummary: string | null;
  createdAt: string;
  editedBy: string;
};

export type ManageablePostListItem = {
  id: string;
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
  readingTimeMinutes: number | null;
  isFeatured: boolean;
  category: ContentCategoryOption | null;
  tags: ContentTagOption[];
  translations: Record<'en' | 'zh-CN', PostTranslationEditorRecord>;
};

export type ManageablePostEditorRecord = ManageablePostListItem & {
  authorId: string;
  revisions: ContentRevisionRecord[];
};

export type ContentScopeSummary = {
  role: AppRole;
  canManageAllPosts: boolean;
};
