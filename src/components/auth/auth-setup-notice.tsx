type AuthSetupNoticeProps = {
  title: string;
  description: string;
  items: string[];
};

export function AuthSetupNotice({
  title,
  description,
  items,
}: AuthSetupNoticeProps) {
  return (
    <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6">{description}</p>
      <ul className="mt-3 space-y-1 text-sm">
        {items.map((item) => (
          <li key={item} className="font-mono">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
