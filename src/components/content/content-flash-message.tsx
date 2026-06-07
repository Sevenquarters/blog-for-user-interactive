type ContentFlashMessageProps = {
  message: string;
  tone: 'success' | 'error';
};

export function ContentFlashMessage({
  message,
  tone,
}: ContentFlashMessageProps) {
  return (
    <p
      className={`rounded-[1.5rem] border px-5 py-4 text-sm ${
        tone === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {message}
    </p>
  );
}
