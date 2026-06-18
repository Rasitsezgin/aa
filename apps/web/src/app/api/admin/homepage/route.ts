import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { getJsonSetting, setJsonSetting } from '@/lib/admin-settings-store';
import { HOMEPAGE_TEXTS } from '@/config/homepage-texts';

export const dynamic = 'force-dynamic';

const DEFAULT_SECTIONS = [
  { id: 'hero', label: 'Ana Giriş (Hero)', isActive: true },
  { id: 'stats', label: 'Canlı İstatistikler', isActive: true },
  { id: 'social-proof', label: 'Sosyal Kanıt (Logolar)', isActive: true },
  { id: 'bento', label: 'Özellik Bento Grid', isActive: true },
  { id: 'pricing', label: 'Fiyatlandırma Paketleri', isActive: true },
  { id: 'faq', label: 'SSS Bölümü', isActive: true },
  { id: 'cta', label: 'Son Çağrı (CTA)', isActive: true },
];

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const [sections, texts, features] = await Promise.all([
    getJsonSetting('homepage_config', DEFAULT_SECTIONS),
    getJsonSetting('homepage_texts', HOMEPAGE_TEXTS),
    getJsonSetting('homepage_features', {}),
  ]);

  return NextResponse.json({ sections, texts, features });
}

export async function PUT(req: NextRequest) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const body = await req.json();

  if (body.sections) await setJsonSetting('homepage_config', body.sections, 'homepage');
  if (body.texts) await setJsonSetting('homepage_texts', body.texts, 'homepage');
  if (body.features) await setJsonSetting('homepage_features', body.features, 'homepage');

  return NextResponse.json({ success: true });
}
