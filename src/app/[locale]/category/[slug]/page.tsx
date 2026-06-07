import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { ArchiveFilters } from '@/components/public/archive-filters';
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
  resolveCategory,
  resolveTag,
} from '@/lib/db/public-blog';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

type CategoryPageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ tag?: string | string[] }>;
};

async function getResolvedCategory(locale: Locale, slug: string) {
  const result = await resolveCategory(locale, slug);

  if (result.status === 'redirect') {
    redirect(buildLocalePath(locale, `/category/${encodeURIComponent(result.slug)}`));
  }

  if (result.status === 'notFound') {
    notFound();
  }

  return result.record;
}

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildCategoryArchivePath(
  locale: Locale,
  categorySlug: string,
  tagSlug?: string | null,
) {
  const query = new URLSearchParams();

  if (tagSlug) {
    query.set('tag', tagSlug);
  }

  const queryString = query.toString();
  const path = buildLocalePath(locale, `/category/${encodeURIComponent(categorySlug)}`);

  return queryString ? `${path}?${queryString}` : path;
}

async function getResolvedArchiveTag(
  locale: Locale,
  categorySlug: string,
  tagSlug?: string,
) {
  if (!tagSlug) {
    return null;
  }

  const result = await resolveTag(locale, tagSlug);

  if (result.status === 'redirect') {
    redirect(buildCategoryArchivePath(locale, categorySlug, result.slug));
  }

  if (result.status === 'notFound') {
    notFound();
  }

  return result.record;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const [category, siteSettings] = await Promise.all([
    getResolvedCategory(locale, slug),
    getPublicSiteSettings(locale),
  ]);

  return {
    title: `${category.name} | ${siteSettings.siteName}`,
    description: category.description ?? undefined,
    alternates: {
      canonical: buildLocalePath(
        locale,
        `/category/${encodeURIComponent(category.slug)}`,
      ),
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { locale, slug } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const category = await getResolvedCategory(locale, slug);
  const activeTag = await getResolvedArchiveTag(
    locale,
    category.slug,
    getSingleSearchParam((await searchParams).tag),
  );

  const [messages, categories, tags, posts] = await Promise.all([
    getMessages(locale),
    listPublicCategories(locale),
    listPublicTags(locale),
    listPublishedPosts(locale, {
      categorySlug: category.slug,
      tagSlug: activeTag?.slug,
    }),
  ]);

  return (
    <div className="grid w-full gap-8 xl:grid-cols-[1fr_22rem]">
      <div className="flex flex-col gap-6">
        <section className="rounded-[2.25rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
            {translateMessage(messages, 'blog.categoryArchiveEyebrow')}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--theme-foreground)]">
            {category.name}
          </h1>
          {category.description ? (
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--theme-muted)]">
              {category.description}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-[var(--theme-border)] px-4 py-2 text-sm text-[var(--theme-foreground)]">
              {category.name}
            </span>
            {activeTag ? (
              <span className="rounded-full bg-white/80 px-4 py-2 text-sm text-[var(--theme-muted)]">
                #{activeTag.name}
              </span>
            ) : null}
          </div>
        </section>

        {posts.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {posts.map((post) => (
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

      <ArchiveFilters
        backHref={buildLocalePath(locale, '/blog')}
        backLabel={translateMessage(messages, 'blog.backToBlog')}
        browseTitle={translateMessage(messages, 'blog.browseFiltersTitle')}
        activeFiltersLabel={translateMessage(messages, 'blog.activeFiltersLabel')}
        categoriesTitle={translateMessage(messages, 'blog.categoriesTitle')}
        tagsTitle={translateMessage(messages, 'blog.tagsTitle')}
        clearCategoryLabel={translateMessage(messages, 'blog.clearCategoryFilter')}
        clearTagLabel={translateMessage(messages, 'blog.clearTagFilter')}
        categories={categories.map((item) => ({
          id: item.id,
          label: item.name,
          href: buildCategoryArchivePath(locale, item.slug, activeTag?.slug),
          active: item.slug === category.slug,
        }))}
        tags={tags.map((item) => ({
          id: item.id,
          label: `#${item.name}`,
          href: buildCategoryArchivePath(locale, category.slug, item.slug),
          active: item.slug === activeTag?.slug,
        }))}
        activeCategory={{
          label: category.name,
        }}
        activeTag={
          activeTag
            ? {
                label: `#${activeTag.name}`,
                clearHref: buildCategoryArchivePath(locale, category.slug),
              }
            : null
        }
      />
    </div>
  );
}
