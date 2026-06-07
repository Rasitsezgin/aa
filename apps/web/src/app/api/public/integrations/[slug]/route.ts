export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getPublishedIntegrationBySlug } from '@/lib/landing-integrations-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const integration = await getPublishedIntegrationBySlug(slug);
  if (!integration) {
    return NextResponse.json({ error: 'Entegrasyon bulunamadı' }, { status: 404 });
  }
  return NextResponse.json({ integration });
}
