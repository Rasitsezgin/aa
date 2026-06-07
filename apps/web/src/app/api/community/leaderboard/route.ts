export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const period = searchParams.get('period') || 'all'; // all, monthly, weekly, daily
    const sortBy = searchParams.get('sortBy') || 'points'; // points, reputation, posts, helpful

    // Tarih filtreleri
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'monthly') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: thirtyDaysAgo } };
    } else if (period === 'weekly') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: sevenDaysAgo } };
    } else if (period === 'daily') {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { gte: yesterday } };
    }

    // Sıralama kriteri
    let orderBy: any = {};
    switch (sortBy) {
      case 'reputation':
        orderBy = { reputation: 'desc' };
        break;
      case 'posts':
        orderBy = { postCount: 'desc' };
        break;
      case 'helpful':
        orderBy = { helpfulCount: 'desc' };
        break;
      case 'points':
      default:
        orderBy = [
          { reputation: 'desc' },
          { postCount: 'desc' },
          { helpfulCount: 'desc' },
        ];
        break;
    }

    // Kullanıcıları getir
    const users = await prisma.forumUserProfile.findMany({
      take: limit,
      orderBy,
      where: dateFilter,
    });

    // İlişkili verileri getir
    const userIds = users.map(u => u.userId);
    const profileIds = users.map(u => u.id);

    const [userDetails, groups, levels, badges] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, firstName: true, lastName: true, image: true, createdAt: true },
      }),
      prisma.forumUserGroup.findMany({
        where: { id: { in: users.map(u => u.primaryGroupId).filter(Boolean) as string[] } },
        select: { id: true, name: true, title: true, color: true, icon: true },
      }),
      prisma.forumUserLevel.findMany({
        where: { userId: { in: profileIds } },
        select: { userId: true, level: true, totalXp: true, currentXp: true, xpToNext: true },
      }),
      prisma.forumUserBadge.findMany({
        where: { userId: { in: profileIds } },
        include: {
          badge: {
            select: { name: true, icon: true, color: true, description: true },
          },
        },
      }),
    ]);

    // Dönemsel istatistikleri hesapla
    const periodStats = await calculatePeriodStats(period, profileIds);

    const formattedUsers = users.map((user, index) => {
      const usr = userDetails.find(u => u.id === user.userId);
      const group = groups.find(g => g.id === user.primaryGroupId);
      const level = levels.find(l => l.userId === user.id);
      const userBadges = badges.filter(b => b.userId === user.id);
      const stats = periodStats.find(s => s.userId === user.id);
      
      const userName = usr?.firstName && usr?.lastName 
        ? `${usr.firstName} ${usr.lastName}` 
        : usr?.firstName || 'Anonim';

      // Puan hesaplama
      const points = user.reputation * 10 + user.postCount * 5 + user.helpfulCount * 20;

      return {
        rank: index + 1,
        id: user.id,
        userId: user.userId,
        name: userName,
        avatar: usr?.image || userName.slice(0, 2).toUpperCase(),
        joinedAt: usr?.createdAt || user.joinedAt,
        
        // İstatistikler
        points,
        reputation: user.reputation,
        postCount: user.postCount,
        topicCount: user.topicCount,
        helpfulCount: user.helpfulCount,
        thanksReceived: user.thanksReceived,
        thanksGiven: user.thanksGiven,
        
        // Dönemsel istatistikler
        periodPosts: stats?.postCount || 0,
        periodReputation: stats?.reputation || 0,
        
        // Seviye
        level: level?.level || 1,
        xp: level?.totalXp || 0,
        currentXp: level?.currentXp || 0,
        xpToNext: level?.xpToNext || 100,
        progress: level ? (level.currentXp / level.xpToNext) * 100 : 0,
        
        // Grup/Rozet
        group: {
          name: group?.title || group?.name || 'Üye',
          color: group?.color || '#6366f1',
          icon: group?.icon,
        },
        badges: userBadges.map(b => ({
          name: b.badge.name,
          icon: b.badge.icon,
          color: b.badge.color,
          description: b.badge.description,
          earnedAt: b.earnedAt,
        })),
        
        // Durum
        isOnline: user.isOnline,
        lastActivity: user.lastActivityAt,
        isBanned: user.isBanned,
        
        // Değişim (önceki sıralamaya göre)
        change: 0,
      };
    });

    return NextResponse.json({
      users: formattedUsers,
      period,
      sortBy,
      totalUsers: formattedUsers.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ 
      users: [],
      period: 'all',
      sortBy: 'points',
      totalUsers: 0,
      error: 'Failed to fetch leaderboard',
    }, { status: 500 });
  }
}

// Dönemsel istatistikleri hesapla
async function calculatePeriodStats(period: string, userIds: string[]) {
  if (period === 'all' || userIds.length === 0) {
    return userIds.map(id => ({ userId: id, postCount: 0, reputation: 0 }));
  }

  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case 'daily':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      return userIds.map(id => ({ userId: id, postCount: 0, reputation: 0 }));
  }

  try {
    // Bu dönemdeki postları say
    const posts = await prisma.forumPost.groupBy({
      by: ['authorId'],
      where: {
        authorId: { in: userIds },
        createdAt: { gte: startDate },
        isDeleted: false,
      },
      _count: { id: true },
    });

    return userIds.map(id => ({
      userId: id,
      postCount: posts.find(p => p.authorId === id)?._count.id || 0,
      reputation: 0, // Reputation için ayrı hesaplama gerekir
    }));
  } catch {
    return userIds.map(id => ({ userId: id, postCount: 0, reputation: 0 }));
  }
}
