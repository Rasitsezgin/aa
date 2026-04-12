// Common types for integrations
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

export interface IntegrationStatus {
  id: string;
  isActive: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'syncing' | 'pending';
  lastSync?: string;
  productCount?: number;
  orderCount?: number;
  errorMessage?: string;
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
  userIntegration?: IntegrationStatus;
}

export interface IntegrationStatusData {
  id: string;
  name: string;
  logo: string;
  brandColor: string;
  status: 'healthy' | 'warning' | 'error' | 'syncing' | 'offline';
  lastSync: string;
  nextSync: string;
  metrics: {
    productsTotal: number;
    productsSynced: number;
    ordersToday: number;
    ordersYesterday: number;
    revenueToday: number;
    revenueYesterday: number;
    errorCount: number;
    warningCount: number;
  };
  recentActivity: {
    type: 'order' | 'product' | 'inventory' | 'error' | 'sync';
    message: string;
    time: string;
  }[];
  syncProgress?: number;
}

// Constants
export const REGION_NAMES: Record<string, string> = {
  TURKEY: 'Türkiye',
  NORTH_AMERICA: 'Kuzey Amerika',
  EUROPE: 'Avrupa',
  ASIA_PACIFIC: 'Asya Pasifik',
  LATIN_AMERICA: 'Latin Amerika',
  MIDDLE_EAST: 'Orta Doğu',
  GLOBAL: 'Global',
};

export const CATEGORY_NAMES: Record<string, string> = {
  GENERAL: 'Genel Pazaryeri',
  FASHION: 'Moda & Giyim',
  ELECTRONICS: 'Elektronik',
  HOME_GARDEN: 'Ev & Yaşam',
  HANDMADE: 'El Yapımı',
  B2B: 'B2B / Kurumsal',
  WHOLESALE: 'Toptan Satış',
  ECOMMERCE: 'E-ticaret Platformu',
  SOCIAL: 'Sosyal Ticaret',
  SPECIALTY: 'Özel Niş',
};

export const PLAN_NAMES: Record<string, string> = {
  FREE: 'Ücretsiz',
  STARTER: 'Başlangıç',
  PROFESSIONAL: 'Profesyonel',
  ENTERPRISE: 'Kurumsal',
  CUSTOM: 'Özel',
};

export const PLAN_HIERARCHY = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM'];

export const COUNTRY_FLAGS: Record<string, string> = {
  TR: '🇹🇷', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', IT: '🇮🇹', ES: '🇪🇸',
  NL: '🇳🇱', PL: '🇵🇱', SE: '🇸🇪', JP: '🇯🇵', AU: '🇦🇺', CA: '🇨🇦', MX: '🇲🇽',
  BR: '🇧🇷', AE: '🇦🇪', SA: '🇸🇦', IN: '🇮🇳', SG: '🇸🇬', MY: '🇲🇾', TH: '🇹🇭',
  VN: '🇻🇳', PH: '🇵🇭', ID: '🇮🇩', CN: '🇨🇳', KR: '🇰🇷', HK: '🇭🇰',
};
