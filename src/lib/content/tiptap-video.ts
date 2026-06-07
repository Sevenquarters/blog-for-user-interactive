import { Node, mergeAttributes } from '@tiptap/core';

export const TiptapVideo = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: null,
      },
      assetId: {
        default: null,
      },
      caption: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      mimeType: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'video[data-editor-video]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(HTMLAttributes, {
        'data-editor-video': 'true',
        controls: 'true',
        preload: 'metadata',
      }),
    ];
  },
});

