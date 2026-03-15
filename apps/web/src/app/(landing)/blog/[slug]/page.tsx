import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { getPublicBlogPostBySlug } from '@/lib/blog-service';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: { slug: string };
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPublicBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: 'Blog yazisi bulunamadi',
      description: 'Istenen blog yazisi bulunamadi.',
    };
  }

  return {
    title: `${post.title} | Pazaryonetimi Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `https://pazaryonetimi.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const post = await getPublicBlogPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen pt-28 pb-20 bg-white dark:bg-[#03060f]">
      <div className="container mx-auto px-6 max-w-4xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500 mb-8">
          <ArrowLeft size={16} /> Blog listesine don
        </Link>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          {post.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-500 border-b border-slate-200 dark:border-white/10 pb-6">
          <span className="inline-flex items-center gap-2"><Calendar size={15} /> {formatDate(post.updatedAt)}</span>
          <span className="inline-flex items-center gap-2"><Clock size={15} /> {post.readTimeMinutes} dk okuma</span>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none mt-8 whitespace-pre-wrap leading-7">
          {post.content}
        </div>
      </div>
    </article>
  );
}
