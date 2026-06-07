import { normalizeContentBlocks } from '@/lib/blog/content';

type PostContentProps = {
  content: unknown;
};

type BlockRecord = {
  type?: unknown;
  text?: unknown;
  content?: unknown;
  items?: unknown[];
};

function renderBlock(block: unknown, index: number) {
  if (typeof block === 'string') {
    return (
      <p key={index} className="text-lg leading-9 text-[var(--theme-foreground)]">
        {block}
      </p>
    );
  }

  if (typeof block !== 'object' || block === null) {
    return null;
  }

  const blockRecord = block as BlockRecord;
  const type =
    typeof blockRecord.type === 'string'
      ? blockRecord.type.toLowerCase()
      : 'paragraph';
  const text =
    typeof blockRecord.text === 'string'
      ? blockRecord.text
      : typeof blockRecord.content === 'string'
        ? blockRecord.content
        : null;

  if (type === 'heading') {
    return (
      <h2
        key={index}
        className="mt-12 text-3xl font-semibold tracking-tight text-[var(--theme-foreground)]"
      >
        {text}
      </h2>
    );
  }

  if (type === 'quote') {
    return (
      <blockquote
        key={index}
        className="rounded-[1.75rem] border border-[var(--theme-border)] bg-white/70 px-6 py-5 text-xl leading-9 text-[var(--theme-foreground)] shadow-[0_18px_48px_rgba(15,23,42,0.06)]"
      >
        {text}
      </blockquote>
    );
  }

  if (type === 'list' && Array.isArray(blockRecord.items)) {
    return (
      <ul
        key={index}
        className="space-y-3 rounded-[1.5rem] border border-[var(--theme-border)] bg-[rgba(255,255,255,0.72)] px-6 py-5 text-lg leading-8 text-[var(--theme-foreground)]"
      >
        {blockRecord.items.map((item: unknown, itemIndex: number) => (
          <li key={`${index}-${itemIndex}`} className="flex gap-3">
            <span className="mt-2 h-2 w-2 rounded-full bg-[var(--theme-accent)]" />
            <span>{String(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (type === 'html' && typeof blockRecord.content === 'string') {
    return (
      <div
        key={index}
        className="prose prose-lg max-w-none text-[var(--theme-foreground)]"
        dangerouslySetInnerHTML={{ __html: blockRecord.content }}
      />
    );
  }

  if (text) {
    return (
      <p key={index} className="text-lg leading-9 text-[var(--theme-foreground)]">
        {text}
      </p>
    );
  }

  return null;
}

export function PostContent({ content }: PostContentProps) {
  const blocks = normalizeContentBlocks(content);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-7">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
