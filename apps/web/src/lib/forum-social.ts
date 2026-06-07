import 'server-only';

import { prisma } from '@/lib/prisma';
import { formatForumUserName } from '@/lib/forum-server';
import { notifyNewFollower } from '@/lib/forum-notifications';

function mapFollowProfile(profile: {
  id: string;
  avatarUrl: string | null;
  isOnline: boolean;
  reputation: number;
  postCount: number;
  user: { firstName: string | null; lastName: string | null; image: string | null; email: string };
  primaryGroup: { title: string; color: string } | null;
  userLevel: { title: string | null } | null;
}) {
  const name = formatForumUserName(profile.user);
  return {
    id: profile.id,
    name,
    avatar: profile.avatarUrl || profile.user.image || undefined,
    title: profile.userLevel?.title || profile.primaryGroup?.title || 'Üye',
    groupColor: profile.primaryGroup?.color || '#f97316',
    isOnline: profile.isOnline,
    reputation: profile.reputation,
    postCount: profile.postCount,
  };
}

const profileInclude = {
  user: { select: { firstName: true, lastName: true, image: true, email: true } },
  primaryGroup: { select: { title: true, color: true } },
  userLevel: { select: { title: true } },
} as const;

export async function getForumSocialStatus(viewerProfileId: string | null, targetProfileId: string) {
  const [followerCount, followingCount, follow, block] = await Promise.all([
    prisma.forumFriendship.count({
      where: { addresseeId: targetProfileId, status: 'ACCEPTED' },
    }),
    prisma.forumFriendship.count({
      where: { requesterId: targetProfileId, status: 'ACCEPTED' },
    }),
    viewerProfileId
      ? prisma.forumFriendship.findUnique({
          where: {
            requesterId_addresseeId: {
              requesterId: viewerProfileId,
              addresseeId: targetProfileId,
            },
          },
          select: { status: true },
        })
      : null,
    viewerProfileId
      ? prisma.forumUserBlock.findUnique({
          where: {
            blockerId_blockedId: {
              blockerId: viewerProfileId,
              blockedId: targetProfileId,
            },
          },
          select: { id: true },
        })
      : null,
  ]);

  return {
    followerCount,
    followingCount,
    isFollowing: follow?.status === 'ACCEPTED',
    isBlocked: Boolean(block),
    isOwnProfile: viewerProfileId === targetProfileId,
  };
}

export async function followForumUser(viewerProfileId: string, targetProfileId: string) {
  if (viewerProfileId === targetProfileId) {
    throw new Error('Kendinizi takip edemezsiniz');
  }

  const blocked = await prisma.forumUserBlock.findFirst({
    where: {
      OR: [
        { blockerId: viewerProfileId, blockedId: targetProfileId },
        { blockerId: targetProfileId, blockedId: viewerProfileId },
      ],
    },
    select: { id: true },
  });
  if (blocked) throw new Error('Bu kullanıcıyla etkileşim kurulamıyor');

  const existing = await prisma.forumFriendship.findUnique({
    where: {
      requesterId_addresseeId: {
        requesterId: viewerProfileId,
        addresseeId: targetProfileId,
      },
    },
    select: { status: true },
  });

  await prisma.forumFriendship.upsert({
    where: {
      requesterId_addresseeId: {
        requesterId: viewerProfileId,
        addresseeId: targetProfileId,
      },
    },
    update: { status: 'ACCEPTED', respondedAt: new Date() },
    create: {
      requesterId: viewerProfileId,
      addresseeId: targetProfileId,
      status: 'ACCEPTED',
      respondedAt: new Date(),
    },
  });

  const isNewFollow = !existing || existing.status !== 'ACCEPTED';
  if (isNewFollow) {
    const follower = await prisma.forumUserProfile.findUnique({
      where: { id: viewerProfileId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    if (follower) {
      await notifyNewFollower({
        followedProfileId: targetProfileId,
        followerProfileId: viewerProfileId,
        followerName: formatForumUserName(follower.user),
      }).catch(() => undefined);
    }
  }

  return { success: true };
}

export async function unfollowForumUser(viewerProfileId: string, targetProfileId: string) {
  await prisma.forumFriendship.deleteMany({
    where: {
      requesterId: viewerProfileId,
      addresseeId: targetProfileId,
    },
  });
  return { success: true };
}

export async function blockForumUser(viewerProfileId: string, targetProfileId: string, reason?: string) {
  if (viewerProfileId === targetProfileId) {
    throw new Error('Kendinizi engelleyemezsiniz');
  }

  await prisma.$transaction([
    prisma.forumUserBlock.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: viewerProfileId,
          blockedId: targetProfileId,
        },
      },
      update: { reason: reason?.trim() || null },
      create: {
        blockerId: viewerProfileId,
        blockedId: targetProfileId,
        reason: reason?.trim() || null,
      },
    }),
    prisma.forumFriendship.deleteMany({
      where: {
        OR: [
          { requesterId: viewerProfileId, addresseeId: targetProfileId },
          { requesterId: targetProfileId, addresseeId: viewerProfileId },
        ],
      },
    }),
  ]);

  return { success: true };
}

export async function unblockForumUser(viewerProfileId: string, targetProfileId: string) {
  await prisma.forumUserBlock.deleteMany({
    where: {
      blockerId: viewerProfileId,
      blockedId: targetProfileId,
    },
  });
  return { success: true };
}

export async function listForumFollowers(profileId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where = { addresseeId: profileId, status: 'ACCEPTED' as const };

  const [rows, total] = await Promise.all([
    prisma.forumFriendship.findMany({
      where,
      orderBy: { respondedAt: 'desc' },
      skip,
      take: limit,
      include: { requester: { include: profileInclude } },
    }),
    prisma.forumFriendship.count({ where }),
  ]);

  return {
    users: rows.map((row) => ({
      ...mapFollowProfile(row.requester),
      followedAt: (row.respondedAt || row.requestedAt).toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export async function listForumFollowing(profileId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where = { requesterId: profileId, status: 'ACCEPTED' as const };

  const [rows, total] = await Promise.all([
    prisma.forumFriendship.findMany({
      where,
      orderBy: { respondedAt: 'desc' },
      skip,
      take: limit,
      include: { addressee: { include: profileInclude } },
    }),
    prisma.forumFriendship.count({ where }),
  ]);

  return {
    users: rows.map((row) => ({
      ...mapFollowProfile(row.addressee),
      followedAt: (row.respondedAt || row.requestedAt).toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}
