export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildExcerpt } from '@/lib/blog-service';

const STATIC_HELP = [
  { title: 'Trendyol entegrasyonu nasıl kurulur?', excerpt: 'Trendyol mağazanızı bağlama adımları', url: '/destek' },
  { title: 'Hepsiburada API bağlantısı', excerpt: 'Hepsiburada satıcı paneli entegrasyonu', url: '/destek' },
  { title: 'Amazon FBA Türkiye rehberi', excerpt: 'Amazon satıcı hesabı ve FBA kurulumu', url: '/destek' },
  { title: 'Ücretsiz deneme nasıl başlar?', excerpt: 'Hesap oluşturma ve ilk kurulum', url: '/faq' },
  { title: 'Fiyatlandırma planları', excerpt: 'Paket karşılaştırması ve özellikler', url: '/pricing' },
  { title: 'Stok senkronizasyonu', excerpt: 'Çoklu kanal stok yönetimi', url: '/destek' },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() ?? '';
    const typesParam = searchParams.get('types') ?? 'forum,blog,help';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    if (q.length < 2) {
      return NextResponse.json({ query: q, results: [], total: 0 });
    }

    const types = typesParam.split(',').map((t) => t.trim());
    const results: Array<{
      type: string;
      id: string;
      title: string;
      excerpt: string;
      url: string;
      updatedAt?: string;
    }> = [];

    const perTypeLimit = Math.ceil(limit / types.length);

    if (types.includes('forum')) {
      const [topics, posts] = await Promise.all([
        prisma.forumTopic.findMany({
          where: {
            status: { not: 'DELETED' },
            title: { contains: q, mode: 'insensitive' },
          },
          take: perTypeLimit,
          orderBy: { lastPostAt: 'desc' },
          select: { id: true, title: true, slug: true, lastPostAt: true },
        }),
        prisma.forumPost.findMany({
          where: {
            isDeleted: false,
            content: { contains: q, mode: 'insensitive' },
          },
          take: perTypeLimit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            topic: { select: { slug: true, title: true } },
          },
        }),
      ]);

      for (const topic of topics) {
        results.push({
          type: 'forum',
          id: topic.id,
          title: topic.title,
          excerpt: 'Forum konusu',
          url: `/forum/topic/${topic.slug}`,
          updatedAt: topic.lastPostAt.toISOString(),
        });
      }

      for (const post of posts) {
        if (!post.topic) continue;
        results.push({
          type: 'forum',
          id: post.id,
          title: post.topic.title,
          excerpt: buildExcerpt(post.content, 120),
          url: `/forum/topic/${post.topic.slug}`,
          updatedAt: post.createdAt.toISOString(),
        });
      }
    }

    if (types.includes('blog')) {
      const blogs = await prisma.cmsPage.findMany({
        where: {
          category: 'blog',
          isActive: true,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: perTypeLimit,
        orderBy: { updatedAt: 'desc' },
        select: { id: true, slug: true, title: true, content: true, updatedAt: true },
      });

      for (const blog of blogs) {
        results.push({
          type: 'blog',
          id: blog.id,
          title: blog.title,
          excerpt: buildExcerpt(blog.content, 120),
          url: `/blog/${blog.slug}`,
          updatedAt: blog.updatedAt.toISOString(),
        });
      }
    }

    if (types.includes('help')) {
      const articles = await prisma.forumHelpArticle.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: perTypeLimit,
        orderBy: { updatedAt: 'desc' },
        select: { id: true, slug: true, title: true, summary: true, updatedAt: true },
      });

      for (const article of articles) {
        results.push({
          type: 'help',
          id: article.id,
          title: article.title,
          excerpt: article.summary ?? 'Yardım makalesi',
          url: `/destek/${article.slug}`,
          updatedAt: article.updatedAt.toISOString(),
        });
      }

      const qLower = q.toLowerCase();
      for (const item of STATIC_HELP) {
        if (
          item.title.toLowerCase().includes(qLower) ||
          item.excerpt.toLowerCase().includes(qLower)
        ) {
          results.push({
            type: 'help',
            id: `static-${item.title}`,
            title: item.title,
            excerpt: item.excerpt,
            url: item.url,
          });
        }
      }
    }

    const deduped = results
      .filter((r, i, arr) => arr.findIndex((x) => x.url === r.url && x.title === r.title) === i)
      .slice(0, limit);

    return NextResponse.json({
      query: q,
      results: deduped,
      total: deduped.length,
    });
  } catch (error) {
    console.error('Community search error:', error);
    return NextResponse.json({ query: '', results: [], total: 0 });
  }
}
