// i18n Internationalization Configuration
// Multi-language support for Pazaryonetimi

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Supported languages
export const supportedLanguages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
] as const;

export type LanguageCode = typeof supportedLanguages[number]['code'];

// Translation resources
const resources = {
  tr: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      products: 'Ürünler',
      orders: 'Siparişler',
      customers: 'Müşteriler',
      analytics: 'Analizler',
      settings: 'Ayarlar',
      integrations: 'Entegrasyonlar',
      
      // Common actions
      add: 'Ekle',
      edit: 'Düzenle',
      delete: 'Sil',
      save: 'Kaydet',
      cancel: 'İptal',
      search: 'Ara',
      filter: 'Filtrele',
      export: 'Dışa Aktar',
      import: 'İçe Aktar',
      sync: 'Senkronize Et',
      refresh: 'Yenile',
      close: 'Kapat',
      confirm: 'Onayla',
      back: 'Geri',
      next: 'İleri',
      
      // Product management
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
      
      // Order management
      orderNumber: 'Sipariş No',
      orderDate: 'Sipariş Tarihi',
      customer: 'Müşteri',
      total: 'Toplam',
      status: 'Durum',
      pending: 'Bekliyor',
      confirmed: 'Onaylandı',
      processing: 'Hazırlanıyor',
      shipped: 'Kargoya Verildi',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi',
      
      // Status messages
      loading: 'Yükleniyor...',
      success: 'Başarılı!',
      error: 'Hata oluştu',
      warning: 'Uyarı',
      info: 'Bilgi',
      
      // Validation
      required: 'Bu alan zorunludur',
      invalidEmail: 'Geçerli bir e-posta adresi giriniz',
      invalidPhone: 'Geçerli bir telefon numarası giriniz',
      minLength: 'En az {{count}} karakter olmalıdır',
      maxLength: 'En fazla {{count}} karakter olabilir',
      
      // Errors
      networkError: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
      serverError: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
      unauthorized: 'Yetkisiz erişim. Lütfen giriş yapın.',
      notFound: 'Sayfa bulunamadı',
      
      // Features
      featureNewDashboard: 'Yeni Dashboard',
      featureAIAssistant: 'AI Asistan',
      featureBulkEdit: 'Toplu Düzenleme',
      featureAdvancedAnalytics: 'Gelişmiş Analizler',
      
      // Marketplace names
      marketplaceTrendyol: 'Trendyol',
      marketplaceHepsiburada: 'Hepsiburada',
      marketplaceAmazon: 'Amazon',
      marketplaceN11: 'N11',
      marketplaceCiceksepeti: 'ÇiçekSepeti',
      
      // Dates
      today: 'Bugün',
      yesterday: 'Dün',
      thisWeek: 'Bu Hafta',
      thisMonth: 'Bu Ay',
      lastMonth: 'Geçen Ay',
      customRange: 'Özel Aralık',
    },
  },
  
  en: {
    translation: {
      dashboard: 'Dashboard',
      products: 'Products',
      orders: 'Orders',
      customers: 'Customers',
      analytics: 'Analytics',
      settings: 'Settings',
      integrations: 'Integrations',
      
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      sync: 'Sync',
      refresh: 'Refresh',
      close: 'Close',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      
      productName: 'Product Name',
      sku: 'SKU',
      barcode: 'Barcode',
      price: 'Price',
      stock: 'Stock',
      category: 'Category',
      brand: 'Brand',
      description: 'Description',
      images: 'Images',
      variants: 'Variants',
      
      orderNumber: 'Order Number',
      orderDate: 'Order Date',
      customer: 'Customer',
      total: 'Total',
      status: 'Status',
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      
      loading: 'Loading...',
      success: 'Success!',
      error: 'An error occurred',
      warning: 'Warning',
      info: 'Info',
      
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      minLength: 'Must be at least {{count}} characters',
      maxLength: 'Must be at most {{count}} characters',
      
      networkError: 'Connection error. Please check your internet connection.',
      serverError: 'Server error. Please try again later.',
      unauthorized: 'Unauthorized access. Please log in.',
      notFound: 'Page not found',
      
      featureNewDashboard: 'New Dashboard',
      featureAIAssistant: 'AI Assistant',
      featureBulkEdit: 'Bulk Edit',
      featureAdvancedAnalytics: 'Advanced Analytics',
      
      marketplaceTrendyol: 'Trendyol',
      marketplaceHepsiburada: 'Hepsiburada',
      marketplaceAmazon: 'Amazon',
      marketplaceN11: 'N11',
      marketplaceCiceksepeti: 'CicekSepeti',
      
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      customRange: 'Custom Range',
    },
  },
};

// Initialize i18n
if (typeof window !== 'undefined') {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'tr',
      supportedLngs: supportedLanguages.map(l => l.code),
      
      detection: {
        order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
        caches: ['localStorage', 'cookie'],
        lookupLocalStorage: 'i18nLng',
        lookupCookie: 'i18nLng',
      },
      
      interpolation: {
        escapeValue: false,
      },
      
      react: {
        useSuspense: false,
      },
    });
}

// Language utilities
export function getCurrentLanguage(): LanguageCode {
  return (i18n.language?.split('-')[0] as LanguageCode) || 'tr';
}

export function setLanguage(lng: LanguageCode): void {
  i18n.changeLanguage(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = supportedLanguages.find(l => l.code === lng)?.dir || 'ltr';
}

export function getLanguageInfo(code: LanguageCode) {
  return supportedLanguages.find(l => l.code === code);
}

// RTL support
export function isRTL(lang: LanguageCode): boolean {
  return supportedLanguages.find(l => l.code === lang)?.dir === 'rtl';
}

// Format numbers based on locale
export function formatNumber(num: number, lang: LanguageCode = getCurrentLanguage()): string {
  return new Intl.NumberFormat(lang).format(num);
}

// Format currency based on locale
export function formatCurrency(
  amount: number,
  currency: string = 'TRY',
  lang: LanguageCode = getCurrentLanguage()
): string {
  return new Intl.NumberFormat(lang, {
    style: 'currency',
    currency,
  }).format(amount);
}

// Format date based on locale
export function formatDate(
  date: Date | string,
  lang: LanguageCode = getCurrentLanguage(),
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(lang, options).format(d);
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(
  date: Date | string,
  lang: LanguageCode = getCurrentLanguage()
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  
  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  if (diffInSeconds < 604800) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  if (diffInSeconds < 2628000) return rtf.format(-Math.floor(diffInSeconds / 604800), 'week');
  if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2628000), 'month');
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
}

// Pluralization helper
export function pluralize(
  count: number,
  singular: string,
  plural: string,
  lang: LanguageCode = getCurrentLanguage()
): string {
  if (lang === 'tr') {
    // Turkish pluralization is different
    return `${count} ${singular}`;
  }
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}

export default i18n;
export { supportedLanguages };
export type { LanguageCode };
