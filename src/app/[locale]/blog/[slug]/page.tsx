import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { PostContent } from '@/components/public/post-content';
import { PostCard } from '@/components/public/post-card';
import { PostViewTracker } from '@/components/public/post-view-tracker';
import { isSupportedLocale, type Locale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import { buildLocalePath } from '@/lib/auth/paths';
import {
  getPublicSiteSettings,
  listPublishedPosts,
  resolvePublishedPost,
} from '@/lib/db/public-blog';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

type BlogDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

async function getResolvedPost(locale: Locale, slug: string) {
  const result = await resolvePublishedPost(locale, slug);

  if (result.status === 'redirect') {
    redirect(buildLocalePath(locale, `/blog/${result.slug}`));
  }

  if (result.status === 'notFound') {
    notFound();
  }

  return result.record;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const post = await getResolvedPost(locale, slug);
  const siteSettings = await getPublicSiteSettings(locale);

  return {
    title: `${post.seoTitle ?? post.title} | ${siteSettings.siteName}`,
    description: post.seoDescription ?? undefined,
    alternates: {
      canonical: buildLocalePath(locale, `/blog/${encodeURIComponent(post.slug)}`),
      languages: Object.fromEntries(
        Object.entries(post.alternateSlugs).map(([itemLocale, itemSlug]) => [
          itemLocale,
          buildLocalePath(
            itemLocale as Locale,
            `/blog/${encodeURIComponent(itemSlug)}`,
          ),
        ]),
      ),
    },
  };
}

function formatPublishedDate(locale: Locale, publishedAt: string) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(publishedAt));
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { locale, slug } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const [messages, post] = await Promise.all([
    getMessages(locale),
    getResolvedPost(locale, slug),
  ]);
  const relatedPosts = (
    await listPublishedPosts(locale, {
      excludePostId: post.id,
      categorySlug: post.category?.slug,
      limit: 2,
    })
  ).slice(0, 2);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <PostViewTracker locale={locale} postId={post.id} />

      <article className="overflow-hidden rounded-[2.5rem] border border-[var(--theme-border)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.94),_rgba(255,247,237,0.9)_100%)] shadow-[0_32px_90px_rgba(15,23,42,0.1)]">
        <div className="border-b border-[var(--theme-border)] px-7 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--theme-muted)]">
            <Link
              href={buildLocalePath(locale, '/blog')}
              className="font-medium text-[var(--theme-accent)]"
            >
              {translateMessage(messages, 'blog.backToBlog')}
            </Link>
            <span>|</span>
            <span>{formatPublishedDate(locale, post.publishedAt)}</span>
            {post.readingTimeMinutes ? (
              <>
                <span>|</span>
                <span>
                  {translateMessage(messages, 'blog.readingTime').replace(
                    '{minutes}',
                    String(post.readingTimeMinutes),
                  )}
                </span>
              </>
            ) : null}
          </div>

          {post.category ? (
            <Link
              href={buildLocalePath(
                locale,
                `/category/${encodeURIComponent(post.category.slug)}`,
              )}
              className="mt-6 inline-flex rounded-full border border-[var(--theme-border)] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[var(--theme-muted)] uppercase transition hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)]"
            >
              {post.category.name}
            </Link>
          ) : null}

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--theme-foreground)] sm:text-5xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-5 max-w-3xl text-xl leading-9 text-[var(--theme-muted)]">
              {post.excerpt}
            </p>
          ) : null}
        </div>

        <div className="px-7 py-8 sm:px-10 sm:py-10">
          <PostContent content={post.content} />

          {post.tags.length > 0 ? (
            <div className="mt-10 flex flex-wrap gap-3 border-t border-[var(--theme-border)] pt-8">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={buildLocalePath(
                    locale,
                    `/tag/${encodeURIComponent(tag.slug)}`,
                  )}
                  className="rounded-full bg-white/80 px-4 py-2 text-sm text-[var(--theme-muted)] transition hover:text-[var(--theme-foreground)]"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </article>

      {relatedPosts.length > 0 ? (
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--theme-foreground)]">
            {translateMessage(messages, 'blog.relatedTitle')}
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <PostCard
                key={relatedPost.id}
                locale={locale}
                post={relatedPost}
                categoryLabel={translateMessage(messages, 'blog.categoryLabel')}
                featuredLabel={translateMessage(messages, 'blog.featuredBadge')}
                readArticleLabel={translateMessage(messages, 'blog.readArticle')}
                readingTimeLabel={(minutes) =>
                  translateMessage(messages, 'blog.readingTime').replace(
                    '{minutes}',
                    String(minutes),
                  )
                }
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
