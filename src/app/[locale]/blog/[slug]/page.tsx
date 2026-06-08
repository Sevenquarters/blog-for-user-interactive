import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { BackToTopButton } from '@/components/public/back-to-top-button';
import { PostComments } from '@/components/public/post-comments';
import { PostContent } from '@/components/public/post-content';
import { PostAuthorCard } from '@/components/public/post-author-card';
import { PostReaderActions } from '@/components/public/post-reader-actions';
import { PostCard } from '@/components/public/post-card';
import { PostReaderStats } from '@/components/public/post-reader-stats';
import { PostTableOfContents } from '@/components/public/post-table-of-contents';
import { PostViewTracker } from '@/components/public/post-view-tracker';
import { ReadingProgressBar } from '@/components/public/reading-progress-bar';
import { Card, badgeClassName, cn } from '@/components/ui';
import { isSupportedLocale, type Locale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import { buildLocalePath } from '@/lib/auth/paths';
import { analyzeContent } from '@/lib/content/content-analysis';
import { listApprovedCommentsForPost } from '@/lib/db/comments';
import {
  getPublicPostViewCount,
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
  const contentAnalysis = analyzeContent(post.content);
  const [viewCount, comments] = await Promise.all([
    getPublicPostViewCount(post.id),
    listApprovedCommentsForPost(locale, post.id),
  ]);
  const computedReadingTime = Math.max(
    post.readingTimeMinutes ?? 0,
    contentAnalysis.estimatedReadingTimeMinutes,
  );
  const readerCopy =
    locale === 'zh-CN'
      ? {
          tableOfContents: '目录',
          readingStats: '阅读信息',
          wordCount: '字数',
          readingTime: '阅读时长',
          published: '发布于',
          author: '作者',
          authorBio:
            '关注产品设计、内容系统与稳定可持续的写作体验，分享双语内容平台的构建过程。',
          backToTop: '回到顶部',
          views: '阅读量',
          readerActions: '稍后再读',
          like: '喜欢',
          liked: '已喜欢',
          bookmark: '收藏',
          bookmarked: '已收藏',
          comments: '讨论',
          commentsEmpty: '这篇文章暂时还没有公开评论，不过评论区的阅读体验已经准备好了。',
          replyingTo: '回复',
        }
      : {
          tableOfContents: 'Table of contents',
          readingStats: 'Reading stats',
          wordCount: 'Words',
          readingTime: 'Reading time',
          published: 'Published',
          author: 'Author',
          authorBio:
            'Writes about product design, content systems, and sustainable publishing workflows for thoughtful online writing.',
          backToTop: 'Back to top',
          views: 'Views',
          readerActions: 'Save this story',
          like: 'Like',
          liked: 'Liked',
          bookmark: 'Bookmark',
          bookmarked: 'Saved',
          comments: 'Discussion',
          commentsEmpty:
            'Comments have not been published for this article yet, but the thread layout is ready for reader conversations.',
          replyingTo: 'Replying to',
        };
  const authorName =
    post.author?.displayName?.trim() ||
    (locale === 'zh-CN' ? '编辑团队' : 'Editorial team');

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PostViewTracker locale={locale} postId={post.id} />
      <ReadingProgressBar />
      <BackToTopButton label={readerCopy.backToTop} />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <Card
          as="article"
          tone="elevated"
          className="overflow-hidden rounded-[2.5rem] bg-[linear-gradient(180deg,_rgba(255,255,255,0.94),_rgba(255,247,237,0.9)_100%)]"
        >
          <div className="border-b border-[var(--theme-border)] px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--theme-muted)]">
              <Link
                href={buildLocalePath(locale, '/blog')}
                className="font-medium text-[var(--theme-accent)]"
              >
                {translateMessage(messages, 'blog.backToBlog')}
              </Link>
              <span>|</span>
              <span>
                {readerCopy.published} {formatPublishedDate(locale, post.publishedAt)}
              </span>
              <span>|</span>
              <span>
                {translateMessage(messages, 'blog.readingTime').replace(
                  '{minutes}',
                  String(computedReadingTime),
                )}
              </span>
            </div>

            {post.category ? (
              <Link
                href={buildLocalePath(
                  locale,
                  `/category/${encodeURIComponent(post.category.slug)}`,
                )}
                className={cn(
                  badgeClassName('outline'),
                  'mt-6 inline-flex text-xs font-semibold tracking-[0.18em] uppercase transition hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)]',
                )}
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

          <div className="px-6 py-8 sm:px-10 sm:py-10">
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
                    className="rounded-full bg-white/80 px-4 py-2 text-sm text-[var(--theme-muted)] transition hover:-translate-y-0.5 hover:text-[var(--theme-foreground)]"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </Card>

        <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <PostReaderStats
            title={readerCopy.readingStats}
            items={[
              {
                label: readerCopy.wordCount,
                value:
                  locale === 'zh-CN'
                    ? `${contentAnalysis.wordCount} 字`
                    : `${contentAnalysis.wordCount}`,
              },
              {
                label: readerCopy.readingTime,
                value:
                  locale === 'zh-CN'
                    ? `${computedReadingTime} 分钟`
                    : `${computedReadingTime} min`,
              },
              ...(viewCount !== null
                ? [
                    {
                      label: readerCopy.views,
                      value: locale === 'zh-CN' ? `${viewCount} 次` : `${viewCount}`,
                    },
                  ]
                : []),
            ]}
          />
          <PostTableOfContents
            title={readerCopy.tableOfContents}
            headings={contentAnalysis.headings}
          />
          <PostReaderActions
            postId={post.id}
            locale={locale}
            labels={{
              title: readerCopy.readerActions,
              like: readerCopy.like,
              liked: readerCopy.liked,
              bookmark: readerCopy.bookmark,
              bookmarked: readerCopy.bookmarked,
            }}
          />
          <PostAuthorCard
            eyebrow={readerCopy.author}
            name={authorName}
            bio={readerCopy.authorBio}
          />
        </aside>
      </div>

      <PostComments
        title={readerCopy.comments}
        emptyState={readerCopy.commentsEmpty}
        replyLabel={readerCopy.replyingTo}
        comments={comments}
      />

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
