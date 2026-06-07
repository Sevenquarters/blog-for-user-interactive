'use client';

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
      className="fixed z-50 w-[min(26rem,calc(100vw-2rem))] rounded-[1.25rem] border border-[var(--theme-border)] bg-white/98 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-[var(--theme-foreground)]">
          {labels.url}
        </label>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-[var(--theme-border)] px-3 py-1 text-xs font-semibold text-[var(--theme-muted)]"
        >
          {labels.close}
        </button>
      </div>
      <input
        type="url"
        value={href}
        onChange={(event) => onHrefChange(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onApply}
          className="rounded-full bg-[var(--theme-accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          {labels.save}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full border border-[var(--theme-border)] px-4 py-2 text-sm font-semibold text-[var(--theme-foreground)]"
        >
          {labels.remove}
        </button>
      </div>
    </div>
  );
}

