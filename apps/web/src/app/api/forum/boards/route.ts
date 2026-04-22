import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tüm forum kategorileri ve board'larını getir
export async function GET() {
  try {
    const categories = await prisma.forumCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        boards: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { topics: true }
            },
            topics: {
              take: 1,
              orderBy: { lastPostAt: 'desc' },
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
                }
              }
            }
          }
        }
      }
    });

    // Formatlanmış veri
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      isExpanded: true,
      boards: cat.boards.map(board => {
        const lastTopic = board.topics[0];
        const lastPost = lastTopic?.posts[0];
        
        return {
          id: board.id,
          name: board.name,
          slug: board.slug,
          description: board.description,
          type: board.type,
          icon: board.icon,
          color: board.color,
          topicCount: board._count.topics,
          postCount: board.postCount || 0,
          lastTopic: lastTopic ? {
            id: lastTopic.id,
            title: lastTopic.title,
            slug: lastTopic.slug,
            author: lastPost?.author?.user?.firstName + ' ' + lastPost?.author?.user?.lastName || 'Bilinmiyor',
            authorId: lastPost?.author?.id,
            postedAt: lastTopic.lastPostAt
          } : null
        };
      })
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Forum boards fetch error:', error);
    return NextResponse.json(
      { error: 'Forum boardları yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
