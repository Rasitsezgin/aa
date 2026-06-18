import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { getJsonSetting, setJsonSetting } from '@/lib/admin-settings-store';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const { id } = await context.params;
  const forms = await getJsonSetting<any[]>('admin_forms', []);
  const filtered = forms.filter((f) => f.id !== id);
  await setJsonSetting('admin_forms', filtered, 'forms');

  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const { id } = await context.params;
  const body = await req.json();
  const forms = await getJsonSetting<any[]>('admin_forms', []);
  const idx = forms.findIndex((f) => f.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Form bulunamadı' }, { status: 404 });

  forms[idx] = { ...forms[idx], ...body, id };
  await setJsonSetting('admin_forms', forms, 'forms');

  return NextResponse.json({ form: forms[idx] });
}
