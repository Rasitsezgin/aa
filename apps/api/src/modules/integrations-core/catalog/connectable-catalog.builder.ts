import { IntegrationCategory } from '../enums/integration-category.enum';
import type { ProviderCatalogEntry } from './provider-catalog';
import { OMNICHANNEL_CATALOG } from './omnichannel-catalog';

type AuthType = ProviderCatalogEntry['authType'];

const CATEGORY_AUTH: Partial<Record<IntegrationCategory, AuthType>> = {
  [IntegrationCategory.MARKETPLACE]: 'API_KEY',
  [IntegrationCategory.ECOMMERCE]: 'API_KEY',
  [IntegrationCategory.CARGO]: 'API_KEY',
  [IntegrationCategory.INVOICE]: 'BASIC',
  [IntegrationCategory.SOCIAL_FEED]: 'OAUTH2',
  [IntegrationCategory.GLOBAL_MARKETPLACE]: 'OAUTH2',
  [IntegrationCategory.ERP]: 'BASIC',
  [IntegrationCategory.FULFILLMENT]: 'OAUTH2',
};

function defaultRequiredFields(
  category: IntegrationCategory,
): ProviderCatalogEntry['requiredFields'] {
  switch (category) {
    case IntegrationCategory.CARGO:
      return [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'customerCode', label: 'Müşteri Kodu', type: 'text', required: false },
      ];
    case IntegrationCategory.INVOICE:
    case IntegrationCategory.ERP:
      return [
        { key: 'username', label: 'Kullanıcı Adı', type: 'text', required: true },
        { key: 'password', label: 'Şifre', type: 'password', required: true },
      ];
    case IntegrationCategory.ECOMMERCE:
      return [
        { key: 'siteUrl', label: 'Site URL', type: 'url', required: true },
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'apiSecret', label: 'API Secret', type: 'password', required: false },
      ];
    case IntegrationCategory.SOCIAL_FEED:
      return [
        { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
        { key: 'merchantId', label: 'Merchant / Page ID', type: 'text', required: false },
      ];
    case IntegrationCategory.FULFILLMENT:
      return [
        { key: 'sellerId', label: 'Seller / Depo ID', type: 'text', required: true },
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      ];
    default:
      return [
        { key: 'apiKey', label: 'API Key', type: 'password', required: true },
        { key: 'apiSecret', label: 'API Secret', type: 'password', required: true },
      ];
  }
}

function defaultFeatures(
  category: IntegrationCategory,
): ProviderCatalogEntry['features'] {
  switch (category) {
    case IntegrationCategory.CARGO:
      return {
        productSync: false,
        orderSync: false,
        inventorySync: false,
        shipmentCreate: true,
      };
    case IntegrationCategory.INVOICE:
      return {
        productSync: false,
        orderSync: false,
        inventorySync: false,
        invoiceSync: true,
      };
    case IntegrationCategory.ERP:
      return {
        productSync: false,
        orderSync: false,
        inventorySync: true,
        invoiceSync: true,
      };
    case IntegrationCategory.SOCIAL_FEED:
      return { productSync: true, orderSync: false, inventorySync: false };
    case IntegrationCategory.FULFILLMENT:
      return { productSync: false, orderSync: false, inventorySync: true };
    default:
      return { productSync: true, orderSync: true, inventorySync: true };
  }
}

/** Omnichannel katalogdan eksik bağlantı kayıtlarını üretir */
export function buildGeneratedCatalogEntries(
  existingIds: Set<string>,
): ProviderCatalogEntry[] {
  return OMNICHANNEL_CATALOG.filter((meta) => !existingIds.has(meta.id)).map(
    (meta) => ({
      id: meta.id,
      name: meta.name,
      category: meta.category,
      country: meta.country,
      authType: CATEGORY_AUTH[meta.category] ?? 'API_KEY',
      requiredFields: defaultRequiredFields(meta.category),
      features: defaultFeatures(meta.category),
      status: meta.status === 'PLANNED' ? 'BETA' : meta.status,
    }),
  );
}
