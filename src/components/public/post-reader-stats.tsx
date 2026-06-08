import { Badge, Card } from '@/components/ui';

type PostReaderStatsProps = {
  title: string;
  items: Array<{
    label: string;
    value: string;
  }>;
};

export function PostReaderStats({ title, items }: PostReaderStatsProps) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold tracking-[0.14em] text-[var(--theme-accent)] uppercase">
        {title}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item.label} className="gap-2 px-3 py-2">
            <span className="text-[var(--theme-muted)]">{item.label}</span>
            <span className="font-semibold text-[var(--theme-foreground)]">
              {item.value}
            </span>
          </Badge>
        ))}
      </div>
    </Card>
  );
}
