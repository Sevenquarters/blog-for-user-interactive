type ContentBlock =
  | string
  | {
      type?: string;
      text?: unknown;
      content?: unknown;
      items?: unknown[];
      children?: unknown[];
    };

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function collectTextParts(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectTextParts(item));
  }

  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap((item) => collectTextParts(item));
  }

  return [];
}

export function extractContentText(content: unknown) {
  const text = normalizeWhitespace(collectTextParts(content).join(' '));

  return text || null;
}

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

export function normalizeContentBlocks(content: unknown): ContentBlock[] {
  if (Array.isArray(content)) {
    return content as ContentBlock[];
  }

  if (typeof content === 'string') {
    return content
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean);
  }

  if (typeof content === 'object' && content !== null) {
    if ('blocks' in content && Array.isArray(content.blocks)) {
      return content.blocks as ContentBlock[];
    }

    if ('content' in content && Array.isArray(content.content)) {
      return content.content as ContentBlock[];
    }

    if ('html' in content && typeof content.html === 'string') {
      return [String(content.html)];
    }
  }

  const text = extractContentText(content);

  return text ? [text] : [];
}
