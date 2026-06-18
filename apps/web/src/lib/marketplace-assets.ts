// Marketplace Logo and Brand Configuration
// Paths match files in public/images/pazaryeri/

const P = '/images/pazaryeri';

export const MARKETPLACE_LOGOS: Record<string, string> = {
  // Turkey
  trendyol: `${P}/Trendyol.png`,
  hepsiburada: `${P}/Hepsiburada.png`,
  n11: `${P}/N11.png`,
  'amazon-tr': `${P}/Amazon.png`,
  ciceksepeti: `${P}/ciceksepeti.png`,
  pazarama: `${P}/Pazarama.png`,
  akinon: `${P}/akinon.webp`,
  ikas: `${P}/ikas.png`,
  ideasoft: `${P}/ideasoft-logo.webp`,
  ticimax: `${P}/ticimax.webp`,
  tsoft: `${P}/tsoft.webp`,
  faprika: `${P}/faprika.png`,
  platinmarket: `${P}/platinmarketlogo.png`,
  inveon: `${P}/inveon.webp`,

  // Amazon variants
  'amazon-us': `${P}/Amazon.png`,
  'amazon-uk': `${P}/Amazon.png`,
  'amazon-de': `${P}/Amazon.png`,
  'amazon-fr': `${P}/Amazon.png`,
  'amazon-it': `${P}/Amazon.png`,
  'amazon-es': `${P}/Amazon.png`,
  'amazon-jp': `${P}/Amazon.png`,
  'amazon-au': `${P}/Amazon.png`,
  'amazon-ca': `${P}/Amazon.png`,
  'amazon-mx': `${P}/Amazon.png`,
  'amazon-br': `${P}/Amazon.png`,
  'amazon-ae': `${P}/Amazon.png`,
  'amazon-sa': `${P}/Amazon.png`,
  'amazon-in': `${P}/Amazon.png`,
  'amazon-sg': `${P}/Amazon.png`,

  // eBay variants
  'ebay-us': `${P}/EBay.png`,
  'ebay-uk': `${P}/EBay.png`,
  'ebay-de': `${P}/EBay.png`,
  'ebay-au': `${P}/EBay.png`,
  'ebay-fr': `${P}/EBay.png`,
  'ebay-it': `${P}/EBay.png`,
  'ebay-es': `${P}/EBay.png`,
  'ebay-ca': `${P}/EBay.png`,

  // Global
  etsy: `${P}/Etsy.png`,
  shopify: `${P}/Shopify.png`,
  woocommerce: `${P}/WooCommerce.png`,
  magento: `${P}/magento.png`,
  bigcommerce: `${P}/bigcommerce.webp`,
  prestashop: `${P}/prestashop.webp`,
  opencart: `${P}/opencart.webp`,
  salesforce: `${P}/Salesforce.png`,
  vtex: `${P}/VTEX_logo.png`,
  sap: `${P}/sap-commerce-cloud.webp`,
  oracle: `${P}/oracle-commerce-cloud.webp`,
  facebook: `${P}/facebook-marketplace.png`,
  instagram: `${P}/Insta_Logo.webp`,
  pinterest: `${P}/pinterest.webp`,
  tiktok: `${P}/tiktok-shop.png`,
  walmart: `${P}/walmart.png`,
};

export const MARKETPLACE_BRAND_COLORS: Record<string, string> = {
  // Turkey
  trendyol: '#F27A1A',
  hepsiburada: '#FF6000',
  n11: '#7B28C4',
  'amazon-tr': '#FF9900',
  ciceksepeti: '#E91E63',
  gittigidiyor: '#0066FF',
  pttavm: '#FFD100',
  morhipo: '#E91E63',
  lcwaikiki: '#E4002B',
  defacto: '#1E3A5F',
  koton: '#000000',
  boyner: '#FF3366',
  teknosa: '#FF6B00',
  mediamarkt: '#DF0000',
  akakce: '#FF6B00',
  cimri: '#00B8D9',

  // Amazon variants
  'amazon-us': '#FF9900',
  'amazon-uk': '#FF9900',
  'amazon-de': '#FF9900',
  'amazon-fr': '#FF9900',
  'amazon-it': '#FF9900',
  'amazon-es': '#FF9900',
  'amazon-jp': '#FF9900',
  'amazon-au': '#FF9900',
  'amazon-ca': '#FF9900',
  'amazon-mx': '#FF9900',
  'amazon-br': '#FF9900',
  'amazon-ae': '#FF9900',
  'amazon-sa': '#FF9900',
  'amazon-in': '#FF9900',
  'amazon-sg': '#FF9900',

  // eBay variants
  'ebay-us': '#E53238',
  'ebay-uk': '#E53238',
  'ebay-de': '#E53238',
  'ebay-au': '#E53238',
  'ebay-fr': '#E53238',
  'ebay-it': '#E53238',
  'ebay-es': '#E53238',
  'ebay-ca': '#E53238',

  // Global
  etsy: '#F1641E',
  shopify: '#96BF48',
  woocommerce: '#7F54B3',
  magento: '#EE672F',
  bigcommerce: '#121118',
  prestashop: '#DF0067',
  opencart: '#23A6DB',

  // Europe
  zalando: '#FF6900',
  'bol-com': '#0000A4',
  allegro: '#FF5A00',
  cdiscount: '#E30613',
  otto: '#E30613',
  manomano: '#00B2A9',
  fnac: '#E4A813',
  emag: '#FC0',
  asos: '#2D2D2D',

  // Asia Pacific
  'shopee-sg': '#EE4D2D',
  'shopee-my': '#EE4D2D',
  'shopee-th': '#EE4D2D',
  'shopee-vn': '#EE4D2D',
  'shopee-ph': '#EE4D2D',
  'shopee-id': '#EE4D2D',
  'shopee-tw': '#EE4D2D',
  lazada: '#0F146D',
  tokopedia: '#42B549',
  bukalapak: '#E31E52',
  rakuten: '#BF0000',
  'yahoo-jp': '#FF0033',
  qoo10: '#FC2E20',
  flipkart: '#2874F0',
  snapdeal: '#E40046',

  // China
  aliexpress: '#E62E04',
  alibaba: '#FF6A00',
  '1688': '#FF5000',
  taobao: '#FF5000',
  tmall: '#E4393C',
  jd: '#E2231A',
  pinduoduo: '#E02E24',

  // Americas
  walmart: '#0071CE',
  target: '#CC0000',
  wish: '#2FB7EC',
  wayfair: '#7F187F',
  newegg: '#F7941E',
  overstock: '#CC0000',
  'mercadolibre-mx': '#FFE600',
  'mercadolibre-br': '#FFE600',
  'mercadolibre-ar': '#FFE600',
  'mercadolibre-co': '#FFE600',
  'mercadolibre-cl': '#FFE600',

  // Middle East
  noon: '#FEEE00',
  souq: '#F68B1E',
  namshi: '#000000',
};

// Generate initials for fallback avatars
export function getMarketplaceInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

// Get logo URL or generate fallback
export function getMarketplaceLogo(marketplaceId: string): string {
  return MARKETPLACE_LOGOS[marketplaceId] || `${P}/Bc-logo-dark.svg`;
}

/** Uppercase platform keys used in analiz / admin UI */
export const PLATFORM_KEY_TO_MARKETPLACE_ID: Record<string, string> = {
  TRENDYOL: 'trendyol',
  HEPSIBURADA: 'hepsiburada',
  AMAZON: 'amazon-tr',
  N11: 'n11',
  CICEKSEPETI: 'ciceksepeti',
  ETSY: 'etsy',
  EBAY: 'ebay-us',
  SHOPIFY: 'shopify',
  WOOCOMMERCE: 'woocommerce',
  WALMART: 'walmart',
  MAGENTO: 'magento',
  PRESTASHOP: 'prestashop',
  OPENCART: 'opencart',
  BIGCOMMERCE: 'bigcommerce',
  VTEX: 'vtex',
  IDEASOFT: 'ideasoft',
  IKAS: 'ikas',
  TICIMAX: 'ticimax',
  TSOFT: 'tsoft',
  FAPRIKA: 'faprika',
  PLATINMARKET: 'platinmarket',
  AKINON: 'akinon',
  INVEON: 'inveon',
  SAP: 'sap',
  ORACLE: 'oracle',
  SALESFORCE: 'salesforce',
  TIKTOK: 'tiktok',
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  PINTEREST: 'pinterest',
  PAZARAMA: 'pazarama',
};

export function getPlatformLogoByKey(platformKey: string): string {
  const id = PLATFORM_KEY_TO_MARKETPLACE_ID[platformKey];
  return getMarketplaceLogo(id ?? '');
}

// Get brand color or default
export function getMarketplaceBrandColor(marketplaceId: string): string {
  return MARKETPLACE_BRAND_COLORS[marketplaceId] || '#6366F1';
}

// Check if logo exists (for SSR/CSR considerations)
export async function checkLogoExists(url: string): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
