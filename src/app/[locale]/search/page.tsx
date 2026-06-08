import { notFound } from 'next/navigation';

import { GlobalSearch } from '@/components/public/global-search';
import { isSupportedLocale } from '@/i18n/config';
import { listSearchablePublishedPosts } from '@/lib/db/public-blog';

type SearchPageProps = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 300;
export const dynamic = 'force-dynamic';

export default async function SearchPage({ params }: SearchPageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const posts = await listSearchablePublishedPosts(locale);
  const labels =
    locale === 'zh-CN'
      ? {
          title: '全站搜索',
          description:
            '按标题、摘要、标签和正文内容快速检索，重新找到那篇值得继续读下去的文章。',
          inputPlaceholder: '搜索文章标题、主题或关键词',
          emptyIdle: '开始输入关键词，相关内容会立即出现在这里。',
          emptyResults: '暂时没有匹配结果，试试更短的关键词或换个说法。',
          readingTime: (minutes: number) => `${minutes} 分钟`,
        }
      : {
          title: 'Search PeppaBlog',
          description:
            'Search across titles, excerpts, tags, and article body text to jump back into the right post quickly.',
          inputPlaceholder: 'Search by title, topic, or keyword',
          emptyIdle: 'Start typing and matching articles will appear here.',
          emptyResults:
            'No matching results yet. Try a shorter phrase or a different keyword.',
          readingTime: (minutes: number) => `${minutes} min`,
        };

  return <GlobalSearch locale={locale} posts={posts} labels={labels} />;
}
