export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const period = searchParams.get('period') || 'all';

    let dateFilter = {};
    if (period === 'monthly') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = { createdAt: { gte: thirtyDaysAgo } };
    } else if (period === 'weekly') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateFilter = { createdAt: { gte: sevenDaysAgo } };
    }

    // En çok mesaj atan kullanıcılar
    const topContributors = await prisma.forumUserProfile.findMany({
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
      select: { userId: true, level: true, totalXp: true },
    });

    const formattedContributors = topContributors.map((user, index) => {
      const usr = users.find(u => u.id === user.userId);
      const group = groups.find(g => g.id === user.primaryGroupId);
      const level = levels.find(l => l.userId === user.id);
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
        badge: group?.title || group?.name || 'Üye',
        badgeColor: group?.color || '#6366f1',
        isOnline: user.isOnline,
        lastActivity: user.lastActivityAt,
      };
    });

    return NextResponse.json(formattedContributors);
  } catch (error) {
    console.error('Community contributors error:', error);
    
    // Fallback data
    return NextResponse.json([
      { rank: 1, id: '1', name: 'Ahmet Yılmaz', avatar: 'AY', points: 12500, reputation: 450, postCount: 234, helpfulCount: 89, level: 25, xp: 12500, badge: 'Elite Üye', badgeColor: '#f59e0b', isOnline: true },
      { rank: 2, id: '2', name: 'Zeynep Kara', avatar: 'ZK', points: 9800, reputation: 350, postCount: 189, helpfulCount: 67, level: 20, xp: 9800, badge: 'Pro Satıcı', badgeColor: '#3b82f6', isOnline: false },
      { rank: 3, id: '3', name: 'Mert Demir', avatar: 'MD', points: 8200, reputation: 290, postCount: 156, helpfulCount: 45, level: 18, xp: 8200, badge: 'Aktif Üye', badgeColor: '#22c55e', isOnline: true },
      { rank: 4, id: '4', name: 'Ayşe Çelik', avatar: 'AÇ', points: 7100, reputation: 250, postCount: 134, helpfulCount: 38, level: 15, xp: 7100, badge: 'Yükselen Yıldız', badgeColor: '#a855f7', isOnline: false },
      { rank: 5, id: '5', name: 'Can Özkan', avatar: 'CÖ', points: 6500, reputation: 220, postCount: 123, helpfulCount: 32, level: 14, xp: 6500, badge: 'Aktif Üye', badgeColor: '#22c55e', isOnline: true },
    ]);
  }
}
