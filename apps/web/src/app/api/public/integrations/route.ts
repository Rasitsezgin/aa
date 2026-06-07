export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { listPublishedLandingIntegrations } from '@/lib/landing-integrations-service';

export async function GET() {
  const integrations = await listPublishedLandingIntegrations();
  return NextResponse.json({ integrations });
}
