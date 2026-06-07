'use client';

const EMOJI_GROUPS = [
  ['😀', '😂', '😍', '🥹', '🤔', '👏', '🔥', '✨'],
  ['👍', '👀', '🎯', '🚀', '💡', '🧠', '📌', '🛠️'],
  ['📷', '🎬', '📝', '📚', '💬', '🌍', '❤️', '☕'],
];

type EmojiPickerProps = {
  open: boolean;
  title: string;
  onSelect: (emoji: string) => void;
};

export function EmojiPicker({ open, title, onSelect }: EmojiPickerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="rounded-[1.25rem] border border-[var(--theme-border)] bg-white/95 p-4 shadow-[0_20px_48px_rgba(15,23,42,0.12)]">
      <p className="text-sm font-semibold text-[var(--theme-foreground)]">
        {title}
      </p>
      <div className="mt-3 space-y-2">
        {EMOJI_GROUPS.map((group, index) => (
          <div key={index} className="flex flex-wrap gap-2">
            {group.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onSelect(emoji)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--theme-border)] bg-white text-xl transition hover:-translate-y-0.5 hover:border-[var(--theme-accent)]"
              >
                {emoji}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

