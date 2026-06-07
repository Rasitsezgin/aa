export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedForumProfile } from '@/lib/forum-server';
import { mapReportReason } from '@/lib/forum-moderation';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Rapor için giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, topicId, userId, reason, description } = body;

    if (!postId && !topicId && !userId) {
      return NextResponse.json({ error: 'Raporlanacak içerik belirtilmeli' }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: 'Rapor nedeni zorunlu' }, { status: 400 });
    }

    const report = await prisma.forumReport.create({
      data: {
        reporterId: authContext.profile.id,
        postId: postId || null,
        topicId: topicId || null,
        userId: userId || null,
        reason: mapReportReason(reason),
        description: description?.trim() || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ id: report.id, status: 'pending' }, { status: 201 });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json({ error: 'Rapor gönderilemedi' }, { status: 500 });
  }
}
