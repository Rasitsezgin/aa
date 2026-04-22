import { NextResponse } from 'next/response';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Son konuları getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const boardSlug = searchParams.get('board');
    const limit = parseInt(searchParams.get('limit') || '25');
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'lastPost'; // lastPost, new, popular

    const skip = (page - 1) * limit;

    // Sıralama koşulu
    let orderBy: Prisma.ForumTopicOrderByWithRelationInput = { lastPostAt: 'desc' };
    if (sortBy === 'new') orderBy = { createdAt: 'desc' };
    if (sortBy === 'popular') orderBy = { viewCount: 'desc' };

    // Filtreleme
    const where: Prisma.ForumTopicWhereInput = {};
    if (boardSlug) {
      where.board = { slug: boardSlug };
    }

    const [topics, totalCount] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        take: limit,
        skip,
        orderBy,
        include: {
          board: true,
          author: {
            include: {
              user: true
            }
          },
          posts: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              author: {
                include: {
                  user: true
                }
              }
            }
          },
          tags: {
            include: {
              tag: true
            }
          }
        }
      }),
      prisma.forumTopic.count({ where })
    ]);

    // Formatlanmış veri
    const formattedTopics = topics.map(topic => {
      const lastPost = topic.posts[0];
      const authorName = topic.author?.user?.firstName + ' ' + topic.author?.user?.lastName || 'Bilinmiyor';
      
      return {
        id: topic.id,
        title: topic.title,
        slug: topic.slug,
        author: {
          id: topic.author?.id,
          name: authorName,
          avatar: topic.author?.user?.image || authorName.slice(0, 2).toUpperCase(),
          level: topic.author?.level?.toString() || 'Üye',
          isStaff: topic.author?.isStaff || false
        },
        board: {
          id: topic.board.id,
          name: topic.board.name,
          slug: topic.board.slug
        },
        replies: topic._count.posts - 1, // İlk post hariç
        views: topic.viewCount,
        lastPost: {
          author: lastPost?.author?.user?.firstName + ' ' + lastPost?.author?.user?.lastName || authorName,
          date: topic.lastPostAt || topic.createdAt
        },
        createdAt: topic.createdAt,
        isPinned: topic.type === 'STICKY' || topic.isPinned,
        isLocked: topic.status === 'CLOSED' || topic.isLocked,
        isSolved: topic.status === 'SOLVED',
        isHot: topic.viewCount > 1000 || topic._count.posts > 20,
        hasPoll: topic.pollId !== null,
        tags: topic.tags.map(t => t.tag.name)
      };
    });

    return NextResponse.json({
      topics: formattedTopics,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount
      }
    });
  } catch (error) {
    console.error('Forum topics fetch error:', error);
    return NextResponse.json(
      { error: 'Konular yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
