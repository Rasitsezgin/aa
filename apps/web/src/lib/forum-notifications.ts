import 'server-only';

import type { ForumNotificationType } from '@pazaryonetimi/database';
import { prisma } from '@/lib/prisma';

interface CreateNotificationInput {
  userId: string;
  type: ForumNotificationType;
  title: string;
  message?: string;
  actorId?: string;
  postId?: string;
  topicId?: string;
  actionUrl?: string;
}

export async function createForumNotification(input: CreateNotificationInput) {
  const prefs = await prisma.forumNotificationPreference.findUnique({
    where: { userId: input.userId },
  });

  if (prefs && !prefs.pushEnabled && !['WARN', 'BAN', 'SYSTEM'].includes(input.type)) {
    return null;
  }

  if (prefs) {
    const blocked =
      (input.type === 'REPLY' && !prefs.pushOnReply) ||
      (input.type === 'MENTION' && !prefs.pushOnMention) ||
      (input.type === 'MESSAGE' && !prefs.pushOnMessage) ||
      (input.type === 'FOLLOW' && !prefs.pushOnMention);
    if (blocked) return null;
  }

  return prisma.forumNotification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      actorId: input.actorId,
      postId: input.postId,
      topicId: input.topicId,
      actionUrl: input.actionUrl,
    },
  });
}

export async function notifyTopicReply({
  topicId,
  topicSlug,
  topicTitle,
  topicAuthorId,
  replierProfileId,
  replierName,
  postId,
}: {
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  topicAuthorId: string;
  replierProfileId: string;
  replierName: string;
  postId: string;
}) {
  if (topicAuthorId === replierProfileId) return;

  await createForumNotification({
    userId: topicAuthorId,
    type: 'REPLY',
    title: 'Konunuza yeni yanıt',
    message: `${replierName} "${topicTitle}" konusuna yanıt verdi.`,
    actorId: replierProfileId,
    postId,
    topicId,
    actionUrl: `/forum/topic/${topicSlug}`,
  });
}

export async function notifyPrivateMessage({
  recipientProfileId,
  senderProfileId,
  senderName,
  conversationId,
  preview,
}: {
  recipientProfileId: string;
  senderProfileId: string;
  senderName: string;
  conversationId: string;
  preview: string;
}) {
  if (recipientProfileId === senderProfileId) return;

  const excerpt = preview.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);

  await createForumNotification({
    userId: recipientProfileId,
    type: 'MESSAGE',
    title: 'Yeni özel mesaj',
    message: `${senderName}: ${excerpt || 'Yeni bir mesaj gönderdi.'}`,
    actorId: senderProfileId,
    actionUrl: `/forum/messages/${conversationId}`,
  });
}

export async function notifyNewFollower({
  followedProfileId,
  followerProfileId,
  followerName,
}: {
  followedProfileId: string;
  followerProfileId: string;
  followerName: string;
}) {
  if (followedProfileId === followerProfileId) return;

  await createForumNotification({
    userId: followedProfileId,
    type: 'FOLLOW',
    title: 'Yeni takipçi',
    message: `${followerName} sizi takip etmeye başladı.`,
    actorId: followerProfileId,
    actionUrl: `/forum/user/${followerProfileId}`,
  });
}

export async function notifyModerationAction({
  userId,
  type,
  title,
  message,
  actionUrl,
}: {
  userId: string;
  type: 'WARN' | 'BAN';
  title: string;
  message: string;
  actionUrl?: string;
}) {
  await createForumNotification({
    userId,
    type,
    title,
    message,
    actionUrl,
  });
}
