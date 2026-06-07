import 'server-only';

import { prisma } from '@/lib/prisma';
import { truncateForMeta } from '@/lib/seo/site-seo';

export interface HelpArticleItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  contentHtml: string;
  viewCount: number;
  helpfulCount: number;
  sectionName: string;
  sectionSlug: string;
  updatedAt: string;
  publishedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
}

export async function getPublishedHelpArticles(limit = 50) {
  const articles = await prisma.forumHelpArticle.findMany({
    where: { status: 'PUBLISHED', isInternal: false },
    orderBy: [{ isPinned: 'desc' }, { isFeatured: 'desc' }, { publishedAt: 'desc' }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      viewCount: true,
      helpfulCount: true,
      updatedAt: true,
      publishedAt: true,
      isPinned: true,
      isFeatured: true,
      section: { select: { name: true, slug: true } },
    },
  }).catch(() => []);

  return articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    viewCount: article.viewCount,
    helpfulCount: article.helpfulCount,
    isPinned: article.isPinned,
    isFeatured: article.isFeatured,
    sectionName: article.section.name,
    sectionSlug: article.section.slug,
    updatedAt: article.updatedAt.toISOString(),
    publishedAt: article.publishedAt?.toISOString() ?? null,
  }));
}

export async function getHelpArticleBySlug(
  slug: string,
  options?: { incrementView?: boolean },
): Promise<HelpArticleItem | null> {
  const article = await prisma.forumHelpArticle.findFirst({
    where: { slug, status: 'PUBLISHED', isInternal: false },
    include: { section: { select: { name: true, slug: true } } },
  }).catch(() => null);

  if (!article) return null;

  const incrementView = options?.incrementView ?? true;
  if (incrementView) {
    await prisma.forumHelpArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => undefined);
  }

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    content: article.content,
    contentHtml: article.contentHtml,
    viewCount: incrementView ? article.viewCount + 1 : article.viewCount,
    helpfulCount: article.helpfulCount,
    sectionName: article.section.name,
    sectionSlug: article.section.slug,
    updatedAt: article.updatedAt.toISOString(),
    publishedAt: article.publishedAt?.toISOString() ?? null,
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    keywords: article.keywords,
  };
}

export function helpArticleExcerpt(article: { summary?: string | null; content: string }, max = 160): string {
  if (article.summary?.trim()) return truncateForMeta(article.summary, max);
  return truncateForMeta(article.content.replace(/<[^>]+>/g, ' '), max);
}
