import 'server-only';

import { prisma } from '@/lib/prisma';

const DEFAULT_DAILY_QUESTS = [
  {
    title: 'Bugün bir yanıt yaz',
    description: 'Herhangi bir konuya yanıt ver',
    type: 'daily',
    action: 'create_post',
    targetCount: 1,
    xpReward: 15,
  },
  {
    title: 'Forum ziyaret et',
    description: 'Topluluğa bugün uğra',
    type: 'daily',
    action: 'visit_forum',
    targetCount: 1,
    xpReward: 5,
  },
  {
    title: 'Haftalık konu aç',
    description: 'Bu hafta yeni bir tartışma başlat',
    type: 'weekly',
    action: 'create_topic',
    targetCount: 1,
    xpReward: 30,
  },
] as const;

const MARKETPLACE_EXPERT_BADGES = [
  {
    name: 'Trendyol Uzmanı',
    description: 'Trendyol panellerinde 3+ katkı',
    icon: 'shopping-bag',
    color: '#f97316',
    boardSlugs: ['trendyol-panel', 'trendyol-fiyat'],
    minPosts: 3,
  },
  {
    name: 'Hepsiburada Uzmanı',
    description: 'Hepsiburada panellerinde 3+ katkı',
    icon: 'store',
    color: '#f59e0b',
    boardSlugs: ['hepsiburada-pazar'],
    minPosts: 3,
  },
  {
    name: 'Amazon Uzmanı',
    description: 'Amazon panellerinde 3+ katkı',
    icon: 'package',
    color: '#eab308',
    boardSlugs: ['amazon-fba-tr', 'amazon-global'],
    minPosts: 3,
  },
  {
    name: 'Shopify Uzmanı',
    description: 'Shopify panellerinde 3+ katkı',
    icon: 'globe',
    color: '#22c55e',
    boardSlugs: ['shopify-magaza'],
    minPosts: 3,
  },
] as const;

function getPeriodStart(type: 'daily' | 'weekly'): Date {
  const now = new Date();
  if (type === 'daily') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - diff);
  return start;
}

export async function ensureGamificationDefaults() {
  for (const quest of DEFAULT_DAILY_QUESTS) {
    const existing = await prisma.forumDailyQuest.findFirst({
      where: { title: quest.title, type: quest.type },
    });
    if (!existing) {
      await prisma.forumDailyQuest.create({ data: { ...quest } });
    }
  }

  for (const badge of MARKETPLACE_EXPERT_BADGES) {
    await prisma.forumBadge.upsert({
      where: { name: badge.name },
      create: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        requirementType: 'marketplace_posts',
        requirementValue: badge.minPosts,
      },
      update: {
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        requirementType: 'marketplace_posts',
        requirementValue: badge.minPosts,
      },
    });
  }
}

async function countActionProgress(
  profileId: string,
  action: string,
  periodType: 'daily' | 'weekly',
): Promise<number> {
  const since = getPeriodStart(periodType);

  if (action === 'visit_forum') {
    return 1;
  }

  if (action === 'create_topic') {
    return prisma.forumTopic.count({
      where: {
        authorId: profileId,
        createdAt: { gte: since },
        status: { not: 'DELETED' },
      },
    });
  }

  if (action === 'create_post') {
    const postsToday = await prisma.forumPost.count({
      where: {
        authorId: profileId,
        createdAt: { gte: since },
        isDeleted: false,
      },
    });
    const topicsToday = await prisma.forumTopic.count({
      where: {
        authorId: profileId,
        createdAt: { gte: since },
        status: { not: 'DELETED' },
      },
    });
    return Math.max(0, postsToday - topicsToday);
  }

  return 0;
}

async function awardXp(
  profileId: string,
  amount: number,
  action: string,
  description?: string,
) {
  let level = await prisma.forumUserLevel.findUnique({ where: { userId: profileId } });
  if (!level) {
    level = await prisma.forumUserLevel.create({
      data: { userId: profileId, title: 'Yeni Üye' },
    });
  }

  let currentXp = level.currentXp + amount;
  let totalXp = level.totalXp + amount;
  let nextLevel = level.level;
  let xpToNext = level.xpToNext;

  while (currentXp >= xpToNext) {
    currentXp -= xpToNext;
    nextLevel += 1;
    xpToNext = Math.floor(xpToNext * 1.15) + 25;
  }

  await prisma.$transaction([
    prisma.forumUserLevel.update({
      where: { id: level.id },
      data: {
        currentXp,
        totalXp,
        level: nextLevel,
        xpToNext,
        title: nextLevel >= 10 ? 'Elite Üye' : nextLevel >= 5 ? 'Aktif Katılımcı' : level.title,
      },
    }),
    prisma.forumXpLog.create({
      data: {
        userId: level.id,
        amount,
        action,
        description,
      },
    }),
  ]);
}

function shouldResetQuest(
  periodType: 'daily' | 'weekly',
  completedAt: Date | null,
  isCompleted: boolean,
): boolean {
  if (!isCompleted) return false;
  if (!completedAt) return true;
  const periodStart = getPeriodStart(periodType);
  return completedAt < periodStart;
}

export async function syncQuestProgress(profileId: string, markVisit = false) {
  await ensureGamificationDefaults();

  const quests = await prisma.forumDailyQuest.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  for (const quest of quests) {
    const periodType = quest.type === 'weekly' ? 'weekly' : 'daily';
    let progress = await countActionProgress(profileId, quest.action, periodType);

    if (quest.action === 'visit_forum' && !markVisit) {
      const existing = await prisma.forumUserQuest.findUnique({
        where: { userId_questId: { userId: profileId, questId: quest.id } },
      });
      progress = existing?.progress ?? 0;
    } else if (quest.action === 'visit_forum' && markVisit) {
      progress = 1;
    }

    const existing = await prisma.forumUserQuest.findUnique({
      where: { userId_questId: { userId: profileId, questId: quest.id } },
    });

    if (existing && shouldResetQuest(periodType, existing.completedAt, existing.isCompleted)) {
      await prisma.forumUserQuest.update({
        where: { id: existing.id },
        data: { progress: 0, isCompleted: false, completedAt: null },
      });
    }

    const cappedProgress = Math.min(progress, quest.targetCount);
    const isNowComplete = cappedProgress >= quest.targetCount;
    const wasComplete = existing?.isCompleted ?? false;

    await prisma.forumUserQuest.upsert({
      where: { userId_questId: { userId: profileId, questId: quest.id } },
      create: {
        userId: profileId,
        questId: quest.id,
        progress: cappedProgress,
        isCompleted: isNowComplete,
        completedAt: isNowComplete ? new Date() : null,
      },
      update: {
        progress: cappedProgress,
        ...(isNowComplete && !wasComplete
          ? { isCompleted: true, completedAt: new Date() }
          : !isNowComplete
            ? { isCompleted: false, completedAt: null }
            : {}),
      },
    });

    if (isNowComplete && !wasComplete) {
      await awardXp(profileId, quest.xpReward, 'quest_completed', quest.title);
    }
  }
}

export async function syncGamificationAfterAction(
  profileId: string,
  action: 'create_post' | 'create_topic',
) {
  await syncQuestProgress(profileId);

  const xpMap = { create_post: 10, create_topic: 25 } as const;
  await awardXp(profileId, xpMap[action], action);

  await checkMarketplaceExpertBadges(profileId);
}

export async function checkMarketplaceExpertBadges(profileId: string) {
  await ensureGamificationDefaults();

  for (const expert of MARKETPLACE_EXPERT_BADGES) {
    const badge = await prisma.forumBadge.findUnique({ where: { name: expert.name } });
    if (!badge) continue;

    const alreadyHas = await prisma.forumUserBadge.findUnique({
      where: { userId_badgeId: { userId: profileId, badgeId: badge.id } },
    });
    if (alreadyHas) continue;

    const postCount = await prisma.forumPost.count({
      where: {
        authorId: profileId,
        isDeleted: false,
        topic: {
          board: { slug: { in: [...expert.boardSlugs] } },
        },
      },
    });

    if (postCount >= expert.minPosts) {
      await prisma.forumUserBadge.create({
        data: { userId: profileId, badgeId: badge.id },
      });
    }
  }
}

export async function getGamificationSummary(profileId: string, markVisit = false) {
  await syncQuestProgress(profileId, markVisit);
  await checkMarketplaceExpertBadges(profileId);

  const [level, userBadges, questProgress] = await Promise.all([
    prisma.forumUserLevel.findUnique({ where: { userId: profileId } }),
    prisma.forumUserBadge.findMany({
      where: { userId: profileId, isDisplayed: true },
      include: {
        badge: {
          select: { name: true, icon: true, color: true, description: true, requirementType: true },
        },
      },
      orderBy: { earnedAt: 'desc' },
      take: 12,
    }),
    prisma.forumUserQuest.findMany({
      where: { userId: profileId },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            action: true,
            targetCount: true,
            xpReward: true,
          },
        },
      },
    }),
  ]);

  const activeQuests = questProgress
    .filter((q) => q.quest.type === 'daily' || q.quest.type === 'weekly')
    .map((q) => ({
      id: q.quest.id,
      title: q.quest.title,
      description: q.quest.description,
      type: q.quest.type,
      action: q.quest.action,
      progress: q.progress,
      targetCount: q.quest.targetCount,
      xpReward: q.quest.xpReward,
      isCompleted: q.isCompleted,
      percent: Math.min(100, Math.round((q.progress / q.quest.targetCount) * 100)),
    }));

  const marketplaceBadges = userBadges
    .filter((b) => b.badge.requirementType === 'marketplace_posts')
    .map((b) => ({
      name: b.badge.name,
      icon: b.badge.icon,
      color: b.badge.color,
      description: b.badge.description,
      earnedAt: b.earnedAt,
    }));

  const otherBadges = userBadges
    .filter((b) => b.badge.requirementType !== 'marketplace_posts')
    .map((b) => ({
      name: b.badge.name,
      icon: b.badge.icon,
      color: b.badge.color,
      description: b.badge.description,
      earnedAt: b.earnedAt,
    }));

  const currentXp = level?.currentXp ?? 0;
  const xpToNext = level?.xpToNext ?? 100;

  return {
    level: level?.level ?? 1,
    title: level?.title ?? 'Yeni Üye',
    currentXp,
    totalXp: level?.totalXp ?? 0,
    xpToNext,
    progress: xpToNext > 0 ? Math.round((currentXp / xpToNext) * 100) : 0,
    currentStreak: level?.currentStreak ?? 0,
    longestStreak: level?.longestStreak ?? 0,
    badges: otherBadges,
    marketplaceBadges,
    quests: activeQuests,
    completedQuestsToday: activeQuests.filter((q) => q.type === 'daily' && q.isCompleted).length,
    totalDailyQuests: activeQuests.filter((q) => q.type === 'daily').length,
  };
}
