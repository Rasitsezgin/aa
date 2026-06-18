export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { mapReportReasonToClient, mapReportStatusToClient } from '@/lib/forum-moderation';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const reports = await prisma.forumReport.findMany({
      where: status && status !== 'all'
        ? { status: status.toUpperCase() as 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED' }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        reporter: { select: { id: true, userId: true } },
        user: { select: { id: true, userId: true } },
        post: {
          select: {
            id: true,
            content: true,
            authorId: true,
            topic: { select: { id: true, title: true, slug: true } },
          },
        },
        topic: { select: { id: true, title: true, slug: true } },
      },
    });

    const profileIds = [
      ...reports.map((r) => r.reporter.id),
      ...reports.map((r) => r.user?.id).filter(Boolean),
    ] as string[];

    const profiles = await prisma.forumUserProfile.findMany({
      where: { id: { in: profileIds } },
      select: { id: true, userId: true },
    });

    const userIds = profiles.map((p) => p.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    const nameForProfile = (profileId: string) => {
      const profile = profiles.find((p) => p.id === profileId);
      const user = users.find((u) => u.id === profile?.userId);
      return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Anonim';
    };

    const logs = await prisma.forumModerationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const bannedUsers = await prisma.forumUserProfile.findMany({
      where: { isBanned: true },
      take: 50,
      select: { id: true, userId: true, banReason: true, updatedAt: true },
    });

    return NextResponse.json({
      reports: reports.map((report) => ({
        id: report.id,
        type: report.postId ? 'post' : report.topicId ? 'topic' : 'user',
        reason: mapReportReasonToClient(report.reason),
        description: report.description ?? '',
        status: mapReportStatusToClient(report.status),
        reporter: {
          id: report.reporter.id,
          name: nameForProfile(report.reporter.id),
        },
        reportedUser: report.user
          ? { id: report.user.id, name: nameForProfile(report.user.id) }
          : report.post?.authorId
            ? { id: report.post.authorId, name: nameForProfile(report.post.authorId) }
            : undefined,
        post: report.post
          ? {
              id: report.post.id,
              content: report.post.content,
              excerpt: report.post.content.slice(0, 160),
              topicTitle: report.post.topic?.title ?? '',
              topicSlug: report.post.topic?.slug,
            }
          : undefined,
        topic: report.topic
          ? { id: report.topic.id, title: report.topic.title, slug: report.topic.slug }
          : undefined,
        createdAt: report.createdAt.toISOString(),
        resolvedAt: report.resolvedAt?.toISOString(),
        moderatorNote: report.moderatorNote,
        actionTaken: report.actionTaken,
      })),
      logs: logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        userName: log.userId ? nameForProfile(log.userId) : '—',
        action: log.action.includes('ban')
          ? 'ban'
          : log.action.includes('warn')
            ? 'warning'
            : log.action.includes('delete')
              ? 'delete_content'
              : 'dismiss',
        reason: log.reason ?? '',
        moderatorId: log.moderatorId,
        moderatorName: 'Moderatör',
        createdAt: log.createdAt.toISOString(),
      })),
      bannedUsers: bannedUsers.map((u) => ({
        id: u.id,
        name: nameForProfile(u.id),
        reason: u.banReason,
        bannedAt: u.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Admin reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
