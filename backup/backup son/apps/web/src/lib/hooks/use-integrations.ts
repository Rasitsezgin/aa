// Integrations API Hooks
import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types
export interface MarketplaceField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'textarea' | 'url';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
}

export interface MarketplaceFeatures {
  productSync: boolean;
  orderSync: boolean;
  inventorySync: boolean;
  priceSync: boolean;
  shippingIntegration: boolean;
  returnManagement: boolean;
  analyticsApi: boolean;
  advertisingApi: boolean;
  fulfillmentService: boolean;
  multiWarehouse: boolean;
}

export interface MarketplaceConfig {
  id: string;
  name: string;
  slug: string;
  logo: string;
  region: string;
  country: string;
  countryCode: string;
  category: string;
  description: string;
  website: string;
  apiType: string;
  authType: string;
  sandboxAvailable: boolean;
  features: MarketplaceFeatures;
  requiredFields: MarketplaceField[];
  minimumPlan: string;
  status: string;
  popularity: number;
  commissionRange?: string;
  brandColor: string;
  monthlyVisitors?: string;
  sellerCount?: string;
  userIntegration?: {
    id: string;
    isActive: boolean;
    status: string;
    lastSync?: string;
  };
}

export interface IntegrationCredentials {
  [key: string]: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: any;
}

export interface IntegrationStats {
  totalIntegrations: number;
  activeIntegrations: number;
  totalSyncedProducts: number;
  totalSyncedOrders: number;
  lastSyncTime?: string;
  byRegion: Record<string, number>;
  byStatus: Record<string, number>;
}

// API Functions
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// Hook: Get all marketplaces
export function useMarketplaces() {
  const [marketplaces, setMarketplaces] = useState<MarketplaceConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketplaces = useCallback(async (filters?: {
    region?: string;
    category?: string;
    search?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (filters?.region) queryParams.append('region', filters.region);
      if (filters?.category) queryParams.append('category', filters.category);
      if (filters?.search) queryParams.append('search', filters.search);

      const data = await fetchWithAuth(`/integrations/marketplaces?${queryParams}`);
      setMarketplaces(data.marketplaces || data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch marketplaces';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { marketplaces, loading, error, fetchMarketplaces };
}

// Hook: Get marketplaces by region
export function useMarketplacesByRegion() {
  const [marketplaces, setMarketplaces] = useState<MarketplaceConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByRegion = useCallback(async (region: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithAuth(`/integrations/by-region/${region}`);
      setMarketplaces(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch marketplaces by region';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { marketplaces, loading, error, fetchByRegion };
}

// Hook: Get marketplaces by plan
export function useMarketplacesByPlan() {
  const [marketplaces, setMarketplaces] = useState<MarketplaceConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByPlan = useCallback(async (plan: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithAuth(`/integrations/by-plan/${plan}`);
      setMarketplaces(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch marketplaces by plan';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { marketplaces, loading, error, fetchByPlan };
}

// Hook: Connect to marketplace
export function useConnectMarketplace() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (
    marketplaceId: string,
    credentials: IntegrationCredentials,
    options?: { sandbox?: boolean }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithAuth('/integrations/connect', {
        method: 'POST',
        body: JSON.stringify({
          marketplaceId,
          credentials,
          sandbox: options?.sandbox || false,
        }),
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { connect, loading, error };
}

// Hook: Test connection
export function useTestConnection() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConnectionTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = useCallback(async (integrationId: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchWithAuth(`/integrations/test/${integrationId}`, {
        method: 'POST',
      });
      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection test failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { testConnection, result, loading, error };
}

// Hook: Disconnect marketplace
export function useDisconnectMarketplace() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disconnect = useCallback(async (integrationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithAuth(`/integrations/disconnect/${integrationId}`, {
        method: 'PUT',
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { disconnect, loading, error };
}

// Hook: Sync marketplace
export function useSyncMarketplace() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const sync = useCallback(async (
    integrationId: string,
    syncOptions?: {
      products?: boolean;
      orders?: boolean;
      inventory?: boolean;
      prices?: boolean;
    }
  ) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const data = await fetchWithAuth(`/integrations/sync/${integrationId}`, {
        method: 'POST',
        body: JSON.stringify(syncOptions || { products: true, orders: true, inventory: true }),
      });
      setProgress(100);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { sync, loading, error, progress };
}

// Hook: Delete integration
export function useDeleteIntegration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteIntegration = useCallback(async (integrationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithAuth(`/integrations/${integrationId}`, {
        method: 'DELETE',
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete integration';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteIntegration, loading, error };
}

// Hook: Get integration stats
export function useIntegrationStats() {
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithAuth('/integrations/stats');
      setStats(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, error, fetchStats };
}

// Utility: Check if user can access marketplace based on plan
export function canAccessMarketplace(userPlan: string, minimumPlan: string): boolean {
  const planHierarchy = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM'];
  const userPlanIndex = planHierarchy.indexOf(userPlan);
  const requiredPlanIndex = planHierarchy.indexOf(minimumPlan);
  return userPlanIndex >= requiredPlanIndex;
}

// Region names for display
export const REGION_NAMES: Record<string, string> = {
  TURKEY: 'Türkiye',
  NORTH_AMERICA: 'Kuzey Amerika',
  EUROPE: 'Avrupa',
  ASIA_PACIFIC: 'Asya Pasifik',
  LATIN_AMERICA: 'Latin Amerika',
  MIDDLE_EAST: 'Orta Doğu',
  GLOBAL: 'Global',
};

// Category names for display
export const CATEGORY_NAMES: Record<string, string> = {
  GENERAL: 'Genel Pazaryeri',
  FASHION: 'Moda & Giyim',
  ELECTRONICS: 'Elektronik',
  HOME_GARDEN: 'Ev & Yaşam',
  HANDMADE: 'El Yapımı',
  B2B: 'B2B / Kurumsal',
  WHOLESALE: 'Toptan Satış',
  ECOMMERCE: 'E-ticaret Platformu',
};

// Plan names for display
export const PLAN_NAMES: Record<string, string> = {
  FREE: 'Ücretsiz',
  STARTER: 'Başlangıç',
  PROFESSIONAL: 'Profesyonel',
  ENTERPRISE: 'Kurumsal',
  CUSTOM: 'Özel',
};

// Country flags
export const COUNTRY_FLAGS: Record<string, string> = {
  TR: '🇹🇷',
  US: '🇺🇸',
  GB: '🇬🇧',
  DE: '🇩🇪',
  FR: '🇫🇷',
  IT: '🇮🇹',
  ES: '🇪🇸',
  NL: '🇳🇱',
  PL: '🇵🇱',
  SE: '🇸🇪',
  JP: '🇯🇵',
  AU: '🇦🇺',
  CA: '🇨🇦',
  MX: '🇲🇽',
  BR: '🇧🇷',
  AE: '🇦🇪',
  SA: '🇸🇦',
  IN: '🇮🇳',
  SG: '🇸🇬',
  MY: '🇲🇾',
  TH: '🇹🇭',
  VN: '🇻🇳',
  PH: '🇵🇭',
  ID: '🇮🇩',
  AR: '🇦🇷',
  CO: '🇨🇴',
  CL: '🇨🇱',
  CN: '🇨🇳',
};
