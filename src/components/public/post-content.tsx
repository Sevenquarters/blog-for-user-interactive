import { ContentRenderer } from '@/components/content/content-renderer';

type PostContentProps = {
  content: unknown;
};

export function PostContent({ content }: PostContentProps) {
  return <ContentRenderer content={content} />;
}
