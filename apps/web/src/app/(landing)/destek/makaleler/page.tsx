import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Eye } from 'lucide-react';
import { getPublishedHelpArticles } from '@/lib/help-service';
import { buildPageMetadata } from '@/lib/seo/site-seo';
import MarketingPageShell from '@/components/landing/MarketingPageShell';
import { MARKETING_CARD_HOVER, MARKETING_GRADIENT_TEXT, MARKETING_HERO_BADGE } from '@/lib/marketing-theme';

export const dynamic = 'force-dynamic';

export const metadata = buildPageMetadata({
  title: 'Yardım Makaleleri | Pazaryonetimi Destek',
  description: 'E-ticaret, pazaryeri entegrasyonu ve platform kullanımı hakkında yardım makaleleri.',
  path: '/destek/makaleler',
  keywords: ['yardım', 'destek', 'e-ticaret rehberi', 'pazaryeri'],
});

export default async function HelpArticlesPage() {
  const articles = await getPublishedHelpArticles(100);

  return (
    <MarketingPageShell as="main">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href="/destek" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-500 mb-8">
          <ArrowLeft size={16} /> Destek merkezine dön
        </Link>

        <div className="mb-10">
          <div className={MARKETING_HERO_BADGE}>
            <BookOpen size={14} />
            Yardım merkezi
          </div>
          <h1 className="mt-5 text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Yardım <span className={MARKETING_GRADIENT_TEXT}>makaleleri</span>
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">Platform ve entegrasyonlar hakkında rehberler</p>
        </div>

        {articles.length === 0 ? (
          <div className={`${MARKETING_CARD_HOVER} p-12 text-center text-slate-500`}>
            Henüz yayınlanmış makale yok.{' '}
            <Link href="/faq" className="text-orange-600 hover:underline font-semibold">SSS sayfasına</Link> göz atabilirsiniz.
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/destek/${article.slug}`}
                className={`block p-6 ${MARKETING_CARD_HOVER} group`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-orange-600 mb-2">{article.sectionName}</p>
                    <h2 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
                      {article.title}
                    </h2>
                    {article.summary && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{article.summary}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right text-xs text-slate-400 space-y-1">
                    <span className="inline-flex items-center gap-1 justify-end"><Eye size={12} /> {article.viewCount}</span>
                    <span className="inline-flex items-center gap-1 justify-end"><Clock size={12} /> oku</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MarketingPageShell>
  );
}
