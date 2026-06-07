export type DashboardWidgetId =
  | 'kpis'
  | 'revenue-chart'
  | 'platform-chart'
  | 'integration-status'
  | 'orders'
  | 'ai-hero'
  | 'profitability'
  | 'ai-insights'
  | 'stock-alerts'
  | 'ghost-stock'
  | 'activity'
  | 'goals'
  | 'marketplace-health'
  | 'order-pipeline'
  | 'sync-queue';

export type DashboardWidgetConfig = {
  id: DashboardWidgetId;
  visible: boolean;
  order: number;
};

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'kpis', visible: true, order: 0 },
  { id: 'revenue-chart', visible: true, order: 1 },
  { id: 'platform-chart', visible: true, order: 2 },
  { id: 'integration-status', visible: true, order: 3 },
  { id: 'orders', visible: true, order: 4 },
  { id: 'ai-hero', visible: true, order: 5 },
  { id: 'profitability', visible: true, order: 6 },
  { id: 'ai-insights', visible: true, order: 7 },
  { id: 'stock-alerts', visible: true, order: 8 },
  { id: 'ghost-stock', visible: true, order: 9 },
  { id: 'activity', visible: true, order: 10 },
  { id: 'goals', visible: true, order: 11 },
  { id: 'marketplace-health', visible: true, order: 12 },
  { id: 'order-pipeline', visible: true, order: 13 },
  { id: 'sync-queue', visible: true, order: 14 },
];

const STORAGE_KEY = 'pazaryonetimi-dashboard-widgets';

export function loadDashboardWidgets(): DashboardWidgetConfig[] {
  if (typeof window === 'undefined') return DEFAULT_DASHBOARD_WIDGETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DASHBOARD_WIDGETS;
    const parsed = JSON.parse(raw) as DashboardWidgetConfig[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_DASHBOARD_WIDGETS;
    const known = new Set(DEFAULT_DASHBOARD_WIDGETS.map((w) => w.id));
    const merged = DEFAULT_DASHBOARD_WIDGETS.map((def) => {
      const saved = parsed.find((p) => p.id === def.id);
      return saved ? { ...def, visible: saved.visible, order: saved.order } : def;
    });
    return merged.filter((w) => known.has(w.id)).sort((a, b) => a.order - b.order);
  } catch {
    return DEFAULT_DASHBOARD_WIDGETS;
  }
}

export function saveDashboardWidgets(widgets: DashboardWidgetConfig[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
}

export async function loadDashboardWidgetsFromApi(): Promise<DashboardWidgetConfig[] | null> {
  try {
    const res = await fetch('/api/dashboard/layout', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data.widgets) || data.widgets.length === 0) return null;
    const known = new Set(DEFAULT_DASHBOARD_WIDGETS.map((w) => w.id));
    return DEFAULT_DASHBOARD_WIDGETS.map((def) => {
      const saved = data.widgets.find((p: DashboardWidgetConfig) => p.id === def.id);
      return saved ? { ...def, visible: saved.visible, order: saved.order } : def;
    })
      .filter((w) => known.has(w.id))
      .sort((a, b) => a.order - b.order);
  } catch {
    return null;
  }
}

export async function saveDashboardWidgetsToApi(widgets: DashboardWidgetConfig[]): Promise<boolean> {
  saveDashboardWidgets(widgets);
  try {
    const res = await fetch('/api/dashboard/layout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ widgets }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function isWidgetVisible(widgets: DashboardWidgetConfig[], id: DashboardWidgetId): boolean {
  return widgets.find((w) => w.id === id)?.visible ?? true;
}

export type DashboardPeriod = '7d' | '30d' | '90d';

export const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  '7d': '7 Gün',
  '30d': '30 Gün',
  '90d': '90 Gün',
};

export const WIDGET_LABELS: Record<DashboardWidgetId, string> = {
  kpis: 'KPI Kartları',
  'revenue-chart': 'Gelir & Sipariş Grafiği',
  'platform-chart': 'Platform Dağılımı',
  'integration-status': 'Entegrasyon Durumu',
  orders: 'Son Siparişler',
  'ai-hero': 'AI Kontrol Merkezi',
  profitability: 'Kârlılık Analizi',
  'ai-insights': 'AI Önerileri',
  'stock-alerts': 'Stok Uyarıları',
  'ghost-stock': 'Hayalet Stok',
  activity: 'Son Aktiviteler',
  goals: 'Hedef Takibi',
  'marketplace-health': 'Pazaryeri Sağlığı',
  'order-pipeline': 'Sipariş Pipeline',
  'sync-queue': 'Senkron Kuyruğu',
};
