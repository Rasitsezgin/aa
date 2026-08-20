import { Platform } from '@pazaryonetimi/database';
import { IntegrationCategory } from '../enums/integration-category.enum';

/** providerId → Prisma Platform (mevcut marketplace bridge'leri için) */
export const PROVIDER_PLATFORM_MAP: Record<string, Platform> = {
  trendyol: 'TRENDYOL',
  hepsiburada: 'HEPSIBURADA',
  n11: 'N11',
  'amazon-tr': 'AMAZON',
  ciceksepeti: 'CICEKSEPETI',
  epttavm: 'PTTAVM',
  pttavm: 'PTTAVM',
  shopify: 'SHOPIFY',
  woocommerce: 'WOOCOMMERCE',
  'amazon-global': 'AMAZON_US',
  zalando: 'ZALANDO',
  etsy: 'ETSY',
  ozon: 'OTHER',
  ebay: 'EBAY',
  walmart: 'WALMART',
  aliexpress: 'ALIEXPRESS',
  alibaba: 'ALIBABA',
  shopee: 'SHOPEE',
  lazada: 'LAZADA',
  rakuten: 'RAKUTEN',
  wayfair: 'WAYFAIR',
  mercadolibre: 'MERCADOLIBRE',
  coupang: 'COUPANG',
  otto: 'OTTO',
  allegro: 'ALLEGRO',
  cdiscount: 'CDISCOUNT',
  'bol-com': 'BOL',
  hepsiglobal: 'HEPSIBURADA',
};

/** Kargo providerId → bridge tipi */
export type CargoBridgeKind = 'yurtici' | 'aras' | 'mng' | 'ptt';

export const PROVIDER_CARGO_BRIDGE_MAP: Record<string, CargoBridgeKind> = {
  'yurtici-kargo': 'yurtici',
  'aras-kargo': 'aras',
  'mng-kargo': 'mng',
  'ptt-kargo': 'ptt',
};

/** E-fatura providerId → integrator anahtarı */
export const PROVIDER_INVOICE_INTEGRATOR_MAP: Record<string, string> = {
  uyumsoft: 'uyumsoft',
  parasut: 'parasut',
  'edm-bilisim': 'edm',
  'e-logo': 'logo',
  'qnb-efinans': 'efinans',
  'innova-payflex': 'innova',
  sovos: 'sovos',
  'turkcell-efatura': 'turkcell',
  'hb-efaturam': 'hb-efatura',
  'n11faturam': 'n11fatura',
  'digital-planet': 'digital-planet',
};

/** Özel (manuel) adapter — factory tarafından üretilmez */
export const DEDICATED_ADAPTER_IDS = new Set([
  'trendyol',
  'hepsiburada',
  'n11',
  'amazon-tr',
  'ciceksepeti',
  'epttavm',
  'pttavm',
  'etsy',
  'aliexpress',
  'ebay',
  'shopify',
  'ikas',
  'yurtici-kargo',
  'aras-kargo',
  'parasut',
  'uyumsoft',
  'logo',
  'google-merchant',
  'amazon-fba',
]);

export function resolvePlatformForProvider(providerId: string): Platform | null {
  return PROVIDER_PLATFORM_MAP[providerId] ?? null;
}

export function isCatalogCategory(
  category: IntegrationCategory,
): 'marketplace' | 'ecommerce' | 'global' | 'cargo' | 'invoice' | 'erp' | 'social' | 'fulfillment' {
  switch (category) {
    case IntegrationCategory.MARKETPLACE:
      return 'marketplace';
    case IntegrationCategory.ECOMMERCE:
      return 'ecommerce';
    case IntegrationCategory.GLOBAL_MARKETPLACE:
      return 'global';
    case IntegrationCategory.CARGO:
      return 'cargo';
    case IntegrationCategory.INVOICE:
      return 'invoice';
    case IntegrationCategory.ERP:
      return 'erp';
    case IntegrationCategory.SOCIAL_FEED:
      return 'social';
    case IntegrationCategory.FULFILLMENT:
      return 'fulfillment';
    default:
      return 'marketplace';
  }
}
