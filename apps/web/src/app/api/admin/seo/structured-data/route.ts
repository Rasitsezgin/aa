export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  return NextResponse.json({
    schemas: [
      { type: 'Organization', status: 'active', pages: ['/'], lastUpdated: new Date().toISOString() },
      { type: 'WebSite', status: 'active', pages: ['/'], lastUpdated: new Date().toISOString() },
      { type: 'SoftwareApplication', status: 'active', pages: ['/'], lastUpdated: new Date().toISOString() },
      { type: 'FAQPage', status: 'active', pages: ['/faq'], lastUpdated: new Date().toISOString() },
      { type: 'BlogPosting', status: 'active', pages: ['/blog/*'], lastUpdated: new Date().toISOString() },
      { type: 'DiscussionForumPosting', status: 'active', pages: ['/forum/topic/*'], lastUpdated: new Date().toISOString() },
      { type: 'Article', status: 'active', pages: ['/destek/*'], lastUpdated: new Date().toISOString() },
    ],
  });
}
