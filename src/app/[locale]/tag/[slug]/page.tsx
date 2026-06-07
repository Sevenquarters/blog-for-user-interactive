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

type TagPageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
};

async function getResolvedTag(locale: Locale, slug: string) {
  const result = await resolveTag(locale, slug);

  if (result.status === 'redirect') {
    redirect(buildLocalePath(locale, `/tag/${encodeURIComponent(result.slug)}`));
  }

  if (result.status === 'notFound') {
    notFound();
  }

  return result.record;
}

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildTagArchivePath(
  locale: Locale,
  tagSlug: string,
  categorySlug?: string | null,
) {
  const query = new URLSearchParams();

  if (categorySlug) {
    query.set('category', categorySlug);
  }

  const queryString = query.toString();
  const path = buildLocalePath(locale, `/tag/${encodeURIComponent(tagSlug)}`);

  return queryString ? `${path}?${queryString}` : path;
}

async function getResolvedArchiveCategory(
  locale: Locale,
  tagSlug: string,
  categorySlug?: string,
) {
  if (!categorySlug) {
    return null;
  }

  const result = await resolveCategory(locale, categorySlug);

  if (result.status === 'redirect') {
    redirect(buildTagArchivePath(locale, tagSlug, result.slug));
  }

  if (result.status === 'notFound') {
    notFound();
  }

  return result.record;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const [tag, siteSettings] = await Promise.all([
    getResolvedTag(locale, slug),
    getPublicSiteSettings(locale),
  ]);

  return {
    title: `#${tag.name} | ${siteSettings.siteName}`,
    alternates: {
      canonical: buildLocalePath(locale, `/tag/${encodeURIComponent(tag.slug)}`),
    },
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { locale, slug } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const tag = await getResolvedTag(locale, slug);
  const activeCategory = await getResolvedArchiveCategory(
    locale,
    tag.slug,
    getSingleSearchParam((await searchParams).category),
  );

  const [messages, categories, tags, posts] = await Promise.all([
    getMessages(locale),
    listPublicCategories(locale),
    listPublicTags(locale),
    listPublishedPosts(locale, {
      categorySlug: activeCategory?.slug,
      tagSlug: tag.slug,
    }),
  ]);

  return (
    <div className="grid w-full gap-8 xl:grid-cols-[1fr_22rem]">
      <div className="flex flex-col gap-6">
        <section className="rounded-[2.25rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
            {translateMessage(messages, 'blog.tagArchiveEyebrow')}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--theme-foreground)]">
            #{tag.name}
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            {activeCategory ? (
              <span className="rounded-full border border-[var(--theme-border)] px-4 py-2 text-sm text-[var(--theme-foreground)]">
                {activeCategory.name}
              </span>
            ) : null}
            <span className="rounded-full bg-white/80 px-4 py-2 text-sm text-[var(--theme-muted)]">
              #{tag.name}
            </span>
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
          href: buildTagArchivePath(locale, tag.slug, item.slug),
          active: item.slug === activeCategory?.slug,
        }))}
        tags={tags.map((item) => ({
          id: item.id,
          label: `#${item.name}`,
          href: buildTagArchivePath(locale, item.slug, activeCategory?.slug),
          active: item.slug === tag.slug,
        }))}
        activeCategory={
          activeCategory
            ? {
                label: activeCategory.name,
                clearHref: buildTagArchivePath(locale, tag.slug),
              }
            : null
        }
        activeTag={{
          label: `#${tag.name}`,
        }}
      />
    </div>
  );
}
