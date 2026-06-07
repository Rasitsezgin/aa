export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createHelpArticle, listAdminHelpArticles } from '@/lib/help-admin-service';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const articles = await listAdminHelpArticles();
  return NextResponse.json({
    articles: articles.map((a) => ({
      ...a,
      status: a.status.toLowerCase(),
      updatedAt: a.updatedAt.toISOString(),
      publishedAt: a.publishedAt?.toISOString() ?? null,
      sectionName: a.section.name,
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const article = await createHelpArticle({
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
      keywords: Array.isArray(body.keywords)
        ? body.keywords
        : String(body.keywords || '').split(',').map((k: string) => k.trim()).filter(Boolean),
      authorId: session.user.id,
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Makale oluşturulamadı';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
