import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const [badges, quests, leaderboard] = await Promise.all([
    prisma.forumBadge.findMany({ orderBy: { displayOrder: 'asc' }, include: { _count: { select: { users: true } } } }),
    prisma.forumDailyQuest.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.forumLeaderboardEntry.findMany({
      orderBy: { rank: 'asc' },
      take: 20,
      include: {
        user: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    }),
  ]);

  const levelRewards = badges.map((b) => ({
    id: b.id,
    level: b.displayOrder,
    name: b.name,
    description: b.description,
    icon: b.icon,
    color: b.color,
    xpRequired: b.requirementValue ?? 0,
    userCount: b._count.users,
  }));

  const dailyQuests = quests.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    type: q.type,
    action: q.action,
    targetCount: q.targetCount,
    xpReward: q.xpReward,
    isActive: q.isActive,
  }));

  const leaderboardEntries = leaderboard.map((e) => ({
    id: e.id,
    rank: e.rank,
    score: e.score,
    name: `${e.user?.user?.firstName ?? ''} ${e.user?.user?.lastName ?? ''}`.trim() || e.user?.user?.email || 'Kullanıcı',
    xp: e.score,
  }));

  return NextResponse.json({
    levelRewards,
    dailyQuests,
    leaderboard: leaderboardEntries,
  });
}
