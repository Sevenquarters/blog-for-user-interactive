'use client';

import { useState } from 'react';

import { Button, Card } from '@/components/ui';

type PostReaderActionsProps = {
  postId: string;
  locale: string;
  labels: {
    title: string;
    like: string;
    liked: string;
    bookmark: string;
    bookmarked: string;
  };
};

function buildStorageKey(kind: 'like' | 'bookmark', locale: string, postId: string) {
  return `blog-reader:${kind}:${locale}:${postId}`;
}

export function PostReaderActions({
  postId,
  locale,
  labels,
}: PostReaderActionsProps) {
  const [liked, setLiked] = useState(() =>
    typeof window !== 'undefined' &&
    window.localStorage.getItem(buildStorageKey('like', locale, postId)) === '1',
  );
  const [bookmarked, setBookmarked] = useState(() =>
    typeof window !== 'undefined' &&
    window.localStorage.getItem(buildStorageKey('bookmark', locale, postId)) === '1',
  );

  function toggle(kind: 'like' | 'bookmark', value: boolean) {
    const nextValue = !value;

    if (nextValue) {
      window.localStorage.setItem(buildStorageKey(kind, locale, postId), '1');
    } else {
      window.localStorage.removeItem(buildStorageKey(kind, locale, postId));
    }

    if (kind === 'like') {
      setLiked(nextValue);
      return;
    }

    setBookmarked(nextValue);
  }

  return (
    <Card className="p-5">
      <p className="text-sm font-semibold tracking-[0.14em] text-[var(--theme-accent)] uppercase">
        {labels.title}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          type="button"
          variant={liked ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => toggle('like', liked)}
        >
          {liked ? labels.liked : labels.like}
        </Button>
        <Button
          type="button"
          variant={bookmarked ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => toggle('bookmark', bookmarked)}
        >
          {bookmarked ? labels.bookmarked : labels.bookmark}
        </Button>
      </div>
    </Card>
  );
}
