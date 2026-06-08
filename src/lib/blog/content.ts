import {
  extractContentText,
  normalizeStoredContent,
  type TipTapBlockNode,
} from '@/lib/content/content-format';
import { sanitizeContentMediaSrc } from '@/lib/content/content-sanitization';

export { extractContentText };

export function buildExcerptFromContent(
  content: unknown,
  maxLength = 180,
): string | null {
  const text = extractContentText(content);

  if (!text) {
    return null;
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

type ContentPreviewImage = {
  url: string;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
};

function findFirstImageNode(blocks: TipTapBlockNode[]): TipTapBlockNode | null {
  for (const block of blocks) {
    if (block.type === 'image') {
      return block;
    }

    if ('content' in block && Array.isArray(block.content)) {
      const nestedImage = findFirstImageNode(block.content as TipTapBlockNode[]);

      if (nestedImage) {
        return nestedImage;
      }
    }
  }

  return null;
}

export function extractPreviewImageFromContent(
  content: unknown,
): ContentPreviewImage | null {
  const imageNode = findFirstImageNode(normalizeStoredContent(content).content);

  if (!imageNode || imageNode.type !== 'image') {
    return null;
  }

  const url = sanitizeContentMediaSrc(imageNode.attrs?.src);

  if (!url) {
    return null;
  }

  return {
    url,
    alt: imageNode.attrs?.alt?.trim() || null,
    caption: imageNode.attrs?.caption?.trim() || null,
    width: imageNode.attrs?.width ?? null,
    height: imageNode.attrs?.height ?? null,
  };
}
