'use client';

import { useEffect, useState } from 'react';

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollHeight <= 0) {
        setProgress(0);
        return;
      }

      setProgress(Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)));
    }

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-1 bg-transparent"
    >
      <div
        className="h-full bg-[linear-gradient(90deg,_rgba(194,65,12,0.96),_rgba(245,158,11,0.9))] shadow-[0_6px_20px_rgba(194,65,12,0.28)] transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
