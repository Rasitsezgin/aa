import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function scorePost(title: string, content: string) {
  const words = content.split(/\s+/).filter(Boolean).length;
  const hasHeadings = /^#{1,3}\s/m.test(content);
  const hasLinks = /\[.+\]\(.+\)/.test(content);
  const titleLen = title.length;

  let score = 50;
  if (words >= 300) score += 15;
  if (words >= 800) score += 10;
  if (hasHeadings) score += 10;
  if (hasLinks) score += 5;
  if (titleLen >= 30 && titleLen <= 70) score += 10;
  if (titleLen < 20) score -= 10;

  return Math.min(100, Math.max(0, score));
}

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 50,
    select: { id: true, title: true, slug: true, content: true, isActive: true, updatedAt: true },
  });

  const reports = posts.map((p) => {
    const score = scorePost(p.title, p.content);
    return {
      id: p.id,
      postTitle: p.title,
      postSlug: p.slug,
      score,
      status: score >= 70 ? 'good' : score >= 50 ? 'warning' : 'poor',
      wordCount: p.content.split(/\s+/).filter(Boolean).length,
      issues: score < 70
        ? [
            ...(p.title.length < 30 ? ['Başlık çok kısa'] : []),
            ...(p.content.split(/\s+/).length < 300 ? ['İçerik yetersiz'] : []),
          ]
        : [],
      checkedAt: p.updatedAt.toISOString(),
      isPublished: p.isActive,
    };
  });

  return NextResponse.json({ reports });
}
