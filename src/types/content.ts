import type { AppRole } from '@/types/database';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type PostTranslationEditorRecord = {
  locale: 'en' | 'zh-CN';
  title: string;
  slug: string;
  excerpt: string;
  contentText: string;
  contentJson: unknown;
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

export type ContentMediaKind = 'image' | 'video';

export type ContentMediaOption = {
  id: string;
  fileName: string;
  publicUrl: string;
  mimeType?: string;
  kind: ContentMediaKind;
  width?: number | null;
  height?: number | null;
  altText: string;
  caption: string;
};

export type EditorImageOption = ContentMediaOption & {
  kind: 'image';
};

export type EditorVideoOption = ContentMediaOption & {
  kind: 'video';
};

export type EditorMediaOption = EditorImageOption | EditorVideoOption;

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
  heroMedia: ContentMediaOption | null;
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
