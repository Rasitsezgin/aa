/** 8 ana omnichannel entegrasyon kategorisi */
export enum IntegrationCategory {
  /** Yurtiçi pazaryerleri — Trendyol, HB, N11 vb. */
  MARKETPLACE = 'MARKETPLACE',
  /** E-ticaret altyapıları — İkas, Ticimax, Shopify vb. */
  ECOMMERCE = 'ECOMMERCE',
  /** Kargo sistemleri — Yurtiçi, Aras, DHL vb. */
  CARGO = 'CARGO',
  /** E-fatura sistemleri — Logo, Uyumsoft, Sovos vb. */
  INVOICE = 'INVOICE',
  /** Sosyal medya & feed — Facebook, Google Merchant, Instagram */
  SOCIAL_FEED = 'SOCIAL_FEED',
  /** Yurtdışı pazaryerleri — Amazon US, Zalando, Ozon vb. */
  GLOBAL_MARKETPLACE = 'GLOBAL_MARKETPLACE',
  /** Muhasebe & ERP — Logo, Netsis, Paraşüt vb. */
  ERP = 'ERP',
  /** Fulfillment — FBA, Hepsilojistik, Parkpalet vb. */
  FULFILLMENT = 'FULFILLMENT',

  /** @deprecated CARGO kullanın */
  SHIPPING = 'CARGO',
  /** @deprecated INVOICE kullanın */
  ACCOUNTING = 'INVOICE',
}

/** Senkronizasyon / iş tipleri */
export enum IntegrationSyncType {
  PRODUCTS = 'products',
  ORDERS = 'orders',
  INVENTORY = 'inventory',
  STOCK_UPDATE = 'stock-update',
  PRICE_UPDATE = 'price-update',
  INVOICES = 'invoices',
  SHIPMENTS = 'shipments',
  TRACKING = 'tracking',
  FEED_SYNC = 'feed-sync',
  ERP_SYNC = 'erp-sync',
  FULFILLMENT_SYNC = 'fulfillment-sync',
  HEALTH_CHECK = 'health-check',
  ALL = 'all',
}

/** Entegrasyon bağlantı durumu */
export enum IntegrationConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  SYNCING = 'syncing',
  PENDING = 'pending',
}

/** Circuit breaker durumları */
export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half-open',
}
