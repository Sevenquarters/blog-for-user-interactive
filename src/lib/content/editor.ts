import type { Locale } from '@/i18n/config';
import {
  createEmptyTipTapDoc,
  hasRenderableContent,
} from '@/lib/content/content-format';
import type { PostStatus, PostTranslationEditorRecord } from '@/types/content';

type SampleTranslation = {
  title: string;
  slug: string;
  excerpt: string;
  contentText: string;
  seoTitle: string;
  seoDescription: string;
  coverAlt: string;
};

type SamplePostDefinition = {
  key: string;
  status: Extract<PostStatus, 'published'>;
  publishedAt: string;
  isFeatured: boolean;
  readingTimeMinutes: number;
  categorySlug: string | null;
  tagSlugs: string[];
  changeSummary: string;
  translations: Record<Locale, SampleTranslation>;
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function buildDefaultTranslation(
  locale: Locale,
): PostTranslationEditorRecord {
  return {
    locale,
    title: '',
    slug: '',
    excerpt: '',
    contentText: '',
    contentJson: createEmptyTipTapDoc(),
    seoTitle: '',
    seoDescription: '',
    coverAlt: '',
    isComplete: false,
  };
}

export function isTranslationComplete(
  translation: {
    title: string;
    slug: string;
    excerpt: string;
    contentText: string;
    seoTitle: string;
    seoDescription: string;
    coverAlt: string;
  },
) {
  return Boolean(
    translation.title.trim() &&
      translation.slug.trim() &&
      hasRenderableContent(translation.contentText),
  );
}

export function resolvePublishedAt(
  status: PostStatus,
  publishedAtInput: string,
  fallbackDate?: string | null,
) {
  if (status === 'draft' || status === 'archived') {
    return null;
  }

  if (status === 'published') {
    return publishedAtInput || fallbackDate || new Date().toISOString();
  }

  if (status === 'scheduled') {
    return publishedAtInput || null;
  }

  return fallbackDate ?? null;
}

export function parsePositiveInteger(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export const SAMPLE_POST_DEFINITIONS: SamplePostDefinition[] = [
  {
    key: 'sample-editorial-systems',
    status: 'published',
    publishedAt: '2026-05-10T09:00:00Z',
    isFeatured: true,
    readingTimeMinutes: 6,
    categorySlug: 'design-system',
    tagSlugs: ['react', 'typescript'],
    changeSummary: 'Added the initial public launch article for the design system track.',
    translations: {
      en: {
        title: 'Designing a Bilingual Editorial System That Scales',
        slug: 'designing-a-bilingual-editorial-system',
        excerpt:
          'How we model language, design tokens, and reusable layouts so the public blog can grow without fragmenting the reader experience.',
        contentText: `# A shared editorial canvas

A bilingual blog becomes hard to manage when each locale feels like a separate product. We wanted one shared publishing workflow with clear translation ownership, repeatable layout decisions, and content that still feels native in each language.

# Where the structure helps

We keep metadata in language-neutral tables and move titles, slugs, and long-form content into translation records. That lets authors and editors update one language without risking the integrity of the other.

- Translation completeness can be tracked per locale.
- Public pages only read published records.
- Design tokens stay stable even when content direction changes.

# Why it matters for the front end

The public blog now reads from a single content model, which makes category archives, tag pages, and SEO metadata much easier to keep aligned across languages.`,
        seoTitle: 'Designing a Bilingual Editorial System',
        seoDescription:
          'A look at the content model and design decisions behind a scalable bilingual editorial platform.',
        coverAlt: 'Editorial design notes laid out beside multilingual content cards.',
      },
      'zh-CN': {
        title: '如何设计可扩展的双语内容系统',
        slug: 'scalable-bilingual-editorial-system',
        excerpt:
          '从语言模型、设计令牌到可复用布局，我们如何让双语博客在持续增长时依然保持统一的阅读体验。',
        contentText: `# 统一的内容画布

如果中英文像两个完全独立的产品，双语博客很快就会变得难以维护。我们希望它共享一套发布流程、清晰的翻译责任边界，以及可重复使用的版式决策，同时又能让每种语言保持自然。

# 结构为什么重要

我们把作者、状态、发布时间等元数据放在语言无关的基础表里，再把标题、slug 和正文放进翻译表。这样作者和编辑可以单独更新某一种语言，而不会破坏另一种语言的内容完整性。

- 每种语言都可以单独追踪翻译完成度。
- 公开页面只读取已发布内容。
- 即使内容方向变化，设计令牌仍然保持稳定。

# 对前台意味着什么

前台博客现在可以从统一的数据结构读取内容，因此分类页、标签页和 SEO 元数据都更容易在中英文之间保持一致。`,
        seoTitle: '如何设计可扩展的双语内容系统',
        seoDescription:
          '拆解一个双语博客平台的内容模型与设计决策，看看它如何支撑持续扩展。',
        coverAlt: '并排展示的中文与英文内容卡片和编辑笔记。',
      },
    },
  },
  {
    key: 'sample-launch-checklist',
    status: 'published',
    publishedAt: '2026-05-22T08:30:00Z',
    isFeatured: false,
    readingTimeMinutes: 5,
    categorySlug: 'product',
    tagSlugs: ['supabase'],
    changeSummary: 'Added a product-facing launch checklist article for published content.',
    translations: {
      en: {
        title: 'A Practical Launch Checklist for Public Content',
        slug: 'practical-launch-checklist-public-content',
        excerpt:
          'Publishing is more than flipping a status flag. This checklist keeps product, editorial, and platform concerns aligned before an article goes live.',
        contentText: `# Publishing is a coordination exercise

When a post becomes public, we are not only exposing text. We are also committing to metadata quality, discoverability, responsive rendering, and a translated experience that does not confuse readers.

# What we verify before publish

- Titles and slugs exist in both languages.
- SEO fields are present for the primary reading path.
- Category and tag relationships support discovery.
- Reading time and publish date make sense for the article.

# The payoff

A strong checklist reduces noisy regressions. Editors publish with confidence, and readers land on pages that feel intentional instead of improvised.`,
        seoTitle: 'Launch Checklist for Public Content',
        seoDescription:
          'A practical publishing checklist for bilingual public content and editorial quality control.',
        coverAlt: 'A launch checklist on paper next to a responsive article preview.',
      },
      'zh-CN': {
        title: '公开内容上线前的实用检查清单',
        slug: 'public-content-launch-checklist',
        excerpt:
          '发布并不只是把状态切到 published，这份清单帮助产品、编辑与平台团队在上线前保持一致。',
        contentText: `# 发布其实是协同动作

一篇文章公开上线时，我们对外暴露的不只是正文，还包括元数据质量、搜索可发现性、响应式呈现，以及不会让读者困惑的双语体验。

# 上线前重点检查什么

- 中英文标题与 slug 是否完整。
- 主要阅读路径的 SEO 字段是否齐全。
- 分类与标签是否能帮助用户发现内容。
- 阅读时长和发布时间是否合理。

# 最终收益

一份可靠的清单能减少很多低级回归。编辑上线更有把握，读者看到的页面也会更完整、更有设计感。`,
        seoTitle: '公开内容上线前的实用检查清单',
        seoDescription:
          '面向双语公开博客的上线检查清单，帮助团队在发布前控制内容质量。',
        coverAlt: '响应式文章预览旁边放着一份上线检查清单。',
      },
    },
  },
  {
    key: 'sample-platform-reading-data',
    status: 'published',
    publishedAt: '2026-06-01T07:15:00Z',
    isFeatured: true,
    readingTimeMinutes: 7,
    categorySlug: 'engineering',
    tagSlugs: ['react', 'supabase'],
    changeSummary: 'Added a platform article explaining basic reading analytics.',
    translations: {
      en: {
        title: 'Adding Lightweight Reading Analytics Without Breaking Trust',
        slug: 'lightweight-reading-analytics-without-breaking-trust',
        excerpt:
          'We only need a small signal to understand what readers open. This post explains how basic view tracking can stay useful without becoming invasive.',
        contentText: `# Measure what helps the team learn

Editorial analytics should help teams understand what gets opened and what needs better packaging. It does not need to become a surveillance system.

# What we store

We record a lightweight post view event with locale, hashed viewer context, referrer, and user agent. That gives editors directional insight while keeping the implementation simple.

# Why the model stays small

- The public reader experience stays fast.
- The data is enough for editorial trend review.
- The platform can evolve later without rewriting the public pages.

# Where this leads next

Once admin content workflows are in place, the same model can support dashboards, revision comparisons, and publishing experiments.`,
        seoTitle: 'Lightweight Reading Analytics for Editorial Teams',
        seoDescription:
          'How the platform records basic post views while keeping the public reading experience simple and trustworthy.',
        coverAlt: 'Analytics cards and article previews displayed on a warm editorial dashboard.',
      },
      'zh-CN': {
        title: '如何在不破坏信任的前提下加入轻量阅读分析',
        slug: 'lightweight-reading-analytics-trust',
        excerpt:
          '编辑团队只需要一个轻量信号来了解读者打开了什么内容，这篇文章解释为什么基础阅读量统计已经足够有价值。',
        contentText: `# 只度量真正有帮助的信号

内容分析应该帮助团队理解哪些文章被打开、哪些标题需要优化，而不是演变成侵入式的监控系统。

# 我们记录什么

目前系统记录的是轻量级的文章浏览事件，包括语言、哈希化的访问上下文、来源页以及浏览器信息。对编辑团队来说，这已经足够提供方向性的判断。

# 为什么保持轻量

- 公开读者的阅读体验更轻。
- 数据已经足够支撑内容趋势复盘。
- 以后平台升级时，不需要重写前台页面。

# 下一步会去哪里

等后台内容工作流补齐后，这套模型还可以继续支持数据看板、修订对比和发布实验。`,
        seoTitle: '轻量阅读分析如何服务内容团队',
        seoDescription:
          '解释平台如何记录基础文章浏览量，并在保持读者体验的同时提供编辑洞察。',
        coverAlt: '暖色调内容看板上展示着浏览统计卡片与文章预览。',
      },
    },
  },
];
