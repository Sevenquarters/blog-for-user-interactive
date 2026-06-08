import Link from 'next/link';

import { Card, cn } from '@/components/ui';

type ArchiveFilterLink = {
  id: string;
  href: string;
  label: string;
  active?: boolean;
};

type ArchiveFiltersProps = {
  backHref: string;
  backLabel: string;
  browseTitle: string;
  activeFiltersLabel: string;
  categoriesTitle: string;
  tagsTitle: string;
  clearCategoryLabel: string;
  clearTagLabel: string;
  categories: ArchiveFilterLink[];
  tags: ArchiveFilterLink[];
  activeCategory?: {
    label: string;
    clearHref?: string;
  } | null;
  activeTag?: {
    label: string;
    clearHref?: string;
  } | null;
};

function getChipClassName(active?: boolean, muted?: boolean) {
  if (active) {
    return 'rounded-full border border-[var(--theme-accent)] bg-[rgba(194,65,12,0.12)] px-3 py-2 text-sm font-medium text-[var(--theme-accent)] transition';
  }

  if (muted) {
    return 'rounded-full bg-white/80 px-3 py-2 text-sm text-[var(--theme-muted)] transition hover:text-[var(--theme-foreground)]';
  }

  return 'rounded-full border border-[var(--theme-border)] px-3 py-2 text-sm text-[var(--theme-foreground)] transition hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)]';
}

export function ArchiveFilters({
  backHref,
  backLabel,
  browseTitle,
  activeFiltersLabel,
  categoriesTitle,
  tagsTitle,
  clearCategoryLabel,
  clearTagLabel,
  categories,
  tags,
  activeCategory,
  activeTag,
}: ArchiveFiltersProps) {
  return (
    <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
      <Card className="p-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--theme-accent)]"
        >
          <span aria-hidden="true">&lt;-</span>
          {backLabel}
        </Link>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--theme-accent)] uppercase">
              {browseTitle}
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--theme-muted)]">
              {activeFiltersLabel}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeCategory ? (
              activeCategory.clearHref ? (
                <Link
                  href={activeCategory.clearHref}
                  className={getChipClassName(true)}
                >
                  {activeCategory.label} / {clearCategoryLabel}
                </Link>
              ) : (
                <span className={getChipClassName(true)}>{activeCategory.label}</span>
              )
            ) : null}

            {activeTag ? (
              activeTag.clearHref ? (
                <Link
                  href={activeTag.clearHref}
                  className={getChipClassName(true, true)}
                >
                  {activeTag.label} / {clearTagLabel}
                </Link>
              ) : (
                <span className={getChipClassName(true, true)}>{activeTag.label}</span>
              )
            ) : null}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--theme-accent)] uppercase">
          {categoriesTitle}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className={cn(getChipClassName(category.active), 'hover:-translate-y-0.5')}
            >
              {category.label}
            </Link>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--theme-accent)] uppercase">
          {tagsTitle}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={tag.href}
              className={cn(getChipClassName(tag.active, true), 'hover:-translate-y-0.5')}
            >
              {tag.label}
            </Link>
          ))}
        </div>
      </Card>
    </aside>
  );
}
