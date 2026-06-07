import Link from 'next/link';

import type { Locale } from '@/i18n/config';
import { buildLocalePath } from '@/lib/auth/paths';
import type { BlogPostListItem } from '@/types/blog';

type PostCardProps = {
  locale: Locale;
  post: BlogPostListItem;
  categoryLabel: string;
  featuredLabel: string;
  readArticleLabel: string;
  readingTimeLabel: (minutes: number) => string;
};

function formatPublishedDate(locale: Locale, publishedAt: string) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(publishedAt));
}

export function PostCard({
  locale,
  post,
  categoryLabel,
  featuredLabel,
  readArticleLabel,
  readingTimeLabel,
}: PostCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,_rgba(194,65,12,0.9),_rgba(245,158,11,0.55),_transparent)]" />
      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--theme-muted)]">
        <span>{formatPublishedDate(locale, post.publishedAt)}</span>
        {post.readingTimeMinutes ? (
          <span>{readingTimeLabel(post.readingTimeMinutes)}</span>
        ) : null}
        {post.isFeatured ? (
          <span className="rounded-full bg-[rgba(194,65,12,0.12)] px-3 py-1 font-medium text-[var(--theme-accent)]">
            {featuredLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        {post.category ? (
          <Link
            href={buildLocalePath(
              locale,
              `/category/${encodeURIComponent(post.category.slug)}`,
            )}
            className="inline-flex rounded-full border border-[var(--theme-border)] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[var(--theme-muted)] uppercase transition hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)]"
          >
            {categoryLabel}: {post.category.name}
          </Link>
        ) : null}

        <div>
          <Link
            href={buildLocalePath(
              locale,
              `/blog/${encodeURIComponent(post.slug)}`,
            )}
            className="inline-block text-2xl font-semibold tracking-tight text-[var(--theme-foreground)] transition group-hover:text-[var(--theme-accent)]"
          >
            {post.title}
          </Link>
          {post.excerpt ? (
            <p className="mt-3 text-base leading-7 text-[var(--theme-muted)]">
              {post.excerpt}
            </p>
          ) : null}
        </div>

        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={buildLocalePath(
                  locale,
                  `/tag/${encodeURIComponent(tag.slug)}`,
                )}
                className="rounded-full bg-white/70 px-3 py-1 text-sm text-[var(--theme-muted)] transition hover:text-[var(--theme-foreground)]"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        ) : null}

        <Link
          href={buildLocalePath(locale, `/blog/${encodeURIComponent(post.slug)}`)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--theme-accent)]"
        >
          {readArticleLabel}
          <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>
    </article>
  );
}
