/** Entegrasyon hub API istemcisi — BFF route'ları üzerinden çalışır */

export type IntegrationCategory =
  | 'MARKETPLACE'
  | 'ECOMMERCE'
  | 'CARGO'
  | 'INVOICE'
  | 'SOCIAL_FEED'
  | 'GLOBAL_MARKETPLACE'
  | 'ERP'
  | 'FULFILLMENT'
  | 'SHIPPING'
  | 'ACCOUNTING';

export interface ProviderCatalogEntry {
  id: string;
  name: string;
  category: IntegrationCategory;
  platform?: string;
  country: string;
  authType?: string;
  requiredFields?: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'url';
    required: boolean;
  }>;
  features?: {
    productSync: boolean;
    orderSync: boolean;
    inventorySync: boolean;
    invoiceSync?: boolean;
    shipmentCreate?: boolean;
  };
  status: 'ACTIVE' | 'BETA' | 'PLANNED' | 'DEPRECATED';
  hasAdapter: boolean;
  connectable: boolean;
  rateLimitPerMinute?: number;
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
  connectionType?: 'integration' | 'service-credential';
}

export interface QueueStatus {
  tenantId: string;
  providerId: string;
  circuitState: string;
  remainingQuota: number;
  registeredAdapters: string[];
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

/** Birleşik omnichannel katalog */
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

/** Kuyruk durumu — circuit breaker + rate limit */
export async function fetchQueueStatus(
  providerId: string,
): Promise<QueueStatus> {
  const res = await fetch(
    `/api/integrations-hub/queue-status?providerId=${encodeURIComponent(providerId)}`,
  );
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
  options?: { sku?: string; quantity?: number; price?: number },
): Promise<{ queued: boolean; message: string; jobId?: string | number }> {
  const res = await fetch(`/api/integrations-hub/${integrationId}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ syncType, ...options }),
  });
  return parseJson(res);
}
