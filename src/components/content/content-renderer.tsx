import type { ReactNode } from 'react';

import {
  normalizeStoredContent,
  type TipTapBlockNode,
  type TipTapInlineNode,
  type TipTapMark,
} from '@/lib/content/content-format';

type ContentRendererProps = {
  content: unknown;
};

function sanitizeHref(href: string | null | undefined) {
  if (!href) {
    return null;
  }

  const normalized = href.trim();

  if (!normalized) {
    return null;
  }

  if (
    normalized.startsWith('/') ||
    normalized.startsWith('#') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('mailto:') ||
    normalized.startsWith('tel:')
  ) {
    return normalized;
  }

  return null;
}

function applyMarks(
  content: ReactNode,
  marks: TipTapMark[] | undefined,
  key: string,
): ReactNode {
  return (marks ?? []).reduce<ReactNode>((result, mark, index) => {
    const markKey = `${key}-${mark.type}-${index}`;

    if (mark.type === 'bold') {
      return <strong key={markKey}>{result}</strong>;
    }

    if (mark.type === 'italic') {
      return <em key={markKey}>{result}</em>;
    }

    if (mark.type === 'underline') {
      return <span key={markKey} className="underline underline-offset-2">{result}</span>;
    }

    if (mark.type === 'code') {
      return (
        <code
          key={markKey}
          className="rounded bg-[rgba(15,23,42,0.08)] px-1.5 py-0.5 font-mono text-[0.95em]"
        >
          {result}
        </code>
      );
    }

    if (mark.type === 'link') {
      const href = sanitizeHref(mark.attrs?.href);

      if (!href) {
        return result;
      }

      return (
        <a
          key={markKey}
          href={href}
          className="font-medium text-[var(--theme-accent)] underline decoration-[0.08em] underline-offset-4"
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noreferrer' : undefined}
        >
          {result}
        </a>
      );
    }

    return result;
  }, content);
}

function renderInlineNode(node: TipTapInlineNode, key: string): ReactNode {
  if (node.type === 'hardBreak') {
    return <br key={key} />;
  }

  return (
    <span key={key}>
      {applyMarks(node.text, node.marks, key)}
    </span>
  );
}

function renderInlineContent(content: TipTapInlineNode[] | undefined, key: string) {
  return (content ?? []).map((node, index) =>
    renderInlineNode(node, `${key}-${index}`),
  );
}

function renderListItem(block: TipTapBlockNode, key: string) {
  if (block.type !== 'listItem') {
    return null;
  }

  return (
    <div key={key} className="space-y-2">
      {(block.content ?? []).map((child, index) =>
        renderBlockNode(child, `${key}-${index}`, true),
      )}
    </div>
  );
}

function renderBlockNode(
  block: TipTapBlockNode,
  key: string,
  isNested = false,
): ReactNode {
  if (block.type === 'paragraph') {
    return (
      <p
        key={key}
        className={
          isNested
            ? 'text-base leading-7 text-[var(--theme-foreground)]'
            : 'text-lg leading-9 text-[var(--theme-foreground)]'
        }
      >
        {renderInlineContent(block.content, key)}
      </p>
    );
  }

  if (block.type === 'heading') {
    const level = Math.min(Math.max(block.attrs?.level ?? 2, 1), 6);
    const headingClass =
      level <= 2
        ? 'mt-12 text-3xl font-semibold tracking-tight text-[var(--theme-foreground)]'
        : 'mt-10 text-2xl font-semibold tracking-tight text-[var(--theme-foreground)]';

    if (level === 1) {
      return (
        <h1 key={key} className={headingClass}>
          {renderInlineContent(block.content, key)}
        </h1>
      );
    }

    if (level === 2) {
      return (
        <h2 key={key} className={headingClass}>
          {renderInlineContent(block.content, key)}
        </h2>
      );
    }

    if (level === 3) {
      return (
        <h3 key={key} className={headingClass}>
          {renderInlineContent(block.content, key)}
        </h3>
      );
    }

    if (level === 4) {
      return (
        <h4 key={key} className={headingClass}>
          {renderInlineContent(block.content, key)}
        </h4>
      );
    }

    if (level === 5) {
      return (
        <h5 key={key} className={headingClass}>
          {renderInlineContent(block.content, key)}
        </h5>
      );
    }

    return (
      <h6 key={key} className={headingClass}>
        {renderInlineContent(block.content, key)}
      </h6>
    );
  }

  if (block.type === 'blockquote') {
    return (
      <blockquote
        key={key}
        className="rounded-[1.75rem] border border-[var(--theme-border)] bg-white/70 px-6 py-5 text-xl leading-9 text-[var(--theme-foreground)] shadow-[0_18px_48px_rgba(15,23,42,0.06)]"
      >
        <div className="space-y-4">
          {(block.content ?? []).map((child, index) =>
            renderBlockNode(child, `${key}-${index}`, true),
          )}
        </div>
      </blockquote>
    );
  }

  if (block.type === 'bulletList') {
    return (
      <ul
        key={key}
        className="space-y-3 rounded-[1.5rem] border border-[var(--theme-border)] bg-[rgba(255,255,255,0.72)] px-6 py-5 text-lg leading-8 text-[var(--theme-foreground)]"
      >
        {(block.content ?? []).map((item, index) => (
          <li key={`${key}-${index}`} className="flex gap-3">
            <span className="mt-2 h-2 w-2 rounded-full bg-[var(--theme-accent)]" />
            <div className="min-w-0 flex-1">
              {renderListItem(item, `${key}-item-${index}`)}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === 'orderedList') {
    return (
      <ol
        key={key}
        start={block.attrs?.start ?? 1}
        className="space-y-3 rounded-[1.5rem] border border-[var(--theme-border)] bg-[rgba(255,255,255,0.72)] px-6 py-5 pl-11 text-lg leading-8 text-[var(--theme-foreground)]"
      >
        {(block.content ?? []).map((item, index) => (
          <li key={`${key}-${index}`} className="pl-1">
            {renderListItem(item, `${key}-item-${index}`)}
          </li>
        ))}
      </ol>
    );
  }

  if (block.type === 'horizontalRule') {
    return (
      <hr
        key={key}
        className="border-0 border-t border-[var(--theme-border)]"
      />
    );
  }

  if (block.type === 'listItem') {
    return renderListItem(block, key);
  }

  return null;
}

export function ContentRenderer({ content }: ContentRendererProps) {
  const normalizedContent = normalizeStoredContent(content);

  if (normalizedContent.content.length === 0) {
    return null;
  }

  return (
    <div className="space-y-7">
      {normalizedContent.content.map((block, index) =>
        renderBlockNode(block, `block-${index}`),
      )}
    </div>
  );
}
