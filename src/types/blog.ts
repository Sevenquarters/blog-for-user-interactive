import type { Locale } from '@/i18n/config';

export type BlogTaxonomy = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
};

export type BlogHeroImage = {
  url: string;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
};

export type BlogPostTag = {
  id: string;
  slug: string;
  name: string;
};

export type BlogPostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string;
  readingTimeMinutes: number | null;
  isFeatured: boolean;
  category: BlogTaxonomy | null;
  tags: BlogPostTag[];
  heroImage: BlogHeroImage | null;
};

export type BlogPostDetail = BlogPostListItem & {
  content: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  alternateSlugs: Partial<Record<Locale, string>>;
};

export type ResolvedLocalizedRecord<T> =
  | {
      status: 'found';
      record: T;
    }
  | {
      status: 'redirect';
      slug: string;
    }
  | {
      status: 'notFound';
    };
