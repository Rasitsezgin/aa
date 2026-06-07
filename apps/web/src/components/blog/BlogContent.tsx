import { markdownToHtml } from '@/lib/blog-markdown';

type BlogContentProps = {
  content: string;
};

export default function BlogContent({ content }: BlogContentProps) {
  const html = markdownToHtml(content);

  return (
    <div
      className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-28 prose-headings:font-black prose-h2:text-2xl prose-h3:text-xl prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-strong:text-slate-900 dark:prose-strong:text-white"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
