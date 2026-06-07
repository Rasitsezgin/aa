export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getPublishedHelpArticles } from '@/lib/help-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const articles = await getPublishedHelpArticles(limit);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Help articles list error:', error);
    return NextResponse.json({ articles: [] });
  }
}
