import { NextResponse } from 'next/server';
import { getPwaSettings } from '@/actions/pwa-settings';

export const dynamic = 'force-dynamic';

// Public PWA settings endpoint (isPublic=true olan ayarlar için)
export async function GET() {
  try {
    const settings = await getPwaSettings();

    // Sadece public ayarları döndür
    const publicSettings = {
      pwa_enabled: settings.pwa_enabled ?? true,
      pwa_install_prompt_enabled: settings.pwa_install_prompt_enabled ?? true,
      pwa_install_prompt_delay: settings.pwa_install_prompt_delay ?? 0,
      pwa_offline_enabled: settings.pwa_offline_enabled ?? true,
      pwa_push_notifications_enabled: settings.pwa_push_notifications_enabled ?? false,
    };

    return NextResponse.json(publicSettings, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch {
    return NextResponse.json(
      {
        pwa_enabled: true,
        pwa_install_prompt_enabled: true,
        pwa_install_prompt_delay: 0,
        pwa_offline_enabled: true,
        pwa_push_notifications_enabled: false,
      },
      { status: 200 }
    );
  }
}
