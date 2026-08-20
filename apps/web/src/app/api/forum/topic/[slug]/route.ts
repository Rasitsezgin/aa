export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  FORUM_TOPICS_BY_SLUG,
  FORUM_USERS_MAP,
  FORUM_BOARDS_MAP,
  FORUM_CATEGORIES_MAP,
  type ForumTopicSeed,
} from '@/lib/forum-seed-data';

function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/### (.*?)\n/g, '<h3 class="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">$1</h3>')
    .replace(/#### (.*?)\n/g, '<h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1.5">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-orange-600 font-mono text-xs">$1</code>')
    .replace(/^\* (.*?)$/gm, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 my-1">$1</li>')
    .replace(/^\d+\. (.*?)$/gm, '<li class="ml-4 list-decimal text-slate-700 dark:text-slate-300 my-1">$1</li>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function getFallbackForumTopic(slug: string) {
  const seedTopic = FORUM_TOPICS_BY_SLUG.get(slug);
  if (!seedTopic) return null;

  const author = FORUM_USERS_MAP.get(seedTopic.authorId);
  const board = FORUM_BOARDS_MAP.get(seedTopic.boardId);
  const category = board ? FORUM_CATEGORIES_MAP.get(board.catId) : null;

  const formattedPosts = seedTopic.posts.map((post, index) => {
    const postAuthor = FORUM_USERS_MAP.get(post.authorId);
    const authorName = postAuthor?.displayName || 'Anonim Satıcı';
    const postNumber = index + 1;
    const isFirstPost = index === 0;

    return {
      id: `${seedTopic.id}-p${postNumber}`,
      postNumber,
      author: {
        id: post.authorId,
        name: authorName,
        avatar: postAuthor?.avatarUrl || authorName.slice(0, 2).toUpperCase(),
        title: postAuthor?.customTitle || 'Onaylı Satıcı',
        isStaff: postAuthor?.isStaff || false,
        isOnline: true,
        reputation: postAuthor?.reputation || 100,
        postCount: postAuthor?.postCount || 10,
        joinedAt: '2024-01-15T00:00:00.000Z',
        level: postAuthor?.levelTitle || 'Seviye 1',
        badges: postAuthor?.levelTitle ? [postAuthor.levelTitle] : []
      },
      content: post.content,
      contentHtml: renderMarkdownToHtml(post.content),
      createdAt: new Date(Date.now() - 86400000 * (seedTopic.posts.length - index)).toISOString(),
      editCount: 0,
      reactions: [
        { type: 'like', count: 4 },
        { type: 'helpful', count: 2 }
      ],
      isBestAnswer: post.isBestAnswer || (!isFirstPost && index === 1),
      attachments: []
    };
  });

  return {
    topic: {
      id: seedTopic.id,
      title: seedTopic.title,
      slug: seedTopic.slug,
      type: seedTopic.type,
      status: seedTopic.status,
      author: {
        id: seedTopic.authorId,
        name: author?.displayName || 'Pazaryonetimi Satıcısı',
        avatar: author?.avatarUrl || (author?.displayName || 'S').slice(0, 2).toUpperCase(),
        isStaff: author?.isStaff || false,
        reputation: author?.reputation || 500,
        postCount: author?.postCount || 20
      },
      board: board ? {
        id: board.id,
        name: board.name,
        slug: board.slug,
        category: category ? {
          id: category.id,
          name: category.name,
          slug: category.slug
        } : undefined
      } : undefined,
      viewCount: seedTopic.viewCount || 1450,
      replyCount: seedTopic.posts.length - 1,
      reactionCount: 18,
      watcherCount: 12,
      isWatching: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      lastPostAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      tags: seedTopic.tags || [],
      poll: null
    },
    posts: formattedPosts,
    pagination: {
      page: 1,
      limit: 20,
      totalCount: formattedPosts.length,
      totalPages: 1,
      hasMore: false
    }
  };
}

// Konu detayı ve gönderileri
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const page = parseInt(searchParams.get('page') || '1');

  try {
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
    }).catch(() => null);

    if (!topic) {
      const fallback = getFallbackForumTopic(slug);
      if (fallback) return NextResponse.json(fallback);
      return NextResponse.json(
        { error: 'Konu bulunamadı' },
        { status: 404 }
      );
    }

    // View count artır
    await prisma.forumTopic.update({
      where: { id: topic.id },
      data: { viewCount: { increment: 1 } }
    }).catch(() => undefined);

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
      }).catch(() => []),
      prisma.forumPost.count({ where: { topicId: topic.id } }).catch(() => 0)
    ]);

    if (posts.length === 0) {
      const fallback = getFallbackForumTopic(slug);
      if (fallback) return NextResponse.json(fallback);
    }

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
        contentHtml: post.contentHtml || renderMarkdownToHtml(post.content),
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
        viewCount: topic.viewCount + 1,
        replyCount: topic.replyCount || (totalPosts > 0 ? totalPosts - 1 : 0),
        reactionCount: topic._count.reactions,
        watcherCount: topic._count.watchers,
        isWatching: false,
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
    const fallback = getFallbackForumTopic(slug);
    if (fallback) return NextResponse.json(fallback);
    return NextResponse.json(
      { error: 'Konu yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

