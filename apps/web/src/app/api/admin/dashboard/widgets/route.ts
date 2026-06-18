import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { getJsonSetting, setJsonSetting } from '@/lib/admin-settings-store';

export const dynamic = 'force-dynamic';

const DEFAULT_CONFIG = {
  widgetEnabled: {} as Record<string, boolean>,
  sections: null as unknown,
};

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const config = await getJsonSetting('admin_dashboard_widgets', DEFAULT_CONFIG);
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const body = await req.json();
  const existing = await getJsonSetting('admin_dashboard_widgets', DEFAULT_CONFIG);
  const updated = {
    widgetEnabled: body.widgetEnabled ?? existing.widgetEnabled ?? {},
    sections: body.sections ?? existing.sections ?? null,
  };

  await setJsonSetting('admin_dashboard_widgets', updated, 'admin');
  return NextResponse.json({ success: true });
}
