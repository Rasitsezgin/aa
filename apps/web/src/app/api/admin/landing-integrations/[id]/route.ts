export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  deleteLandingIntegration,
  getLandingIntegrationById,
  updateLandingIntegration,
} from '@/lib/landing-integrations-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const integration = await getLandingIntegrationById(id);
  if (!integration) {
    return NextResponse.json({ error: 'Pazaryeri bulunamadı' }, { status: 404 });
  }

  return NextResponse.json({ integration });
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
    const integration = await updateLandingIntegration(id, body);
    return NextResponse.json({ integration });
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

  try {
    const { id } = await params;
    await deleteLandingIntegration(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Silme başarısız';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
