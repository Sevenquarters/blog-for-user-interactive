import Link from 'next/link';

import { buttonClassName, cn } from '@/components/ui';

type PaginationProps = {
  page: number;
  totalPages: number;
  previousLabel: string;
  nextLabel: string;
  pageLabel: (page: number, totalPages: number) => string;
  buildHref: (page: number) => string;
};

function getVisiblePages(page: number, totalPages: number) {
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index,
  );
}

export function Pagination({
  page,
  totalPages,
  previousLabel,
  nextLabel,
  pageLabel,
  buildHref,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="rounded-[1.9rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3 shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
    >
      <div className="hidden items-center justify-center gap-2 md:flex">
        <Link
          href={buildHref(page - 1)}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={cn(
            buttonClassName({
              variant: 'ghost',
              size: 'sm',
            }),
            page <= 1 && 'pointer-events-none opacity-45',
          )}
        >
          {previousLabel}
        </Link>
        {visiblePages.map((pageNumber) => (
          <Link
            key={pageNumber}
            href={buildHref(pageNumber)}
            aria-current={pageNumber === page ? 'page' : undefined}
            className={buttonClassName({
              variant: pageNumber === page ? 'primary' : 'ghost',
              size: 'sm',
              active: pageNumber === page,
            })}
          >
            {pageNumber}
          </Link>
        ))}
        <Link
          href={buildHref(page + 1)}
          aria-disabled={page >= totalPages}
          tabIndex={page >= totalPages ? -1 : undefined}
          className={cn(
            buttonClassName({
              variant: 'ghost',
              size: 'sm',
            }),
            page >= totalPages && 'pointer-events-none opacity-45',
          )}
        >
          {nextLabel}
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3 md:hidden">
        <Link
          href={buildHref(page - 1)}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={cn(
            buttonClassName({
              variant: 'ghost',
              size: 'sm',
            }),
            page <= 1 && 'pointer-events-none opacity-45',
          )}
        >
          {previousLabel}
        </Link>
        <p className="text-sm font-medium text-[var(--theme-muted)]">
          {pageLabel(page, totalPages)}
        </p>
        <Link
          href={buildHref(page + 1)}
          aria-disabled={page >= totalPages}
          tabIndex={page >= totalPages ? -1 : undefined}
          className={cn(
            buttonClassName({
              variant: 'ghost',
              size: 'sm',
            }),
            page >= totalPages && 'pointer-events-none opacity-45',
          )}
        >
          {nextLabel}
        </Link>
      </div>
    </nav>
  );
}
