export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureForumProfile } from '@/lib/forum-server';
import {
  getOnlinePresenceCount,
  getOnlinePresenceUsers,
  getTypingUsers,
  markStaleUsersOffline,
  setTypingIndicator,
  setUserPresence,
} from '@/lib/forum-presence';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'status';

  try {
    switch (type) {
      case 'status':
        return await getRealtimeStatus();
      case 'activities':
        return await getRecentActivities();
      case 'typing':
        return await getTypingStatus(searchParams);
      case 'notifications':
        return await getNotificationCount();
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Realtime API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getNotificationCount() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ unreadCount: 0 });
  }

  const profile = await prisma.forumUserProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ unreadCount: 0 });
  }

  const unreadCount = await prisma.forumNotification.count({
    where: { userId: profile.id, isRead: false },
  });

  return NextResponse.json({ unreadCount });
}

async function getRealtimeStatus() {
  try {
    await markStaleUsersOffline();

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const [redisCount, recentlyActive, activeTopics] = await Promise.all([
      getOnlinePresenceCount(),
      prisma.forumUserProfile.findMany({
        where: { lastActivityAt: { gte: fiveMinutesAgo } },
        take: 20,
        orderBy: { lastActivityAt: 'desc' },
        select: {
          id: true,
          userId: true,
          isOnline: true,
          lastActivityAt: true,
          primaryGroup: { select: { isStaff: true, isModerator: true } },
        },
      }),
      prisma.forumTopic.findMany({
        where: {
          OR: [
            { createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
            { lastPostAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
          ],
        },
        take: 5,
        orderBy: { lastPostAt: 'desc' },
      }),
    ]);

    const userIds = recentlyActive.map((u) => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, image: true },
    });

    const redisUsers = await getOnlinePresenceUsers();
    const onlineCount = Math.max(redisCount, recentlyActive.filter((u) => u.isOnline).length);

    const formattedUsers = recentlyActive.map((profile) => {
      const user = users.find((u) => u.id === profile.userId);
      const redisUser = redisUsers.find((r) => r.id === profile.id);
      const name =
        user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.firstName || redisUser?.name || 'Anonim';

      return {
        id: profile.id,
        name,
        avatar: user?.image || name.slice(0, 2).toUpperCase(),
        isOnline: profile.isOnline || Boolean(redisUser),
        isStaff: profile.primaryGroup?.isStaff || false,
        isModerator: profile.primaryGroup?.isModerator || false,
        lastActivity: profile.lastActivityAt,
      };
    });

    return NextResponse.json({
      onlineCount,
      recentlyActive: formattedUsers,
      activeTopics: activeTopics.map((t) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        lastActivity: t.lastPostAt,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Realtime status error:', error);
    return NextResponse.json({
      onlineCount: 0,
      recentlyActive: [],
      activeTopics: [],
      timestamp: new Date().toISOString(),
    });
  }
}

async function getRecentActivities() {
  try {
    const activities = await prisma.forumPost.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      where: { isDeleted: false },
      select: {
        id: true,
        content: true,
        createdAt: true,
        authorId: true,
        topicId: true,
      },
    });

    const authorIds = [...new Set(activities.map((a) => a.authorId))];
    const topicIds = [...new Set(activities.map((a) => a.topicId).filter(Boolean))];

    const [authors, topics] = await Promise.all([
      prisma.forumUserProfile.findMany({ where: { id: { in: authorIds } } }),
      prisma.forumTopic.findMany({
        where: { id: { in: topicIds as string[] } },
        select: { id: true, title: true, slug: true },
      }),
    ]);

    const userIds = [...new Set(authors.map((a) => a.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, image: true },
    });

    const formattedActivities = activities.map((activity) => {
      const author = authors.find((a) => a.id === activity.authorId);
      const user = users.find((u) => u.id === author?.userId);
      const topic = topics.find((t) => t.id === activity.topicId);

      const name =
        user?.firstName && user?.lastName
          ? `${user.firstName} ${user.lastName}`
          : user?.firstName || 'Anonim';

      return {
        id: activity.id,
        type: 'post',
        user: {
          id: author?.id,
          name,
          avatar: user?.image || name.slice(0, 2).toUpperCase(),
        },
        topic: topic
          ? { id: topic.id, title: topic.title, slug: topic.slug }
          : null,
        createdAt: activity.createdAt,
      };
    });

    return NextResponse.json({
      activities: formattedActivities,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Realtime activities error:', error);
    return NextResponse.json({ activities: [], timestamp: new Date().toISOString() });
  }
}

async function getTypingStatus(searchParams: URLSearchParams) {
  const topicId = searchParams.get('topicId');
  if (!topicId) {
    return NextResponse.json({ typingUsers: [], topicId: null });
  }

  const typingUsers = await getTypingUsers(topicId);
  return NextResponse.json({
    typingUsers: typingUsers.map((u) => ({ id: u.profileId, name: u.userName })),
    topicId,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, topicId, userName } = body;

    switch (action) {
      case 'heartbeat': {
        const session = await auth();
        if (!session?.user?.id) {
          return NextResponse.json({ success: false });
        }

        const profile = await ensureForumProfile(session.user.id);
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { firstName: true, lastName: true },
        });
        const name =
          [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Üye';

        await Promise.all([
          prisma.forumUserProfile.update({
            where: { id: profile.id },
            data: { isOnline: true, lastActivityAt: new Date() },
          }),
          setUserPresence(profile.id, name),
        ]);

        return NextResponse.json({ success: true });
      }

      case 'typing': {
        const session = await auth();
        if (!session?.user?.id || !topicId) {
          return NextResponse.json({ success: false });
        }
        const profile = await ensureForumProfile(session.user.id);
        await setTypingIndicator(
          topicId,
          profile.id,
          userName || 'Üye',
        );
        return NextResponse.json({ success: true });
      }

      case 'view':
        if (topicId) {
          await prisma.forumTopic.update({
            where: { id: topicId },
            data: { viewCount: { increment: 1 } },
          });
        }
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Realtime POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
