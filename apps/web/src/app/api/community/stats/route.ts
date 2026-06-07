export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Toplam kullanıcı sayısı
    const totalMembers = await prisma.forumUserProfile.count();

    // Toplam konu sayısı
    const totalTopics = await prisma.forumTopic.count({
      where: {
        status: {
          not: 'DELETED',
        },
      },
    });

    // Toplam mesaj sayısı
    const totalPosts = await prisma.forumPost.count({
      where: {
        isDeleted: false,
      },
    });

    // Çözülen sorular (best answer olan konular)
    const solvedTopics = await prisma.forumTopic.count({
      where: {
        status: 'SOLVED',
      },
    });

    // Son 30 gündeki etkinlik
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyPosts = await prisma.forumPost.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        isDeleted: false,
      },
    });

    // Yeni üye (son kaydolan)
    const newestMemberProfile = await prisma.forumUserProfile.findFirst({
      orderBy: {
        joinedAt: 'desc',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Online kullanıcılar (son 15 dakika içinde aktif olanlar)
    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

    const onlineUsers = await prisma.forumUserProfile.count({
      where: {
        lastActivityAt: {
          gte: fifteenMinutesAgo,
        },
      },
    });

    const newestMemberName = newestMemberProfile
      ? [newestMemberProfile.user.firstName, newestMemberProfile.user.lastName]
          .filter(Boolean)
          .join(' ')
          .trim() || newestMemberProfile.user.email || 'Yeni Üye'
      : '—';

    return NextResponse.json({
      totalMembers,
      totalTopics,
      totalPosts,
      solvedTopics,
      monthlyPosts,
      onlineUsers,
      onlineGuests: 0,
      newestMember: newestMemberName,
      growthRate: 0,
      activeToday: onlineUsers,
    });
  } catch (error) {
    console.error('Community stats error:', error);
    return NextResponse.json({
      totalMembers: 0,
      totalTopics: 0,
      totalPosts: 0,
      solvedTopics: 0,
      monthlyPosts: 0,
      onlineUsers: 0,
      onlineGuests: 0,
      newestMember: '—',
      growthRate: 0,
      activeToday: 0,
    });
  }
}
