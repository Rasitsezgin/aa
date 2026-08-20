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

function getFallbackTopicResponse(slug: string) {
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
      content: post.content,
      contentHtml: renderMarkdownToHtml(post.content),
      author: {
        id: post.authorId,
        name: authorName,
        avatar: postAuthor?.avatarUrl || authorName.slice(0, 2).toUpperCase(),
        level: postAuthor?.level || 1,
        title: postAuthor?.customTitle || 'Onaylı Satıcı',
        xp: (postAuthor?.reputation || 200) * 1.5,
        group: postAuthor?.isStaff ? 'Yönetici' : 'Satıcı',
        groupColor: postAuthor?.isStaff ? '#ef4444' : '#10b981',
        reputation: postAuthor?.reputation || 100,
        postCount: postAuthor?.postCount || 10,
        joinedAt: 'Oca 2024',
        isOnline: true,
        badges: postAuthor?.levelTitle ? [postAuthor.levelTitle] : [],
        signature: postAuthor?.signature,
      },
      createdAt: '1 gün önce',
      isBestAnswer: post.isBestAnswer || (!isFirstPost && index === 1),
      reactionCount: Math.floor(Math.random() * 8) + 2,
      reactions: [
        { type: 'like', count: 4, userReacted: false },
        { type: 'helpful', count: 2, userReacted: false },
      ],
    };
  });

  return {
    id: seedTopic.id,
    title: seedTopic.title,
    slug: seedTopic.slug,
    status: seedTopic.status,
    type: seedTopic.type,
    viewCount: seedTopic.viewCount || 1450,
    replyCount: seedTopic.posts.length - 1,
    reactionCount: 18,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isSolved: seedTopic.status === 'SOLVED' || seedTopic.type === 'SOLVED',
    isPinned: seedTopic.type === 'STICKY' || seedTopic.type === 'ANNOUNCEMENT',
    isHot: (seedTopic.viewCount || 0) > 3000,
    author: {
      id: seedTopic.authorId,
      name: author?.displayName || 'Pazaryonetimi Satıcısı',
      avatar: author?.avatarUrl || (author?.displayName || 'S').slice(0, 2).toUpperCase(),
      title: author?.customTitle || 'Satıcı',
      reputation: author?.reputation || 500,
      postCount: author?.postCount || 20,
    },
    board: board ? {
      id: board.id,
      name: board.name,
      slug: board.slug,
      category: category?.name || 'Pazaryerleri',
    } : null,
    posts: formattedPosts,
    tags: seedTopic.tags || [],
  };
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;

  try {
    // 1. Veritabanından konuyu getir
    const topic = await prisma.forumTopic.findUnique({
      where: { slug },
    }).catch(() => null);

    if (!topic) {
      const fallback = getFallbackTopicResponse(slug);
      if (fallback) {
        return NextResponse.json(fallback);
      }
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Görüntülenme sayısını artır
    await prisma.forumTopic.update({
      where: { id: topic.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => undefined);

    // Yazar bilgilerini getir
    const author = await prisma.forumUserProfile.findUnique({
      where: { id: topic.authorId },
    }).catch(() => null);

    const authorUser = author ? await prisma.user.findUnique({
      where: { id: author.userId },
      select: { firstName: true, lastName: true, image: true },
    }).catch(() => null) : null;

    // Board bilgilerini getir
    const board = await prisma.forumBoard.findUnique({
      where: { id: topic.boardId },
    }).catch(() => null);

    const boardCategory = board?.categoryId ? await prisma.forumCategory.findUnique({
      where: { id: board.categoryId },
    }).catch(() => null) : null;

    // Gönderileri getir
    const posts = await prisma.forumPost.findMany({
      where: { 
        topicId: topic.id,
        isDeleted: false,
      },
      orderBy: { postNumber: 'asc' },
      take: 50,
    }).catch(() => []);

    if (posts.length === 0) {
      const fallback = getFallbackTopicResponse(slug);
      if (fallback) return NextResponse.json(fallback);
    }

    // Gönderi yazarlarını getir
    const authorIds = [...new Set(posts.map(p => p.authorId))];
    const postAuthors = await prisma.forumUserProfile.findMany({
      where: { id: { in: authorIds } },
    }).catch(() => []);

    const postUserIds = [...new Set(postAuthors.map(a => a.userId))];
    const postUsers = await prisma.user.findMany({
      where: { id: { in: postUserIds } },
      select: { id: true, firstName: true, lastName: true, image: true },
    }).catch(() => []);

    // Kullanıcı seviyelerini getir
    const userLevels = await prisma.forumUserLevel.findMany({
      where: { userId: { in: authorIds } },
      select: { userId: true, level: true, totalXp: true },
    }).catch(() => []);

    // Kullanıcı gruplarını getir
    const userGroups = await prisma.forumUserGroup.findMany({
      where: { id: { in: postAuthors.map(a => a.primaryGroupId).filter(Boolean) as string[] } },
      select: { id: true, name: true, title: true, color: true },
    }).catch(() => []);

    // Formatlanmış gönderiler
    const formattedPosts = posts.map((post) => {
      const postAuthor = postAuthors.find(a => a.id === post.authorId);
      const postUser = postUsers.find(u => u.id === postAuthor?.userId);
      const level = userLevels.find(l => l.userId === post.authorId);
      const group = userGroups.find(g => g.id === postAuthor?.primaryGroupId);
      
      const userName = postUser?.firstName && postUser?.lastName 
        ? `${postUser.firstName} ${postUser.lastName}` 
        : postAuthor?.displayName || postUser?.firstName || 'Anonim';

      return {
        id: post.id,
        postNumber: post.postNumber,
        content: post.content,
        contentHtml: post.contentHtml || renderMarkdownToHtml(post.content),
        author: {
          id: post.authorId,
          name: userName,
          avatar: postAuthor?.avatarUrl || postUser?.image || userName.slice(0, 2).toUpperCase(),
          level: level?.level || 1,
          title: postAuthor?.customTitle || group?.title || group?.name || 'Üye',
          xp: level?.totalXp || 0,
          group: group?.title || group?.name || 'Üye',
          groupColor: group?.color || '#6366f1',
          reputation: postAuthor?.reputation || 0,
          postCount: postAuthor?.postCount || 0,
          joinedAt: postAuthor?.joinedAt ? new Date(postAuthor.joinedAt).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }) : 'Yeni',
          isOnline: postAuthor?.isOnline || false,
          badges: [],
          signature: postAuthor?.signature || undefined,
        },
        createdAt: new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        updatedAt: post.updatedAt,
        editedAt: post.lastEditAt ? new Date(post.lastEditAt).toLocaleDateString('tr-TR') : undefined,
        editCount: post.editCount,
        isBestAnswer: topic.bestAnswerId === post.id,
        reactionCount: post.reactionCount,
        reactions: [
          { type: 'like', count: Math.max(1, Math.floor(post.reactionCount * 0.6)), userReacted: false },
          { type: 'helpful', count: Math.max(0, Math.floor(post.reactionCount * 0.3)), userReacted: false },
          { type: 'thanks', count: Math.max(0, Math.floor(post.reactionCount * 0.1)), userReacted: false },
        ].filter(r => r.count > 0),
      };
    });

    // Etiketleri getir
    const tags = await prisma.forumTopicTag.findMany({
      where: { topicId: topic.id },
    }).catch(() => []);

    const result = {
      id: topic.id,
      title: topic.title,
      slug: topic.slug,
      status: topic.status,
      type: topic.type,
      viewCount: topic.viewCount + 1,
      replyCount: topic.replyCount,
      reactionCount: topic.reactionCount,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      lastPostAt: topic.lastPostAt,
      isSolved: topic.status === 'SOLVED',
      isPinned: topic.type === 'STICKY' || topic.type === 'ANNOUNCEMENT',
      isHot: topic.viewCount > 1000 || topic.reactionCount > 50,
      hasPoll: topic.hasPoll,
      bestAnswerId: topic.bestAnswerId,
      author: {
        id: topic.authorId,
        name: authorUser?.firstName && authorUser?.lastName 
          ? `${authorUser.firstName} ${authorUser.lastName}` 
          : author?.displayName || authorUser?.firstName || 'Anonim',
        avatar: author?.avatarUrl || authorUser?.image || (authorUser?.firstName || 'A').slice(0, 2).toUpperCase(),
        title: author?.customTitle || 'Üye',
        reputation: author?.reputation || 0,
        postCount: author?.postCount || 0,
      },
      board: board ? {
        id: board.id,
        name: board.name,
        slug: board.slug,
        category: boardCategory?.name || 'Genel',
      } : null,
      posts: formattedPosts,
      tags: tags.map(t => ({ name: t.name, slug: t.slug, color: t.color })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Topic detail error:', error);
    const fallback = getFallbackTopicResponse(slug);
    if (fallback) return NextResponse.json(fallback);
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 });
  }
}

