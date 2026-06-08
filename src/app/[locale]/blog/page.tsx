import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Pagination } from '@/components/public/pagination';
import { PostCard } from '@/components/public/post-card';
import { Card, badgeClassName, cardClassName, cn } from '@/components/ui';
import { isSupportedLocale, type Locale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import { buildLocalePath } from '@/lib/auth/paths';
import {
  getPublicSiteSettings,
  listPublicCategories,
  listPublishedPosts,
  listPublishedPostsPage,
  listPublicTags,
} from '@/lib/db/public-blog';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

const POSTS_PER_PAGE = 10;

type BlogPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePageParam(value: string | undefined) {
  const parsed = Number.parseInt(value ?? '1', 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function buildBlogPageHref(locale: Locale, page: number) {
  const path = buildLocalePath(locale, '/blog');

  if (page <= 1) {
    return path;
  }

  return `${path}?page=${page}`;
}

async function loadBlogPageData(locale: Locale, page: number) {
  const [messages, categories, tags, paginatedPosts, featuredPosts] =
    await Promise.all([
      getMessages(locale),
      listPublicCategories(locale),
      listPublicTags(locale),
      listPublishedPostsPage(locale, {
        page,
        pageSize: POSTS_PER_PAGE,
      }),
      page === 1
        ? listPublishedPosts(locale, {
            featuredOnly: true,
            limit: 2,
          })
        : Promise.resolve([]),
    ]);

  return {
    messages,
    categories,
    tags,
    paginatedPosts,
    featuredPosts,
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const page = parsePageParam(getSingleSearchParam((await searchParams).page));
  const [{ siteName, siteDescription }, messages] = await Promise.all([
    getPublicSiteSettings(locale),
    getMessages(locale),
  ]);

  return {
    title: `${translateMessage(messages, 'blog.indexTitle')} | ${siteName}`,
    description:
      translateMessage(messages, 'blog.indexDescription') ||
      siteDescription ||
      undefined,
    alternates: {
      canonical: buildBlogPageHref(locale, page),
    },
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: BlogPageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const requestedPage = parsePageParam(
    getSingleSearchParam((await searchParams).page),
  );
  const { messages, categories, tags, paginatedPosts, featuredPosts } =
    await loadBlogPageData(locale, requestedPage);
  const { items, page, totalCount, totalPages } = paginatedPosts;

  if (requestedPage > totalPages && totalCount > 0) {
    redirect(buildBlogPageHref(locale, totalPages));
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <Card tone="hero" className="overflow-hidden rounded-[2.5rem] p-8 sm:p-10">
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
            <div
              className={cardClassName({
                tone: 'subtle',
                className: 'rounded-[1.75rem] p-5',
              })}
            >
              <p className="text-sm text-[var(--theme-muted)]">
                {translateMessage(messages, 'blog.statPosts')}
              </p>
              <p className="mt-3 text-3xl font-semibold text-[var(--theme-foreground)]">
                {totalCount}
              </p>
            </div>
            <div
              className={cardClassName({
                tone: 'subtle',
                className: 'rounded-[1.75rem] p-5',
              })}
            >
              <p className="text-sm text-[var(--theme-muted)]">
                {translateMessage(messages, 'blog.statCategories')}
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
          {page === 1 && featuredPosts.length > 0 ? (
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
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--theme-foreground)]">
                {translateMessage(messages, 'blog.latestTitle')}
              </h2>
              <p className="text-sm text-[var(--theme-muted)]">
                {translateMessage(messages, 'blog.paginationPage')
                  .replace('{page}', String(page))
                  .replace('{total}', String(totalPages))}
              </p>
            </div>

            {items.length > 0 ? (
              <>
                <div className="grid gap-5">
                  {items.map((post) => (
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
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  previousLabel={translateMessage(
                    messages,
                    'blog.paginationPrevious',
                  )}
                  nextLabel={translateMessage(messages, 'blog.paginationNext')}
                  pageLabel={(currentPage, pageCount) =>
                    translateMessage(messages, 'blog.paginationPage')
                      .replace('{page}', String(currentPage))
                      .replace('{total}', String(pageCount))
                  }
                  buildHref={(nextPage) =>
                    buildBlogPageHref(
                      locale,
                      Math.min(Math.max(nextPage, 1), totalPages),
                    )
                  }
                />
              </>
            ) : (
              <div
                className={cardClassName({
                  tone: 'dashed',
                  className:
                    'p-8 text-base leading-8 text-[var(--theme-muted)]',
                })}
              >
                {translateMessage(messages, 'blog.emptyState')}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="p-6">
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

          <Card className="p-6">
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
                  className="rounded-full bg-white/80 px-3 py-2 text-sm text-[var(--theme-muted)] transition hover:-translate-y-0.5 hover:text-[var(--theme-foreground)]"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}
