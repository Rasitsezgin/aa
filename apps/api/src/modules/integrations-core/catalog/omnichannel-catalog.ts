import { IntegrationCategory } from '../enums/integration-category.enum';

/** Omnichannel sağlayıcı meta kaydı — adapter henüz yazılmasa da katalogda listelenir */
export interface OmnichannelProviderMeta {
  id: string;
  name: string;
  category: IntegrationCategory;
  country: string;
  status: 'ACTIVE' | 'BETA' | 'PLANNED' | 'DEPRECATED';
  hasAdapter: boolean;
  rateLimitPerMinute?: number;
}

/** 8 kategori — tüm planlanan platformlar */
export const OMNICHANNEL_CATALOG: OmnichannelProviderMeta[] = [
  // — 1. Yurtiçi Pazaryerleri —
  { id: 'trendyol', name: 'Trendyol', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'ACTIVE', hasAdapter: true, rateLimitPerMinute: 60 },
  { id: 'hepsiburada', name: 'Hepsiburada', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'ACTIVE', hasAdapter: true, rateLimitPerMinute: 50 },
  { id: 'n11', name: 'N11', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'ACTIVE', hasAdapter: true, rateLimitPerMinute: 40 },
  { id: 'amazon-tr', name: 'Amazon Türkiye', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'ACTIVE', hasAdapter: true, rateLimitPerMinute: 30 },
  { id: 'temu', name: 'Temu', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'beymen', name: 'Beymen', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'lcwaikiki', name: 'LC Waikiki', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'ciceksepeti', name: 'Çiçek Sepeti', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'BETA', hasAdapter: false },
  { id: 'pazarama', name: 'Pazarama', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'idefix', name: 'İdefix', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'boyner', name: 'Boyner', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'modanisa', name: 'Modanisa', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'farmazon', name: 'Farmazon', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'epttavm', name: 'EpttAVM', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'BETA', hasAdapter: false },
  { id: 'koctas', name: 'Koçtaş', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'teknosa', name: 'Teknosa', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'toptantr', name: 'ToptanTR', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'turkcell-pasaj', name: 'Turkcell Pasaj', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'amazon-vendor-df', name: 'Amazon Vendor DF', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'akakce', name: 'Akakçe', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'cimri', name: 'Cimri', category: IntegrationCategory.MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },

  // — 2. E-Ticaret Altyapıları —
  { id: 'ikas', name: 'İkas', category: IntegrationCategory.ECOMMERCE, country: 'TR', status: 'BETA', hasAdapter: true },
  { id: 'ticimax', name: 'Ticimax', category: IntegrationCategory.ECOMMERCE, country: 'TR', status: 'BETA', hasAdapter: false },
  { id: 'ideasoft', name: 'Ideasoft', category: IntegrationCategory.ECOMMERCE, country: 'TR', status: 'BETA', hasAdapter: false },
  { id: 'hipotenus', name: 'Hipotenüs', category: IntegrationCategory.ECOMMERCE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'shopify', name: 'Shopify', category: IntegrationCategory.ECOMMERCE, country: 'GLOBAL', status: 'ACTIVE', hasAdapter: true, rateLimitPerMinute: 80 },
  { id: 'tsoft', name: 'T-Soft', category: IntegrationCategory.ECOMMERCE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'opencart', name: 'OpenCart', category: IntegrationCategory.ECOMMERCE, country: 'GLOBAL', status: 'PLANNED', hasAdapter: false },
  { id: 'woocommerce', name: 'WooCommerce', category: IntegrationCategory.ECOMMERCE, country: 'GLOBAL', status: 'BETA', hasAdapter: false },
  { id: 'ethica', name: 'Ethica', category: IntegrationCategory.ECOMMERCE, country: 'TR', status: 'PLANNED', hasAdapter: false },

  // — 3. Kargo Sistemleri —
  { id: 'yurtici-kargo', name: 'Yurtiçi Kargo', category: IntegrationCategory.CARGO, country: 'TR', status: 'ACTIVE', hasAdapter: true, rateLimitPerMinute: 100 },
  { id: 'aras-kargo', name: 'Aras Kargo', category: IntegrationCategory.CARGO, country: 'TR', status: 'ACTIVE', hasAdapter: true, rateLimitPerMinute: 80 },
  { id: 'dhl-ecommerce', name: 'DHL eCommerce', category: IntegrationCategory.CARGO, country: 'GLOBAL', status: 'PLANNED', hasAdapter: false },
  { id: 'surat-kargo', name: 'Sürat Kargo', category: IntegrationCategory.CARGO, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'kolay-gelsin', name: 'Kolay Gelsin', category: IntegrationCategory.CARGO, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'hepsijet', name: 'Hepsijet', category: IntegrationCategory.CARGO, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'ups-kargo', name: 'UPS Kargo', category: IntegrationCategory.CARGO, country: 'GLOBAL', status: 'PLANNED', hasAdapter: false },
  { id: 'net-kargo', name: 'Net Kargo', category: IntegrationCategory.CARGO, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'amazon-easy-ship', name: 'Amazon Easy Ship', category: IntegrationCategory.CARGO, country: 'GLOBAL', status: 'PLANNED', hasAdapter: false },
  { id: 'ptt-kargo', name: 'PTT Kargo', category: IntegrationCategory.CARGO, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'bir-gunde-kargo', name: 'Bir Günde Kargo', category: IntegrationCategory.CARGO, country: 'TR', status: 'PLANNED', hasAdapter: false },

  // — 4. E-Fatura Sistemleri —
  { id: 'innova-payflex', name: 'Innova Payflex', category: IntegrationCategory.INVOICE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'digital-planet', name: 'Digital Planet', category: IntegrationCategory.INVOICE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'edm-bilisim', name: 'Edm Bilişim', category: IntegrationCategory.INVOICE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'n11faturam', name: 'n11faturam', category: IntegrationCategory.INVOICE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'sovos', name: 'Sovos', category: IntegrationCategory.INVOICE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'e-logo', name: 'e-Logo', category: IntegrationCategory.INVOICE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'turkcell-efatura', name: 'Turkcell e-Fatura', category: IntegrationCategory.INVOICE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'uyumsoft', name: 'Uyumsoft', category: IntegrationCategory.INVOICE, country: 'TR', status: 'ACTIVE', hasAdapter: true },
  { id: 'hb-efaturam', name: 'Hepsiburada e-faturam', category: IntegrationCategory.INVOICE, country: 'TR', status: 'PLANNED', hasAdapter: false },

  // — 5. Sosyal Medya & Feed —
  { id: 'facebook-shop', name: 'Facebook Mağaza', category: IntegrationCategory.SOCIAL_FEED, country: 'GLOBAL', status: 'PLANNED', hasAdapter: false },
  { id: 'google-merchant', name: 'Google Merchant', category: IntegrationCategory.SOCIAL_FEED, country: 'GLOBAL', status: 'BETA', hasAdapter: true },
  { id: 'instagram-shop', name: 'Instagram', category: IntegrationCategory.SOCIAL_FEED, country: 'GLOBAL', status: 'PLANNED', hasAdapter: false },

  // — 6. Yurtdışı & E-İhracat —
  { id: 'amazon-global', name: 'Amazon Yurtdışı', category: IntegrationCategory.GLOBAL_MARKETPLACE, country: 'GLOBAL', status: 'BETA', hasAdapter: false },
  { id: 'zalando', name: 'Zalando', category: IntegrationCategory.GLOBAL_MARKETPLACE, country: 'EU', status: 'PLANNED', hasAdapter: false },
  { id: 'ozon', name: 'Ozon', category: IntegrationCategory.GLOBAL_MARKETPLACE, country: 'RU', status: 'PLANNED', hasAdapter: false },
  { id: 'etsy', name: 'Etsy', category: IntegrationCategory.GLOBAL_MARKETPLACE, country: 'US', status: 'PLANNED', hasAdapter: false },
  { id: 'joom', name: 'Joom', category: IntegrationCategory.GLOBAL_MARKETPLACE, country: 'EU', status: 'PLANNED', hasAdapter: false },
  { id: 'hepsiglobal', name: 'Hepsiglobal', category: IntegrationCategory.GLOBAL_MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'exporgin', name: 'Exporgin', category: IntegrationCategory.GLOBAL_MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'globalink', name: 'Globalink', category: IntegrationCategory.GLOBAL_MARKETPLACE, country: 'TR', status: 'PLANNED', hasAdapter: false },

  // — 7. Muhasebe & ERP —
  { id: 'logo', name: 'Logo', category: IntegrationCategory.ERP, country: 'TR', status: 'ACTIVE', hasAdapter: true, rateLimitPerMinute: 30 },
  { id: 'netsis', name: 'Netsis', category: IntegrationCategory.ERP, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'nebim', name: 'Nebim', category: IntegrationCategory.ERP, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'dia', name: 'Dia', category: IntegrationCategory.ERP, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'zirve', name: 'Zirve', category: IntegrationCategory.ERP, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'akinsoft-wolvox', name: 'Akınsoft Wolvox', category: IntegrationCategory.ERP, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'uyumsoft-erp', name: 'Uyumsoft ERP', category: IntegrationCategory.ERP, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'odoo', name: 'Odoo', category: IntegrationCategory.ERP, country: 'GLOBAL', status: 'PLANNED', hasAdapter: false },
  { id: 'mikro', name: 'Mikro', category: IntegrationCategory.ERP, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'gizsoft', name: 'Giz Soft', category: IntegrationCategory.ERP, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'eta-sql', name: 'Eta SQL', category: IntegrationCategory.ERP, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'bizimhesap', name: 'Bizim Hesap', category: IntegrationCategory.ERP, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'parasut', name: 'Paraşüt', category: IntegrationCategory.ERP, country: 'TR', status: 'BETA', hasAdapter: true },

  // — 8. Fulfillment —
  { id: 'amazon-fba', name: 'Amazon FBA', category: IntegrationCategory.FULFILLMENT, country: 'GLOBAL', status: 'BETA', hasAdapter: true },
  { id: 'zalando-zfs', name: 'Zalando ZFS', category: IntegrationCategory.FULFILLMENT, country: 'EU', status: 'PLANNED', hasAdapter: false },
  { id: 'hepsilojistik', name: 'Hepsilojistik', category: IntegrationCategory.FULFILLMENT, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'parkpalet', name: 'Parkpalet', category: IntegrationCategory.FULFILLMENT, country: 'TR', status: 'PLANNED', hasAdapter: false },
  { id: 'ficommerce', name: 'Ficommerce', category: IntegrationCategory.FULFILLMENT, country: 'TR', status: 'PLANNED', hasAdapter: false },
];

export function getOmnichannelByCategory(
  category: IntegrationCategory,
): OmnichannelProviderMeta[] {
  return OMNICHANNEL_CATALOG.filter((p) => p.category === category);
}

export function getOmnichannelProvider(id: string): OmnichannelProviderMeta | undefined {
  return OMNICHANNEL_CATALOG.find((p) => p.id === id);
}
