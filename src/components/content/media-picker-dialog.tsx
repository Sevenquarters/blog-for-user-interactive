'use client';

import { useMemo, useState } from 'react';

import type { EditorMediaOption } from '@/types/content';
import { Badge, Button, Dialog, TabsList, tabTriggerClassName } from '@/components/ui';

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
  return tabTriggerClassName(active, 'text-xs font-semibold tracking-[0.08em]');
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
    <Dialog
      open={open}
      title={labels.title}
      onClose={onClose}
      closeLabel={labels.close}
      className="max-w-6xl"
    >
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--theme-foreground)]">
            {labels.existingTitle}
          </h3>
          <TabsList className="p-1">
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
          </TabsList>
        </div>

        {filteredMedia.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--theme-border-strong)] bg-white/60 p-8 text-sm text-[var(--theme-muted)]">
            {labels.empty}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredMedia.map((mediaOption) => (
              <article
                key={mediaOption.id}
                className="group overflow-hidden rounded-[1.6rem] border border-[var(--theme-border)] bg-white/82 shadow-[0_18px_48px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_68px_rgba(15,23,42,0.12)]"
              >
                <div className="overflow-hidden">{renderMediaPreview(mediaOption)}</div>
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-[var(--theme-foreground)]">
                      {mediaOption.fileName}
                    </p>
                    <Badge variant="outline" className="text-[10px] tracking-[0.12em] uppercase">
                      {mediaOption.kind}
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-[var(--theme-muted)]">
                    {mediaOption.altText || mediaOption.caption || mediaOption.fileName}
                  </p>
                  <Button
                    type="button"
                    onClick={() => onSelect(mediaOption)}
                    variant="primary"
                    size="sm"
                  >
                    {labels.insert}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Dialog>
  );
}
