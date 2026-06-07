'use client';

import { useMemo, useState } from 'react';

import type { EditorMediaOption } from '@/types/content';

type MediaPickerLabels = {
  title: string;
  close: string;
  existingTitle: string;
  empty: string;
  insert: string;
  filterAll: string;
  filterImages: string;
  filterVideos: string;
};

type MediaPickerDialogProps = {
  open: boolean;
  media: EditorMediaOption[];
  labels: MediaPickerLabels;
  onClose: () => void;
  onSelect: (media: EditorMediaOption) => void;
};

type MediaFilter = 'all' | 'image' | 'video';

function getFilterButtonClassName(active: boolean) {
  return [
    'rounded-full border px-3 py-2 text-xs font-semibold tracking-[0.08em] transition',
    active
      ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)] text-white'
      : 'border-[var(--theme-border)] bg-white text-[var(--theme-foreground)]',
  ].join(' ');
}

function renderMediaPreview(media: EditorMediaOption) {
  if (media.kind === 'video') {
    return (
      <video
        src={media.publicUrl}
        controls
        preload="metadata"
        className="h-44 w-full bg-slate-950 object-cover"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.publicUrl}
      alt={media.altText || media.fileName}
      className="h-44 w-full object-cover"
    />
  );
}

export function MediaPickerDialog({
  open,
  media,
  labels,
  onClose,
  onSelect,
}: MediaPickerDialogProps) {
  const [activeFilter, setActiveFilter] = useState<MediaFilter>('all');
  const filteredMedia = useMemo(
    () =>
      media.filter((mediaOption) =>
        activeFilter === 'all' ? true : mediaOption.kind === activeFilter,
      ),
    [activeFilter, media],
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-background)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--theme-foreground)]">
            {labels.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--theme-border)] px-4 py-2 text-sm font-medium text-[var(--theme-foreground)]"
          >
            {labels.close}
          </button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4 xl:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">
                {labels.existingTitle}
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={getFilterButtonClassName(activeFilter === 'all')}
                >
                  {labels.filterAll}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('image')}
                  className={getFilterButtonClassName(activeFilter === 'image')}
                >
                  {labels.filterImages}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('video')}
                  className={getFilterButtonClassName(activeFilter === 'video')}
                >
                  {labels.filterVideos}
                </button>
              </div>
            </div>

            {filteredMedia.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--theme-border)] bg-white/60 p-6 text-sm text-[var(--theme-muted)]">
                {labels.empty}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredMedia.map((mediaOption) => (
                  <article
                    key={mediaOption.id}
                    className="overflow-hidden rounded-[1.5rem] border border-[var(--theme-border)] bg-white/80"
                  >
                    {renderMediaPreview(mediaOption)}
                    <div className="space-y-2 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-[var(--theme-foreground)]">
                          {mediaOption.fileName}
                        </p>
                        <span className="rounded-full border border-[var(--theme-border)] px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--theme-muted)] uppercase">
                          {mediaOption.kind}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-[var(--theme-muted)]">
                        {mediaOption.altText || mediaOption.caption || mediaOption.fileName}
                      </p>
                      <button
                        type="button"
                        onClick={() => onSelect(mediaOption)}
                        className="rounded-full bg-[var(--theme-accent)] px-4 py-2 text-sm font-semibold text-white"
                      >
                        {labels.insert}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
