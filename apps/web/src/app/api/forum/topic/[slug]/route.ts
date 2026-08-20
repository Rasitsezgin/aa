export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Konu detayı ve gönderileri
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const topic = await prisma.forumTopic.findUnique({
      where: { slug },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        author: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
                createdAt: true
              }
            },
            primaryGroup: true,
            userLevel: true
          }
        },
        tags: true,
        poll: {
          include: {
            options: {
              include: {
                _count: {
                  select: { votes: true }
                }
              }
            }
          }
        },
        _count: {
          select: {
            posts: true,
            reactions: true,
            watchers: true
          }
        }
      }
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Konu bulunamadı' },
        { status: 404 }
      );
    }

    // View count artır
    await prisma.forumTopic.update({
      where: { id: topic.id },
      data: { viewCount: { increment: 1 } }
    });

    // Gönderileri getir
    const skip = (page - 1) * limit;
    const [posts, totalPosts] = await Promise.all([
      prisma.forumPost.findMany({
        where: { topicId: topic.id },
        take: limit,
        skip,
        orderBy: { postNumber: 'asc' },
        include: {
          author: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  image: true,
                  createdAt: true
                }
              },
              primaryGroup: true,
              userLevel: true,
              badges: {
                include: {
                  badge: true
                }
              }
            }
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true
                }
              }
            }
          },
          editHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          attachments: true
        }
      }),
      prisma.forumPost.count({ where: { topicId: topic.id } })
    ]);

    const formattedPosts = posts.map(post => {
      const authorName = post.author?.user?.firstName && post.author?.user?.lastName
        ? `${post.author.user.firstName} ${post.author.user.lastName}`
        : post.author?.displayName || 'Bilinmiyor';
      
      // Reaksiyonları grupla
      const reactions = post.reactions.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        id: post.id,
        postNumber: post.postNumber,
        author: {
          id: post.author?.id,
          name: authorName,
          avatar: post.author?.avatarUrl || post.author?.user?.image || authorName.slice(0, 2).toUpperCase(),
          title: post.author?.customTitle || post.author?.primaryGroup?.name || 'Üye',
          isStaff: post.author?.isStaff || false,
          isOnline: post.author?.isOnline || false,
          reputation: post.author?.reputation || 0,
          postCount: post.author?.postCount || 0,
          joinedAt: post.author?.user?.createdAt || post.author?.joinedAt,
          level: post.author?.userLevel?.title || 'Seviye 1',
          badges: post.author?.badges?.map(b => b.badge?.name).filter(Boolean) || []
        },
        content: post.content,
        contentHtml: post.contentHtml || post.content,
        createdAt: post.createdAt,
        editedAt: post.lastEditAt,
        editCount: post.editCount,
        editReason: post.editHistory?.[0]?.reason,
        reactions: Object.entries(reactions).map(([type, count]) => ({
          type,
          count
        })),
        isBestAnswer: topic.bestAnswerId === post.id,
        attachments: post.attachments.map(a => ({
          id: a.id,
          filename: a.filename,
          filesize: a.filesize,
          url: a.url
        }))
      };
    });

    const topicAuthorName = topic.author?.user?.firstName && topic.author?.user?.lastName
      ? `${topic.author.user.firstName} ${topic.author.user.lastName}`
      : topic.author?.displayName || 'Bilinmiyor';

    return NextResponse.json({
      topic: {
        id: topic.id,
        title: topic.title,
        slug: topic.slug,
        type: topic.type,
        status: topic.status,
        author: {
          id: topic.author?.id,
          name: topicAuthorName,
          avatar: topic.author?.avatarUrl || topic.author?.user?.image || topicAuthorName.slice(0, 2).toUpperCase(),
          isStaff: topic.author?.isStaff || false,
          reputation: topic.author?.reputation || 0,
          postCount: topic.author?.postCount || 0
        },
        board: topic.board,
        viewCount: topic.viewCount + 1, // Artırılmış değer
        replyCount: topic.replyCount || (totalPosts > 0 ? totalPosts - 1 : 0),
        reactionCount: topic._count.reactions,
        watcherCount: topic._count.watchers,
        isWatching: false, // Kullanıcı kontrolü gerekir
        createdAt: topic.createdAt,
        lastPostAt: topic.lastPostAt,
        tags: topic.tags.map(t => ({
          name: t.name,
          slug: t.slug,
          color: t.color
        })),
        poll: topic.poll ? {
          id: topic.poll.id,
          question: topic.poll.question,
          options: topic.poll.options.map(o => ({
            id: o.id,
            text: o.text,
            voteCount: o._count.votes
          })),
          totalVotes: topic.poll.options.reduce((acc, o) => acc + o._count.votes, 0),
          isClosed: topic.poll.isClosed
        } : null
      },
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        totalCount: totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        hasMore: page * limit < totalPosts
      }
    });
  } catch (error) {
    console.error('Topic fetch error:', error);
    return NextResponse.json(
      { error: 'Konu yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
