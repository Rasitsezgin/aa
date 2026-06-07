export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  createLandingIntegration,
  listAllLandingIntegrations,
  resetLandingIntegrationsToDefaults,
} from '@/lib/landing-integrations-service';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const integrations = await listAllLandingIntegrations();
  return NextResponse.json({ integrations });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (body.action === 'reset') {
      const integrations = await resetLandingIntegrationsToDefaults();
      return NextResponse.json({ integrations });
    }

    const integration = await createLandingIntegration(body);
    return NextResponse.json({ integration }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pazaryeri oluşturulamadı';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
