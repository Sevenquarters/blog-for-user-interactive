import Link from 'next/link';

import type { Locale } from '@/i18n/config';
import { buildLocalePath } from '@/lib/auth/paths';
import type { BlogPostListItem } from '@/types/blog';
import { Badge, Button, Card } from '@/components/ui';

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
  const articleHref = buildLocalePath(
    locale,
    `/blog/${encodeURIComponent(post.slug)}`,
  );

  return (
    <Card
      as="article"
      interactive
      className="group relative overflow-hidden p-0"
    >
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-[linear-gradient(90deg,_rgba(194,65,12,0.9),_rgba(245,158,11,0.55),_transparent)]" />

      <Link href={articleHref} className="block overflow-hidden">
        {post.previewImage ? (
          <div className="overflow-hidden border-b border-[var(--theme-border)] bg-[rgba(255,247,237,0.55)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.previewImage.url}
              alt={post.previewImage.alt ?? post.title}
              width={post.previewImage.width ?? undefined}
              height={post.previewImage.height ?? undefined}
              className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-56 items-end overflow-hidden border-b border-[var(--theme-border)] bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.28),_transparent_42%),linear-gradient(135deg,_rgba(255,247,237,0.92),_rgba(255,255,255,0.9))] p-6">
            <div className="rounded-[1.3rem] border border-white/70 bg-white/75 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.18em] text-[var(--theme-accent)] uppercase">
                {post.category?.name ?? featuredLabel}
              </p>
              <p className="mt-2 max-w-xs text-lg font-semibold leading-7 text-[var(--theme-foreground)]">
                {post.title}
              </p>
            </div>
          </div>
        )}
      </Link>

      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--theme-muted)]">
          <span>{formatPublishedDate(locale, post.publishedAt)}</span>
          {post.readingTimeMinutes ? (
            <span>{readingTimeLabel(post.readingTimeMinutes)}</span>
          ) : null}
          {post.isFeatured ? (
            <Badge variant="accent">{featuredLabel}</Badge>
          ) : null}
        </div>

        <div className="mt-5 space-y-4">
          {post.category ? (
            <Link
              href={buildLocalePath(
                locale,
                `/category/${encodeURIComponent(post.category.slug)}`,
              )}
              className="inline-flex rounded-full border border-[var(--theme-border-strong)] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[var(--theme-muted)] uppercase transition hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)]"
            >
              {categoryLabel}: {post.category.name}
            </Link>
          ) : null}

          <div>
            <Link
              href={articleHref}
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
                  className="rounded-full bg-white/72 px-3 py-1 text-sm text-[var(--theme-muted)] transition hover:-translate-y-0.5 hover:text-[var(--theme-foreground)]"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          ) : null}

          <div>
            <Link href={articleHref}>
              <Button
                variant="ghost"
                size="sm"
                trailingIcon={<span aria-hidden="true">-&gt;</span>}
              >
                {readArticleLabel}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
