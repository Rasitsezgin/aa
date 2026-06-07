export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deleteHelpArticle, getAdminHelpArticle, updateHelpArticle } from '@/lib/help-admin-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const article = await getAdminHelpArticle(id);
  if (!article) {
    return NextResponse.json({ error: 'Makale bulunamadı' }, { status: 404 });
  }

  return NextResponse.json({
    article: {
      ...article,
      status: article.status.toLowerCase(),
      updatedAt: article.updatedAt.toISOString(),
      publishedAt: article.publishedAt?.toISOString() ?? null,
      sectionName: article.section.name,
      sectionId: article.section.id,
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const article = await updateHelpArticle(id, {
      title: body.title,
      slug: body.slug,
      sectionId: body.sectionId,
      summary: body.summary,
      content: body.content,
      status: body.status?.toUpperCase(),
      isPinned: body.isPinned,
      isFeatured: body.isFeatured,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      keywords: body.keywords !== undefined
        ? (Array.isArray(body.keywords)
          ? body.keywords
          : String(body.keywords).split(',').map((k: string) => k.trim()).filter(Boolean))
        : undefined,
    });

    return NextResponse.json({ article });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Güncelleme başarısız';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await deleteHelpArticle(id);
  return NextResponse.json({ success: true });
}
