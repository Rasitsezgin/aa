/**
 * Tek kaynak navigasyon yapılandırması.
 * Desktop sidebar, mobil drawer, bottom nav ve Command Palette buradan üretilir.
 * Logo ERP / Kurumsal Ticaret Seviyesinde Hiyerarşik Modüller.
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
  // ─── KONTROL PANELİ ─────────────────────────────────────────────
  { id: 'dashboard', label: 'Ana Kontrol Merkezi', href: '/dashboard', icon: 'LayoutDashboard', section: 'Genel', moduleKey: 'DASHBOARD', keywords: ['ana sayfa', 'özet', 'kpi', 'panel'], description: 'Satış, ciro ve operasyon özeti', sidebar: true, mobile: true, commandPalette: true, bottomNav: true },
  { id: 'live-analytics', label: 'Canlı Satış & Analitik', href: '/dashboard/live-analytics', icon: 'Activity', section: 'Genel', moduleKey: 'DASHBOARD', keywords: ['canlı', 'satış', 'anlık'], badge: 'Canlı', sidebar: true, mobile: true, commandPalette: true },

  // ─── CARİ & MÜŞTERİ YÖNETİMİ ────────────────────────────────────
  { id: 'customers', label: 'Cari Kartlar & Müşteriler', href: '/dashboard/customers', icon: 'Users', section: 'Cari & Müşteri', moduleKey: 'CUSTOMERS', keywords: ['müşteri', 'cari', 'kart', 'crm'], description: 'Müşteri profilleri ve satın alma geçmişi', sidebar: true, mobile: true, commandPalette: true },

  // ─── STOK & DEPO & MALZEME ──────────────────────────────────────
  { id: 'products', label: 'Malzeme / Ürün Kataloğu', href: '/dashboard/products', icon: 'Package', section: 'Stok & Depo', moduleKey: 'PRODUCTS', keywords: ['ürün', 'katalog', 'malzeme', 'fiyat'], description: 'Tüm pazaryeri ürünleri ve varyantlar', sidebar: true, mobile: true, commandPalette: true, bottomNav: true },
  { id: 'inventory', label: 'Stok & Depo Yönetimi', href: '/dashboard/inventory', icon: 'Warehouse', section: 'Stok & Depo', moduleKey: 'INVENTORY', keywords: ['stok', 'depo', 'sayım', 'raf'], description: 'Depo stokları ve kritik seviye uyarıları', sidebar: true, mobile: true, commandPalette: true },
  { id: 'xml-import', label: 'Toptancı & XML İçe Aktar', href: '/dashboard/xml-import', icon: 'FileCode', section: 'Stok & Depo', moduleKey: 'PRODUCTS', keywords: ['xml', 'toptancı', 'tedarikçi', 'aktar'], badge: 'Yeni', sidebar: true, mobile: true, commandPalette: true },
  { id: 'group-mapping', label: 'SKU & Master Barkod Eşleme', href: '/dashboard/inventory/group-mapping', icon: 'Layers', section: 'Stok & Depo', moduleKey: 'INVENTORY', keywords: ['sku', 'barkod', 'eşleme', 'master'], sidebar: true, mobile: true, commandPalette: true },

  // ─── SİPARİŞ & LOJİSTİK ─────────────────────────────────────────
  { id: 'orders', label: 'Sipariş Dağıtım Merkezi', href: '/dashboard/orders', icon: 'ShoppingCart', section: 'Sipariş & Lojistik', moduleKey: 'ORDERS', keywords: ['sipariş', 'satış', 'bekleyen'], description: 'Tüm pazaryerlerinden gelen siparişler', sidebar: true, mobile: true, commandPalette: true, bottomNav: true },
  { id: 'shipping', label: 'Termal Kargo & Barkod', href: '/dashboard/shipping', icon: 'Truck', section: 'Sipariş & Lojistik', moduleKey: 'SHIPPING', keywords: ['kargo', 'etiket', 'barkod', 'termal', 'zpl'], badge: 'Sıfır-Tık', sidebar: true, mobile: true, commandPalette: true },
  { id: 'returns', label: 'İadeler & Müşteri Talepleri', href: '/dashboard/returns', icon: 'RefreshCw', section: 'Sipariş & Lojistik', moduleKey: 'ORDERS', keywords: ['iade', 'iptal', 'rma'], sidebar: true, mobile: true, commandPalette: true },

  // ─── PAZARYERİ & AKILLI FİYAT ───────────────────────────────────
  { id: 'price-optimization', label: 'Oto-Pilot Buybox Repricer', href: '/dashboard/price-optimization', icon: 'Zap', section: 'Pazaryeri & Fiyat', moduleKey: 'PRICING_ENGINE', pro: true, keywords: ['buybox', 'fiyat kırma', 'otopilot', 'kâr koruma'], badge: 'Oto-Pilot', sidebar: true, mobile: true, commandPalette: true },
  { id: 'competitor-tracking', label: 'Rakip Casusu & Fiyat Takibi', href: '/dashboard/competitor-tracking', icon: 'TrendingUp', section: 'Pazaryeri & Fiyat', moduleKey: 'COMPETITOR_ANALYSIS', pro: true, keywords: ['rakip', 'casus', 'pazar payı'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'ad-campaigns', label: 'Kampanyalar & İndirimler', href: '/dashboard/ad-campaigns', icon: 'Megaphone', section: 'Pazaryeri & Fiyat', moduleKey: 'CAMPAIGNS', keywords: ['kampanya', 'kupon', 'reklam'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'stores', label: 'Bağlı Mağazalarım', href: '/dashboard/stores', icon: 'Store', section: 'Pazaryeri & Fiyat', moduleKey: 'STORE_MANAGEMENT', keywords: ['mağaza', 'trendyol', 'hepsiburada', 'amazon'], sidebar: true, mobile: true, commandPalette: true },

  // ─── FİNANS & MUHASEBE & MUTABAKAT ──────────────────────────────
  { id: 'finance', label: 'Finansal Röntgen & Ceza Dedektifi', href: '/dashboard/finance', icon: 'Briefcase', section: 'Finans & Muhasebe', moduleKey: 'PAYMENTS', keywords: ['finans', 'desi', 'ceza', 'kaçak', 'kârlılık'], badge: 'Röntgen', sidebar: true, mobile: true, commandPalette: true },
  { id: 'payments', label: 'Hakedişler & Ödemeler', href: '/dashboard/payments', icon: 'CreditCard', section: 'Finans & Muhasebe', moduleKey: 'PAYMENTS', keywords: ['ödeme', 'hakediş', 'vade'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'reports', label: 'Muhasebe & Mutabakat Raporları', href: '/dashboard/reports', icon: 'BarChart3', section: 'Finans & Muhasebe', moduleKey: 'FINANCIAL_REPORTS', pro: true, sidebar: true, mobile: true, commandPalette: true },

  // ─── AI MERKEZİ & OTOMASYON ─────────────────────────────────────
  { id: 'growth-hub', label: 'AI Büyüme & Dönüşüm Merkezi', href: '/dashboard/growth', icon: 'Sparkles', section: 'AI & Otomasyon', moduleKey: 'AI_ADVISOR', pro: true, keywords: ['ai', 'büyüme', 'satış artırma'], badge: 'AI', sidebar: true, mobile: true, commandPalette: true },
  { id: 'ai-advisor', label: 'AI Satış & Müşteri Danışmanı', href: '/dashboard/ai-advisor', icon: 'Bot', section: 'AI & Otomasyon', moduleKey: 'AI_ADVISOR', pro: true, keywords: ['ai', 'danışman', 'yapay zeka'], sidebar: true, mobile: true, commandPalette: true, bottomNav: true },
  { id: 'seo', label: 'SEO & Başlık Sihirbazı', href: '/dashboard/seo', icon: 'Target', section: 'AI & Otomasyon', moduleKey: 'AI_SEO', pro: true, keywords: ['seo', 'başlık', 'açıklama'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'bulk-actions', label: 'Toplu İşlemler & Otomasyon', href: '/dashboard/bulk-actions', icon: 'Boxes', section: 'AI & Otomasyon', moduleKey: 'BULK_ACTIONS', pro: true, keywords: ['toplu', 'fiyat güncelle', 'otomasyon'], sidebar: true, mobile: true, commandPalette: true },

  // ─── SİSTEM & AYARLAR ───────────────────────────────────────────
  { id: 'integrations', label: 'Entegrasyon Ayarları', href: '/dashboard/settings/integrations', icon: 'Globe', section: 'Sistem', moduleKey: 'INTEGRATIONS', keywords: ['entegrasyon', 'api', 'trendyol', 'hepsiburada'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'integration-hub', label: 'Entegrasyon Merkezi (Hub)', href: '/dashboard/settings/integration-hub', icon: 'Plug', section: 'Sistem', moduleKey: 'INTEGRATIONS', keywords: ['hub', 'kargo', 'efatura'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'security', label: 'Güvenlik & 2FA Doğrulama', href: '/dashboard/security', icon: 'Shield', section: 'Sistem', moduleKey: 'SECURITY', keywords: ['güvenlik', '2fa', 'şifre'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'notification-center', label: 'Bildirim Merkezi', href: '/dashboard/notification-center', icon: 'Bell', section: 'Sistem', moduleKey: 'DASHBOARD', keywords: ['bildirim', 'uyarı'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'settings', label: 'Genel Sistem Ayarları', href: '/dashboard/settings', icon: 'Settings', section: 'Sistem', moduleKey: 'SETTINGS', keywords: ['ayar', 'firma'], sidebar: true, mobile: true, commandPalette: true },
  { id: 'favorites', label: 'Hızlı Kısayollarım', href: '/dashboard/favorites', icon: 'Star', section: 'Kişisel', moduleKey: 'DASHBOARD', sidebar: true, commandPalette: true },
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
