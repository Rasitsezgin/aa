import 'server-only';

import { prisma } from '@/lib/prisma';

export const DEFAULT_NOTIFICATION_PREFS = {
  emailOnReply: true,
  emailOnQuote: true,
  emailOnMention: true,
  emailOnReaction: false,
  emailOnMessage: true,
  emailOnAchievement: true,
  emailDigest: 'never',
  pushEnabled: true,
  pushOnReply: true,
  pushOnMention: true,
  pushOnMessage: true,
  soundEnabled: true,
} as const;

export async function ensureNotificationPreferences(profileId: string) {
  const existing = await prisma.forumNotificationPreference.findUnique({
    where: { userId: profileId },
  });
  if (existing) return existing;

  return prisma.forumNotificationPreference.create({
    data: { userId: profileId, ...DEFAULT_NOTIFICATION_PREFS },
  });
}

export async function getNotificationPreferences(profileId: string) {
  const prefs = await ensureNotificationPreferences(profileId);
  return {
    pushEnabled: prefs.pushEnabled,
    pushOnReply: prefs.pushOnReply,
    pushOnMention: prefs.pushOnMention,
    pushOnMessage: prefs.pushOnMessage,
    soundEnabled: prefs.soundEnabled,
    emailOnReply: prefs.emailOnReply,
    emailOnQuote: prefs.emailOnQuote,
    emailOnMention: prefs.emailOnMention,
    emailOnReaction: prefs.emailOnReaction,
    emailOnMessage: prefs.emailOnMessage,
    emailOnAchievement: prefs.emailOnAchievement,
    emailDigest: prefs.emailDigest,
  };
}

export async function updateNotificationPreferences(
  profileId: string,
  input: Partial<{
    pushEnabled: boolean;
    pushOnReply: boolean;
    pushOnMention: boolean;
    pushOnMessage: boolean;
    soundEnabled: boolean;
    emailOnReply: boolean;
    emailOnQuote: boolean;
    emailOnMention: boolean;
    emailOnReaction: boolean;
    emailOnMessage: boolean;
    emailOnAchievement: boolean;
    emailDigest: string;
  }>,
) {
  await ensureNotificationPreferences(profileId);

  const data: Record<string, unknown> = {};
  const boolFields = [
    'pushEnabled', 'pushOnReply', 'pushOnMention', 'pushOnMessage', 'soundEnabled',
    'emailOnReply', 'emailOnQuote', 'emailOnMention', 'emailOnReaction',
    'emailOnMessage', 'emailOnAchievement',
  ] as const;

  for (const key of boolFields) {
    if (typeof input[key] === 'boolean') data[key] = input[key];
  }

  if (typeof input.emailDigest === 'string' && ['never', 'daily', 'weekly'].includes(input.emailDigest)) {
    data.emailDigest = input.emailDigest;
  }

  return prisma.forumNotificationPreference.update({
    where: { userId: profileId },
    data,
  });
}
