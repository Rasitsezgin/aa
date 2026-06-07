export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        boards: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            _count: { select: { topics: true } },
            topics: {
              take: 1,
              orderBy: { lastPostAt: 'desc' },
              include: {
                author: { include: { user: { select: { firstName: true, lastName: true } } } },
                posts: {
                  take: 1,
                  orderBy: { createdAt: 'desc' },
                  include: {
                    author: { include: { user: { select: { firstName: true, lastName: true } } } }
                  }
                }
              }
            }
          }
        }
      }
    });

    const formatted = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      isExpanded: true,
      boards: cat.boards.map(board => {
        const lastTopic = board.topics[0];
        const lastPost = lastTopic?.posts[0];
        return {
          id: board.id,
          name: board.name,
          slug: board.slug,
          description: board.description,
          topicCount: board._count.topics,
          postCount: board.postCount || 0,
          lastTopic: lastTopic ? {
            id: lastTopic.id,
            title: lastTopic.title,
            slug: lastTopic.slug,
            author: `${lastPost?.author?.user?.firstName || ''} ${lastPost?.author?.user?.lastName || ''}`.trim() || 'Bilinmiyor',
            postedAt: lastTopic.lastPostAt
          } : null
        };
      })
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: 'Boardlar yüklenemedi' }, { status: 500 });
  }
}
