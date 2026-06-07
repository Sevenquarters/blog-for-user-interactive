type TipTapMarkType = 'bold' | 'italic' | 'underline' | 'code' | 'link';

type TipTapLinkAttrs = {
  href?: string | null;
};

export type TipTapMark = {
  type: TipTapMarkType;
  attrs?: TipTapLinkAttrs;
};

export type TipTapTextNode = {
  type: 'text';
  text: string;
  marks?: TipTapMark[];
};

export type TipTapHardBreakNode = {
  type: 'hardBreak';
};

export type TipTapInlineNode = TipTapTextNode | TipTapHardBreakNode;

export type TipTapParagraphNode = {
  type: 'paragraph';
  content?: TipTapInlineNode[];
};

export type TipTapHeadingNode = {
  type: 'heading';
  attrs?: {
    level?: number;
  };
  content?: TipTapInlineNode[];
};

export type TipTapBlockquoteNode = {
  type: 'blockquote';
  content?: TipTapBlockNode[];
};

export type TipTapListItemNode = {
  type: 'listItem';
  content?: TipTapBlockNode[];
};

export type TipTapBulletListNode = {
  type: 'bulletList';
  content?: TipTapListItemNode[];
};

export type TipTapOrderedListNode = {
  type: 'orderedList';
  attrs?: {
    start?: number;
  };
  content?: TipTapListItemNode[];
};

export type TipTapHorizontalRuleNode = {
  type: 'horizontalRule';
};

export type TipTapCodeBlockNode = {
  type: 'codeBlock';
  attrs?: {
    language?: string | null;
  };
  content?: TipTapTextNode[];
};

export type TipTapImageNode = {
  type: 'image';
  attrs?: {
    src?: string | null;
    alt?: string | null;
    title?: string | null;
    assetId?: string | null;
    caption?: string | null;
    width?: number | null;
    height?: number | null;
  };
};

export type TipTapVideoNode = {
  type: 'video';
  attrs?: {
    src?: string | null;
    title?: string | null;
    assetId?: string | null;
    caption?: string | null;
    width?: number | null;
    height?: number | null;
    mimeType?: string | null;
  };
};

export type TipTapBlockNode =
  | TipTapParagraphNode
  | TipTapHeadingNode
  | TipTapBlockquoteNode
  | TipTapListItemNode
  | TipTapBulletListNode
  | TipTapOrderedListNode
  | TipTapHorizontalRuleNode
  | TipTapCodeBlockNode
  | TipTapImageNode
  | TipTapVideoNode;

export type TipTapDoc = {
  type: 'doc';
  content: TipTapBlockNode[];
};

type LegacyBlock = {
  type?: unknown;
  text?: unknown;
  content?: unknown;
  items?: unknown[];
  children?: unknown[];
};

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n?/g, '\n');
}

function collapseWhitespace(value: string) {
  return value.replace(/[ \t\f\v]+/g, ' ').trim();
}

function decodeHtmlEntities(value: string) {
  return value.replace(
    /&(#x?[0-9a-f]+|nbsp|amp|lt|gt|quot|apos);/gi,
    (entity, rawCode: string) => {
      const code = rawCode.toLowerCase();

      if (code === 'nbsp') {
        return ' ';
      }

      if (code === 'amp') {
        return '&';
      }

      if (code === 'lt') {
        return '<';
      }

      if (code === 'gt') {
        return '>';
      }

      if (code === 'quot') {
        return '"';
      }

      if (code === 'apos') {
        return "'";
      }

      const parsed = code.startsWith('#x')
        ? Number.parseInt(code.slice(2), 16)
        : code.startsWith('#')
          ? Number.parseInt(code.slice(1), 10)
          : Number.NaN;

      if (!Number.isFinite(parsed)) {
        return entity;
      }

      try {
        return String.fromCodePoint(parsed);
      } catch {
        return entity;
      }
    },
  );
}

function stripUnsafeHtml(value: string) {
  return value
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(iframe|object|embed|svg|canvas)[\s\S]*?>[\s\S]*?<\/\1>/gi, ' ');
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function createTextNode(text: string): TipTapTextNode | null {
  const normalized = collapseWhitespace(decodeHtmlEntities(text));

  return normalized ? { type: 'text', text: normalized } : null;
}

function createParagraphFromLines(lines: string[]) {
  const content: TipTapInlineNode[] = [];

  lines.forEach((line, index) => {
    const textNode = createTextNode(line);

    if (textNode) {
      content.push(textNode);
    }

    if (index < lines.length - 1 && line.trim()) {
      content.push({ type: 'hardBreak' });
    }
  });

  if (content.length === 0) {
    return null;
  }

  return {
    type: 'paragraph',
    content,
  } satisfies TipTapParagraphNode;
}

function blockNodesToDoc(content: TipTapBlockNode[]): TipTapDoc {
  return {
    type: 'doc',
    content,
  };
}

export function createEmptyTipTapDoc(): TipTapDoc {
  return blockNodesToDoc([]);
}

function createListNode(
  type: 'bulletList' | 'orderedList',
  items: string[],
): TipTapBulletListNode | TipTapOrderedListNode | null {
  const content = items
    .map((item) => collapseWhitespace(item))
    .filter(Boolean)
    .map(
      (item) =>
        ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: item }],
            },
          ],
        }) satisfies TipTapListItemNode,
    );

  if (content.length === 0) {
    return null;
  }

  if (type === 'bulletList') {
    return {
      type,
      content,
    };
  }

  return {
    type,
    attrs: {
      start: 1,
    },
    content,
  };
}

function textareaSectionToBlocks(section: string): TipTapBlockNode[] {
  const lines = normalizeLineEndings(section)
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return [];
  }

  const headingMatch = lines[0]?.match(/^(#{1,6})\s+(.+)$/);

  if (headingMatch) {
    const level = Math.min(headingMatch[1].length, 6);
    const text = [headingMatch[2], ...lines.slice(1)].join(' ');
    const textNode = createTextNode(text);

    if (!textNode) {
      return [];
    }

    return [
      {
        type: 'heading',
        attrs: { level },
        content: [textNode],
      },
    ];
  }

  if (lines.length === 1 && /^(---|\*\*\*|___)$/.test(lines[0].trim())) {
    return [{ type: 'horizontalRule' }];
  }

  if (lines[0] === '```' && lines[lines.length - 1] === '```') {
    const codeContent = lines.slice(1, -1).join('\n');

    return codeContent
      ? [
          {
            type: 'codeBlock',
            attrs: {
              language: null,
            },
            content: [
              {
                type: 'text',
                text: codeContent,
              },
            ],
          },
        ]
      : [];
  }

  const unorderedItems = lines
    .map((line) => line.match(/^[-*]\s+(.+)$/)?.[1] ?? null)
    .filter((value): value is string => Boolean(value));

  if (unorderedItems.length === lines.length) {
    const list = createListNode('bulletList', unorderedItems);

    return list ? [list] : [];
  }

  const orderedItems = lines
    .map((line) => line.match(/^\d+[.)]\s+(.+)$/)?.[1] ?? null)
    .filter((value): value is string => Boolean(value));

  if (orderedItems.length === lines.length) {
    const list = createListNode('orderedList', orderedItems);

    return list ? [list] : [];
  }

  const quoteLines = lines
    .map((line) => line.match(/^>\s?(.*)$/)?.[1] ?? null)
    .filter((value): value is string => value !== null);

  if (quoteLines.length === lines.length) {
    const paragraph = createParagraphFromLines(quoteLines);

    return paragraph
      ? [
          {
            type: 'blockquote',
            content: [paragraph],
          },
        ]
      : [];
  }

  const paragraph = createParagraphFromLines(lines);

  return paragraph ? [paragraph] : [];
}

export function textareaTextToTipTapDoc(value: string): TipTapDoc {
  const sections = normalizeLineEndings(value)
    .split(/\n{2,}/)
    .map((section) => section.trim())
    .filter(Boolean);

  return blockNodesToDoc(
    sections.flatMap((section) => textareaSectionToBlocks(section)),
  );
}

function legacyHtmlToPlainText(value: string) {
  const sanitized = stripUnsafeHtml(normalizeLineEndings(value));

  return decodeHtmlEntities(
    sanitized
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<hr\s*\/?>/gi, '\n\n---\n\n')
      .replace(/<li[^>]*>/gi, '\n- ')
      .replace(/<\/li>/gi, '')
      .replace(/<blockquote[^>]*>/gi, '\n\n> ')
      .replace(/<\/blockquote>/gi, '\n\n')
      .replace(/<h([1-6])[^>]*>/gi, (_, level: string) => {
        const depth = Number.parseInt(level, 10);
        return `\n\n${'#'.repeat(Math.max(depth, 1))} `;
      })
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<(p|div|section|article|pre|ul|ol)[^>]*>/gi, '\n\n')
      .replace(/<\/(p|div|section|article|pre|ul|ol)>/gi, '\n\n')
      .replace(/<code[^>]*>/gi, '`')
      .replace(/<\/code>/gi, '`')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
  );
}

function collectLegacyBlockText(block: LegacyBlock) {
  if (typeof block.text === 'string') {
    return block.text;
  }

  if (typeof block.content === 'string') {
    return block.content;
  }

  return '';
}

function legacyBlockToNodes(block: unknown): TipTapBlockNode[] {
  if (typeof block === 'string') {
    return textareaTextToTipTapDoc(block).content;
  }

  if (typeof block !== 'object' || block === null) {
    return [];
  }

  const legacyBlock = block as LegacyBlock;
  const type =
    typeof legacyBlock.type === 'string'
      ? legacyBlock.type.toLowerCase()
      : 'paragraph';

  if (type === 'html' && typeof legacyBlock.content === 'string') {
    return textareaTextToTipTapDoc(
      legacyHtmlToPlainText(legacyBlock.content),
    ).content;
  }

  if (type === 'heading') {
    const textNode = createTextNode(collectLegacyBlockText(legacyBlock));

    return textNode
      ? [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [textNode],
          },
        ]
      : [];
  }

  if (type === 'quote' || type === 'blockquote') {
    const paragraph = createParagraphFromLines([
      collectLegacyBlockText(legacyBlock),
    ]);

    return paragraph
      ? [
          {
            type: 'blockquote',
            content: [paragraph],
          },
        ]
      : [];
  }

  if (type === 'list' && Array.isArray(legacyBlock.items)) {
    const list = createListNode(
      'bulletList',
      legacyBlock.items.map((item) => String(item)),
    );

    return list ? [list] : [];
  }

  return textareaTextToTipTapDoc(collectLegacyBlockText(legacyBlock)).content;
}

function normalizeLegacyArray(content: unknown[]) {
  return blockNodesToDoc(content.flatMap((block) => legacyBlockToNodes(block)));
}

export function normalizeStoredContent(content: unknown): TipTapDoc {
  if (
    typeof content === 'object' &&
    content !== null &&
    'type' in content &&
    content.type === 'doc' &&
    'content' in content &&
    Array.isArray(content.content)
  ) {
    return content as TipTapDoc;
  }

  if (Array.isArray(content)) {
    return normalizeLegacyArray(content);
  }

  if (typeof content === 'string') {
    return looksLikeHtml(content)
      ? textareaTextToTipTapDoc(legacyHtmlToPlainText(content))
      : textareaTextToTipTapDoc(content);
  }

  if (typeof content === 'object' && content !== null) {
    if ('blocks' in content && Array.isArray(content.blocks)) {
      return normalizeLegacyArray(content.blocks);
    }

    if ('html' in content && typeof content.html === 'string') {
      return textareaTextToTipTapDoc(legacyHtmlToPlainText(content.html));
    }

    if ('content' in content && Array.isArray(content.content)) {
      return normalizeLegacyArray(content.content);
    }
  }

  return createEmptyTipTapDoc();
}

function extractInlineText(content: TipTapInlineNode[] | undefined): string {
  return (content ?? [])
    .map((node) => {
      if (node.type === 'hardBreak') {
        return '\n';
      }

      return node.text;
    })
    .join('');
}

function blockToTextareaSection(
  block: TipTapBlockNode,
  orderedIndex = 1,
): string[] {
  if (block.type === 'paragraph') {
    const text = extractInlineText(block.content)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n');

    return text ? [text] : [];
  }

  if (block.type === 'heading') {
    const level = Math.min(Math.max(block.attrs?.level ?? 2, 1), 6);
    const text = collapseWhitespace(extractInlineText(block.content));

    return text ? [`${'#'.repeat(level)} ${text}`] : [];
  }

  if (block.type === 'blockquote') {
    const text = block.content
      ?.flatMap((child) => blockToTextareaSection(child))
      .join('\n')
      .split('\n')
      .map((line) => (line ? `> ${line}` : '>'))
      .join('\n');

    return text ? [text] : [];
  }

  if (block.type === 'bulletList') {
    const lines =
      block.content?.flatMap((item) => {
        const text = item.content
          ?.flatMap((child) => blockToTextareaSection(child))
          .join(' ')
          .trim();

        return text ? [`- ${text}`] : [];
      }) ?? [];

    return lines.length > 0 ? [lines.join('\n')] : [];
  }

  if (block.type === 'orderedList') {
    const start = block.attrs?.start ?? orderedIndex;
    const lines =
      block.content?.flatMap((item, index) => {
        const text = item.content
          ?.flatMap((child) => blockToTextareaSection(child))
          .join(' ')
          .trim();

        return text ? [`${start + index}. ${text}`] : [];
      }) ?? [];

    return lines.length > 0 ? [lines.join('\n')] : [];
  }

  if (block.type === 'horizontalRule') {
    return ['---'];
  }

  if (block.type === 'codeBlock') {
    const code = (block.content ?? [])
      .map((node) => node.text)
      .join('');

    return code ? [`\`\`\`\n${code}\n\`\`\``] : [];
  }

  if (block.type === 'image') {
    const alt = collapseWhitespace(block.attrs?.alt ?? '');
    const src = collapseWhitespace(block.attrs?.src ?? '');

    if (!alt && !src) {
      return ['[Image]'];
    }

    if (!src) {
      return [`![${alt}]`];
    }

    return [`![${alt || 'Image'}](${src})`];
  }

  if (block.type === 'video') {
    const title = collapseWhitespace(block.attrs?.title ?? '');
    const src = collapseWhitespace(block.attrs?.src ?? '');

    if (!title && !src) {
      return ['[Video]'];
    }

    if (!src) {
      return [`[Video: ${title || 'Video'}]`];
    }

    return [`[Video: ${title || 'Video'}](${src})`];
  }

  if (block.type === 'listItem') {
    const text = block.content
      ?.flatMap((child) => blockToTextareaSection(child))
      .join(' ')
      .trim();

    return text ? [text] : [];
  }

  return [];
}

export function contentToTextareaText(content: unknown) {
  return normalizeStoredContent(content)
    .content.flatMap((block) => blockToTextareaSection(block))
    .join('\n\n')
    .trim();
}

function blockToPlainText(block: TipTapBlockNode): string[] {
  if (block.type === 'paragraph' || block.type === 'heading') {
    const text = collapseWhitespace(extractInlineText(block.content));

    return text ? [text] : [];
  }

  if (block.type === 'blockquote' || block.type === 'listItem') {
    return (
      block.content?.flatMap((child) => blockToPlainText(child)).filter(Boolean) ??
      []
    );
  }

  if (block.type === 'bulletList' || block.type === 'orderedList') {
    return (
      block.content?.flatMap((item) => blockToPlainText(item)).filter(Boolean) ?? []
    );
  }

  if (block.type === 'horizontalRule') {
    return [];
  }

  if (block.type === 'codeBlock') {
    const code = (block.content ?? [])
      .map((node) => node.text)
      .join(' ')
      .trim();

    return code ? [code] : [];
  }

  if (block.type === 'image') {
    const alt = collapseWhitespace(block.attrs?.alt ?? '');
    const caption = collapseWhitespace(block.attrs?.caption ?? '');

    return [alt || caption || 'Image'];
  }

  if (block.type === 'video') {
    const title = collapseWhitespace(block.attrs?.title ?? '');
    const caption = collapseWhitespace(block.attrs?.caption ?? '');

    return [title || caption || 'Video'];
  }

  return [];
}

export function extractContentText(content: unknown) {
  const text = normalizeStoredContent(content)
    .content.flatMap((block) => blockToPlainText(block))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text || null;
}

export function hasRenderableContent(content: unknown) {
  const doc = normalizeStoredContent(content);

  return (
    doc.content.length > 0 &&
    (doc.content.some(
      (block) => block.type === 'horizontalRule' || block.type === 'image',
    ) ||
      Boolean(extractContentText(doc)))
  );
}
