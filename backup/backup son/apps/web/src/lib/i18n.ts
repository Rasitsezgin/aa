// i18n Configuration and Translations
export type Language = 'tr' | 'en' | 'de' | 'ar';

export interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

export const translations: Translations = {
  // Common
  'common.save': { tr: 'Kaydet', en: 'Save', de: 'Speichern', ar: 'حفظ' },
  'common.cancel': { tr: 'İptal', en: 'Cancel', de: 'Abbrechen', ar: 'إلغاء' },
  'common.delete': { tr: 'Sil', en: 'Delete', de: 'Löschen', ar: 'حذف' },
  'common.edit': { tr: 'Düzenle', en: 'Edit', de: 'Bearbeiten', ar: 'تعديل' },
  'common.add': { tr: 'Ekle', en: 'Add', de: 'Hinzufügen', ar: 'إضافة' },
  'common.search': { tr: 'Ara', en: 'Search', de: 'Suchen', ar: 'بحث' },
  'common.filter': { tr: 'Filtrele', en: 'Filter', de: 'Filtern', ar: 'تصفية' },
  'common.export': { tr: 'Dışa Aktar', en: 'Export', de: 'Exportieren', ar: 'تصدير' },
  'common.import': { tr: 'İçe Aktar', en: 'Import', de: 'Importieren', ar: 'استيراد' },
  'common.loading': { tr: 'Yükleniyor...', en: 'Loading...', de: 'Laden...', ar: 'جار التحميل...' },
  'common.success': { tr: 'Başarılı', en: 'Success', de: 'Erfolg', ar: 'نجاح' },
  'common.error': { tr: 'Hata', en: 'Error', de: 'Fehler', ar: 'خطأ' },
  'common.warning': { tr: 'Uyarı', en: 'Warning', de: 'Warnung', ar: 'تحذير' },
  'common.info': { tr: 'Bilgi', en: 'Info', de: 'Info', ar: 'معلومات' },
  'common.yes': { tr: 'Evet', en: 'Yes', de: 'Ja', ar: 'نعم' },
  'common.no': { tr: 'Hayır', en: 'No', de: 'Nein', ar: 'لا' },
  'common.all': { tr: 'Tümü', en: 'All', de: 'Alle', ar: 'الكل' },
  'common.none': { tr: 'Hiçbiri', en: 'None', de: 'Keine', ar: 'لا شيء' },
  'common.back': { tr: 'Geri', en: 'Back', de: 'Zurück', ar: 'رجوع' },
  'common.next': { tr: 'İleri', en: 'Next', de: 'Weiter', ar: 'التالي' },
  'common.close': { tr: 'Kapat', en: 'Close', de: 'Schließen', ar: 'إغلاق' },

  // Navigation
  'nav.dashboard': { tr: 'Dashboard', en: 'Dashboard', de: 'Dashboard', ar: 'لوحة التحكم' },
  'nav.products': { tr: 'Ürünler', en: 'Products', de: 'Produkte', ar: 'المنتجات' },
  'nav.orders': { tr: 'Siparişler', en: 'Orders', de: 'Bestellungen', ar: 'الطلبات' },
  'nav.customers': { tr: 'Müşteriler', en: 'Customers', de: 'Kunden', ar: 'العملاء' },
  'nav.inventory': { tr: 'Stok Yönetimi', en: 'Inventory', de: 'Lagerbestand', ar: 'المخزون' },
  'nav.analytics': { tr: 'Analitik', en: 'Analytics', de: 'Analytik', ar: 'التحليلات' },
  'nav.settings': { tr: 'Ayarlar', en: 'Settings', de: 'Einstellungen', ar: 'الإعدادات' },
  'nav.integrations': { tr: 'Entegrasyonlar', en: 'Integrations', de: 'Integrationen', ar: 'التكاملات' },
  'nav.notifications': { tr: 'Bildirimler', en: 'Notifications', de: 'Benachrichtigungen', ar: 'الإشعارات' },
  'nav.ai_tools': { tr: 'AI Araçları', en: 'AI Tools', de: 'KI-Werkzeuge', ar: 'أدوات الذكاء الاصطناعي' },
  'nav.automation': { tr: 'Otomasyon', en: 'Automation', de: 'Automatisierung', ar: 'الأتمتة' },
  'nav.webhooks': { tr: 'Webhooks', en: 'Webhooks', de: 'Webhooks', ar: 'ويب هوكس' },
  'nav.theme': { tr: 'Tema', en: 'Theme', de: 'Thema', ar: 'المظهر' },
  'nav.security': { tr: 'Güvenlik', en: 'Security', de: 'Sicherheit', ar: 'الأمان' },

  // Dashboard
  'dashboard.welcome': { tr: 'Hoş Geldiniz', en: 'Welcome', de: 'Willkommen', ar: 'مرحبا' },
  'dashboard.total_sales': { tr: 'Toplam Satış', en: 'Total Sales', de: 'Gesamtumsatz', ar: 'إجمالي المبيعات' },
  'dashboard.orders_today': { tr: 'Bugünkü Siparişler', en: 'Orders Today', de: 'Bestellungen Heute', ar: 'طلبات اليوم' },
  'dashboard.revenue': { tr: 'Gelir', en: 'Revenue', de: 'Umsatz', ar: 'الإيرادات' },
  'dashboard.customers': { tr: 'Müşteriler', en: 'Customers', de: 'Kunden', ar: 'العملاء' },
  'dashboard.pending_orders': { tr: 'Bekleyen Siparişler', en: 'Pending Orders', de: 'Ausstehende Bestellungen', ar: 'الطلبات المعلقة' },
  'dashboard.low_stock': { tr: 'Düşük Stok', en: 'Low Stock', de: 'Niedriger Bestand', ar: 'مخزون منخفض' },

  // Products
  'products.title': { tr: 'Ürün Yönetimi', en: 'Product Management', de: 'Produktverwaltung', ar: 'إدارة المنتجات' },
  'products.add_product': { tr: 'Ürün Ekle', en: 'Add Product', de: 'Produkt hinzufügen', ar: 'إضافة منتج' },
  'products.product_name': { tr: 'Ürün Adı', en: 'Product Name', de: 'Produktname', ar: 'اسم المنتج' },
  'products.sku': { tr: 'SKU', en: 'SKU', de: 'SKU', ar: 'رمز المنتج' },
  'products.price': { tr: 'Fiyat', en: 'Price', de: 'Preis', ar: 'السعر' },
  'products.stock': { tr: 'Stok', en: 'Stock', de: 'Bestand', ar: 'المخزون' },
  'products.category': { tr: 'Kategori', en: 'Category', de: 'Kategorie', ar: 'الفئة' },
  'products.status': { tr: 'Durum', en: 'Status', de: 'Status', ar: 'الحالة' },

  // Orders
  'orders.title': { tr: 'Sipariş Yönetimi', en: 'Order Management', de: 'Bestellungsverwaltung', ar: 'إدارة الطلبات' },
  'orders.order_id': { tr: 'Sipariş No', en: 'Order ID', de: 'Bestellnummer', ar: 'رقم الطلب' },
  'orders.customer': { tr: 'Müşteri', en: 'Customer', de: 'Kunde', ar: 'العميل' },
  'orders.total': { tr: 'Toplam', en: 'Total', de: 'Gesamt', ar: 'المجموع' },
  'orders.status': { tr: 'Durum', en: 'Status', de: 'Status', ar: 'الحالة' },
  'orders.date': { tr: 'Tarih', en: 'Date', de: 'Datum', ar: 'التاريخ' },
  'orders.pending': { tr: 'Bekliyor', en: 'Pending', de: 'Ausstehend', ar: 'قيد الانتظار' },
  'orders.processing': { tr: 'İşleniyor', en: 'Processing', de: 'In Bearbeitung', ar: 'قيد المعالجة' },
  'orders.shipped': { tr: 'Kargoda', en: 'Shipped', de: 'Versendet', ar: 'تم الشحن' },
  'orders.delivered': { tr: 'Teslim Edildi', en: 'Delivered', de: 'Geliefert', ar: 'تم التسليم' },
  'orders.cancelled': { tr: 'İptal', en: 'Cancelled', de: 'Storniert', ar: 'ملغى' },

  // Settings
  'settings.title': { tr: 'Ayarlar', en: 'Settings', de: 'Einstellungen', ar: 'الإعدادات' },
  'settings.general': { tr: 'Genel', en: 'General', de: 'Allgemein', ar: 'عام' },
  'settings.account': { tr: 'Hesap', en: 'Account', de: 'Konto', ar: 'الحساب' },
  'settings.language': { tr: 'Dil', en: 'Language', de: 'Sprache', ar: 'اللغة' },
  'settings.theme': { tr: 'Tema', en: 'Theme', de: 'Thema', ar: 'المظهر' },
  'settings.notifications': { tr: 'Bildirimler', en: 'Notifications', de: 'Benachrichtigungen', ar: 'الإشعارات' },

  // Auth
  'auth.login': { tr: 'Giriş Yap', en: 'Login', de: 'Anmelden', ar: 'تسجيل الدخول' },
  'auth.logout': { tr: 'Çıkış Yap', en: 'Logout', de: 'Abmelden', ar: 'تسجيل الخروج' },
  'auth.register': { tr: 'Kayıt Ol', en: 'Register', de: 'Registrieren', ar: 'التسجيل' },
  'auth.email': { tr: 'E-posta', en: 'Email', de: 'E-Mail', ar: 'البريد الإلكتروني' },
  'auth.password': { tr: 'Şifre', en: 'Password', de: 'Passwort', ar: 'كلمة المرور' },
  'auth.forgot_password': { tr: 'Şifremi Unuttum', en: 'Forgot Password', de: 'Passwort vergessen', ar: 'نسيت كلمة المرور' },

  // Time
  'time.today': { tr: 'Bugün', en: 'Today', de: 'Heute', ar: 'اليوم' },
  'time.yesterday': { tr: 'Dün', en: 'Yesterday', de: 'Gestern', ar: 'أمس' },
  'time.this_week': { tr: 'Bu Hafta', en: 'This Week', de: 'Diese Woche', ar: 'هذا الأسبوع' },
  'time.this_month': { tr: 'Bu Ay', en: 'This Month', de: 'Diesen Monat', ar: 'هذا الشهر' },
  'time.this_year': { tr: 'Bu Yıl', en: 'This Year', de: 'Dieses Jahr', ar: 'هذا العام' },

  // Currencies
  'currency.try': { tr: '₺', en: '₺', de: '₺', ar: '₺' },
  'currency.usd': { tr: '$', en: '$', de: '$', ar: '$' },
  'currency.eur': { tr: '€', en: '€', de: '€', ar: '€' },
};

export const languageNames: Record<Language, string> = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
  ar: 'العربية'
};

export const languageFlags: Record<Language, string> = {
  tr: '🇹🇷',
  en: '🇬🇧',
  de: '🇩🇪',
  ar: '🇸🇦'
};

// Default language
export const defaultLanguage: Language = 'tr';

// Get browser language
export function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return defaultLanguage;
  
  const browserLang = navigator.language.split('-')[0];
  if (browserLang in languageNames) {
    return browserLang as Language;
  }
  return defaultLanguage;
}

// Translation function
export function t(key: string, lang: Language = defaultLanguage): string {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation not found for key: ${key}`);
    return key;
  }
  return translation[lang] || translation[defaultLanguage] || key;
}

// Format number based on locale
export function formatNumber(value: number, lang: Language = defaultLanguage): string {
  const locales: Record<Language, string> = {
    tr: 'tr-TR',
    en: 'en-US',
    de: 'de-DE',
    ar: 'ar-SA'
  };
  return new Intl.NumberFormat(locales[lang]).format(value);
}

// Format currency
export function formatCurrency(value: number, currency: string = 'TRY', lang: Language = defaultLanguage): string {
  const locales: Record<Language, string> = {
    tr: 'tr-TR',
    en: 'en-US',
    de: 'de-DE',
    ar: 'ar-SA'
  };
  return new Intl.NumberFormat(locales[lang], {
    style: 'currency',
    currency
  }).format(value);
}

// Format date
export function formatDate(date: Date, lang: Language = defaultLanguage, options?: Intl.DateTimeFormatOptions): string {
  const locales: Record<Language, string> = {
    tr: 'tr-TR',
    en: 'en-US',
    de: 'de-DE',
    ar: 'ar-SA'
  };
  return new Intl.DateTimeFormat(locales[lang], options).format(date);
}
