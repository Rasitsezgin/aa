import 'server-only';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getForumSocialStatus } from '@/lib/forum-social';
import type { ForumTopicType } from '@pazaryonetimi/database';

export function slugifyForumTitle(value: string): string {
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

  return normalized || `konu-${Date.now()}`;
}

export function formatForumContentHtml(content: string): string {
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return `<p>${escaped.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
}

export async function ensureForumProfile(userId: string) {
  const existing = await prisma.forumUserProfile.findUnique({
    where: { userId },
  });

  if (existing) {
    await prisma.forumUserProfile.update({
      where: { id: existing.id },
      data: { lastActivityAt: new Date(), isOnline: true },
    });
    return existing;
  }

  const profile = await prisma.forumUserProfile.create({
    data: {
      userId,
      lastActivityAt: new Date(),
      isOnline: true,
    },
  });

  await prisma.forumUserLevel.create({
    data: {
      userId: profile.id,
      title: 'Yeni Üye',
    },
  }).catch(() => undefined);

  await prisma.forumNotificationPreference.create({
    data: { userId: profile.id },
  }).catch(() => undefined);

  return profile;
}

export async function createUniqueTopicSlug(title: string): Promise<string> {
  const base = slugifyForumTitle(title);
  let candidate = base;
  let counter = 2;

  while (await prisma.forumTopic.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export async function getAuthenticatedForumProfile() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const profile = await ensureForumProfile(userId);
  return { session, profile, userId };
}

export function formatForumUserName(
  user?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null,
): string {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return name || user?.email || 'Bilinmiyor';
}

function stripHtmlForExcerpt(content: string, maxLength = 120): string {
  const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}...`;
}

export async function getForumUserPublicProfile(profileId: string, viewerProfileId?: string | null) {
  const profile = await prisma.forumUserProfile.findUnique({
    where: { id: profileId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          image: true,
          email: true,
          createdAt: true,
        },
      },
      primaryGroup: {
        select: {
          name: true,
          title: true,
          color: true,
          icon: true,
          isStaff: true,
          isModerator: true,
        },
      },
      userLevel: {
        select: {
          level: true,
          title: true,
          totalXp: true,
        },
      },
      badges: {
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
        take: 24,
      },
      topics: {
        where: { status: { not: 'DELETED' } },
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          replyCount: true,
          viewCount: true,
          board: { select: { name: true } },
        },
      },
      posts: {
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: {
          id: true,
          content: true,
          createdAt: true,
          reactionCount: true,
          topic: {
            select: {
              title: true,
              slug: true,
              board: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!profile || profile.isBanned) {
    return null;
  }

  const name = formatForumUserName(profile.user);
  const emailLocal = profile.user.email?.split('@')[0] || profile.id.slice(0, 8);
  const social = await getForumSocialStatus(viewerProfileId ?? null, profile.id);

  return {
    id: profile.id,
    name,
    username: emailLocal,
    avatar: profile.avatarUrl || profile.user.image || undefined,
    coverImage: profile.coverImageUrl || undefined,
    title: profile.userLevel?.title || profile.primaryGroup?.title || undefined,
    isStaff: profile.primaryGroup?.isStaff || profile.primaryGroup?.isModerator || false,
    isOnline: profile.isOnline,
    joinedAt: profile.joinedAt.toISOString(),
    lastSeenAt: profile.lastActivityAt.toISOString(),
    location: profile.location || undefined,
    website: profile.website || undefined,
    about: profile.about || undefined,
    signature: profile.signature || undefined,
    postCount: profile.postCount,
    topicCount: profile.topicCount,
    reputation: profile.reputation,
    thanksReceived: profile.thanksReceived,
    thanksGiven: profile.thanksGiven,
    helpfulCount: profile.helpfulCount,
    level: profile.userLevel?.level ?? 1,
    totalXp: profile.userLevel?.totalXp ?? 0,
    primaryGroup: {
      name: profile.primaryGroup?.title || profile.primaryGroup?.name || 'Üye',
      color: profile.primaryGroup?.color || '#f97316',
      icon: profile.primaryGroup?.icon || undefined,
    },
    badges: profile.badges.map((entry) => ({
      id: entry.id,
      name: entry.badge.name,
      icon: entry.badge.icon,
      color: entry.badge.color,
      earnedAt: entry.earnedAt.toISOString(),
    })),
    recentTopics: profile.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      slug: topic.slug,
      boardName: topic.board.name,
      createdAt: topic.createdAt.toISOString(),
      replyCount: topic.replyCount,
      viewCount: topic.viewCount,
    })),
    recentPosts: profile.posts.map((post) => ({
      id: post.id,
      topicTitle: post.topic.title,
      topicSlug: post.topic.slug,
      boardName: post.topic.board.name,
      excerpt: stripHtmlForExcerpt(post.content),
      createdAt: post.createdAt.toISOString(),
      reactionCount: post.reactionCount,
    })),
    followerCount: social.followerCount,
    followingCount: social.followingCount,
    isFollowing: social.isFollowing,
    isBlocked: social.isBlocked,
    isOwnProfile: social.isOwnProfile,
  };
}

export function mapTopicType(input?: string): ForumTopicType {
  switch (input) {
    case 'question':
      return 'QNA';
    case 'poll':
      return 'POLL';
    case 'announcement':
      return 'ANNOUNCEMENT';
    default:
      return 'NORMAL';
  }
}
