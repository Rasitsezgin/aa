export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Board detayı ve konuları
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '25');
    const page = parseInt(searchParams.get('page') || '1');

    const board = await prisma.forumBoard.findUnique({
      where: { slug: params.slug },
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
    });

    if (!board) {
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
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              posts: true,
              reactions: true
            }
          }
        }
      }),
      prisma.forumTopic.count({ where: { boardId: board.id } })
    ]);

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
        replies: topic._count.posts - 1,
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
    return NextResponse.json(
      { error: 'Forum bölümü yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
