'use client';

type UploadItem = {
  id: string;
  fileName: string;
  status: 'uploading' | 'complete' | 'failed';
  kind: 'image' | 'video';
};

type EditorUploadStatusProps = {
  items: UploadItem[];
  labels: {
    uploading: string;
    complete: string;
    failed: string;
  };
};

function getToneClassName(status: UploadItem['status']) {
  if (status === 'complete') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (status === 'failed') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  return 'border-amber-200 bg-amber-50 text-amber-700';
}

function getStatusLabel(status: UploadItem['status'], labels: EditorUploadStatusProps['labels']) {
  if (status === 'complete') {
    return labels.complete;
  }

  if (status === 'failed') {
    return labels.failed;
  }

  return labels.uploading;
}

export function EditorUploadStatus({
  items,
  labels,
}: EditorUploadStatusProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${getToneClassName(item.status)}`}
        >
          <span>{item.kind === 'video' ? 'Video' : 'Image'}</span>
          <span className="max-w-44 truncate">{item.fileName}</span>
          <span>{getStatusLabel(item.status, labels)}</span>
        </div>
      ))}
    </div>
  );
}

