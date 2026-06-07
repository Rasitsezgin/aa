export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { readSeoOverrides, writeSeoOverrides } from '@/lib/seo/seo-admin-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.type !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { path: encodedPath } = await params;
  const routePath = decodeURIComponent(encodedPath);
  const body = await request.json();

  const overrides = await readSeoOverrides();
  overrides[routePath] = {
    title: body.title,
    description: body.description,
    keywords: body.keywords,
    indexable: body.indexable,
    ogImage: body.ogImage,
    canonical: body.canonical,
  };
  await writeSeoOverrides(overrides);

  return NextResponse.json({ success: true, path: routePath });
}
