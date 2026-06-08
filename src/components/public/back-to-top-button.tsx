'use client';

import { useEffect, useState } from 'react';

import { Button, cn } from '@/components/ui';

type BackToTopButtonProps = {
  label: string;
};

export function BackToTopButton({ label }: BackToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 520);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={cn(
        'fixed right-4 bottom-5 z-30 transition duration-200 sm:right-6 sm:bottom-6',
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <Button
        type="button"
        variant="secondary"
        size="icon"
        aria-label={label}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        ↑
      </Button>
    </div>
  );
}
