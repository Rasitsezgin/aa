import { NextRequest, NextResponse } from 'next/server';
import { getJsonSetting, setJsonSetting } from '@/lib/admin-settings-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body.email ?? '').trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin' }, { status: 400 });
  }

  const subscribers = await getJsonSetting<any[]>('newsletter_subscribers', []);
  if (subscribers.some((s) => s.email === email)) {
    return NextResponse.json({ success: true, message: 'Zaten abonesiniz' });
  }

  subscribers.push({
    id: crypto.randomUUID(),
    email,
    name: body.name ?? null,
    status: 'active',
    subscribedAt: new Date().toISOString(),
    source: body.source ?? 'website',
  });

  await setJsonSetting('newsletter_subscribers', subscribers, 'newsletter');

  return NextResponse.json({ success: true }, { status: 201 });
}
