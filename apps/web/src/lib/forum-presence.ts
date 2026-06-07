import 'server-only';

import { cache, redis } from '@/lib/cache';

const PRESENCE_PREFIX = 'forum:presence:';
const TYPING_PREFIX = 'forum:typing:';
const PRESENCE_TTL = 300;
const TYPING_TTL = 5;

export interface PresenceUser {
  id: string;
  name: string;
  lastSeen: number;
}

export async function setUserPresence(profileId: string, name: string) {
  const payload: PresenceUser = {
    id: profileId,
    name,
    lastSeen: Date.now(),
  };
  await cache.set(`${PRESENCE_PREFIX}${profileId}`, payload, PRESENCE_TTL);
  try {
    await redis.sadd('forum:online', profileId);
    await redis.expire('forum:online', PRESENCE_TTL * 2);
  } catch {
    // Redis optional — DB fallback still works
  }
}

export async function getOnlinePresenceUsers(): Promise<PresenceUser[]> {
  try {
    const keys = await redis.keys(`${PRESENCE_PREFIX}*`);
    if (!keys.length) return [];

    const users = await Promise.all(
      keys.map((key) => cache.get<PresenceUser>(key)),
    );
    return users.filter((u): u is PresenceUser => Boolean(u));
  } catch {
    return [];
  }
}

export async function getOnlinePresenceCount(): Promise<number> {
  const users = await getOnlinePresenceUsers();
  return users.length;
}

export async function setTypingIndicator(
  topicId: string,
  profileId: string,
  userName: string,
) {
  await cache.set(
    `${TYPING_PREFIX}${topicId}:${profileId}`,
    { profileId, userName },
    TYPING_TTL,
  );
}

export async function getTypingUsers(topicId: string) {
  try {
    const keys = await redis.keys(`${TYPING_PREFIX}${topicId}:*`);
    if (!keys.length) return [];

    const users = await Promise.all(
      keys.map((key) => cache.get<{ profileId: string; userName: string }>(key)),
    );
    return users.filter((u): u is { profileId: string; userName: string } => Boolean(u));
  } catch {
    return [];
  }
}

export async function markStaleUsersOffline() {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000);
  const { prisma } = await import('@/lib/prisma');
  await prisma.forumUserProfile.updateMany({
    where: {
      isOnline: true,
      lastActivityAt: { lt: cutoff },
    },
    data: { isOnline: false },
  });
}
