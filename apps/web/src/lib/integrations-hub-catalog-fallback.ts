import type { ProviderCatalogEntry } from './integrations-hub-api';

/** API offline olduğunda kullanılan statik katalog */
export const PROVIDER_CATALOG_FALLBACK: ProviderCatalogEntry[] = [
  {
    id: 'trendyol',
    name: 'Trendyol',
    category: 'MARKETPLACE',
    platform: 'TRENDYOL',
    country: 'TR',
    authType: 'TOKEN',
    requiredFields: [
      { key: 'supplierId', label: 'Satıcı ID', type: 'text', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'apiSecret', label: 'API Secret', type: 'password', required: true },
    ],
    features: { productSync: true, orderSync: true, inventorySync: true },
    status: 'ACTIVE',
  },
  {
    id: 'hepsiburada',
    name: 'Hepsiburada',
    category: 'MARKETPLACE',
    platform: 'HEPSIBURADA',
    country: 'TR',
    authType: 'API_KEY',
    requiredFields: [
      { key: 'merchantId', label: 'Merchant ID', type: 'text', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
    ],
    features: { productSync: true, orderSync: true, inventorySync: true },
    status: 'ACTIVE',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'ECOMMERCE',
    platform: 'SHOPIFY',
    country: 'GLOBAL',
    authType: 'OAUTH2',
    requiredFields: [
      { key: 'shopDomain', label: 'Mağaza Domain', type: 'text', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
    ],
    features: { productSync: true, orderSync: true, inventorySync: true },
    status: 'ACTIVE',
  },
  {
    id: 'yurtici-kargo',
    name: 'Yurtiçi Kargo',
    category: 'SHIPPING',
    country: 'TR',
    authType: 'API_KEY',
    requiredFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'customerCode', label: 'Müşteri Kodu', type: 'text', required: true },
    ],
    features: {
      productSync: false,
      orderSync: false,
      inventorySync: false,
      shipmentCreate: true,
    },
    status: 'ACTIVE',
  },
  {
    id: 'parasut',
    name: 'Paraşüt',
    category: 'ACCOUNTING',
    country: 'TR',
    authType: 'OAUTH2',
    requiredFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
    ],
    features: {
      productSync: false,
      orderSync: false,
      inventorySync: false,
      invoiceSync: true,
    },
    status: 'ACTIVE',
  },
];
