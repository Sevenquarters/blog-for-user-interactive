'use client';

import type { ContentTagOption } from '@/types/content';

type HashtagSuggestionsProps = {
  open: boolean;
  title: string;
  tags: ContentTagOption[];
  position: {
    top: number;
    left: number;
  } | null;
  onSelect: (tag: ContentTagOption) => void;
};

export function HashtagSuggestions({
  open,
  title,
  tags,
  position,
  onSelect,
}: HashtagSuggestionsProps) {
  if (!open || !position || tags.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed z-50 w-[min(22rem,calc(100vw-2rem))] rounded-[1.25rem] border border-[var(--theme-border)] bg-white/98 p-3 shadow-[0_24px_60px_rgba(15,23,42,0.14)]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <p className="px-2 pb-2 text-xs font-semibold tracking-[0.12em] text-[var(--theme-muted)] uppercase">
        {title}
      </p>
      <div className="space-y-1">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onSelect(tag)}
            className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left transition hover:bg-[rgba(194,65,12,0.08)]"
          >
            <span className="font-medium text-[var(--theme-foreground)]">
              #{tag.name}
            </span>
            <span className="text-xs text-[var(--theme-muted)]">{tag.slug}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

