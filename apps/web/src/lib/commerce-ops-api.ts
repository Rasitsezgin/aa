/** Commerce Ops BFF istemcisi */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/commerce-ops/${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

export type BundleRow = {
  id: string;
  name: string;
  sku: string;
  finalPrice: string | number | null;
  status: string;
  items: Array<{ product: { title: string; sku: string; stock: number }; quantity: number }>;
};

export type StockAlertRule = {
  id: string;
  criticalLevel: number;
  reorderLevel: number;
  autoPauseListing: boolean;
  product?: { title: string; sku: string; stock: number };
};

export type BuyBoxRule = {
  id: string;
  platform: string;
  minMarginPct: string | number;
  maxDropPct: string | number;
  product?: { title: string; sku: string };
};

export type ProfitRadar = {
  periodDays?: number;
  summary: {
    orderCount: number;
    revenue: number;
    commission: number;
    shipping: number;
    netProfit: number;
    marginPct: number;
  };
  byPlatform: Record<string, { orders: number; revenue: number; profit: number }>;
};

export function fetchBundles() {
  return request<BundleRow[]>('bundles');
}

export function createBundle(data: {
  name: string;
  sku: string;
  items: Array<{ productId: string; quantity: number }>;
  pricingValue?: number;
}) {
  return request<BundleRow>('bundles', { method: 'POST', body: JSON.stringify(data) });
}

export function importFromLink(url: string, sku?: string) {
  return request<{ success: boolean; product: { id: string; title: string; sku: string } }>(
    'link-import',
    { method: 'POST', body: JSON.stringify({ url, sku }) },
  );
}

export function fetchStockAlerts() {
  return request<StockAlertRule[]>('stock-alerts');
}

export function scanStockAlerts() {
  return request<{ total: number; alerts: Array<{ title: string; stock: number; action: string }> }>(
    'stock-alerts/scan',
    { method: 'POST' },
  );
}

export function fetchBuyBoxRules() {
  return request<BuyBoxRule[]>('buybox/rules');
}

export function runBuyBoxRobot() {
  return request<{ processed: number; results: Array<{ productId: string; applied: boolean; hasBuyBox: boolean }> }>(
    'buybox/run',
    { method: 'POST' },
  );
}

export function fetchBuyBoxSnapshots() {
  return request<Array<{ platform: string; ourPrice: string; competitorPrice: string | null; hasBuyBox: boolean; product: { title: string } }>>(
    'buybox/snapshots',
  );
}

export function autoApproveOrders() {
  return request<{ approved: number }>('automation/approve-orders', { method: 'POST' });
}

export function bulkCreateInvoices(orderIds: string[]) {
  return request<{ success: number; total: number }>('automation/bulk-invoices', {
    method: 'POST',
    body: JSON.stringify({ orderIds }),
  });
}

export function fetchProfitRadar(days = 30) {
  return request<ProfitRadar>(`finance/radar?days=${days}`);
}
