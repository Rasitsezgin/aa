export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatForumContentHtml, getAuthenticatedForumProfile } from '@/lib/forum-server';
import { syncGamificationAfterAction } from '@/lib/forum-gamification';
import { notifyTopicReply } from '@/lib/forum-notifications';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Cevap yazmak için giriş yapmalısınız.' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!content || content.length < 2) {
      return NextResponse.json({ error: 'Cevap en az 2 karakter olmalı.' }, { status: 400 });
    }

    const topic = await prisma.forumTopic.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        authorId: true,
        status: true,
        boardId: true,
        replyCount: true,
      },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Konu bulunamadı.' }, { status: 404 });
    }

    if (topic.status === 'CLOSED' || topic.status === 'ARCHIVED' || topic.status === 'DELETED') {
      return NextResponse.json({ error: 'Bu konu kapalı, cevap yazılamaz.' }, { status: 403 });
    }

    const { profile } = authContext;
    const contentHtml = formatForumContentHtml(content);
    const postNumber = topic.replyCount + 1;

    const post = await prisma.$transaction(async (tx) => {
      const created = await tx.forumPost.create({
        data: {
          topicId: topic.id,
          authorId: profile.id,
          content,
          contentHtml,
          postNumber,
        },
      });

      await tx.forumTopic.update({
        where: { id: topic.id },
        data: {
          replyCount: { increment: 1 },
          lastPostAt: new Date(),
          bumpedAt: new Date(),
        },
      });

      await tx.forumBoard.update({
        where: { id: topic.boardId },
        data: {
          postCount: { increment: 1 },
          lastPostId: created.id,
          lastPostAt: new Date(),
          lastPosterId: profile.id,
        },
      });

      await tx.forumUserProfile.update({
        where: { id: profile.id },
        data: {
          postCount: { increment: 1 },
          lastPostAt: new Date(),
          lastActivityAt: new Date(),
        },
      });

      return created;
    });

    syncGamificationAfterAction(profile.id, 'create_post').catch(console.error);

    const replierUser = await prisma.user.findUnique({
      where: { id: authContext.userId },
      select: { firstName: true, lastName: true },
    });
    const replierName =
      [replierUser?.firstName, replierUser?.lastName].filter(Boolean).join(' ') || 'Bir üye';

    notifyTopicReply({
      topicId: topic.id,
      topicSlug: topic.slug,
      topicTitle: topic.title,
      topicAuthorId: topic.authorId,
      replierProfileId: profile.id,
      replierName,
      postId: post.id,
    }).catch(console.error);

    return NextResponse.json({
      id: post.id,
      postNumber: post.postNumber,
      createdAt: post.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error('Forum reply create error:', error);
    return NextResponse.json({ error: 'Cevap gönderilemedi.' }, { status: 500 });
  }
}
