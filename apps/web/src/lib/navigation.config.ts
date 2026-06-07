/**
 * Tek kaynak navigasyon yapılandırması.
 * Desktop sidebar, mobil drawer, bottom nav ve Command Palette buradan üretilir.
 */

export type NavItemConfig = {
  id: string;
  label: string;
  href: string;
  icon: string;
  section: string;
  moduleKey?: string;
  pro?: boolean;
  badge?: string;
  keywords?: string[];
  description?: string;
  sidebar?: boolean;
  mobile?: boolean;
  commandPalette?: boolean;
  bottomNav?: boolean;
};

export const NAV_REDIRECTS: Record<string, string> = {
  '/dashboard/ai-consultant': '/dashboard/ai-advisor',
  '/dashboard/ai-assistant': '/dashboard/ai-advisor',
  '/dashboard/competitor': '/dashboard/competitor-tracking',
  '/dashboard/campaigns': '/dashboard/ad-campaigns',
  '/dashboard/theme-settings': '/dashboard/theme',
  '/dashboard/webhook-manager': '/dashboard/webhooks',
  '/dashboard/widgets': '/dashboard/widget-editor',
  '/dashboard/settings/security': '/dashboard/security',
  '/dashboard/settings/billing': '/dashboard/payments',
  '/dashboard/settings/appearance': '/dashboard/theme',
  '/dashboard/settings/api': '/dashboard/webhooks',
};

export const NAV_ITEMS: NavItemConfig[] = [
  // —— Günlük operasyon ——
  { id: 'dashboard', label: 'Kontrol Merkezi', href: '/dashboard', icon: 'LayoutDashboard', section: 'Günlük', moduleKey: 'DASHBOARD', keywords: ['ana sayfa', 'özet', 'panel'], description: 'Satış ve KPI özeti', sidebar: true, mobile: true, commandPalette: true, bottomNav: true },
  { id: 'orders', label: 'Siparişler', href: '/dashboard/orders', icon: 'ShoppingCart', section: 'Günlük', moduleKey: 'ORDERS', keywords: ['sipariş', 'kargo', 'satış'], sidebar: true, mobile: true, commandPalette: true, bottomNav: true },
  { id: 'products', label: 'Ürünler', href: '/dashboard/products', icon: 'Package', section: 'Günlük', moduleKey: 'PRODUCTS', keywords: ['ürün', 'katalog'], sidebar: true, mobile: true, commandPalette: true, bottomNav: true },
  { id: 'inventory', label: 'Stok Yönetimi', href: '/dashboard/inventory', icon: 'Warehouse', section: 'Günlük', moduleKey: 'INVENTORY', keywords: ['stok', 'depo'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'customers', label: 'Müşteriler', href: '/dashboard/customers', icon: 'Users', section: 'Günlük', moduleKey: 'CUSTOMERS', keywords: ['müşteri', 'crm'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'returns', label: 'İadeler', href: '/dashboard/returns', icon: 'RefreshCw', section: 'Günlük', moduleKey: 'ORDERS', keywords: ['iade', 'rma'], sidebar: true, mobile: true, commandPalette: true },

  // —— Büyüme ——
  { id: 'ai-advisor', label: 'AI Asistan', href: '/dashboard/ai-advisor', icon: 'Bot', section: 'Büyüme', moduleKey: 'AI_ADVISOR', pro: true, keywords: ['ai', 'danışman', 'yapay zeka'], description: 'Tek AI merkezi', sidebar: true, mobile: true, commandPalette: true, bottomNav: true },
  { id: 'ad-campaigns', label: 'Kampanyalar', href: '/dashboard/ad-campaigns', icon: 'Megaphone', section: 'Büyüme', moduleKey: 'CAMPAIGNS', keywords: ['kampanya', 'reklam'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'competitor-tracking', label: 'Rakip Takibi', href: '/dashboard/competitor-tracking', icon: 'TrendingUp', section: 'Büyüme', moduleKey: 'COMPETITOR_ANALYSIS', pro: true, keywords: ['rakip', 'fiyat'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'analytics', label: 'Analitik', href: '/dashboard/analytics', icon: 'LineChart', section: 'Büyüme', moduleKey: 'ANALYTICS_ADVANCED', keywords: ['analitik', 'metrik'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'seo', label: 'SEO Optimizasyonu', href: '/dashboard/seo', icon: 'Target', section: 'Büyüme', moduleKey: 'AI_SEO', pro: true, keywords: ['seo', 'arama'], mobile: true, commandPalette: true },
  { id: 'price-optimization', label: 'Fiyat Optimizasyonu', href: '/dashboard/price-optimization', icon: 'Zap', section: 'Büyüme', moduleKey: 'PRICING_ENGINE', pro: true, mobile: true, commandPalette: true },

  // —— Sistem ——
  { id: 'stores', label: 'Mağazalarım', href: '/dashboard/stores', icon: 'Store', section: 'Sistem', moduleKey: 'STORE_MANAGEMENT', keywords: ['mağaza', 'kanal'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'integrations', label: 'Entegrasyonlar', href: '/dashboard/settings/integrations', icon: 'Globe', section: 'Sistem', moduleKey: 'INTEGRATIONS', keywords: ['entegrasyon', 'api', 'trendyol'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'settings', label: 'Ayarlar', href: '/dashboard/settings', icon: 'Settings', section: 'Sistem', moduleKey: 'SETTINGS', keywords: ['ayar', 'config'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'security', label: 'Güvenlik', href: '/dashboard/security', icon: 'Shield', section: 'Sistem', moduleKey: 'SECURITY', keywords: ['güvenlik', '2fa'], mobile: true, commandPalette: true },
  { id: 'widget-editor', label: 'Panel Özelleştirme', href: '/dashboard/widget-editor', icon: 'LayoutGrid', section: 'Sistem', moduleKey: 'DASHBOARD', keywords: ['widget', 'dashboard'], commandPalette: true },

  // —— Ek modüller (mobil + palette, sidebar dışı) ——
  { id: 'finance', label: 'Finans & Karlılık', href: '/dashboard/finance', icon: 'Briefcase', section: 'Finans', moduleKey: 'PAYMENTS', mobile: true, commandPalette: true },
  { id: 'payments', label: 'Ödemeler', href: '/dashboard/payments', icon: 'CreditCard', section: 'Finans', moduleKey: 'PAYMENTS', mobile: true, commandPalette: true },
  { id: 'reports', label: 'Finansal Raporlar', href: '/dashboard/reports', icon: 'BarChart3', section: 'Finans', moduleKey: 'FINANCIAL_REPORTS', pro: true, mobile: true, commandPalette: true },
  { id: 'webhooks', label: 'Webhooks', href: '/dashboard/webhooks', icon: 'Webhook', section: 'Sistem', moduleKey: 'INTEGRATIONS', pro: true, mobile: true, commandPalette: true },
  { id: 'bulk-actions', label: 'Toplu İşlemler', href: '/dashboard/bulk-actions', icon: 'Boxes', section: 'Operasyon', moduleKey: 'BULK_ACTIONS', pro: true, mobile: true, commandPalette: true },
  { id: 'group-mapping', label: 'SKU Eşleme', href: '/dashboard/inventory/group-mapping', icon: 'Layers', section: 'Operasyon', moduleKey: 'INVENTORY', keywords: ['sku', 'eşleme', 'master'], mobile: true, commandPalette: true },
  { id: 'shipping', label: 'Kargo Ayarları', href: '/dashboard/shipping', icon: 'Truck', section: 'Operasyon', moduleKey: 'SHIPPING', mobile: true, commandPalette: true },
  { id: 'notification-center', label: 'Bildirim Merkezi', href: '/dashboard/notification-center', icon: 'Bell', section: 'Sistem', moduleKey: 'DASHBOARD', mobile: true, commandPalette: true },
  { id: 'theme', label: 'Tema & Görünüm', href: '/dashboard/theme', icon: 'Palette', section: 'Sistem', moduleKey: 'SETTINGS', mobile: true, commandPalette: true },
  { id: 'live-analytics', label: 'Canlı Analitik', href: '/dashboard/live-analytics', icon: 'Activity', section: 'Sistem', moduleKey: 'DASHBOARD', mobile: true, commandPalette: true },
  { id: 'favorites', label: 'Favoriler', href: '/dashboard/favorites', icon: 'Star', section: 'Kişisel', moduleKey: 'DASHBOARD', commandPalette: true },
];

export type NavSection = { title: string; items: NavItemConfig[] };

function groupBySection(items: NavItemConfig[]): NavSection[] {
  const map = new Map<string, NavItemConfig[]>();
  for (const item of items) {
    if (!map.has(item.section)) map.set(item.section, []);
    map.get(item.section)!.push(item);
  }
  return Array.from(map.entries()).map(([title, sectionItems]) => ({ title, items: sectionItems }));
}

export function getSidebarSections(): NavSection[] {
  return groupBySection(NAV_ITEMS.filter((i) => i.sidebar));
}

export function getMobileSections(): NavSection[] {
  return groupBySection(NAV_ITEMS.filter((i) => i.mobile));
}

export function getBottomNavItems(): NavItemConfig[] {
  return NAV_ITEMS.filter((i) => i.bottomNav);
}

export function getCommandPaletteNavItems(): NavItemConfig[] {
  return NAV_ITEMS.filter((i) => i.commandPalette);
}

export function getPageTitle(pathname: string): string {
  const exact = NAV_ITEMS.find((i) => i.href === pathname);
  if (exact) return exact.label;
  const prefix = NAV_ITEMS.filter((i) => i.href !== '/dashboard' && pathname.startsWith(i.href)).sort((a, b) => b.href.length - a.href.length)[0];
  if (prefix) return prefix.label;
  return 'Dashboard';
}

export function resolveNavRedirect(pathname: string): string | null {
  return NAV_REDIRECTS[pathname] ?? null;
}
