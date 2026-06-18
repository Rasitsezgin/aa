import { NextRequest, NextResponse } from 'next/server';
import { getJsonSetting, setJsonSetting } from '@/lib/admin-settings-store';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const forms = await getJsonSetting<any[]>('admin_forms', []);
  const form = forms.find((f) => f.slug === slug && f.isActive);

  if (!form) {
    return NextResponse.json({ error: 'Form bulunamadı' }, { status: 404 });
  }

  return NextResponse.json({
    form: {
      id: form.id,
      name: form.name,
      slug: form.slug,
      description: form.description,
      submitButtonText: form.submitButtonText,
      fields: form.fields ?? [],
    },
  });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const body = await req.json();

  const forms = await getJsonSetting<any[]>('admin_forms', []);
  const idx = forms.findIndex((f) => f.slug === slug && f.isActive);
  if (idx === -1) {
    return NextResponse.json({ error: 'Form bulunamadı' }, { status: 404 });
  }

  const responses = await getJsonSetting<any[]>('form_responses', []);
  responses.push({
    id: crypto.randomUUID(),
    formId: forms[idx].id,
    formSlug: slug,
    data: body,
    submittedAt: new Date().toISOString(),
  });

  forms[idx].responseCount = (forms[idx].responseCount ?? 0) + 1;
  await setJsonSetting('admin_forms', forms, 'forms');
  await setJsonSetting('form_responses', responses, 'forms');

  return NextResponse.json({ success: true }, { status: 201 });
}
