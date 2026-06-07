'use client';

import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';

import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { EditorLinkBubble } from '@/components/content/editor-link-bubble';
import { EditorUploadStatus } from '@/components/content/editor-upload-status';
import { EmojiPicker } from '@/components/content/emoji-picker';
import { HashtagSuggestions } from '@/components/content/hashtag-suggestions';
import { buildLocalePath } from '@/lib/auth/paths';
import {
  contentToTextareaText,
  normalizeStoredContent,
} from '@/lib/content/content-format';
import { sanitizeContentHref } from '@/lib/content/content-sanitization';
import { TiptapImage } from '@/lib/content/tiptap-image';
import { TiptapVideo } from '@/lib/content/tiptap-video';
import type { Locale } from '@/i18n/config';
import type {
  ContentMediaOption,
  ContentTagOption,
  EditorMediaOption,
} from '@/types/content';

import {
  EditorToolbar,
  type EditorToolbarLabels,
} from './editor-toolbar';
import { MediaPickerDialog } from './media-picker-dialog';

type RichPostEditorProps = {
  initialContent: unknown;
  locale: Locale;
  mediaOptions: ContentMediaOption[];
  tags: ContentTagOption[];
  labels: EditorToolbarLabels;
};

type UploadQueueItem = {
  id: string;
  fileName: string;
  status: 'uploading' | 'complete' | 'failed';
  kind: 'image' | 'video';
};

type HashtagSuggestionState = {
  from: number;
  to: number;
  position: {
    top: number;
    left: number;
  };
  tags: ContentTagOption[];
};

function serializeContent(content: unknown) {
  return JSON.stringify(normalizeStoredContent(content));
}

function normalizeLinkInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const maybeUrl =
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#')
      ? trimmed
      : `https://${trimmed}`;

  return sanitizeContentHref(maybeUrl) ?? '';
}

function buildFloatingPosition(
  left: number,
  top: number,
  width: number,
  offsetY: number,
) {
  if (typeof window === 'undefined') {
    return {
      left,
      top,
    };
  }

  const clampedLeft = Math.max(
    16,
    Math.min(left, window.innerWidth - width - 16),
  );

  return {
    left: clampedLeft,
    top: Math.max(16, top + offsetY),
  };
}

function buildMediaNode(media: EditorMediaOption) {
  if (media.kind === 'video') {
    return {
      type: 'video',
      attrs: {
        src: media.publicUrl,
        title: media.fileName,
        assetId: media.id,
        caption: media.caption || null,
        width: media.width ?? undefined,
        height: media.height ?? undefined,
        mimeType: media.mimeType ?? 'video/mp4',
      },
    };
  }

  return {
    type: 'image',
    attrs: {
      src: media.publicUrl,
      alt: media.altText || media.fileName,
      title: media.caption || media.fileName,
      assetId: media.id,
      caption: media.caption || null,
      width: media.width ?? undefined,
      height: media.height ?? undefined,
    },
  };
}

function inferMediaKind(file: File): 'image' | 'video' | null {
  if (file.type.startsWith('image/')) {
    return 'image';
  }

  if (file.type.startsWith('video/')) {
    return 'video';
  }

  return null;
}

function toEditorMediaOptions(mediaOptions: ContentMediaOption[]) {
  return mediaOptions.map((mediaOption) =>
    mediaOption.kind === 'video'
      ? { ...mediaOption, kind: 'video' as const }
      : { ...mediaOption, kind: 'image' as const },
  );
}

async function uploadEditorMediaFile(file: File, locale: Locale) {
  const formData = new FormData();

  formData.set('locale', locale);
  formData.set('file', file);

  const response = await fetch('/api/editor-images', {
    method: 'POST',
    body: formData,
  });

  const payload = (await response.json()) as {
    error?: string;
    media?: EditorMediaOption;
  };

  if (!response.ok || !payload.media) {
    throw new Error(payload.error || 'Unable to upload media');
  }

  return payload.media;
}

export function RichPostEditor({
  initialContent,
  locale,
  mediaOptions,
  tags,
  labels,
}: RichPostEditorProps) {
  const initialDocumentJson = serializeContent(initialContent);
  const initialDocument = JSON.parse(initialDocumentJson);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<EditorMediaOption[]>([]);
  const [contentJsonValue, setContentJsonValue] = useState(() =>
    initialDocumentJson,
  );
  const [contentTextValue, setContentTextValue] = useState(() =>
    contentToTextareaText(initialDocument),
  );
  const [isLinkEditorOpen, setIsLinkEditorOpen] = useState(false);
  const [linkHref, setLinkHref] = useState('');
  const [linkBubblePosition, setLinkBubblePosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const [hashtagSuggestion, setHashtagSuggestion] =
    useState<HashtagSuggestionState | null>(null);
  const media = useMemo(() => {
    const baseMedia = toEditorMediaOptions(mediaOptions);

    return [
      ...uploadedMedia,
      ...baseMedia.filter(
        (mediaOption) =>
          !uploadedMedia.some((uploadedItem) => uploadedItem.id === mediaOption.id),
      ),
    ];
  }, [mediaOptions, uploadedMedia]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
        protocols: ['http', 'https', 'mailto', 'tel'],
      }),
      Underline,
      TiptapImage,
      TiptapVideo,
    ],
    content: initialDocument,
    editorProps: {
      attributes: {
        class:
          'min-h-[24rem] rounded-[1.5rem] bg-white/70 px-5 py-5 text-base leading-8 text-[var(--theme-foreground)] focus:outline-none',
      },
      handleClick(view, _position, event) {
        const target = event.target;

        if (!(target instanceof HTMLElement) || !target.closest('a')) {
          return false;
        }

        const coords = view.coordsAtPos(view.state.selection.from);

        setIsLinkEditorOpen(true);
        setIsEmojiPickerOpen(false);
        setLinkBubblePosition(
          buildFloatingPosition(coords.left, coords.top, 416, -96),
        );
        setLinkHref('');

        return true;
      },
      handlePaste(_view, event) {
        const clipboardFiles = Array.from(event.clipboardData?.files ?? []);
        const itemFiles = Array.from(event.clipboardData?.items ?? [])
          .map((item) => item.getAsFile())
          .filter((file): file is File => Boolean(file));
        const files = [...clipboardFiles, ...itemFiles].filter((file, index, allFiles) => {
          if (!file.type.startsWith('image/')) {
            return false;
          }

          return (
            allFiles.findIndex(
              (candidate) =>
                candidate.name === file.name &&
                candidate.size === file.size &&
                candidate.type === file.type,
            ) === index
          );
        });

        if (files.length === 0) {
          return false;
        }

        event.preventDefault();
        void Promise.all(files.map((file) => uploadAndInsert(file)));

        return true;
      },
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
          Boolean(inferMediaKind(file)),
        );

        if (files.length === 0) {
          return false;
        }

        event.preventDefault();
        setIsDraggingMedia(false);
        const position = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        })?.pos;

        void Promise.all(files.map((file) => uploadAndInsert(file, position)));

        return true;
      },
    },
    onCreate({ editor: nextEditor }) {
      const json = nextEditor.getJSON();

      setContentJsonValue(serializeContent(json));
      setContentTextValue(contentToTextareaText(json));
      syncHashtagSuggestion(nextEditor);
    },
    onUpdate({ editor: nextEditor }) {
      const json = nextEditor.getJSON();

      setContentJsonValue(serializeContent(json));
      setContentTextValue(contentToTextareaText(json));
      syncHashtagSuggestion(nextEditor);

      if (isLinkEditorOpen && nextEditor.isActive('link')) {
        syncLinkBubble(nextEditor);
      }
    },
  });

  function updateUploadQueue(
    uploadId: string,
    nextStatus: UploadQueueItem['status'],
  ) {
    setUploadQueue((currentQueue) =>
      currentQueue.map((item) =>
        item.id === uploadId ? { ...item, status: nextStatus } : item,
      ),
    );
  }

  function insertMedia(mediaOption: EditorMediaOption, position?: number) {
    if (!editor) {
      return;
    }

    const node = buildMediaNode(mediaOption);

    if (typeof position === 'number') {
      editor.chain().focus().insertContentAt(position, node).run();
      return;
    }

    editor.chain().focus().insertContent(node).run();
  }

  async function uploadAndInsert(file: File, position?: number) {
    const kind = inferMediaKind(file);

    if (!kind) {
      return;
    }

    const uploadId = crypto.randomUUID();

    setUploadQueue((currentQueue) => [
      ...currentQueue,
      {
        id: uploadId,
        fileName: file.name,
        status: 'uploading',
        kind,
      },
    ]);

    try {
      const uploadedMedia = await uploadEditorMediaFile(file, locale);

      setUploadedMedia((currentMedia) => [
        uploadedMedia,
        ...currentMedia.filter((item) => item.id !== uploadedMedia.id),
      ]);
      insertMedia(uploadedMedia, position);
      updateUploadQueue(uploadId, 'complete');
    } catch {
      updateUploadQueue(uploadId, 'failed');
    }

    window.setTimeout(() => {
      setUploadQueue((currentQueue) =>
        currentQueue.filter((item) => item.id !== uploadId),
      );
    }, 3200);
  }

  async function uploadSelectedFiles(fileList: FileList | File[], position?: number) {
    const files = Array.from(fileList).filter((file) =>
      Boolean(inferMediaKind(file)),
    );

    if (files.length === 0) {
      return;
    }

    await Promise.all(files.map((file) => uploadAndInsert(file, position)));
  }

  function syncLinkBubble(nextEditor: NonNullable<typeof editor>) {
    const coords = nextEditor.view.coordsAtPos(nextEditor.state.selection.from);

    setLinkBubblePosition(
      buildFloatingPosition(coords.left, coords.top, 416, -96),
    );

    if (nextEditor.isActive('link')) {
      setLinkHref(String(nextEditor.getAttributes('link').href ?? ''));
      return;
    }

    setLinkHref('');
  }

  function syncHashtagSuggestion(nextEditor: NonNullable<typeof editor>) {
    const { from, empty } = nextEditor.state.selection;

    if (!empty) {
      setHashtagSuggestion(null);
      return;
    }

    const textBefore = nextEditor.state.doc.textBetween(
      Math.max(0, from - 80),
      from,
      ' ',
      ' ',
    );
    const match = /(^|\s)#([^\s#]*)$/u.exec(textBefore);

    if (!match) {
      setHashtagSuggestion(null);
      return;
    }

    const query = (match[2] ?? '').trim().toLowerCase();
    const filteredTags = tags
      .filter((tag) => {
        if (!query) {
          return true;
        }

        return (
          tag.name.toLowerCase().includes(query) ||
          tag.slug.toLowerCase().includes(query)
        );
      })
      .slice(0, 6);

    if (filteredTags.length === 0) {
      setHashtagSuggestion(null);
      return;
    }

    const matchedText = match[0];
    const leadingSpace = matchedText.startsWith(' ') ? 1 : 0;
    const start = from - matchedText.length + leadingSpace;
    const coords = nextEditor.view.coordsAtPos(from);

    setHashtagSuggestion({
      from: start,
      to: from,
      position: buildFloatingPosition(coords.left, coords.top, 352, 18),
      tags: filteredTags,
    });
  }

  const handleSelectionChange = useEffectEvent(() => {
    if (!editor) {
      return;
    }

    syncHashtagSuggestion(editor);

    if (editor.isActive('link')) {
      syncLinkBubble(editor);
    } else if (!isLinkEditorOpen) {
      setLinkBubblePosition(null);
    }
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.on('selectionUpdate', handleSelectionChange);
    editor.on('transaction', handleSelectionChange);

    return () => {
      editor.off('selectionUpdate', handleSelectionChange);
      editor.off('transaction', handleSelectionChange);
    };
  }, [editor]);

  const applyLink = () => {
    if (!editor) {
      return;
    }

    const normalizedHref = normalizeLinkInput(linkHref);

    if (!normalizedHref) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setIsLinkEditorOpen(false);
      return;
    }

    if (editor.state.selection.empty && !editor.isActive('link')) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: normalizedHref,
          marks: [{ type: 'link', attrs: { href: normalizedHref } }],
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: normalizedHref })
        .run();
    }

    setIsLinkEditorOpen(false);
  };

  const removeLink = () => {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    setIsLinkEditorOpen(false);
  };

  const insertHashtag = (tag: ContentTagOption) => {
    if (!editor || !hashtagSuggestion) {
      return;
    }

    editor
      .chain()
      .focus()
      .insertContentAt(
        {
          from: hashtagSuggestion.from,
          to: hashtagSuggestion.to,
        },
        [
          {
            type: 'text',
            text: `#${tag.name}`,
            marks: [
              {
                type: 'link',
                attrs: {
                  href: buildLocalePath(
                    locale,
                    `/tag/${encodeURIComponent(tag.slug)}`,
                  ),
                },
              },
            ],
          },
          {
            type: 'text',
            text: ' ',
          },
        ],
      )
      .run();

    setHashtagSuggestion(null);
  };

  return (
    <div className="tiptap-editor space-y-4">
      <EditorUploadStatus
        items={uploadQueue}
        labels={{
          uploading: labels.uploadStatusUploading,
          complete: labels.uploadStatusComplete,
          failed: labels.uploadStatusFailed,
        }}
      />

      <div className="rounded-[2rem] border border-[var(--theme-border)] bg-[rgba(255,255,255,0.52)] p-4 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
        <EditorToolbar
          editor={editor}
          labels={labels}
          isLinkEditorOpen={isLinkEditorOpen}
          isEmojiPickerOpen={isEmojiPickerOpen}
          onToggleLinkEditor={() => {
            if (!editor) {
              return;
            }

            setIsEmojiPickerOpen(false);
            setIsLinkEditorOpen((currentValue) => {
              const nextValue = !currentValue;

              if (nextValue) {
                syncLinkBubble(editor);
              } else {
                setLinkBubblePosition(null);
              }

              return nextValue;
            });
          }}
          onToggleEmojiPicker={() => {
            setIsLinkEditorOpen(false);
            setIsEmojiPickerOpen((currentValue) => !currentValue);
          }}
          onInsertMedia={() => {
            setIsEmojiPickerOpen(false);
            setIsLinkEditorOpen(false);
            setIsMediaPickerOpen(true);
          }}
        />

        <div className="mt-4 space-y-3">
          <div
            className={[
              'rounded-[1.75rem] border border-dashed px-5 py-5 transition',
              isDraggingMedia
                ? 'border-[var(--theme-accent)] bg-[rgba(194,65,12,0.08)] ring-4 ring-[rgba(194,65,12,0.12)]'
                : 'border-[var(--theme-border)] bg-[rgba(255,255,255,0.72)]',
            ].join(' ')}
            onDragOver={(event) => {
              if (
                Array.from(event.dataTransfer?.items ?? []).some((item) =>
                  item.type.startsWith('image/') || item.type.startsWith('video/'),
                )
              ) {
                event.preventDefault();
                setIsDraggingMedia(true);
              }
            }}
            onDragLeave={() => setIsDraggingMedia(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDraggingMedia(false);
              void uploadSelectedFiles(event.dataTransfer?.files ?? []);
            }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold tracking-[0.12em] text-[var(--theme-accent)] uppercase">
                  {labels.uploadZoneTitle}
                </p>
                <p className="text-sm leading-7 text-[var(--theme-muted)]">
                  {labels.uploadZoneDescription}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  className="rounded-full bg-[var(--theme-accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(194,65,12,0.24)]"
                >
                  {labels.uploadZoneButton}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="rounded-full border border-[var(--theme-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--theme-foreground)]"
                >
                  {labels.imageDialogExisting}
                </button>
              </div>
            </div>

            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(event) => {
                const files = event.target.files;

                if (files && files.length > 0) {
                  void uploadSelectedFiles(files);
                }

                event.target.value = '';
              }}
            />
          </div>

          <EmojiPicker
            open={isEmojiPickerOpen}
            title={labels.emojiPickerTitle}
            onSelect={(emoji) => {
              editor?.chain().focus().insertContent(emoji).run();
              setIsEmojiPickerOpen(false);
            }}
          />

          <div
            className={[
              'rounded-[1.75rem] border bg-white/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition',
              isDraggingMedia
                ? 'border-[var(--theme-accent)] ring-4 ring-[rgba(194,65,12,0.12)]'
                : 'border-[var(--theme-border)]',
            ].join(' ')}
            onDragOver={(event) => {
              if (
                Array.from(event.dataTransfer?.items ?? []).some((item) =>
                  item.type.startsWith('image/') || item.type.startsWith('video/'),
                )
              ) {
                event.preventDefault();
                setIsDraggingMedia(true);
              }
            }}
            onDragLeave={() => setIsDraggingMedia(false)}
            onDrop={() => setIsDraggingMedia(false)}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <EditorLinkBubble
        open={isLinkEditorOpen}
        href={linkHref}
        position={linkBubblePosition}
        labels={{
          url: labels.linkBubbleUrl,
          save: labels.linkBubbleSave,
          remove: labels.linkBubbleRemove,
          close: labels.linkBubbleClose,
        }}
        onHrefChange={setLinkHref}
        onApply={applyLink}
        onRemove={removeLink}
        onClose={() => setIsLinkEditorOpen(false)}
      />

      <HashtagSuggestions
        open={Boolean(hashtagSuggestion)}
        title={labels.hashtagSuggestionsTitle}
        tags={hashtagSuggestion?.tags ?? []}
        position={hashtagSuggestion?.position ?? null}
        onSelect={insertHashtag}
      />

      <MediaPickerDialog
        open={isMediaPickerOpen}
        media={media}
        labels={{
          title: labels.imageDialogTitle,
          close: labels.imageDialogClose,
          existingTitle: labels.imageDialogExisting,
          empty: labels.imageDialogEmpty,
          insert: labels.imageDialogInsert,
          filterAll: labels.imageDialogFilterAll,
          filterImages: labels.imageDialogFilterImages,
          filterVideos: labels.imageDialogFilterVideos,
        }}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(selectedMedia) => {
          insertMedia(selectedMedia);
          setIsMediaPickerOpen(false);
        }}
      />

      <textarea readOnly hidden name="contentJson" value={contentJsonValue} />
      <textarea readOnly hidden name="contentText" value={contentTextValue} />
    </div>
  );
}
