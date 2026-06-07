const MARKETPLACE_PLATFORM_MAP: Record<string, string> = {
  trendyol: 'TRENDYOL',
  hepsiburada: 'HEPSIBURADA',
  n11: 'N11',
  ciceksepeti: 'CICEKSEPETI',
  gittigidiyor: 'GITTIGIDIYOR',
  pttavm: 'PTTAVM',
  morhipo: 'MORHIPO',
  'amazon-tr': 'AMAZON',
  'amazon-us': 'AMAZON_US',
  'amazon-uk': 'AMAZON_UK',
  'amazon-de': 'AMAZON_DE',
  'amazon-fr': 'AMAZON_FR',
  'ebay-us': 'EBAY',
  'ebay-uk': 'EBAY',
  'ebay-de': 'EBAY',
  etsy: 'ETSY',
  walmart: 'WALMART',
  'walmart-us': 'WALMART',
  shopify: 'SHOPIFY',
  woocommerce: 'WOOCOMMERCE',
  aliexpress: 'ALIEXPRESS',
  alibaba: 'ALIBABA',
  'shopee-sg': 'SHOPEE',
  'lazada-sg': 'LAZADA',
  'rakuten-jp': 'RAKUTEN',
  zalando: 'ZALANDO',
  allegro: 'ALLEGRO',
  'bol-com': 'BOL',
  cdiscount: 'CDISCOUNT',
  otto: 'OTTO',
  'mercadolibre-mx': 'MERCADOLIBRE',
  'mercadolibre-br': 'MERCADOLIBRE',
  wayfair: 'WAYFAIR',
  coupang: 'COUPANG',
};

export function resolvePlatformEnum(marketplaceId: string): string {
  const mapped = MARKETPLACE_PLATFORM_MAP[marketplaceId.toLowerCase()];
  if (mapped) return mapped;
  return marketplaceId.toUpperCase().replace(/-/g, '_');
}
