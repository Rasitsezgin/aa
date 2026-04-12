// Türkçe dil dosyası
export const tr = {
  // Genel
  common: {
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    add: 'Ekle',
    search: 'Ara',
    filter: 'Filtrele',
    export: 'Dışa Aktar',
    import: 'İçe Aktar',
    loading: 'Yükleniyor...',
    noData: 'Veri bulunamadı',
    error: 'Hata',
    success: 'Başarılı',
    warning: 'Uyarı',
    info: 'Bilgi',
    confirm: 'Onayla',
    back: 'Geri',
    next: 'İleri',
    previous: 'Önceki',
    close: 'Kapat',
    yes: 'Evet',
    no: 'Hayır',
    all: 'Tümü',
    none: 'Hiçbiri',
    select: 'Seç',
    required: 'Zorunlu',
    optional: 'Opsiyonel',
  },

  // Navigasyon
  nav: {
    dashboard: 'Dashboard',
    orders: 'Siparişler',
    products: 'Ürünler',
    inventory: 'Envanter',
    customers: 'Müşteriler',
    analytics: 'Analitik',
    finance: 'Finans',
    reports: 'Raporlar',
    settings: 'Ayarlar',
    integrations: 'Entegrasyonlar',
    support: 'Destek',
    warehouse: 'Depolar',
    campaigns: 'Kampanyalar',
    affiliates: 'Affiliate',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    welcome: 'Hoş Geldiniz',
    totalRevenue: 'Toplam Gelir',
    totalOrders: 'Toplam Sipariş',
    totalProducts: 'Toplam Ürün',
    totalCustomers: 'Toplam Müşteri',
    recentOrders: 'Son Siparişler',
    topProducts: 'En Çok Satan Ürünler',
    lowStock: 'Düşük Stok Uyarıları',
    pendingOrders: 'Bekleyen Siparişler',
    todaySales: 'Bugünkü Satışlar',
    thisWeek: 'Bu Hafta',
    thisMonth: 'Bu Ay',
    comparedToLast: 'önceki döneme göre',
  },

  // Siparişler
  orders: {
    title: 'Siparişler',
    newOrder: 'Yeni Sipariş',
    orderNumber: 'Sipariş No',
    orderDate: 'Sipariş Tarihi',
    customer: 'Müşteri',
    status: 'Durum',
    total: 'Toplam',
    items: 'Ürünler',
    shipping: 'Kargo',
    payment: 'Ödeme',
    notes: 'Notlar',
    statuses: {
      pending: 'Bekliyor',
      confirmed: 'Onaylandı',
      shipped: 'Kargoya Verildi',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi',
      returned: 'İade Edildi',
    },
  },

  // Ürünler
  products: {
    title: 'Ürünler',
    newProduct: 'Yeni Ürün',
    productName: 'Ürün Adı',
    sku: 'SKU',
    barcode: 'Barkod',
    price: 'Fiyat',
    stock: 'Stok',
    category: 'Kategori',
    brand: 'Marka',
    description: 'Açıklama',
    images: 'Görseller',
    variants: 'Varyantlar',
    active: 'Aktif',
    inactive: 'Pasif',
  },

  // Envanter
  inventory: {
    title: 'Envanter',
    stockLevel: 'Stok Seviyesi',
    lowStockThreshold: 'Düşük Stok Eşiği',
    reorderPoint: 'Yeniden Sipariş Noktası',
    inStock: 'Stokta',
    outOfStock: 'Stok Tükendi',
    lowStock: 'Düşük Stok',
    updateStock: 'Stok Güncelle',
    stockHistory: 'Stok Geçmişi',
    warehouse: 'Depo',
    transfer: 'Transfer',
  },

  // Finans
  finance: {
    title: 'Finans',
    revenue: 'Gelir',
    expenses: 'Gider',
    profit: 'Kar',
    commission: 'Komisyon',
    tax: 'Vergi',
    invoices: 'Faturalar',
    payments: 'Ödemeler',
    balance: 'Bakiye',
  },

  // Ayarlar
  settings: {
    title: 'Ayarlar',
    general: 'Genel',
    account: 'Hesap',
    security: 'Güvenlik',
    notifications: 'Bildirimler',
    integrations: 'Entegrasyonlar',
    billing: 'Faturalama',
    team: 'Ekip',
    language: 'Dil',
    timezone: 'Saat Dilimi',
    currency: 'Para Birimi',
    twoFactor: 'İki Faktörlü Doğrulama',
    changePassword: 'Şifre Değiştir',
  },

  // Hatalar
  errors: {
    generic: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    notFound: 'Sayfa bulunamadı',
    unauthorized: 'Bu işlem için yetkiniz yok',
    networkError: 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.',
    validationError: 'Lütfen tüm alanları doğru doldurun',
    sessionExpired: 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.',
  },

  // Zaman
  time: {
    now: 'Şimdi',
    today: 'Bugün',
    yesterday: 'Dün',
    tomorrow: 'Yarın',
    thisWeek: 'Bu Hafta',
    lastWeek: 'Geçen Hafta',
    thisMonth: 'Bu Ay',
    lastMonth: 'Geçen Ay',
    thisYear: 'Bu Yıl',
    ago: 'önce',
    minutes: 'dakika',
    hours: 'saat',
    days: 'gün',
  },

  // Pazaryeri
  marketplace: {
    title: 'Pazaryerleri',
    sync: 'Senkronize Et',
    lastSync: 'Son Senkronizasyon',
    connected: 'Bağlı',
    disconnected: 'Bağlı Değil',
    configure: 'Yapılandır',
    testConnection: 'Bağlantıyı Test Et',
    syncProducts: 'Ürünleri Senkronize Et',
    syncOrders: 'Siparişleri Senkronize Et',
  },

  // Rakip Analizi
  competitor: {
    title: 'Rakip Takibi',
    addCompetitor: 'Rakip Ekle',
    priceComparison: 'Fiyat Karşılaştırma',
    priceHistory: 'Fiyat Geçmişi',
    competitorCount: 'Rakip Sayısı',
    avgPrice: 'Ortalama Fiyat',
    minPrice: 'En Düşük Fiyat',
    maxPrice: 'En Yüksek Fiyat',
  },

  // Fiyatlandırma
  pricing: {
    title: 'Fiyat Optimizasyonu',
    suggestedPrice: 'Önerilen Fiyat',
    currentPrice: 'Mevcut Fiyat',
    costPrice: 'Maliyet Fiyatı',
    margin: 'Kar Marjı',
    rules: 'Fiyat Kuralları',
    createRule: 'Kural Oluştur',
    confidence: 'Güven Skoru',
    applyPrice: 'Fiyatı Uygula',
  },

  // Tahminleme
  forecasting: {
    title: 'Satış Tahmini',
    predictedSales: 'Tahmini Satış',
    avgDailySales: 'Günlük Ort. Satış',
    trend: 'Trend',
    increasing: 'Artıyor',
    decreasing: 'Azalıyor',
    stable: 'Sabit',
    stockWarning: 'Stok Uyarısı',
  },
};

export type Dictionary = typeof tr;
