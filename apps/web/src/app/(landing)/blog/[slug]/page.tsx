import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import {
  getPublicBlogPostBySlug,
  getRelatedBlogPosts,
} from '@/lib/blog-service';
import { buildPageMetadata, absoluteUrl, SITE_URL } from '@/lib/seo/site-seo';
import { getResolvedMetadata } from '@/lib/seo/seo-admin-service';
import JsonLd from '@/components/SEO/JsonLd';
import BlogContent from '@/components/blog/BlogContent';
import BlogShareButtons from '@/components/blog/BlogShareButtons';
import ReadingProgress from '@/components/blog/ReadingProgress';
import RelatedPosts from '@/components/blog/RelatedPosts';
import TableOfContents from '@/components/blog/TableOfContents';
import MarketingPageShell from '@/components/landing/MarketingPageShell';
import BlogInteractiveShell from '@/components/blog/BlogInteractiveShell';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);
  if (!post) {
    return {
      title: 'Blog yazısı bulunamadı | Pazaryonetimi',
      description: 'İstenen blog yazısı bulunamadı.',
    };
  }

  const resolved = await getResolvedMetadata(`/blog/${post.slug}`);
  const keywords = post.metaKeywords
    ? post.metaKeywords.split(',').map((k) => k.trim()).filter(Boolean)
    : (resolved?.keywords as string[] | undefined) || post.tags;

  return buildPageMetadata({
    title: post.metaTitle || resolved?.title || `${post.title} | Pazaryonetimi Blog`,
    description: post.metaDescription || resolved?.description || post.excerpt,
    path: `/blog/${post.slug}`,
    keywords,
    ogType: 'article',
    noIndex: resolved?.noIndex,
    ogImage: post.coverImage ? absoluteUrl(post.coverImage) : resolved?.ogImage,
  });
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedBlogPosts(slug, post.tags, 3);
  const pageUrl = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: pageUrl,
    image: post.coverImage ? absoluteUrl(post.coverImage) : absoluteUrl('/og-image.png'),
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Organization', name: 'Pazaryonetimi' },
    publisher: {
      '@type': 'Organization',
      name: 'Pazaryonetimi',
      url: SITE_URL,
    },
    keywords: post.tags.join(', '),
    articleSection: post.categoryLabel,
  };

  return (
    <>
      <ReadingProgress />
      <MarketingPageShell as="article" padded={false} className="pb-20">
        <JsonLd data={jsonLd} />

        {post.coverImage && (
          <div className="relative h-56 sm:h-72 lg:h-96 overflow-hidden">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAF9] dark:from-[#0B1120] via-black/20 to-black/30" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`${post.coverImage ? '-mt-16 relative z-10' : 'pt-8'}`}>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-500 mb-8"
            >
              <ArrowLeft size={16} /> Blog listesine dön
            </Link>

            <BlogInteractiveShell 
              content={post.content}
              sidebar={<TableOfContents />}
            >
              <div className={`${post.coverImage ? 'rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/70 dark:border-white/10 p-6 sm:p-8 lg:p-10 shadow-xl' : ''}`}>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-orange-500/10 text-orange-600 border border-orange-200/60">
                    {post.categoryLabel}
                  </span>
                  {post.isFeatured && (
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-600">
                      Öne çıkan
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {post.title}
                </h1>

                <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-500 border-b border-slate-200 dark:border-white/10 pb-6">
                  <span className="inline-flex items-center gap-2"><Calendar size={15} /> {formatDate(post.updatedAt)}</span>
                  <span className="inline-flex items-center gap-2"><Clock size={15} /> {post.readTimeMinutes} dk okuma</span>
                </div>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <Tag size={12} /> {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-8">
                  <BlogContent content={post.content} />
                </div>

                <div className="mt-10 pt-8 border-t border-slate-200 dark:border-white/10">
                  <BlogShareButtons title={post.title} url={pageUrl} />
                </div>
              </div>

              <RelatedPosts posts={related} />
            </BlogInteractiveShell>
          </div>
        </div>
      </MarketingPageShell>
    </>
  );
}
