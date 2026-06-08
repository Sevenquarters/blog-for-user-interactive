import { Card } from '@/components/ui';

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card
      tone="elevated"
      className="mx-auto w-full max-w-xl overflow-hidden bg-[var(--theme-hero)] p-8"
    >
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--theme-foreground)]">
        {title}
      </h1>
      <p className="mt-3 text-base leading-7 text-[var(--theme-muted)]">
        {description}
      </p>
      <div className="mt-8">{children}</div>
    </Card>
  );
}
