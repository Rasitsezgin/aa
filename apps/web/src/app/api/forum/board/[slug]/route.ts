export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  FORUM_BOARDS_BY_SLUG,
  FORUM_CATEGORIES_MAP,
  FORUM_DETAILED_TOPICS,
  FORUM_USERS_MAP,
} from '@/lib/forum-seed-data';

function getFallbackBoardResponse(slug: string) {
  const seedBoard = FORUM_BOARDS_BY_SLUG.get(slug);
  if (!seedBoard) return null;

  const category = FORUM_CATEGORIES_MAP.get(seedBoard.catId);
  const matchingTopics = FORUM_DETAILED_TOPICS.filter((t) => t.boardId === seedBoard.id);

  const formattedTopics = matchingTopics.map((topic) => {
    const author = FORUM_USERS_MAP.get(topic.authorId);
    const authorName = author?.displayName || 'Anonim Satıcı';

    return {
      id: topic.id,
      title: topic.title,
      slug: topic.slug,
      author: {
        id: topic.authorId,
        name: authorName,
        avatar: author?.avatarUrl || authorName.slice(0, 2).toUpperCase(),
        level: author?.levelTitle || 'Seviye 1',
        isStaff: author?.isStaff || false,
      },
      replies: topic.posts.length > 0 ? topic.posts.length - 1 : 0,
      views: topic.viewCount || 850,
      lastPost: {
        author: authorName,
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      isPinned: topic.type === 'STICKY' || topic.type === 'ANNOUNCEMENT',
      isLocked: topic.status === 'CLOSED',
      isSolved: topic.status === 'SOLVED',
      isHot: (topic.viewCount || 0) > 3000,
      hasPoll: false,
      tags: topic.tags.map((t) => t.name),
    };
  });

  return {
    board: {
      id: seedBoard.id,
      name: seedBoard.name,
      slug: seedBoard.slug,
      description: seedBoard.description,
      type: 'GENERAL',
      category: category ? {
        id: category.id,
        name: category.name,
        slug: category.slug,
      } : null,
      moderators: [],
      topicCount: formattedTopics.length,
      postCount: matchingTopics.reduce((acc, t) => acc + t.posts.length, 0),
    },
    topics: formattedTopics,
    pagination: {
      page: 1,
      limit: 25,
      totalCount: formattedTopics.length,
      totalPages: 1,
      hasMore: false,
    },
  };
}

// Board detayı ve konuları
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '25');
  const page = parseInt(searchParams.get('page') || '1');

  try {
    const board = await prisma.forumBoard.findUnique({
      where: { slug },
      include: {
        category: true,
        moderators: {
          include: {
            user: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: { topics: true }
        }
      }
    }).catch(() => null);

    if (!board) {
      const fallback = getFallbackBoardResponse(slug);
      if (fallback) return NextResponse.json(fallback);
      return NextResponse.json(
        { error: 'Forum bölümü bulunamadı' },
        { status: 404 }
      );
    }

    // Board'daki konuları getir
    const skip = (page - 1) * limit;
    const [topics, totalCount] = await Promise.all([
      prisma.forumTopic.findMany({
        where: { boardId: board.id },
        take: limit,
        skip,
        orderBy: [
          { type: 'desc' }, // Önce sabit konular
          { lastPostAt: 'desc' }
        ],
        include: {
          author: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  image: true
                }
              }
            }
          },
          posts: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              author: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          },
          tags: true,
          _count: {
            select: {
              posts: true,
              reactions: true
            }
          }
        }
      }).catch(() => []),
      prisma.forumTopic.count({ where: { boardId: board.id } }).catch(() => 0)
    ]);

    if (topics.length === 0) {
      const fallback = getFallbackBoardResponse(slug);
      if (fallback) return NextResponse.json(fallback);
    }

    const formattedTopics = topics.map(topic => {
      const lastPost = topic.posts[0];
      const authorName = topic.author?.user?.firstName && topic.author?.user?.lastName
        ? `${topic.author.user.firstName} ${topic.author.user.lastName}`
        : topic.author?.displayName || 'Bilinmiyor';
      
      return {
        id: topic.id,
        title: topic.title,
        slug: topic.slug,
        author: {
          id: topic.author?.id,
          name: authorName,
          avatar: topic.author?.avatarUrl || topic.author?.user?.image || authorName.slice(0, 2).toUpperCase(),
          level: topic.author?.userLevel?.title || topic.author?.customTitle || 'Üye',
          isStaff: topic.author?.isStaff || false
        },
        replies: topic.replyCount || (topic._count.posts > 0 ? topic._count.posts - 1 : 0),
        views: topic.viewCount,
        lastPost: {
          author: lastPost?.author?.user?.firstName && lastPost?.author?.user?.lastName
            ? `${lastPost.author.user.firstName} ${lastPost.author.user.lastName}`
            : lastPost?.author?.displayName || authorName,
          date: topic.lastPostAt || topic.createdAt
        },
        createdAt: topic.createdAt,
        isPinned: topic.type === 'STICKY' || topic.type === 'ANNOUNCEMENT',
        isLocked: topic.status === 'CLOSED',
        isSolved: topic.status === 'SOLVED',
        isHot: topic.viewCount > 1000 || topic._count.posts > 20,
        hasPoll: topic.hasPoll,
        tags: topic.tags.map(t => t.name)
      };
    });

    return NextResponse.json({
      board: {
        id: board.id,
        name: board.name,
        slug: board.slug,
        description: board.description,
        type: board.type,
        icon: board.icon,
        color: board.color,
        rules: board.rules,
        topicCount: board._count.topics,
        postCount: board.postCount || 0,
        category: {
          id: board.category?.id,
          name: board.category?.name,
          slug: board.category?.slug
        },
        moderators: board.moderators.map(m => ({
          id: m.user.id,
          name: m.user.user?.firstName + ' ' + m.user.user?.lastName
        }))
      },
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
    console.error('Board fetch error:', error);
    const fallback = getFallbackBoardResponse(slug);
    if (fallback) return NextResponse.json(fallback);
    return NextResponse.json(
      { error: 'Forum bölümü yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
