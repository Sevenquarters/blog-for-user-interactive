import { Card } from '@/components/ui';

type PostAuthorCardProps = {
  eyebrow: string;
  name: string;
  bio: string;
};

export function PostAuthorCard({ eyebrow, name, bio }: PostAuthorCardProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <Card className="p-5">
      <p className="text-sm font-semibold tracking-[0.14em] text-[var(--theme-accent)] uppercase">
        {eyebrow}
      </p>
      <div className="mt-4 flex items-start gap-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-[var(--theme-accent)] text-sm font-bold text-white shadow-[0_18px_34px_rgba(194,65,12,0.24)]">
          {initials || 'AU'}
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-[var(--theme-foreground)]">
            {name}
          </p>
          <p className="text-sm leading-7 text-[var(--theme-muted)]">{bio}</p>
        </div>
      </div>
    </Card>
  );
}
