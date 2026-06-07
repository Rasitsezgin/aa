import { IntegrationCategory } from '../enums/integration-category.enum';

export interface ProviderCatalogEntry {
  id: string;
  name: string;
  category: IntegrationCategory;
  platform?: string;
  country: string;
  authType: 'API_KEY' | 'OAUTH2' | 'TOKEN' | 'BASIC';
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

/** 4 kategori için merkezi sağlayıcı kataloğu */
export const PROVIDER_CATALOG: ProviderCatalogEntry[] = [
  // — Pazaryerleri —
  {
    id: 'trendyol',
    name: 'Trendyol',
    category: IntegrationCategory.MARKETPLACE,
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
    category: IntegrationCategory.MARKETPLACE,
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
    id: 'amazon-tr',
    name: 'Amazon TR',
    category: IntegrationCategory.MARKETPLACE,
    platform: 'AMAZON',
    country: 'TR',
    authType: 'OAUTH2',
    requiredFields: [
      { key: 'sellerId', label: 'Seller ID', type: 'text', required: true },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
    ],
    features: { productSync: true, orderSync: true, inventorySync: true },
    status: 'ACTIVE',
  },
  {
    id: 'n11',
    name: 'N11',
    category: IntegrationCategory.MARKETPLACE,
    platform: 'N11',
    country: 'TR',
    authType: 'API_KEY',
    requiredFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'apiSecret', label: 'API Secret', type: 'password', required: true },
    ],
    features: { productSync: true, orderSync: true, inventorySync: true },
    status: 'ACTIVE',
  },
  {
    id: 'ciceksepeti',
    name: 'Çiçeksepeti',
    category: IntegrationCategory.MARKETPLACE,
    platform: 'CICEKSEPETI',
    country: 'TR',
    authType: 'TOKEN',
    requiredFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
    ],
    features: { productSync: true, orderSync: true, inventorySync: true },
    status: 'ACTIVE',
  },
  {
    id: 'pttavm',
    name: 'PTT AVM',
    category: IntegrationCategory.MARKETPLACE,
    platform: 'PTTAVM',
    country: 'TR',
    authType: 'TOKEN',
    requiredFields: [
      { key: 'shopId', label: 'Mağaza ID', type: 'text', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
    ],
    features: { productSync: true, orderSync: true, inventorySync: false },
    status: 'ACTIVE',
  },
  // — E-Ticaret —
  {
    id: 'shopify',
    name: 'Shopify',
    category: IntegrationCategory.ECOMMERCE,
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
    id: 'woocommerce',
    name: 'WooCommerce',
    category: IntegrationCategory.ECOMMERCE,
    platform: 'WOOCOMMERCE',
    country: 'GLOBAL',
    authType: 'BASIC',
    requiredFields: [
      { key: 'siteUrl', label: 'Site URL', type: 'url', required: true },
      { key: 'consumerKey', label: 'Consumer Key', type: 'password', required: true },
      { key: 'consumerSecret', label: 'Consumer Secret', type: 'password', required: true },
    ],
    features: { productSync: true, orderSync: true, inventorySync: true },
    status: 'ACTIVE',
  },
  {
    id: 'ticimax',
    name: 'Ticimax',
    category: IntegrationCategory.ECOMMERCE,
    country: 'TR',
    authType: 'API_KEY',
    requiredFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'siteUrl', label: 'Site URL', type: 'url', required: true },
    ],
    features: { productSync: true, orderSync: true, inventorySync: true },
    status: 'BETA',
  },
  {
    id: 'ideasoft',
    name: 'Ideasoft',
    category: IntegrationCategory.ECOMMERCE,
    country: 'TR',
    authType: 'API_KEY',
    requiredFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'siteUrl', label: 'Site URL', type: 'url', required: true },
    ],
    features: { productSync: true, orderSync: true, inventorySync: true },
    status: 'BETA',
  },
  // — Kargo —
  {
    id: 'yurtici-kargo',
    name: 'Yurtiçi Kargo',
    category: IntegrationCategory.SHIPPING,
    country: 'TR',
    authType: 'API_KEY',
    requiredFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'customerCode', label: 'Müşteri Kodu', type: 'text', required: true },
    ],
    features: { productSync: false, orderSync: false, inventorySync: false, shipmentCreate: true },
    status: 'ACTIVE',
  },
  {
    id: 'aras-kargo',
    name: 'Aras Kargo',
    category: IntegrationCategory.SHIPPING,
    country: 'TR',
    authType: 'API_KEY',
    requiredFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'customerCode', label: 'Müşteri Kodu', type: 'text', required: true },
    ],
    features: { productSync: false, orderSync: false, inventorySync: false, shipmentCreate: true },
    status: 'ACTIVE',
  },
  {
    id: 'mng-kargo',
    name: 'MNG Kargo',
    category: IntegrationCategory.SHIPPING,
    country: 'TR',
    authType: 'API_KEY',
    requiredFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'customerCode', label: 'Müşteri Kodu', type: 'text', required: true },
    ],
    features: { productSync: false, orderSync: false, inventorySync: false, shipmentCreate: true },
    status: 'ACTIVE',
  },
  {
    id: 'sendeo',
    name: 'Sendeo',
    category: IntegrationCategory.SHIPPING,
    country: 'TR',
    authType: 'API_KEY',
    requiredFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
    ],
    features: { productSync: false, orderSync: false, inventorySync: false, shipmentCreate: true },
    status: 'BETA',
  },
  // — E-Fatura / Muhasebe —
  {
    id: 'parasut',
    name: 'Paraşüt',
    category: IntegrationCategory.ACCOUNTING,
    country: 'TR',
    authType: 'OAUTH2',
    requiredFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
    ],
    features: { productSync: false, orderSync: false, inventorySync: false, invoiceSync: true },
    status: 'ACTIVE',
  },
  {
    id: 'uyumsoft',
    name: 'Uyumsoft',
    category: IntegrationCategory.ACCOUNTING,
    country: 'TR',
    authType: 'BASIC',
    requiredFields: [
      { key: 'username', label: 'Kullanıcı Adı', type: 'text', required: true },
      { key: 'password', label: 'Şifre', type: 'password', required: true },
    ],
    features: { productSync: false, orderSync: false, inventorySync: false, invoiceSync: true },
    status: 'ACTIVE',
  },
  {
    id: 'qnb-efinans',
    name: 'QNB eFinans',
    category: IntegrationCategory.ACCOUNTING,
    country: 'TR',
    authType: 'BASIC',
    requiredFields: [
      { key: 'username', label: 'Kullanıcı Adı', type: 'text', required: true },
      { key: 'password', label: 'Şifre', type: 'password', required: true },
    ],
    features: { productSync: false, orderSync: false, inventorySync: false, invoiceSync: true },
    status: 'ACTIVE',
  },
  {
    id: 'bizimhesap',
    name: 'BizimHesap',
    category: IntegrationCategory.ACCOUNTING,
    country: 'TR',
    authType: 'API_KEY',
    requiredFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
    ],
    features: { productSync: false, orderSync: false, inventorySync: false, invoiceSync: true },
    status: 'BETA',
  },
];

export function getProvidersByCategory(
  category: IntegrationCategory,
): ProviderCatalogEntry[] {
  return PROVIDER_CATALOG.filter((p) => p.category === category);
}

export function getProviderById(id: string): ProviderCatalogEntry | undefined {
  return PROVIDER_CATALOG.find((p) => p.id === id);
}
