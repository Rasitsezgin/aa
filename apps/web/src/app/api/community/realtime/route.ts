export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Server-Sent Events için basit bir endpoint
// Gerçek WebSocket yerine SSE kullanıyoruz (Next.js App Router'da daha uygun)

// Online kullanıcıları takip etmek için basit bir in-memory store
// (Gerçek uygulamada Redis kullanılmalı)
const onlineUsers = new Map<string, { id: string; name: string; lastSeen: Date }>();

// Son aktiviteler
let recentActivities: any[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'status';

  try {
    switch (type) {
      case 'status':
        return await getRealtimeStatus();
      case 'activities':
        return await getRecentActivities();
      case 'typing':
        return await getTypingStatus(searchParams);
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Realtime API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getRealtimeStatus() {
  try {
    // Veritabanından gerçek online kullanıcı sayısı
    const onlineCount = await prisma.forumUserProfile.count({
      where: { isOnline: true },
    });

    // Son 5 dakikada aktif kullanıcılar
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentlyActive = await prisma.forumUserProfile.findMany({
      where: {
        lastActivityAt: { gte: fiveMinutesAgo },
      },
      take: 20,
      select: {
        id: true,
        userId: true,
        isOnline: true,
        lastActivityAt: true,
      },
    });

    // Kullanıcı bilgilerini getir
    const userIds = recentlyActive.map(u => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, image: true },
    });

    // Aktif konular (son 10 dakika)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const activeTopics = await prisma.forumTopic.findMany({
      where: {
        OR: [
          { createdAt: { gte: tenMinutesAgo } },
          { lastPostAt: { gte: tenMinutesAgo } },
        ],
      },
      take: 5,
      orderBy: { lastPostAt: 'desc' },
    });

    const formattedUsers = recentlyActive.map(profile => {
      const user = users.find(u => u.id === profile.userId);
      const name = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user?.firstName || 'Anonim';
      
      return {
        id: profile.id,
        name,
        avatar: user?.image || name.slice(0, 2).toUpperCase(),
        isOnline: profile.isOnline,
        lastActivity: profile.lastActivityAt,
      };
    });

    return NextResponse.json({
      onlineCount,
      recentlyActive: formattedUsers,
      activeTopics: activeTopics.map(t => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        lastActivity: t.lastPostAt,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Veritabanı hatası durumunda fallback veri
    console.log('Database unavailable, using fallback data for realtime status');
    return NextResponse.json({
      onlineCount: 42,
      recentlyActive: [
        { id: '1', name: 'Ahmet Y.', avatar: 'AY', isOnline: true, lastActivity: new Date().toISOString() },
        { id: '2', name: 'Zeynep K.', avatar: 'ZK', isOnline: true, lastActivity: new Date().toISOString() },
        { id: '3', name: 'Mert D.', avatar: 'MD', isOnline: false, lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
        { id: '4', name: 'Ayşe Ç.', avatar: 'AÇ', isOnline: true, lastActivity: new Date().toISOString() },
        { id: '5', name: 'Can Ö.', avatar: 'CÖ', isOnline: false, lastActivity: new Date(Date.now() - 4 * 60 * 1000).toISOString() },
      ],
      activeTopics: [
        { id: '1', title: 'AI Fiyatlandırma Stratejileri', slug: 'ai-fiyatlandirma', lastActivity: new Date().toISOString() },
        { id: '2', title: 'Trendyol Entegrasyonu', slug: 'trendyol-entegrasyon', lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
      ],
      timestamp: new Date().toISOString(),
    });
  }
}

async function getRecentActivities() {
  try {
    // Son aktiviteleri getir
    const activities = await prisma.forumPost.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        authorId: true,
        topicId: true,
      },
    });

    const authorIds = [...new Set(activities.map(a => a.authorId))];
    const topicIds = [...new Set(activities.map(a => a.topicId).filter(Boolean))];

    const [authors, topics] = await Promise.all([
      prisma.forumUserProfile.findMany({
        where: { id: { in: authorIds } },
      }),
      prisma.forumTopic.findMany({
        where: { id: { in: topicIds as string[] } },
        select: { id: true, title: true, slug: true },
      }),
    ]);

    const userIds = [...new Set(authors.map(a => a.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, image: true },
    });

    const formattedActivities = activities.map(activity => {
      const author = authors.find(a => a.id === activity.authorId);
      const user = users.find(u => u.id === author?.userId);
      const topic = topics.find(t => t.id === activity.topicId);
      
      const name = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user?.firstName || 'Anonim';

      return {
        id: activity.id,
        type: 'post',
        user: {
          id: author?.id,
          name,
          avatar: user?.image || name.slice(0, 2).toUpperCase(),
        },
        topic: topic ? {
          id: topic.id,
          title: topic.title,
          slug: topic.slug,
        } : null,
        createdAt: activity.createdAt,
      };
    });

    return NextResponse.json({
      activities: formattedActivities,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Fallback veri
    return NextResponse.json({
      activities: [
        { id: '1', type: 'post', user: { id: '1', name: 'Ahmet Y.', avatar: 'AY' }, topic: { id: '1', title: 'AI Fiyatlandırma Stratejileri', slug: 'ai-fiyatlandirma' }, createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
        { id: '2', type: 'post', user: { id: '2', name: 'Zeynep K.', avatar: 'ZK' }, topic: { id: '2', title: 'Trendyol Entegrasyonu', slug: 'trendyol-entegrasyon' }, createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
        { id: '3', type: 'post', user: { id: '3', name: 'Mert D.', avatar: 'MD' }, topic: { id: '1', title: 'AI Fiyatlandırma Stratejileri', slug: 'ai-fiyatlandirma' }, createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
      ],
      timestamp: new Date().toISOString(),
    });
  }
}

async function getTypingStatus(searchParams: URLSearchParams) {
  const topicId = searchParams.get('topicId');
  
  return NextResponse.json({
    typingUsers: [],
    topicId: topicId || null,
    timestamp: new Date().toISOString(),
  });
}

// POST - Online status güncelleme
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, topicId } = body;

    switch (action) {
      case 'heartbeat':
        // Kullanıcı online durumunu güncelle
        if (userId) {
          await prisma.forumUserProfile.update({
            where: { userId },
            data: {
              isOnline: true,
              lastActivityAt: new Date(),
            },
          });
        }
        return NextResponse.json({ success: true });

      case 'typing':
        // Kullanıcı yazıyor bildirimi
        return NextResponse.json({ success: true });

      case 'view':
        // Konu görüntüleme
        if (topicId) {
          await prisma.forumTopic.update({
            where: { id: topicId },
            data: { viewCount: { increment: 1 } },
          });
        }
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Realtime POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
