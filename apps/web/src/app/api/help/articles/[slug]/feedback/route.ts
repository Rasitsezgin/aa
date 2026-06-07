export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedForumProfile } from '@/lib/forum-server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const wasHelpful = Boolean(body.wasHelpful);

    const article = await prisma.forumHelpArticle.findFirst({
      where: { slug, status: 'PUBLISHED', isInternal: false },
      select: { id: true },
    });
    if (!article) {
      return NextResponse.json({ error: 'Makale bulunamadı' }, { status: 404 });
    }

    const authContext = await getAuthenticatedForumProfile();
    const userId = authContext?.profile.id ?? null;

    if (userId) {
      await prisma.forumHelpArticleFeedback.upsert({
        where: { articleId_userId: { articleId: article.id, userId } },
        update: { wasHelpful },
        create: { articleId: article.id, userId, wasHelpful },
      });
    }

    await prisma.forumHelpArticle.update({
      where: { id: article.id },
      data: wasHelpful
        ? { helpfulCount: { increment: 1 } }
        : { notHelpfulCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Help feedback error:', error);
    return NextResponse.json({ error: 'Geri bildirim kaydedilemedi' }, { status: 500 });
  }
}
