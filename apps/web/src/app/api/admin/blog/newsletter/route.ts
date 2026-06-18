import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { getJsonSetting, setJsonSetting } from '@/lib/admin-settings-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const [newsletters, subscribers, campaigns] = await Promise.all([
    getJsonSetting('newsletter_issues', []),
    getJsonSetting('newsletter_subscribers', []),
    getJsonSetting('newsletter_campaigns', []),
  ]);

  return NextResponse.json({ newsletters, subscribers, campaigns });
}

export async function POST(req: NextRequest) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const body = await req.json();

  if (body.type === 'campaign') {
    const campaigns = await getJsonSetting<any[]>('newsletter_campaigns', []);
    campaigns.push({
      id: crypto.randomUUID(),
      name: body.name,
      subject: body.subject,
      status: body.status ?? 'draft',
      sentCount: 0,
      openRate: 0,
      createdAt: new Date().toISOString(),
    });
    await setJsonSetting('newsletter_campaigns', campaigns, 'newsletter');
    return NextResponse.json({ success: true }, { status: 201 });
  }

  if (body.type === 'issue') {
    const newsletters = await getJsonSetting<any[]>('newsletter_issues', []);
    newsletters.push({
      id: crypto.randomUUID(),
      title: body.title,
      subject: body.subject,
      status: body.status ?? 'draft',
      sentAt: null,
      recipientCount: 0,
      createdAt: new Date().toISOString(),
    });
    await setJsonSetting('newsletter_issues', newsletters, 'newsletter');
    return NextResponse.json({ success: true }, { status: 201 });
  }

  return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
}
