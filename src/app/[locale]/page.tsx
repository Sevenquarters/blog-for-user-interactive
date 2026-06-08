import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PostCard } from '@/components/public/post-card';
import { Card, badgeClassName, buttonClassName, cardClassName, cn } from '@/components/ui';
import { isSupportedLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import { buildLocalePath } from '@/lib/auth/paths';
import {
  getPublicSiteSettings,
  listPublicCategories,
  listPublishedPosts,
} from '@/lib/db/public-blog';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 300;
export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const [messages, siteSettings, categories, posts] = await Promise.all([
    getMessages(locale),
    getPublicSiteSettings(locale),
    listPublicCategories(locale),
    listPublishedPosts(locale),
  ]);
  const featuredPosts = posts.filter((post) => post.isFeatured).slice(0, 2);
  const recentPosts = posts.slice(0, siteSettings.postsPerPage);

  return (
    <div className="flex w-full flex-col gap-8">
      <Card tone="hero" className="overflow-hidden rounded-[2.75rem] p-8 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
              {translateMessage(messages, 'home.eyebrow')}
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-[var(--theme-foreground)] sm:text-6xl">
              {siteSettings.siteName}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--theme-muted)]">
              {siteSettings.siteDescription ??
                translateMessage(messages, 'home.description')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={buildLocalePath(locale, '/blog')}
                className={buttonClassName({ variant: 'primary', size: 'lg' })}
              >
                {translateMessage(messages, 'home.primaryCta')}
              </Link>
              <Link
                href={buildLocalePath(locale, '/dashboard')}
                className={buttonClassName({ variant: 'secondary', size: 'lg' })}
              >
                {translateMessage(messages, 'home.secondaryCta')}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={cardClassName({ tone: 'subtle', className: 'rounded-[1.75rem] p-5' })}>
              <p className="text-sm text-[var(--theme-muted)]">
                {translateMessage(messages, 'home.statPublishedPosts')}
              </p>
              <p className="mt-3 text-3xl font-semibold text-[var(--theme-foreground)]">
                {posts.length}
              </p>
            </div>
            <div className={cardClassName({ tone: 'subtle', className: 'rounded-[1.75rem] p-5' })}>
              <p className="text-sm text-[var(--theme-muted)]">
                {translateMessage(messages, 'home.statCategories')}
              </p>
              <p className="mt-3 text-3xl font-semibold text-[var(--theme-foreground)]">
                {categories.length}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-8 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          {featuredPosts.length > 0 ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--theme-foreground)]">
                  {translateMessage(messages, 'home.featuredTitle')}
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
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--theme-foreground)]">
                {translateMessage(messages, 'home.latestTitle')}
              </h2>
              <Link
                href={buildLocalePath(locale, '/blog')}
                className="text-sm font-semibold text-[var(--theme-accent)]"
              >
                {translateMessage(messages, 'home.viewAll')}
              </Link>
            </div>

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
              <div className={cardClassName({ tone: 'dashed', className: 'p-8 text-base leading-8 text-[var(--theme-muted)]' })}>
                {translateMessage(messages, 'blog.emptyState')}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="p-6">
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--theme-accent)] uppercase">
              {translateMessage(messages, 'home.categoriesTitle')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={buildLocalePath(
                    locale,
                    `/category/${encodeURIComponent(category.slug)}`,
                  )}
                  className={cn(
                    badgeClassName('outline'),
                    'px-3 py-2 transition hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)]',
                  )}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}
