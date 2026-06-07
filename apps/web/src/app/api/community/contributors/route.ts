export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const period = searchParams.get('period') || 'all';

    let whereClause: { lastActivityAt?: { gte: Date } } = {};
    if (period === 'monthly') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      whereClause = { lastActivityAt: { gte: thirtyDaysAgo } };
    } else if (period === 'weekly') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      whereClause = { lastActivityAt: { gte: sevenDaysAgo } };
    }

    const topContributors = await prisma.forumUserProfile.findMany({
      where: whereClause,
      take: limit,
      orderBy: [
        { reputation: 'desc' },
        { postCount: 'desc' },
        { helpfulCount: 'desc' },
      ],
    });

    // Kullanıcı bilgilerini ayrı sorgu ile al
    const userIds = [...new Set(topContributors.map(c => c.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, image: true },
    });

    // Grup bilgilerini al
    const groupIds = [...new Set(topContributors.map(c => c.primaryGroupId).filter(Boolean))];
    const groups = await prisma.forumUserGroup.findMany({
      where: { id: { in: groupIds as string[] } },
      select: { id: true, name: true, title: true, color: true },
    });

    // Seviye bilgilerini al
    const userIdsForLevels = topContributors.map(c => c.id);
    const levels = await prisma.forumUserLevel.findMany({
      where: { userId: { in: userIdsForLevels } },
      select: { userId: true, level: true, totalXp: true, currentXp: true, xpToNext: true },
    });

    const userBadges = await prisma.forumUserBadge.findMany({
      where: { userId: { in: userIdsForLevels }, isDisplayed: true },
      include: {
        badge: { select: { name: true, icon: true, color: true, requirementType: true } },
      },
      orderBy: { earnedAt: 'desc' },
    });

    const formattedContributors = topContributors.map((user, index) => {
      const usr = users.find(u => u.id === user.userId);
      const group = groups.find(g => g.id === user.primaryGroupId);
      const level = levels.find(l => l.userId === user.id);
      const badges = userBadges
        .filter((b) => b.userId === user.id)
        .slice(0, 3)
        .map((b) => ({
          name: b.badge.name,
          icon: b.badge.icon,
          color: b.badge.color,
          isMarketplace: b.badge.requirementType === 'marketplace_posts',
        }));
      const userName = usr?.firstName && usr?.lastName 
        ? `${usr.firstName} ${usr.lastName}` 
        : usr?.firstName || 'Anonim';

      return {
        rank: index + 1,
        id: user.id,
        name: userName,
        avatar: usr?.image || userName.slice(0, 2).toUpperCase() || '??',
        points: user.reputation * 10 + user.postCount * 5 + user.helpfulCount * 20,
        reputation: user.reputation,
        postCount: user.postCount,
        helpfulCount: user.helpfulCount,
        level: level?.level || 1,
        xp: level?.totalXp || 0,
        xpProgress: level?.xpToNext
          ? Math.round(((level.currentXp ?? 0) / level.xpToNext) * 100)
          : 0,
        badge: group?.title || group?.name || 'Üye',
        badgeColor: group?.color || '#6366f1',
        badges,
        isOnline: user.isOnline,
        lastActivity: user.lastActivityAt,
      };
    });

    return NextResponse.json(formattedContributors);
  } catch (error) {
    console.error('Community contributors error:', error);
    return NextResponse.json([]);
  }
}
