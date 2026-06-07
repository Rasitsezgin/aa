export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getHelpArticleBySlug } from '@/lib/help-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const article = await getHelpArticleBySlug(slug);
    if (!article) {
      return NextResponse.json({ error: 'Makale bulunamadı' }, { status: 404 });
    }
    return NextResponse.json({ article });
  } catch (error) {
    console.error('Help article fetch error:', error);
    return NextResponse.json({ error: 'Makale yüklenemedi' }, { status: 500 });
  }
}
