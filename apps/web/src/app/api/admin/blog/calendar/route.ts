import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
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

  const items = posts.map((p) => ({
    id: p.id,
    title: p.title,
    type: 'blog_post' as const,
    date: p.createdAt.toISOString().split('T')[0],
    status: p.isActive ? 'published' : 'draft',
    color: p.isActive ? 'blue' : 'slate',
  }));

  const campaigns = await prisma.campaign.findMany({
    orderBy: { startDate: 'desc' },
    take: 50,
    select: {
      id: true,
      name: true,
      status: true,
      startDate: true,
      endDate: true,
      type: true,
    },
  });

  const campaignItems = campaigns.map((c) => ({
    id: c.id,
    title: c.name,
    type: 'campaign' as const,
    date: c.startDate.toISOString().split('T')[0],
    endDate: c.endDate.toISOString().split('T')[0],
    status: c.status,
    color: c.status === 'active' ? 'green' : 'orange',
  }));

  return NextResponse.json({ items: [...items, ...campaignItems], campaigns: campaignItems });
}
