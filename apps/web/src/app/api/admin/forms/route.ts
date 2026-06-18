import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { getJsonSetting, setJsonSetting } from '@/lib/admin-settings-store';

export const dynamic = 'force-dynamic';

type StoredForm = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  submitButtonText: string;
  responseCount: number;
  createdAt: string;
  fields?: unknown[];
};

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const forms = await getJsonSetting<StoredForm[]>('admin_forms', []);
  return NextResponse.json({ forms });
}

export async function POST(req: NextRequest) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const body = await req.json();
  const forms = await getJsonSetting<StoredForm[]>('admin_forms', []);

  const newForm: StoredForm = {
    id: crypto.randomUUID(),
    name: body.name,
    slug: body.slug ?? body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: body.description,
    isActive: body.isActive ?? true,
    submitButtonText: body.submitButtonText ?? 'Gönder',
    responseCount: 0,
    createdAt: new Date().toISOString(),
    fields: body.fields ?? [],
  };

  forms.push(newForm);
  await setJsonSetting('admin_forms', forms, 'forms');

  return NextResponse.json({ form: newForm }, { status: 201 });
}
