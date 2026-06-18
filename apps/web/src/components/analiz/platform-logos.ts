import { getMarketplaceLogo, getPlatformLogoByKey } from '@/lib/marketplace-assets';

const logo = (id: string) => getMarketplaceLogo(id);

export const PLATFORM_LOGOS: Record<string, { logo: string; name: string; color: string }> = {
  TRENDYOL: { logo: logo('trendyol'), name: 'Trendyol', color: 'from-orange-500 to-red-500' },
  HEPSIBURADA: { logo: logo('hepsiburada'), name: 'Hepsiburada', color: 'from-orange-400 to-yellow-500' },
  AMAZON: { logo: logo('amazon-tr'), name: 'Amazon', color: 'from-yellow-500 to-orange-500' },
  N11: { logo: logo('n11'), name: 'N11', color: 'from-purple-500 to-pink-500' },
  CICEKSEPETI: { logo: logo('ciceksepeti'), name: 'Çiçeksepeti', color: 'from-pink-500 to-red-500' },
  ETSY: { logo: logo('etsy'), name: 'Etsy', color: 'from-orange-600 to-red-600' },
  EBAY: { logo: logo('ebay-us'), name: 'eBay', color: 'from-orange-500 to-yellow-500' },
  SHOPIFY: { logo: logo('shopify'), name: 'Shopify', color: 'from-green-500 to-emerald-500' },
  WOOCOMMERCE: { logo: logo('woocommerce'), name: 'WooCommerce', color: 'from-purple-600 to-violet-600' },
  TIKTOK: { logo: logo('tiktok'), name: 'TikTok Shop', color: 'from-slate-900 to-pink-500' },
  FACEBOOK: { logo: logo('facebook'), name: 'Facebook Marketplace', color: 'from-orange-600 to-amber-500' },
  INSTAGRAM: { logo: logo('instagram'), name: 'Instagram Shop', color: 'from-purple-500 via-pink-500 to-orange-500' },
  PINTEREST: { logo: logo('pinterest'), name: 'Pinterest', color: 'from-red-600 to-red-500' },
  WALMART: { logo: logo('walmart'), name: 'Walmart', color: 'from-orange-500 to-yellow-400' },
  SALESFORCE: { logo: logo('salesforce'), name: 'Salesforce Commerce', color: 'from-blue-400 to-cyan-500' },
  MAGENTO: { logo: logo('magento'), name: 'Magento', color: 'from-orange-500 to-red-500' },
  PRESTASHOP: { logo: logo('prestashop'), name: 'PrestaShop', color: 'from-pink-500 to-purple-500' },
  OPENCART: { logo: logo('opencart'), name: 'OpenCart', color: 'from-orange-500 to-cyan-400' },
  BIGCOMMERCE: { logo: logo('bigcommerce'), name: 'BigCommerce', color: 'from-slate-700 to-slate-900' },
  VTEX: { logo: logo('vtex'), name: 'VTEX', color: 'from-pink-500 to-red-500' },
  IDEASOFT: { logo: logo('ideasoft'), name: 'IdeaSoft', color: 'from-orange-500 to-amber-600' },
  IKAS: { logo: logo('ikas'), name: 'ikas', color: 'from-purple-600 to-pink-500' },
  TICIMAX: { logo: logo('ticimax'), name: 'Ticimax', color: 'from-orange-600 to-purple-600' },
  TSOFT: { logo: logo('tsoft'), name: 'T-Soft', color: 'from-red-500 to-orange-500' },
  FAPRIKA: { logo: logo('faprika'), name: 'Faprika', color: 'from-orange-500 to-amber-500' },
  PLATINMARKET: { logo: logo('platinmarket'), name: 'PlatinMarket', color: 'from-yellow-500 to-amber-600' },
  AKINON: { logo: logo('akinon'), name: 'Akinon', color: 'from-amber-500 to-purple-600' },
  INVEON: { logo: logo('inveon'), name: 'Inveon', color: 'from-orange-500 to-amber-500' },
  SAP: { logo: logo('sap'), name: 'SAP Commerce Cloud', color: 'from-orange-600 to-cyan-500' },
  ORACLE: { logo: logo('oracle'), name: 'Oracle Commerce', color: 'from-red-500 to-red-600' },
  PAZARAMA: { logo: logo('pazarama'), name: 'Pazarama', color: 'from-blue-500 to-cyan-500' },
};

export { getPlatformLogoByKey };
