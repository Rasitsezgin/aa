import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { getJsonSetting, setJsonSetting } from '@/lib/admin-settings-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const templates = await getJsonSetting('blog_templates', []);
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const body = await req.json();
  const templates = await getJsonSetting<any[]>('blog_templates', []);

  const template = {
    id: crypto.randomUUID(),
    name: body.name,
    description: body.description ?? '',
    category: body.category ?? 'genel',
    content: body.content ?? '',
    isActive: body.isActive ?? true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
  };

  templates.push(template);
  await setJsonSetting('blog_templates', templates, 'blog');

  return NextResponse.json({ template }, { status: 201 });
}
