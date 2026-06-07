import { extractContentText } from '@/lib/content/content-format';

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
