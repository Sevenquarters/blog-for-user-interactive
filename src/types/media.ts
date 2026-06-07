export type MediaTranslationRecord = {
  locale: 'en' | 'zh-CN';
  altText: string;
  caption: string;
};

export type MediaAssetRecord = {
  id: string;
  uploadedBy: string;
  bucketName: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  publicUrl: string;
  translations: Record<'en' | 'zh-CN', MediaTranslationRecord>;
};
