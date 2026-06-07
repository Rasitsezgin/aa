import 'server-only';

import { prisma } from '@/lib/prisma';
import { formatForumContentHtml, formatForumUserName } from '@/lib/forum-server';
import { notifyPrivateMessage } from '@/lib/forum-notifications';

async function assertNotBlocked(userA: string, userB: string) {
  const blocked = await prisma.forumUserBlock.findFirst({
    where: {
      OR: [
        { blockerId: userA, blockedId: userB },
        { blockerId: userB, blockedId: userA },
      ],
    },
    select: { id: true },
  });
  if (blocked) throw new Error('Bu kullanıcıyla mesajlaşamazsınız');
}

export async function getOrCreateDirectConversation(viewerProfileId: string, targetProfileId: string) {
  if (viewerProfileId === targetProfileId) {
    throw new Error('Kendinize mesaj gönderemezsiniz');
  }

  await assertNotBlocked(viewerProfileId, targetProfileId);

  const target = await prisma.forumUserProfile.findUnique({
    where: { id: targetProfileId },
    select: { id: true, isBanned: true },
  });
  if (!target || target.isBanned) throw new Error('Kullanıcı bulunamadı');

  const existing = await prisma.forumConversation.findFirst({
    where: {
      isGroup: false,
      participants: {
        some: { userId: viewerProfileId, hasLeft: false },
      },
      AND: {
        participants: {
          some: { userId: targetProfileId, hasLeft: false },
        },
      },
    },
    include: {
      participants: { where: { hasLeft: false }, select: { userId: true } },
    },
  });

  if (existing && existing.participants.length === 2) {
    return existing.id;
  }

  const conversation = await prisma.forumConversation.create({
    data: {
      isGroup: false,
      creatorId: viewerProfileId,
      participants: {
        create: [
          { userId: viewerProfileId, lastReadAt: new Date(), unreadCount: 0 },
          { userId: targetProfileId, lastReadAt: new Date(), unreadCount: 0 },
        ],
      },
    },
  });

  return conversation.id;
}

export async function listUserConversations(profileId: string) {
  const participations = await prisma.forumConversationParticipant.findMany({
    where: { userId: profileId, hasLeft: false },
    orderBy: { conversation: { lastMessageAt: 'desc' } },
    take: 50,
    include: {
      conversation: {
        include: {
          participants: {
            where: { hasLeft: false },
            include: {
              user: {
                include: {
                  user: { select: { firstName: true, lastName: true, image: true, email: true } },
                },
              },
            },
          },
          messages: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { content: true, createdAt: true, authorId: true },
          },
        },
      },
    },
  });

  return participations.map((entry) => {
    const others = entry.conversation.participants.filter((p) => p.userId !== profileId);
    const peer = others[0];
    const last = entry.conversation.messages[0];
    const peerName = peer ? formatForumUserName(peer.user.user) : 'Kullanıcı';

    return {
      id: entry.conversationId,
      isGroup: entry.conversation.isGroup,
      title: entry.conversation.isGroup
        ? entry.conversation.title || 'Grup'
        : peerName,
      peer: peer
        ? {
            id: peer.userId,
            name: peerName,
            avatar: peer.user.avatarUrl || peer.user.user.image || undefined,
            isOnline: peer.user.isOnline,
          }
        : null,
      lastMessage: last
        ? {
            content: last.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120),
            createdAt: last.createdAt.toISOString(),
            isMine: last.authorId === profileId,
          }
        : null,
      unreadCount: entry.unreadCount,
      lastMessageAt: entry.conversation.lastMessageAt.toISOString(),
    };
  });
}

export async function getConversationForUser(conversationId: string, profileId: string) {
  const participation = await prisma.forumConversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: profileId },
    },
    include: {
      conversation: {
        include: {
          participants: {
            where: { hasLeft: false },
            include: {
              user: {
                include: {
                  user: { select: { firstName: true, lastName: true, image: true, email: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!participation || participation.hasLeft) return null;

  const others = participation.conversation.participants.filter((p) => p.userId !== profileId);
  const peer = others[0];

  return {
    id: conversationId,
    isGroup: participation.conversation.isGroup,
    title: participation.conversation.isGroup
      ? participation.conversation.title || 'Grup'
      : peer ? formatForumUserName(peer.user.user) : 'Sohbet',
    peer: peer
      ? {
          id: peer.userId,
          name: formatForumUserName(peer.user.user),
          avatar: peer.user.avatarUrl || peer.user.user.image || undefined,
          isOnline: peer.user.isOnline,
        }
      : null,
  };
}

export async function getConversationMessages(
  conversationId: string,
  profileId: string,
  page = 1,
  limit = 40,
) {
  const participation = await prisma.forumConversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: profileId } },
    select: { hasLeft: true },
  });
  if (!participation || participation.hasLeft) return null;

  const skip = (page - 1) * limit;
  const [messages, total] = await Promise.all([
    prisma.forumPrivateMessage.findMany({
      where: { conversationId, isDeleted: false },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
      include: {
        author: {
          include: {
            user: { select: { firstName: true, lastName: true, image: true } },
          },
        },
      },
    }),
    prisma.forumPrivateMessage.count({ where: { conversationId, isDeleted: false } }),
  ]);

  await prisma.forumConversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId: profileId } },
    data: { lastReadAt: new Date(), unreadCount: 0 },
  });

  return {
    messages: messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      contentHtml: msg.contentHtml,
      createdAt: msg.createdAt.toISOString(),
      isMine: msg.authorId === profileId,
      author: {
        id: msg.authorId,
        name: formatForumUserName(msg.author.user),
        avatar: msg.author.avatarUrl || msg.author.user.image || undefined,
      },
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

export async function sendPrivateMessage(
  conversationId: string,
  authorProfileId: string,
  content: string,
) {
  const trimmed = content.trim();
  if (!trimmed) throw new Error('Mesaj boş olamaz');
  if (trimmed.length > 5000) throw new Error('Mesaj çok uzun');

  const participation = await prisma.forumConversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: authorProfileId } },
    include: {
      conversation: {
        include: {
          participants: { where: { hasLeft: false }, select: { userId: true } },
        },
      },
    },
  });

  if (!participation || participation.hasLeft) {
    throw new Error('Sohbete erişim yok');
  }

  const others = participation.conversation.participants
    .map((p) => p.userId)
    .filter((id) => id !== authorProfileId);

  for (const otherId of others) {
    await assertNotBlocked(authorProfileId, otherId);
  }

  const html = formatForumContentHtml(trimmed);
  const now = new Date();

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.forumPrivateMessage.create({
      data: {
        conversationId,
        authorId: authorProfileId,
        content: trimmed,
        contentHtml: html,
      },
      include: {
        author: {
          include: {
            user: { select: { firstName: true, lastName: true, image: true } },
          },
        },
      },
    });

    await tx.forumConversation.update({
      where: { id: conversationId },
      data: {
        messageCount: { increment: 1 },
        lastMessageAt: now,
        lastMessageId: created.id,
      },
    });

    await tx.forumConversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: authorProfileId },
        hasLeft: false,
      },
      data: { unreadCount: { increment: 1 } },
    });

    await tx.forumConversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId: authorProfileId } },
      data: { lastReadAt: now, unreadCount: 0 },
    });

    return created;
  });

  const senderName = formatForumUserName(message.author.user);
  await Promise.all(
    others.map((recipientId) =>
      notifyPrivateMessage({
        recipientProfileId: recipientId,
        senderProfileId: authorProfileId,
        senderName,
        conversationId,
        preview: trimmed,
      }).catch(() => undefined),
    ),
  );

  return {
    id: message.id,
    content: message.content,
    contentHtml: message.contentHtml,
    createdAt: message.createdAt.toISOString(),
    isMine: true,
    author: {
      id: message.authorId,
      name: formatForumUserName(message.author.user),
      avatar: message.author.avatarUrl || message.author.user.image || undefined,
    },
  };
}

export async function getUnreadMessageCount(profileId: string): Promise<number> {
  const result = await prisma.forumConversationParticipant.aggregate({
    where: { userId: profileId, hasLeft: false },
    _sum: { unreadCount: true },
  });
  return result._sum.unreadCount ?? 0;
}
