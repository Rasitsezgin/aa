export type SkuGroup = {
  masterSku: string;
  masterStock: number;
  variantIds: string[];
  updatedAt: string;
};

const STORAGE_KEY = 'pazaryonetimi-sku-groups';

function loadFromStorage(tenantId: string): SkuGroup[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${tenantId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SkuGroup[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(tenantId: string, groups: SkuGroup[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_KEY}:${tenantId}`, JSON.stringify(groups));
}

export async function loadSkuGroups(tenantId: string): Promise<SkuGroup[]> {
  try {
    const res = await fetch('/api/inventory/sku-groups', { cache: 'no-store' });
    if (res.ok) {
      const data = (await res.json()) as SkuGroup[];
      if (Array.isArray(data)) {
        saveToStorage(tenantId, data);
        return data;
      }
    }
  } catch {
    // fallback to local cache
  }
  return loadFromStorage(tenantId);
}

export async function saveSkuGroups(tenantId: string, groups: SkuGroup[]): Promise<SkuGroup[]> {
  saveToStorage(tenantId, groups);
  try {
    const res = await fetch('/api/inventory/sku-groups', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ groups }),
    });
    if (res.ok) {
      const data = (await res.json()) as SkuGroup[];
      if (Array.isArray(data)) {
        saveToStorage(tenantId, data);
        return data;
      }
    }
  } catch {
    // keep local copy
  }
  return groups;
}
