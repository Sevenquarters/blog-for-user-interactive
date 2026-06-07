'use client';

import type { ReactNode } from 'react';

import type { Editor } from '@tiptap/react';

export type EditorToolbarLabels = {
  paragraph: string;
  heading1: string;
  heading2: string;
  heading3: string;
  bold: string;
  italic: string;
  underline: string;
  link: string;
  blockquote: string;
  codeBlock: string;
  bulletList: string;
  orderedList: string;
  horizontalRule: string;
  media: string;
  emoji: string;
  imageDialogTitle: string;
  imageDialogClose: string;
  imageDialogExisting: string;
  imageDialogEmpty: string;
  imageDialogInsert: string;
  imageDialogFilterAll: string;
  imageDialogFilterImages: string;
  imageDialogFilterVideos: string;
  linkBubbleUrl: string;
  linkBubbleSave: string;
  linkBubbleRemove: string;
  linkBubbleClose: string;
  emojiPickerTitle: string;
  hashtagSuggestionsTitle: string;
  uploadStatusUploading: string;
  uploadStatusComplete: string;
  uploadStatusFailed: string;
  uploadZoneTitle: string;
  uploadZoneDescription: string;
  uploadZoneButton: string;
};

type EditorToolbarProps = {
  editor: Editor | null;
  labels: EditorToolbarLabels;
  isLinkEditorOpen: boolean;
  isEmojiPickerOpen: boolean;
  onToggleLinkEditor: () => void;
  onToggleEmojiPicker: () => void;
  onInsertMedia: () => void;
};

function getButtonClassName(isActive: boolean) {
  return [
    'rounded-full border px-3 py-2 text-xs font-semibold tracking-[0.08em] transition',
    isActive
      ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)] text-white shadow-[0_12px_24px_rgba(194,65,12,0.18)]'
      : 'border-[var(--theme-border)] bg-white/90 text-[var(--theme-foreground)] hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)]',
  ].join(' ');
}

function ToolbarButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={getButtonClassName(active)}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function ToolbarGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-[1.4rem] border border-[var(--theme-border)] bg-[rgba(255,255,255,0.7)] p-2">
      {children}
    </div>
  );
}

export function EditorToolbar({
  editor,
  labels,
  isLinkEditorOpen,
  isEmojiPickerOpen,
  onToggleLinkEditor,
  onToggleEmojiPicker,
  onInsertMedia,
}: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <ToolbarGroup>
          <ToolbarButton
            active={editor.isActive('paragraph')}
            label={labels.paragraph}
            onClick={() => editor.chain().focus().setParagraph().run()}
          />
          <ToolbarButton
            active={editor.isActive('heading', { level: 1 })}
            label={labels.heading1}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          />
          <ToolbarButton
            active={editor.isActive('heading', { level: 2 })}
            label={labels.heading2}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />
          <ToolbarButton
            active={editor.isActive('heading', { level: 3 })}
            label={labels.heading3}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          />
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarButton
            active={editor.isActive('bold')}
            label={labels.bold}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            active={editor.isActive('italic')}
            label={labels.italic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            active={editor.isActive('underline')}
            label={labels.underline}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <ToolbarButton
            active={editor.isActive('link') || isLinkEditorOpen}
            label={labels.link}
            onClick={onToggleLinkEditor}
          />
          <ToolbarButton
            active={isEmojiPickerOpen}
            label={labels.emoji}
            onClick={onToggleEmojiPicker}
          />
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarButton
            active={editor.isActive('blockquote')}
            label={labels.blockquote}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
          <ToolbarButton
            active={editor.isActive('codeBlock')}
            label={labels.codeBlock}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          />
          <ToolbarButton
            active={editor.isActive('bulletList')}
            label={labels.bulletList}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            active={editor.isActive('orderedList')}
            label={labels.orderedList}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            active={false}
            label={labels.horizontalRule}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          />
          <ToolbarButton
            active={false}
            label={labels.media}
            onClick={onInsertMedia}
          />
        </ToolbarGroup>
      </div>
    </div>
  );
}
