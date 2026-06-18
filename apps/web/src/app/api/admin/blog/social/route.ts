import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { getJsonSetting } from '@/lib/admin-settings-store';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const [accounts, shares] = await Promise.all([
    getJsonSetting('blog_social_accounts', []),
    getJsonSetting('blog_social_shares', []),
  ]);

  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 20,
    select: { id: true, title: true, slug: true, updatedAt: true },
  });

  return NextResponse.json({
    accounts,
    shares: shares.length > 0 ? shares : posts.map((p) => ({
      id: p.id,
      postTitle: p.title,
      platform: 'TWITTER',
      message: p.title,
      status: 'draft',
      impressions: 0,
      clicks: 0,
      likes: 0,
      shares: 0,
      comments: 0,
    })),
  });
}
