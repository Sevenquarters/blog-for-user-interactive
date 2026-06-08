'use client';

import { useEffect, useState } from 'react';

import type { ContentHeading } from '@/lib/content/content-analysis';
import { Card, cn } from '@/components/ui';

type PostTableOfContentsProps = {
  title: string;
  headings: ContentHeading[];
};

export function PostTableOfContents({
  title,
  headings,
}: PostTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (headings.length === 0) {
      return;
    }

    const observers = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (observers.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (entryA, entryB) => entryA.boundingClientRect.top - entryB.boundingClientRect.top,
          );

        if (visibleEntries[0]?.target.id) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-20% 0px -65% 0px',
        threshold: [0, 1],
      },
    );

    observers.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <Card className="p-5">
      <p className="text-sm font-semibold tracking-[0.14em] text-[var(--theme-accent)] uppercase">
        {title}
      </p>
      <nav aria-label={title} className="mt-4 space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={cn(
              'block rounded-2xl px-3 py-2 text-sm leading-6 transition',
              heading.level === 1 && 'font-semibold',
              heading.level === 2 && 'pl-4',
              heading.level === 3 && 'pl-6 text-[var(--theme-muted)]',
              activeId === heading.id
                ? 'bg-[rgba(194,65,12,0.12)] text-[var(--theme-accent)]'
                : 'text-[var(--theme-foreground)] hover:bg-white/70',
            )}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </Card>
  );
}
