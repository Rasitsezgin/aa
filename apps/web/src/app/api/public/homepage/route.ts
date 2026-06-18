import { NextResponse } from 'next/server';
import { getJsonSetting } from '@/lib/admin-settings-store';
import { HOMEPAGE_TEXTS } from '@/config/homepage-texts';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

const DEFAULT_SECTIONS = [
  { id: 'hero', isActive: true },
  { id: 'social-proof', isActive: true },
  { id: 'chaos-control', isActive: true },
  { id: 'preview', isActive: true },
  { id: 'bento', isActive: true },
  { id: 'testimonials', isActive: true },
  { id: 'pricing', isActive: true },
  { id: 'faq', isActive: true },
  { id: 'cta', isActive: true },
];

export async function GET() {
  const [sections, texts, features] = await Promise.all([
    getJsonSetting('homepage_config', DEFAULT_SECTIONS),
    getJsonSetting('homepage_texts', HOMEPAGE_TEXTS),
    getJsonSetting('homepage_features', {}),
  ]);

  return NextResponse.json(
    { sections, texts, features },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    },
  );
}
