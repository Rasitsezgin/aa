export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@pazaryonetimi/database';
import {
  createUniqueTopicSlug,
  formatForumContentHtml,
  getAuthenticatedForumProfile,
  mapTopicType,
  slugifyForumTitle,
} from '@/lib/forum-server';
import { syncGamificationAfterAction } from '@/lib/forum-gamification';

function formatUserName(
  user?: { firstName?: string | null; lastName?: string | null; email?: string } | null,
): string {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return name || user?.email || 'Bilinmiyor';
}

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
    const where: Prisma.ForumTopicWhereInput = {
      status: { not: 'DELETED' },
    };
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
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  image: true,
                  email: true,
                },
              },
              primaryGroup: {
                select: {
                  isStaff: true,
                  isModerator: true,
                  title: true,
                },
              },
              userLevel: {
                select: {
                  title: true,
                  level: true,
                },
              },
            },
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
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          tags: true,
        },
      }),
      prisma.forumTopic.count({ where }),
    ]);

    const formattedTopics = topics.map((topic) => {
      const lastPost = topic.posts[0];
      const authorName = formatUserName(topic.author?.user);

      return {
        id: topic.id,
        title: topic.title,
        slug: topic.slug,
        author: {
          id: topic.author?.id,
          name: authorName,
          avatar: topic.author?.avatarUrl || topic.author?.user?.image || authorName.slice(0, 2).toUpperCase(),
          level: topic.author?.userLevel?.title || topic.author?.primaryGroup?.title || 'Üye',
          isStaff: topic.author?.primaryGroup?.isStaff || false,
        },
        board: {
          id: topic.board.id,
          name: topic.board.name,
          slug: topic.board.slug,
        },
        replies: topic.replyCount,
        views: topic.viewCount,
        lastPost: {
          author: lastPost ? formatUserName(lastPost.author?.user) : authorName,
          date: topic.lastPostAt || topic.createdAt,
        },
        createdAt: topic.createdAt,
        isPinned: topic.type === 'STICKY' || topic.type === 'ANNOUNCEMENT',
        isLocked: topic.status === 'CLOSED',
        isSolved: topic.status === 'SOLVED',
        isHot: topic.viewCount > 1000 || topic.replyCount > 20,
        hasPoll: topic.hasPoll,
        tags: topic.tags.map((t) => t.name),
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

export async function POST(request: Request) {
  try {
    const authContext = await getAuthenticatedForumProfile();
    if (!authContext) {
      return NextResponse.json({ error: 'Konu açmak için giriş yapmalısınız.' }, { status: 401 });
    }

    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const boardId = typeof body.boardId === 'string' ? body.boardId : '';
    const topicType = mapTopicType(body.type);
    const tags = Array.isArray(body.tags)
      ? body.tags.filter((tag: unknown) => typeof tag === 'string').map((tag: string) => tag.trim()).filter(Boolean).slice(0, 5)
      : [];

    if (!title || title.length < 3) {
      return NextResponse.json({ error: 'Konu başlığı en az 3 karakter olmalı.' }, { status: 400 });
    }
    if (!content || content.length < 10) {
      return NextResponse.json({ error: 'Mesaj en az 10 karakter olmalı.' }, { status: 400 });
    }
    if (!boardId) {
      return NextResponse.json({ error: 'Forum bölümü seçilmelidir.' }, { status: 400 });
    }

    const board = await prisma.forumBoard.findFirst({
      where: { id: boardId, isActive: true },
      select: { id: true, name: true },
    });

    if (!board) {
      return NextResponse.json({ error: 'Seçilen forum bölümü bulunamadı.' }, { status: 404 });
    }

    const slug = await createUniqueTopicSlug(title);
    const contentHtml = formatForumContentHtml(content);
    const { profile } = authContext;

    const result = await prisma.$transaction(async (tx) => {
      const topic = await tx.forumTopic.create({
        data: {
          title,
          slug,
          boardId: board.id,
          authorId: profile.id,
          type: topicType,
          status: 'OPEN',
          hasPoll: topicType === 'POLL',
          replyCount: 0,
          lastPostAt: new Date(),
          bumpedAt: new Date(),
        },
      });

      const post = await tx.forumPost.create({
        data: {
          topicId: topic.id,
          authorId: profile.id,
          content,
          contentHtml,
          postNumber: 1,
        },
      });

      await tx.forumTopic.update({
        where: { id: topic.id },
        data: { firstPostId: post.id },
      });

      if (tags.length > 0) {
        await tx.forumTopicTag.createMany({
          data: tags.map((tag) => ({
            topicId: topic.id,
            name: tag,
            slug: slugifyForumTitle(tag),
          })),
          skipDuplicates: true,
        });
      }

      await tx.forumBoard.update({
        where: { id: board.id },
        data: {
          topicCount: { increment: 1 },
          postCount: { increment: 1 },
          lastTopicId: topic.id,
          lastTopicTitle: topic.title,
          lastPostId: post.id,
          lastPostAt: new Date(),
          lastPosterId: profile.id,
        },
      });

      await tx.forumUserProfile.update({
        where: { id: profile.id },
        data: {
          topicCount: { increment: 1 },
          postCount: { increment: 1 },
          lastPostAt: new Date(),
          lastActivityAt: new Date(),
        },
      });

      return topic;
    });

    syncGamificationAfterAction(profile.id, 'create_topic').catch(console.error);

    return NextResponse.json({
      id: result.id,
      slug: result.slug,
      title: result.title,
    }, { status: 201 });
  } catch (error) {
    console.error('Forum topic create error:', error);
    return NextResponse.json({ error: 'Konu oluşturulamadı.' }, { status: 500 });
  }
}
