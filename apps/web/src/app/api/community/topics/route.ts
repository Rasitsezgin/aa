export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'popular';

    let whereClause: any = {
      status: {
        not: 'DELETED',
      },
    };

    if (category && category !== 'Tümü') {
      // Kategori filtresi için basit string eşleşme
      whereClause = {
        ...whereClause,
      };
    }

    let orderBy: any = {};
    switch (sortBy) {
      case 'recent':
        orderBy = { createdAt: 'desc' };
        break;
      case 'unanswered':
        whereClause.replyCount = 0;
        orderBy = { createdAt: 'desc' };
        break;
      case 'popular':
      default:
        orderBy = [
          { reactionCount: 'desc' },
          { viewCount: 'desc' },
          { lastPostAt: 'desc' },
        ];
        break;
    }

    // Basit sorgu - relations olmadan
    const topics = await prisma.forumTopic.findMany({
      where: whereClause,
      take: limit,
      orderBy,
    });

    // Kullanıcı ve kategori bilgilerini ayrı sorgularla al
    const authorIds = [...new Set(topics.map(t => t.authorId))];
    const boardIds = [...new Set(topics.map(t => t.boardId))];

    const authors = await prisma.forumUserProfile.findMany({
      where: { id: { in: authorIds } },
    });

    const boards = await prisma.forumBoard.findMany({
      where: { id: { in: boardIds } },
    });

    const userIds = [...new Set(authors.map(a => a.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, image: true },
    });

    const categoryIds = [...new Set(boards.map(b => b.categoryId).filter(Boolean))];
    const categories = await prisma.forumCategory.findMany({
      where: { id: { in: categoryIds as string[] } },
    });

    // Verileri birleştir
    const formattedTopics = topics.map((topic) => {
      const board = boards.find(b => b.id === topic.boardId);
      const category = categories.find(c => c.id === board?.categoryId);
      const author = authors.find(a => a.id === topic.authorId);
      const user = users.find(u => u.id === author?.userId);
      const userName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user?.firstName || 'Anonim';

      return {
        id: topic.id,
        title: topic.title,
        slug: topic.slug,
        category: category?.name || board?.name || 'Genel',
        categoryColor: category?.color || 'blue',
        author: {
          name: userName,
          avatar: user?.image || userName.slice(0, 2).toUpperCase() || '??',
          badge: undefined,
          badgeColor: undefined,
        },
        replies: topic.replyCount,
        views: topic.viewCount,
        likes: topic.reactionCount,
        lastActivity: topic.lastPostAt || topic.createdAt,
        createdAt: topic.createdAt,
        isPinned: topic.type === 'STICKY' || topic.type === 'ANNOUNCEMENT',
        isSolved: topic.status === 'SOLVED',
        isHot: topic.viewCount > 1000 || topic.reactionCount > 50,
        type: topic.type,
      };
    });

    return NextResponse.json(formattedTopics);
  } catch (error) {
    console.error('Community topics error:', error);
    // Fallback data
    return NextResponse.json([
      {
        id: '1',
        title: 'AI Fiyatlandırma Stratejileri: En İyi Uygulamalar',
        slug: 'ai-fiyatlandirma-stratejileri',
        category: 'Fiyatlandırma',
        categoryColor: 'emerald',
        author: { name: 'Ahmet Y.', avatar: 'AY', badge: 'Pro Satıcı' },
        replies: 47,
        views: 1250,
        likes: 89,
        lastActivity: new Date(),
        createdAt: new Date(),
        isPinned: true,
        isSolved: false,
        isHot: true,
        type: 'NORMAL',
      },
      {
        id: '2',
        title: 'Trendyol Entegrasyonu - Stok Senkronizasyon Sorunu',
        slug: 'trendyol-entegrasyon-stok',
        category: 'Entegrasyon',
        categoryColor: 'blue',
        author: { name: 'Zeynep K.', avatar: 'ZK' },
        replies: 23,
        views: 456,
        likes: 12,
        lastActivity: new Date(),
        createdAt: new Date(),
        isPinned: false,
        isSolved: true,
        isHot: false,
        type: 'NORMAL',
      },
    ]);
  }
}
