import {
  normalizeStoredContent,
  type TipTapBlockNode,
  type TipTapDoc,
  type TipTapInlineNode,
  type TipTapMark,
} from '@/lib/content/content-format';
import {
  sanitizeContentHref,
  sanitizeContentMediaSrc,
} from '@/lib/content/content-sanitization';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function applyMarksToHtml(content: string, marks: TipTapMark[] | undefined) {
  return (marks ?? []).reduce<string>((result, mark) => {
    if (mark.type === 'bold') {
      return `<strong>${result}</strong>`;
    }

    if (mark.type === 'italic') {
      return `<em>${result}</em>`;
    }

    if (mark.type === 'underline') {
      return `<span style="text-decoration:underline">${result}</span>`;
    }

    if (mark.type === 'code') {
      return `<code>${result}</code>`;
    }

    if (mark.type === 'link') {
      const href = sanitizeContentHref(mark.attrs?.href);

      if (!href) {
        return result;
      }

      const escapedHref = escapeHtml(href);
      const externalAttributes = href.startsWith('http')
        ? ' target="_blank" rel="noreferrer"'
        : '';

      return `<a href="${escapedHref}"${externalAttributes}>${result}</a>`;
    }

    return result;
  }, content);
}

function renderInlineNodeToHtml(node: TipTapInlineNode) {
  if (node.type === 'hardBreak') {
    return '<br />';
  }

  return applyMarksToHtml(escapeHtml(node.text), node.marks);
}

function renderInlineContentToHtml(content: TipTapInlineNode[] | undefined) {
  return (content ?? []).map(renderInlineNodeToHtml).join('');
}

function renderListItemContent(block: TipTapBlockNode) {
  if (block.type !== 'listItem') {
    return '';
  }

  return (block.content ?? []).map(renderBlockToHtml).join('');
}

function renderFigureCaption(caption: string | null | undefined) {
  const normalized = caption?.trim();

  return normalized ? `<figcaption>${escapeHtml(normalized)}</figcaption>` : '';
}

function renderBlockToHtml(block: TipTapBlockNode): string {
  if (block.type === 'paragraph') {
    return `<p>${renderInlineContentToHtml(block.content)}</p>`;
  }

  if (block.type === 'heading') {
    const level = Math.min(Math.max(block.attrs?.level ?? 2, 1), 6);

    return `<h${level}>${renderInlineContentToHtml(block.content)}</h${level}>`;
  }

  if (block.type === 'blockquote') {
    return `<blockquote>${(block.content ?? []).map(renderBlockToHtml).join('')}</blockquote>`;
  }

  if (block.type === 'bulletList') {
    const items = (block.content ?? [])
      .map((item) => `<li>${renderListItemContent(item)}</li>`)
      .join('');

    return `<ul>${items}</ul>`;
  }

  if (block.type === 'orderedList') {
    const start = block.attrs?.start ?? 1;
    const items = (block.content ?? [])
      .map((item) => `<li>${renderListItemContent(item)}</li>`)
      .join('');

    return start === 1 ? `<ol>${items}</ol>` : `<ol start="${start}">${items}</ol>`;
  }

  if (block.type === 'horizontalRule') {
    return '<hr />';
  }

  if (block.type === 'codeBlock') {
    const code = (block.content ?? [])
      .map((node) => escapeHtml(node.text))
      .join('');

    return code ? `<pre><code>${code}</code></pre>` : '';
  }

  if (block.type === 'image') {
    const src = sanitizeContentMediaSrc(block.attrs?.src);

    if (!src) {
      return '';
    }

    const alt = escapeHtml(block.attrs?.alt?.trim() || '');
    const title = block.attrs?.title?.trim()
      ? ` title="${escapeHtml(block.attrs.title.trim())}"`
      : '';
    const width =
      typeof block.attrs?.width === 'number' ? ` width="${block.attrs.width}"` : '';
    const height =
      typeof block.attrs?.height === 'number'
        ? ` height="${block.attrs.height}"`
        : '';

    return `<figure><img src="${escapeHtml(src)}" alt="${alt}"${title}${width}${height} />${renderFigureCaption(block.attrs?.caption)}</figure>`;
  }

  if (block.type === 'video') {
    const src = sanitizeContentMediaSrc(block.attrs?.src);

    if (!src) {
      return '';
    }

    const width =
      typeof block.attrs?.width === 'number' ? ` width="${block.attrs.width}"` : '';
    const height =
      typeof block.attrs?.height === 'number'
        ? ` height="${block.attrs.height}"`
        : '';

    return `<figure><video controls preload="metadata" src="${escapeHtml(src)}"${width}${height}></video>${renderFigureCaption(block.attrs?.caption || block.attrs?.title)}</figure>`;
  }

  if (block.type === 'listItem') {
    return renderListItemContent(block);
  }

  return '';
}

export function getSafeContentJson(content: unknown): TipTapDoc {
  return normalizeStoredContent(content);
}

export function getSafeContentHtml(content: unknown) {
  return normalizeStoredContent(content)
    .content.map(renderBlockToHtml)
    .join('');
}

