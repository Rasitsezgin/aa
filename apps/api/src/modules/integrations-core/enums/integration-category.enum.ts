/** Dış sistem entegrasyon kategorileri */
export enum IntegrationCategory {
  MARKETPLACE = 'MARKETPLACE',
  ECOMMERCE = 'ECOMMERCE',
  SHIPPING = 'SHIPPING',
  ACCOUNTING = 'ACCOUNTING',
}

/** Senkronizasyon iş tipleri */
export enum IntegrationSyncType {
  PRODUCTS = 'products',
  ORDERS = 'orders',
  INVENTORY = 'inventory',
  INVOICES = 'invoices',
  SHIPMENTS = 'shipments',
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
