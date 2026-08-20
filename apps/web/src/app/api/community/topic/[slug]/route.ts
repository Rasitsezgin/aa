export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    
    // Konuyu getir
    const topic = await prisma.forumTopic.findUnique({
      where: { slug },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Görüntülenme sayısını artır
    await prisma.forumTopic.update({
      where: { id: topic.id },
      data: { viewCount: { increment: 1 } },
    });

    // Yazar bilgilerini getir
    const author = await prisma.forumUserProfile.findUnique({
      where: { id: topic.authorId },
    });

    const authorUser = author ? await prisma.user.findUnique({
      where: { id: author.userId },
      select: { firstName: true, lastName: true, image: true },
    }) : null;

    // Board bilgilerini getir
    const board = await prisma.forumBoard.findUnique({
      where: { id: topic.boardId },
    });

    const boardCategory = board?.categoryId ? await prisma.forumCategory.findUnique({
      where: { id: board.categoryId },
    }) : null;

    // Gönderileri getir
    const posts = await prisma.forumPost.findMany({
      where: { 
        topicId: topic.id,
        isDeleted: false,
      },
      orderBy: { postNumber: 'asc' },
      take: 50,
    });

    // Gönderi yazarlarını getir
    const authorIds = [...new Set(posts.map(p => p.authorId))];
    const postAuthors = await prisma.forumUserProfile.findMany({
      where: { id: { in: authorIds } },
    });

    const postUserIds = [...new Set(postAuthors.map(a => a.userId))];
    const postUsers = await prisma.user.findMany({
      where: { id: { in: postUserIds } },
      select: { id: true, firstName: true, lastName: true, image: true },
    });

    // Kullanıcı seviyelerini getir
    const userLevels = await prisma.forumUserLevel.findMany({
      where: { userId: { in: authorIds } },
      select: { userId: true, level: true, totalXp: true },
    });

    // Kullanıcı gruplarını getir
    const userGroups = await prisma.forumUserGroup.findMany({
      where: { id: { in: postAuthors.map(a => a.primaryGroupId).filter(Boolean) as string[] } },
      select: { id: true, name: true, title: true, color: true },
    });

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
        contentHtml: post.contentHtml || post.content,
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
    });

    const result = {
      id: topic.id,
      title: topic.title,
      slug: topic.slug,
      status: topic.status,
      type: topic.type,
      viewCount: topic.viewCount + 1, // Artırılmış değer
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
    return NextResponse.json({ error: 'Failed to fetch topic' }, { status: 500 });
  }
}
