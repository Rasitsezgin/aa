import { markdownToHtml } from '@/lib/blog-markdown';

type BlogContentProps = {
  content: string;
};

export default function BlogContent({ content }: BlogContentProps) {
  const html = markdownToHtml(content);

  return (
    <div
      className="prose prose-slate prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:tracking-tight prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-p:leading-relaxed prose-p:mb-8 prose-li:mb-2 prose-ul:mb-8 prose-ol:mb-8 prose-a:text-orange-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg prose-strong:text-slate-900 dark:prose-strong:text-white prose-blockquote:border-l-orange-500 prose-blockquote:bg-orange-50 dark:prose-blockquote:bg-orange-500/10 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
