'use client';

import { useEffect } from 'react';

import type { Locale } from '@/i18n/config';

type PostViewTrackerProps = {
  locale: Locale;
  postId: string;
};

function getStorageKey(postId: string, locale: Locale) {
  return `blog-view:${locale}:${postId}`;
}

export function PostViewTracker({ locale, postId }: PostViewTrackerProps) {
  useEffect(() => {
    const storageKey = getStorageKey(postId, locale);

    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    window.sessionStorage.setItem(storageKey, '1');

    void fetch('/api/post-views', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        locale,
        postId,
      }),
      keepalive: true,
    });
  }, [locale, postId]);

  return null;
}
