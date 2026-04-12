import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // Admin panelinden ayarları oku (sadece runtime'da, build time'da skip et)
  let settings: any = {};
  
  // Skip database queries during build time
  // NEXT_PHASE env var is set during build: phase-production-build, phase-production-server, etc
  const isBuildTime =
    process.env.NEXT_PHASE?.includes('build') ||
    process.env.NODE_ENV === 'development';

  if (!isBuildTime) {
    try {
      const { getPwaSettings } = await import('@/actions/pwa-settings');
      settings = await getPwaSettings();
    } catch (error) {
      // Silently fail with defaults
      console.warn('[manifest] PWA settings unavailable, using defaults');
    }
  }

  const name = settings.pwa_app_name || 'PazarYonetimi - E-ticaret Yönetim Platformu';
  const shortName = settings.pwa_short_name || 'PazarYonetimi';
  const description = settings.pwa_description || 'Tüm pazaryerlerinizi tek platformdan yönetin. Trendyol, Hepsiburada, Amazon, N11 entegrasyonları.';
  const themeColor = settings.pwa_theme_color || '#2563eb';
  const bgColor = settings.pwa_bg_color || '#ffffff';
  const display = (settings.pwa_display as any) || 'standalone';
  const startUrl = settings.pwa_start_url || '/dashboard';

  return {
    name,
    short_name: shortName,
    description,
    start_url: startUrl,
    display,
    background_color: bgColor,
    theme_color: themeColor,
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'tr',
    categories: ['business', 'productivity', 'shopping'],
    icons: [
      // PNG icons (dinamik oluşturulan)
      {
        src: '/api/pwa-icon?size=72',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/pwa-icon?size=96',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/pwa-icon?size=128',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/pwa-icon?size=144',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/pwa-icon?size=152',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/pwa-icon?size=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/pwa-icon?size=384',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/pwa-icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      // Maskable icons
      {
        src: '/api/pwa-icon?size=192&maskable=true',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/api/pwa-icon?size=512&maskable=true',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      // SVG icons (yedek)
      {
        src: '/icons/icon-192x192.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        url: '/dashboard',
        description: 'Ana kontrol paneline git',
      },
      {
        name: 'Siparişler',
        short_name: 'Siparişler',
        url: '/dashboard/orders',
        description: 'Sipariş yönetimi',
      },
      {
        name: 'Ürünler',
        short_name: 'Ürünler',
        url: '/dashboard/products',
        description: 'Ürün yönetimi',
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
