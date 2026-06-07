/** Entegrasyon hub API istemcisi — BFF route'ları üzerinden çalışır */

export type IntegrationCategory =
  | 'MARKETPLACE'
  | 'ECOMMERCE'
  | 'SHIPPING'
  | 'ACCOUNTING';

export interface ProviderCatalogEntry {
  id: string;
  name: string;
  category: IntegrationCategory;
  platform?: string;
  country: string;
  authType: string;
  requiredFields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'url';
    required: boolean;
  }>;
  features: {
    productSync: boolean;
    orderSync: boolean;
    inventorySync: boolean;
    invoiceSync?: boolean;
    shipmentCreate?: boolean;
  };
  status: 'ACTIVE' | 'BETA' | 'DEPRECATED';
}

export interface TenantConnection {
  id: string;
  tenantId: string;
  providerId: string;
  providerName: string;
  category: IntegrationCategory;
  platform: string;
  isActive: boolean;
  status: string;
  lastSyncAt: string;
  hasAdapter: boolean;
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data as { message?: string; error?: string }).message ||
      (data as { error?: string }).error ||
      'İstek başarısız';
    throw new Error(message);
  }
  return data as T;
}

/** Katalog listesini getirir */
export async function fetchIntegrationCatalog(
  category?: IntegrationCategory,
): Promise<ProviderCatalogEntry[]> {
  const qs = category ? `?category=${category}` : '';
  const res = await fetch(`/api/integrations-hub/catalog${qs}`);
  return parseJson(res);
}

/** Tenant bağlantılarını listeler */
export async function fetchTenantConnections(): Promise<TenantConnection[]> {
  const res = await fetch('/api/integrations-hub/connections');
  return parseJson(res);
}

/** Sağlayıcı bağlantısı kurar */
export async function connectProvider(
  providerId: string,
  credentials: Record<string, string>,
): Promise<{
  success: boolean;
  integrationId: string;
  message: string;
  initialSync: { queued: boolean; message: string };
}> {
  const res = await fetch('/api/integrations-hub/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerId, credentials }),
  });
  return parseJson(res);
}

/** Bağlantı testi */
export async function testProviderConnection(
  integrationId: string,
  providerId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/integrations-hub/${integrationId}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerId }),
  });
  return parseJson(res);
}

/** Manuel senkronizasyon tetikler */
export async function triggerProviderSync(
  integrationId: string,
  syncType = 'all',
): Promise<{ queued: boolean; message: string; jobId?: string | number }> {
  const res = await fetch(`/api/integrations-hub/${integrationId}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ syncType }),
  });
  return parseJson(res);
}
