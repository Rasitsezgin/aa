import type { Metadata } from 'next';
import { getHelpArticleBySlug, helpArticleExcerpt } from '@/lib/help-service';
import { buildPageMetadata } from '@/lib/seo/site-seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getHelpArticleBySlug(slug, { incrementView: false }).catch(() => null);

  if (!article) {
    return { title: 'Makale bulunamadı', robots: { index: false, follow: false } };
  }

  return buildPageMetadata({
    title: article.metaTitle || `${article.title} | Pazaryonetimi Destek`,
    description: article.metaDescription || helpArticleExcerpt(article),
    path: `/destek/${slug}`,
    keywords: article.keywords.length ? article.keywords : ['yardım', 'destek', article.sectionName],
  });
}

export default function HelpArticleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
