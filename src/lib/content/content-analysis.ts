import {
  normalizeStoredContent,
  type TipTapBlockNode,
  type TipTapDoc,
  type TipTapInlineNode,
} from '@/lib/content/content-format';

export type ContentHeading = {
  id: string;
  level: 1 | 2 | 3;
  text: string;
};

export type ContentAnalysis = {
  headings: ContentHeading[];
  wordCount: number;
  estimatedReadingTimeMinutes: number;
};

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function extractInlineText(content: TipTapInlineNode[] | undefined) {
  return collapseWhitespace(
    (content ?? [])
      .map((node) => (node.type === 'hardBreak' ? ' ' : node.text))
      .join(' '),
  );
}

function slugifyHeading(value: string) {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');

  return normalized || 'section';
}

function countWords(value: string) {
  const latinWords = value.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? [];
  const cjkCharacters =
    value.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu) ??
    [];

  return latinWords.length + cjkCharacters.length;
}

function collectBlockText(block: TipTapBlockNode): string[] {
  if (block.type === 'paragraph' || block.type === 'heading') {
    const text = extractInlineText(block.content);

    return text ? [text] : [];
  }

  if (block.type === 'blockquote' || block.type === 'listItem') {
    return (block.content ?? []).flatMap((child) => collectBlockText(child));
  }

  if (block.type === 'bulletList' || block.type === 'orderedList') {
    return (block.content ?? []).flatMap((child) => collectBlockText(child));
  }

  if (block.type === 'codeBlock') {
    const code = collapseWhitespace(
      (block.content ?? []).map((node) => node.text).join(' '),
    );

    return code ? [code] : [];
  }

  if (block.type === 'image') {
    const alt = collapseWhitespace(block.attrs?.alt ?? '');
    const caption = collapseWhitespace(block.attrs?.caption ?? '');

    return alt || caption ? [alt || caption] : [];
  }

  if (block.type === 'video') {
    const title = collapseWhitespace(block.attrs?.title ?? '');
    const caption = collapseWhitespace(block.attrs?.caption ?? '');

    return title || caption ? [title || caption] : [];
  }

  return [];
}

export function analyzeTipTapDocument(document: TipTapDoc): ContentAnalysis {
  const headings: ContentHeading[] = [];
  const slugCounts = new Map<string, number>();

  for (const block of document.content) {
    if (block.type !== 'heading') {
      continue;
    }

    const level = Math.min(Math.max(block.attrs?.level ?? 2, 1), 3) as
      | 1
      | 2
      | 3;
    const text = extractInlineText(block.content);

    if (!text) {
      continue;
    }

    const baseId = slugifyHeading(text);
    const currentCount = slugCounts.get(baseId) ?? 0;
    slugCounts.set(baseId, currentCount + 1);

    headings.push({
      id: currentCount === 0 ? baseId : `${baseId}-${currentCount + 1}`,
      level,
      text,
    });
  }

  const text = document.content.flatMap((block) => collectBlockText(block)).join(' ');
  const wordCount = countWords(text);

  return {
    headings,
    wordCount,
    estimatedReadingTimeMinutes: Math.max(1, Math.ceil(wordCount / 220)),
  };
}

export function analyzeContent(content: unknown) {
  return analyzeTipTapDocument(normalizeStoredContent(content));
}
