type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <section className="mx-auto w-full max-w-xl rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--theme-foreground)]">
        {title}
      </h1>
      <p className="mt-3 text-base leading-7 text-[var(--theme-muted)]">
        {description}
      </p>
      <div className="mt-8">{children}</div>
    </section>
  );
}
