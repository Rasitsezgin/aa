export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedForumProfile } from '@/lib/forum-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const [notifications, unreadCount, dmUnread] = await Promise.all([
      prisma.forumNotification.findMany({
        where: { userId: authContext.profile.id },
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          actionUrl: true,
          createdAt: true,
          topicId: true,
          actorId: true,
        },
      }),
      prisma.forumNotification.count({
        where: { userId: authContext.profile.id, isRead: false },
      }),
      prisma.forumConversationParticipant.aggregate({
        where: { userId: authContext.profile.id, hasLeft: false },
        _sum: { unreadCount: true },
      }),
    ]);

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type.toLowerCase(),
        title: n.title,
        message: n.message,
        read: n.isRead,
        actionUrl: n.actionUrl,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
      dmUnreadCount: dmUnread._sum.unreadCount ?? 0,
    });
  } catch (error) {
    console.error('Forum notifications error:', error);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PATCH() {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.forumNotification.updateMany({
      where: { userId: authContext.profile.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
