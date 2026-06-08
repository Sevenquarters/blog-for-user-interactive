'use client';

import Link from 'next/link';
import { startTransition, useDeferredValue, useMemo, useState } from 'react';

import Fuse from 'fuse.js';

import { Badge, Card, Input } from '@/components/ui';
import type { SearchableBlogPost } from '@/types/blog';

type GlobalSearchProps = {
  locale: string;
  posts: SearchableBlogPost[];
  labels: {
    title: string;
    description: string;
    inputPlaceholder: string;
    emptyIdle: string;
    emptyResults: string;
    readingTime: (minutes: number) => string;
  };
};

export function GlobalSearch({ posts, locale, labels }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim();

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        threshold: 0.34,
        includeScore: true,
        minMatchCharLength: 2,
        keys: [
          { name: 'title', weight: 0.45 },
          { name: 'excerpt', weight: 0.2 },
          { name: 'searchText', weight: 0.2 },
          { name: 'category.name', weight: 0.1 },
          { name: 'tags.name', weight: 0.05 },
        ],
      }),
    [posts],
  );

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return posts.slice(0, 8);
    }

    return fuse.search(normalizedQuery).map((result) => result.item);
  }, [fuse, normalizedQuery, posts]);

  return (
    <div className="space-y-6">
      <Card tone="hero" className="p-8 sm:p-10">
        <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
          {labels.title}
        </p>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--theme-muted)]">
          {labels.description}
        </p>
        <Input
          type="search"
          value={query}
          onChange={(event) => {
            const nextValue = event.target.value;
            startTransition(() => setQuery(nextValue));
          }}
          placeholder={labels.inputPlaceholder}
          className="mt-6 min-h-13 text-base"
        />
      </Card>

      {results.length === 0 ? (
        <Card className="p-6 text-base leading-8 text-[var(--theme-muted)]">
          {normalizedQuery ? labels.emptyResults : labels.emptyIdle}
        </Card>
      ) : (
        <div className="grid gap-4">
          {results.map((post) => (
            <Card key={post.id} as="article" interactive className="p-5">
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--theme-muted)]">
                <span>
                  {new Intl.DateTimeFormat(locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }).format(new Date(post.publishedAt))}
                </span>
                <span>{labels.readingTime(post.readingTimeMinutes ?? 1)}</span>
                {post.category ? <Badge>{post.category.name}</Badge> : null}
              </div>

              <div className="mt-4 space-y-3">
                <Link
                  href={`/${locale}/blog/${encodeURIComponent(post.slug)}`}
                  className="inline-block text-2xl font-semibold tracking-tight text-[var(--theme-foreground)] transition hover:text-[var(--theme-accent)]"
                >
                  {post.title}
                </Link>
                {post.excerpt ? (
                  <p className="text-base leading-7 text-[var(--theme-muted)]">
                    {post.excerpt}
                  </p>
                ) : null}
                {post.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag.id}>#{tag.name}</Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
