import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PostCard } from '@/components/public/post-card';
import { isSupportedLocale, type Locale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import { buildLocalePath } from '@/lib/auth/paths';
import {
  getPublicSiteSettings,
  listPublicCategories,
  listPublishedPosts,
  listPublicTags,
} from '@/lib/db/public-blog';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

async function loadBlogPageData(locale: Locale) {
  const [messages, siteSettings, categories, tags, posts] = await Promise.all([
    getMessages(locale),
    getPublicSiteSettings(locale),
    listPublicCategories(locale),
    listPublicTags(locale),
    listPublishedPosts(locale),
  ]);

  return {
    messages,
    siteSettings,
    categories,
    tags,
    posts,
  };
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const [{ siteName, siteDescription }, messages] = await Promise.all([
    getPublicSiteSettings(locale),
    getMessages(locale),
  ]);

  return {
    title: `${translateMessage(messages, 'blog.indexTitle')} | ${siteName}`,
    description:
      translateMessage(messages, 'blog.indexDescription') || siteDescription || undefined,
    alternates: {
      canonical: buildLocalePath(locale, '/blog'),
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const { messages, siteSettings, categories, tags, posts } =
    await loadBlogPageData(locale);
  const featuredPosts = posts.filter((post) => post.isFeatured).slice(0, 2);
  const recentPosts = posts.slice(0, siteSettings.postsPerPage);

  return (
    <div className="flex w-full flex-col gap-8">
      <section className="overflow-hidden rounded-[2.5rem] border border-[var(--theme-border)] bg-[linear-gradient(135deg,_rgba(255,247,237,0.96),_rgba(255,255,255,0.92)_48%,_rgba(254,240,138,0.3)_100%)] p-8 shadow-[0_32px_90px_rgba(15,23,42,0.1)] sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
              {translateMessage(messages, 'blog.eyebrow')}
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-[var(--theme-foreground)] sm:text-5xl">
              {translateMessage(messages, 'blog.indexTitle')}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--theme-muted)]">
              {translateMessage(messages, 'blog.indexDescription')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-[var(--theme-border)] bg-white/70 p-5">
              <p className="text-sm text-[var(--theme-muted)]">
                {translateMessage(messages, 'blog.statPosts')}
              </p>
              <p className="mt-3 text-3xl font-semibold text-[var(--theme-foreground)]">
                {posts.length}
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-[var(--theme-border)] bg-white/70 p-5">
              <p className="text-sm text-[var(--theme-muted)]">
                {translateMessage(messages, 'blog.statCategories')}
              </p>
              <p className="mt-3 text-3xl font-semibold text-[var(--theme-foreground)]">
                {categories.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          {featuredPosts.length > 0 ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--theme-foreground)]">
                  {translateMessage(messages, 'blog.featuredTitle')}
                </h2>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                {featuredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    locale={locale}
                    post={post}
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
            </div>
          ) : null}

          <div className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--theme-foreground)]">
              {translateMessage(messages, 'blog.latestTitle')}
            </h2>

            {recentPosts.length > 0 ? (
              <div className="grid gap-5">
                {recentPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    locale={locale}
                    post={post}
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
            ) : (
              <div className="rounded-[2rem] border border-dashed border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 text-base leading-8 text-[var(--theme-muted)]">
                {translateMessage(messages, 'blog.emptyState')}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--theme-accent)] uppercase">
              {translateMessage(messages, 'blog.categoriesTitle')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={buildLocalePath(
                    locale,
                    `/category/${encodeURIComponent(category.slug)}`,
                  )}
                  className="rounded-full border border-[var(--theme-border)] px-3 py-2 text-sm text-[var(--theme-foreground)] transition hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)]"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--theme-accent)] uppercase">
              {translateMessage(messages, 'blog.tagsTitle')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={buildLocalePath(
                    locale,
                    `/tag/${encodeURIComponent(tag.slug)}`,
                  )}
                  className="rounded-full bg-white/80 px-3 py-2 text-sm text-[var(--theme-muted)] transition hover:text-[var(--theme-foreground)]"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
