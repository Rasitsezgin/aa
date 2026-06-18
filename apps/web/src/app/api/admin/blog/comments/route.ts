import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const comments = await prisma.blogComment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const postIds = [...new Set(comments.map((c) => c.postId))];
  const posts = await prisma.blogPost.findMany({
    where: { id: { in: postIds } },
    select: { id: true, title: true, slug: true },
  });
  const postMap = Object.fromEntries(posts.map((p) => [p.id, p]));

  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      postTitle: postMap[c.postId]?.title,
      postSlug: postMap[c.postId]?.slug,
      authorName: c.authorName,
      authorEmail: c.authorEmail,
    })),
  });
}
