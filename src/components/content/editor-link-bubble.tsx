'use client';

import { Button, Input } from '@/components/ui';

type EditorLinkBubbleProps = {
  open: boolean;
  href: string;
  position: {
    top: number;
    left: number;
  } | null;
  labels: {
    url: string;
    save: string;
    remove: string;
    close: string;
  };
  onHrefChange: (value: string) => void;
  onApply: () => void;
  onRemove: () => void;
  onClose: () => void;
};

export function EditorLinkBubble({
  open,
  href,
  position,
  labels,
  onHrefChange,
  onApply,
  onRemove,
  onClose,
}: EditorLinkBubbleProps) {
  if (!open || !position) {
    return null;
  }

  return (
    <div
      className="fixed z-50 w-[min(26rem,calc(100vw-2rem))] rounded-[1.4rem] border border-[var(--theme-border)] bg-white/98 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-[var(--theme-foreground)]">
          {labels.url}
        </label>
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>
          {labels.close}
        </Button>
      </div>
      <Input
        type="url"
        value={href}
        onChange={(event) => onHrefChange(event.target.value)}
        className="mt-3"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" onClick={onApply} variant="primary" size="sm">
          {labels.save}
        </Button>
        <Button type="button" onClick={onRemove} variant="secondary" size="sm">
          {labels.remove}
        </Button>
      </div>
    </div>
  );
}

