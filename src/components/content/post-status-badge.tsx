import type { PostStatus } from '@/types/content';
import { Badge } from '@/components/ui';

type PostStatusBadgeProps = {
  label: string;
  status: PostStatus;
};

const STATUS_STYLES: Record<PostStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  scheduled: 'bg-sky-100 text-sky-700',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-amber-100 text-amber-700',
};

export function PostStatusBadge({ label, status }: PostStatusBadgeProps) {
  return (
    <Badge
      className={`text-xs font-semibold uppercase tracking-[0.16em] ${STATUS_STYLES[status]}`}
    >
      {label}
    </Badge>
  );
}
