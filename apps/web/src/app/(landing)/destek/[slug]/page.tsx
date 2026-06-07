import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Eye, ThumbsUp } from 'lucide-react';
import { getHelpArticleBySlug } from '@/lib/help-service';
import { SITE_URL } from '@/lib/seo/site-seo';
import JsonLd from '@/components/SEO/JsonLd';
import HelpArticleFeedback from '@/components/help/HelpArticleFeedback';
import MarketingPageShell from '@/components/landing/MarketingPageShell';
import ReadingProgress from '@/components/blog/ReadingProgress';
import { MARKETING_CARD, MARKETING_HERO_BADGE } from '@/lib/marketing-theme';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function HelpArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getHelpArticleBySlug(slug);
  if (!article) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary || article.content.slice(0, 160),
    url: `${SITE_URL}/destek/${article.slug}`,
    dateModified: article.updatedAt,
    datePublished: article.publishedAt || article.updatedAt,
    author: { '@type': 'Organization', name: 'Pazaryonetimi' },
    publisher: { '@type': 'Organization', name: 'Pazaryonetimi', url: SITE_URL },
  };

  return (
    <>
      <ReadingProgress />
      <MarketingPageShell as="article">
        <JsonLd data={jsonLd} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/destek/makaleler" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-500 mb-8">
            <ArrowLeft size={16} /> Tüm makaleler
          </Link>

          <div className={`${MARKETING_CARD} p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/20 dark:shadow-none`}>
            <div className={MARKETING_HERO_BADGE}>{article.sectionName}</div>

            <h1 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {article.title}
            </h1>

            {article.summary && (
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{article.summary}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-500 border-b border-slate-200 dark:border-white/10 pb-6">
              <span className="inline-flex items-center gap-2"><Calendar size={15} /> {formatDate(article.publishedAt || article.updatedAt)}</span>
              <span className="inline-flex items-center gap-2"><Eye size={15} /> {article.viewCount} görüntülenme</span>
              <span className="inline-flex items-center gap-2"><ThumbsUp size={15} /> {article.helpfulCount} faydalı</span>
            </div>

            <div
              className="prose prose-slate dark:prose-invert max-w-none mt-8 leading-7 prose-headings:font-black prose-a:text-orange-600"
              dangerouslySetInnerHTML={{ __html: article.contentHtml || article.content }}
            />

            <HelpArticleFeedback slug={article.slug} />
          </div>
        </div>
      </MarketingPageShell>
    </>
  );
}
