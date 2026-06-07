import 'server-only';

import type { ForumReportReason, ForumReportStatus } from '@pazaryonetimi/database';
import { prisma } from '@/lib/prisma';
import { notifyModerationAction } from '@/lib/forum-notifications';

export function mapReportReason(input: string): ForumReportReason {
  const map: Record<string, ForumReportReason> = {
    spam: 'SPAM',
    offensive: 'OFFENSIVE',
    harassment: 'HARASSMENT',
    off_topic: 'OFF_TOPIC',
    duplicate: 'DUPLICATE',
    other: 'OTHER',
  };
  return map[input.toLowerCase()] ?? 'OTHER';
}

export function mapReportStatusToClient(status: ForumReportStatus): string {
  return status.toLowerCase();
}

export function mapReportReasonToClient(reason: ForumReportReason): string {
  return reason.toLowerCase();
}

export async function resolveReport({
  reportId,
  moderatorUserId,
  action,
  moderatorNote,
}: {
  reportId: string;
  moderatorUserId: string;
  action: 'warning' | 'ban' | 'delete' | 'dismiss';
  moderatorNote?: string;
}) {
  const report = await prisma.forumReport.findUnique({
    where: { id: reportId },
    include: {
      post: { select: { id: true, authorId: true } },
      topic: { select: { id: true, authorId: true, slug: true } },
      user: { select: { id: true } },
    },
  });

  if (!report) throw new Error('Rapor bulunamadı');

  const status: ForumReportStatus =
    action === 'dismiss' ? 'DISMISSED' : 'RESOLVED';

  const targetUserId =
    report.userId ?? report.post?.authorId ?? report.topic?.authorId ?? null;

  await prisma.$transaction(async (tx) => {
    await tx.forumReport.update({
      where: { id: reportId },
      data: {
        status,
        moderatorId: moderatorUserId,
        moderatorNote,
        resolvedAt: new Date(),
        actionTaken: action,
        warnPoints: action === 'warning' ? 1 : 0,
      },
    });

    await tx.forumModerationLog.create({
      data: {
        moderatorId: moderatorUserId,
        action: action === 'warning' ? 'warn_user' : action === 'ban' ? 'ban_user' : action === 'delete' ? 'delete_post' : 'dismiss_report',
        topicId: report.topicId,
        postId: report.postId,
        userId: targetUserId,
        reason: moderatorNote ?? report.description,
      },
    });

    if (action === 'delete' && report.postId) {
      await tx.forumPost.update({
        where: { id: report.postId },
        data: { isDeleted: true, deletedAt: new Date(), deletedBy: moderatorUserId },
      });
    }

    if (action === 'warning' && targetUserId) {
      await tx.forumUserProfile.update({
        where: { id: targetUserId },
        data: { warnPoints: { increment: 1 } },
      });
    }

    if (action === 'ban' && targetUserId) {
      await tx.forumUserProfile.update({
        where: { id: targetUserId },
        data: {
          isBanned: true,
          banReason: moderatorNote ?? 'Topluluk kuralları ihlali',
        },
      });
    }
  });

  if (targetUserId) {
    if (action === 'warning') {
      await notifyModerationAction({
        userId: targetUserId,
        type: 'WARN',
        title: 'Topluluk uyarısı',
        message: moderatorNote ?? 'Topluluk kurallarına aykırı davranış tespit edildi.',
        actionUrl: '/forum',
      });
    }
    if (action === 'ban') {
      await notifyModerationAction({
        userId: targetUserId,
        type: 'BAN',
        title: 'Hesabınız askıya alındı',
        message: moderatorNote ?? 'Topluluk erişiminiz geçici olarak kısıtlandı.',
      });
    }
  }

  return { success: true, status: mapReportStatusToClient(status) };
}
