import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 100,
    select: {
      id: true,
      title: true,
      slug: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const stages = [
    { id: 'draft', name: 'Taslak', color: 'slate' },
    { id: 'review', name: 'İncelemede', color: 'amber' },
    { id: 'scheduled', name: 'Planlandı', color: 'blue' },
    { id: 'published', name: 'Yayında', color: 'green' },
  ];

  const items = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    stage: p.isActive ? 'published' : 'draft',
    author: 'Editör',
    updatedAt: p.updatedAt.toISOString(),
    createdAt: p.createdAt.toISOString(),
  }));

  const counts = {
    draft: items.filter((i) => i.stage === 'draft').length,
    review: 0,
    scheduled: 0,
    published: items.filter((i) => i.stage === 'published').length,
  };

  return NextResponse.json({ stages, items, counts });
}
