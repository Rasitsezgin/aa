/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';

export type SupportedLanguage = 'tr' | 'en' | 'ar' | 'de' | 'fr' | 'es' | 'ru';

interface Translation {
  [key: string]: string | Translation;
}

interface I18nContext {
  language: SupportedLanguage;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  currency: string;
}

@Injectable()
export class AII18nService {
  private translations: Record<SupportedLanguage, Translation> = {
    tr: {
      common: {
        greeting: 'Merhaba',
        goodbye: 'Hoşçakal',
        yes: 'Evet',
        no: 'Hayır',
        cancel: 'İptal',
        confirm: 'Onayla',
        loading: 'Yükleniyor...',
        error: 'Hata',
        success: 'Başarılı',
        warning: 'Uyarı',
        info: 'Bilgi',
      },
      actions: {
        brandSync: 'Marka Eşitleme',
        categorySync: 'Kategori Eşitleme',
        attributeSync: 'Özellik Eşitleme',
        productUpload: 'Ürün Yükleme',
        variantManage: 'Varyant Yönetimi',
        bulkUpload: 'Toplu Yükleme',
        syncStarted: 'Eşitleme başlatıldı',
        syncCompleted: 'Eşitleme tamamlandı',
        syncFailed: 'Eşitleme başarısız',
        uploadStarted: 'Yükleme başlatıldı',
        uploadCompleted: 'Yükleme tamamlandı',
        uploadFailed: 'Yükleme başarısız',
      },
      platforms: {
        TRENDYOL: 'Trendyol',
        AMAZON: 'Amazon',
        HEPSIBURADA: 'Hepsiburada',
        N11: 'N11',
        CICEKSEPETI: 'Çiçek Sepeti',
        PTTAVM: 'PTT AVM',
        GITTIGIDIYOR: 'GittiGidiyor',
        MORHIPO: 'Morhipo',
        ALIBABA: 'Alibaba',
        ALIEXPRESS: 'AliExpress',
        SHOPEE: 'Shopee',
        EBAY: 'eBay',
        ETSY: 'Etsy',
        WALMART: 'Walmart',
        LAZADA: 'Lazada',
      },
      assistant: {
        welcome: "Sopyo AI Asistan'a hoş geldiniz!",
        help: 'Size nasıl yardımcı olabilirim?',
        understanding: 'Anlıyorum...',
        processing: 'İşlem yapılıyor...',
        clarification: 'Lütfen daha spesifik olun',
        suggestion: 'Bunu deneyebilir misiniz?',
        confirmation: 'Bu işlemi yapmak istediğinize emin misiniz?',
        result: 'İşlem sonucu',
        nextSteps: 'Sonraki adımlar',
        alternatives: 'Alternatifler',
      },
      errors: {
        platformNotFound: 'Platform bulunamadı',
        invalidCommand: 'Geçersiz komut',
        syncError: 'Eşitleme hatası',
        uploadError: 'Yükleme hatası',
        networkError: 'Ağ hatası',
        permissionError: 'Yetki hatası',
        unknownError: 'Bilinmeyen hata',
        retryLater: 'Lütfen daha sonra tekrar deneyin',
        contactSupport: 'Destek ekibiyle iletişime geçin',
      },
      time: {
        now: 'şimdi',
        today: 'bugün',
        tomorrow: 'yarın',
        yesterday: 'dün',
        minutes: 'dakika',
        hours: 'saat',
        days: 'gün',
        weeks: 'hafta',
        months: 'ay',
        years: 'yıl',
        ago: 'önce',
        later: 'sonra',
        soon: 'yakında',
        recently: 'son zamanlarda',
      },
    },
    en: {
      common: {
        greeting: 'Hello',
        goodbye: 'Goodbye',
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
        confirm: 'Confirm',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Info',
      },
      actions: {
        brandSync: 'Brand Sync',
        categorySync: 'Category Sync',
        attributeSync: 'Attribute Sync',
        productUpload: 'Product Upload',
        variantManage: 'Variant Management',
        bulkUpload: 'Bulk Upload',
        syncStarted: 'Sync started',
        syncCompleted: 'Sync completed',
        syncFailed: 'Sync failed',
        uploadStarted: 'Upload started',
        uploadCompleted: 'Upload completed',
        uploadFailed: 'Upload failed',
      },
      platforms: {
        TRENDYOL: 'Trendyol',
        AMAZON: 'Amazon',
        HEPSIBURADA: 'Hepsiburada',
        N11: 'N11',
        CICEKSEPETI: 'Cicek Sepeti',
        PTTAVM: 'PTT AVM',
        GITTIGIDIYOR: 'GittiGidiyor',
        MORHIPO: 'Morhipo',
        ALIBABA: 'Alibaba',
        ALIEXPRESS: 'AliExpress',
        SHOPEE: 'Shopee',
        EBAY: 'eBay',
        ETSY: 'Etsy',
        WALMART: 'Walmart',
        LAZADA: 'Lazada',
      },
      assistant: {
        welcome: 'Welcome to Sopyo AI Assistant!',
        help: 'How can I help you?',
        understanding: 'I understand...',
        processing: 'Processing...',
        clarification: 'Please be more specific',
        suggestion: 'Would you like to try this?',
        confirmation: 'Are you sure you want to do this?',
        result: 'Result',
        nextSteps: 'Next steps',
        alternatives: 'Alternatives',
      },
      errors: {
        platformNotFound: 'Platform not found',
        invalidCommand: 'Invalid command',
        syncError: 'Sync error',
        uploadError: 'Upload error',
        networkError: 'Network error',
        permissionError: 'Permission error',
        unknownError: 'Unknown error',
        retryLater: 'Please try again later',
        contactSupport: 'Contact support team',
      },
      time: {
        now: 'now',
        today: 'today',
        tomorrow: 'tomorrow',
        yesterday: 'yesterday',
        minutes: 'minutes',
        hours: 'hours',
        days: 'days',
        weeks: 'weeks',
        months: 'months',
        years: 'years',
        ago: 'ago',
        later: 'later',
        soon: 'soon',
        recently: 'recently',
      },
    },
    ar: {
      common: {
        greeting: 'مرحبا',
        goodbye: 'وداعا',
        yes: 'نعم',
        no: 'لا',
        cancel: 'إلغاء',
        confirm: 'تأكيد',
        loading: 'جاري التحميل...',
        error: 'خطأ',
        success: 'نجاح',
        warning: 'تحذير',
        info: 'معلومات',
      },
      actions: {
        brandSync: 'مزامنة العلامة التجارية',
        categorySync: 'مزامنة الفئة',
        attributeSync: 'مزامنة السمة',
        productUpload: 'رفع المنتج',
        variantManage: 'إدارة المتغيرات',
        bulkUpload: 'الرفع بالجملة',
        syncStarted: 'بدأت المزامنة',
        syncCompleted: 'اكتملت المزامنة',
        syncFailed: 'فشلت المزامنة',
        uploadStarted: 'بدأ الرفع',
        uploadCompleted: 'اكتمل الرفع',
        uploadFailed: 'فشل الرفع',
      },
      platforms: {
        TRENDYOL: 'ترينديول',
        AMAZON: 'أمازون',
        HEPSIBURADA: 'هيبسيبرادا',
        N11: 'N11',
        CICEKSEPETI: 'تشيك سيبيتي',
        PTTAVM: 'PTT AVM',
        GITTIGIDIYOR: 'جيتي جيديور',
        MORHIPO: 'مورهيبو',
        ALIBABA: 'علي بابا',
        ALIEXPRESS: 'علي إكسبرس',
        SHOPEE: 'شوبي',
        EBAY: 'إيباي',
        ETSY: 'إتسي',
        WALMART: 'وول مارت',
        LAZADA: 'لازادا',
      },
      assistant: {
        welcome: 'مرحبا بك في مساعد Sopyo AI!',
        help: 'كيف يمكنني مساعدتك؟',
        understanding: 'أفهم...',
        processing: 'جاري المعالجة...',
        clarification: 'يرجى التحديد أكثر',
        suggestion: 'هل تريد تجربة هذا؟',
        confirmation: 'هل أنت متأكد أنك تريد القيام بذلك؟',
        result: 'النتيجة',
        nextSteps: 'الخطوات التالية',
        alternatives: 'بدائل',
      },
      errors: {
        platformNotFound: 'المنصة غير موجودة',
        invalidCommand: 'أمر غير صالح',
        syncError: 'خطأ في المزامنة',
        uploadError: 'خطأ في الرفع',
        networkError: 'خطأ في الشبكة',
        permissionError: 'خطأ في الإذن',
        unknownError: 'خطأ غير معروف',
        retryLater: 'يرجى المحاولة مرة أخرى لاحقا',
        contactSupport: 'اتصل بفريق الدعم',
      },
      time: {
        now: 'الآن',
        today: 'اليوم',
        tomorrow: 'غدا',
        yesterday: 'أمس',
        minutes: 'دقائق',
        hours: 'ساعات',
        days: 'أيام',
        weeks: 'أسابيع',
        months: 'أشهر',
        years: 'سنوات',
        ago: 'منذ',
        later: 'لاحقا',
        soon: 'قريبا',
        recently: 'مؤخرا',
      },
    },
    de: {
      common: {
        greeting: 'Hallo',
        goodbye: 'Auf Wiedersehen',
        yes: 'Ja',
        no: 'Nein',
        cancel: 'Abbrechen',
        confirm: 'Bestätigen',
        loading: 'Wird geladen...',
        error: 'Fehler',
        success: 'Erfolg',
        warning: 'Warnung',
        info: 'Info',
      },
      actions: {
        brandSync: 'Markensynchronisation',
        categorySync: 'Kategoriesynchronisation',
        attributeSync: 'Attributsynchronisation',
        productUpload: 'Produkt-Upload',
        variantManage: 'Variantenverwaltung',
        bulkUpload: 'Massen-Upload',
        syncStarted: 'Synchronisation gestartet',
        syncCompleted: 'Synchronisation abgeschlossen',
        syncFailed: 'Synchronisation fehlgeschlagen',
        uploadStarted: 'Upload gestartet',
        uploadCompleted: 'Upload abgeschlossen',
        uploadFailed: 'Upload fehlgeschlagen',
      },
      platforms: {
        TRENDYOL: 'Trendyol',
        AMAZON: 'Amazon',
        HEPSIBURADA: 'Hepsiburada',
        N11: 'N11',
        CICEKSEPETI: 'Cicek Sepeti',
        PTTAVM: 'PTT AVM',
        GITTIGIDIYOR: 'GittiGidiyor',
        MORHIPO: 'Morhipo',
        ALIBABA: 'Alibaba',
        ALIEXPRESS: 'AliExpress',
        SHOPEE: 'Shopee',
        EBAY: 'eBay',
        ETSY: 'Etsy',
        WALMART: 'Walmart',
        LAZADA: 'Lazada',
      },
      assistant: {
        welcome: 'Willkommen beim Sopyo AI Assistant!',
        help: 'Wie kann ich Ihnen helfen?',
        understanding: 'Ich verstehe...',
        processing: 'Wird verarbeitet...',
        clarification: 'Bitte spezifizieren Sie mehr',
        suggestion: 'Möchten Sie dies versuchen?',
        confirmation: 'Sind Sie sicher, dass Sie dies tun möchten?',
        result: 'Ergebnis',
        nextSteps: 'Nächste Schritte',
        alternatives: 'Alternativen',
      },
      errors: {
        platformNotFound: 'Plattform nicht gefunden',
        invalidCommand: 'Ungültiger Befehl',
        syncError: 'Synchronisationsfehler',
        uploadError: 'Upload-Fehler',
        networkError: 'Netzwerkfehler',
        permissionError: 'Berechtigungsfehler',
        unknownError: 'Unbekannter Fehler',
        retryLater: 'Bitte versuchen Sie es später erneut',
        contactSupport: 'Kontaktieren Sie das Support-Team',
      },
      time: {
        now: 'jetzt',
        today: 'heute',
        tomorrow: 'morgen',
        yesterday: 'gestern',
        minutes: 'Minuten',
        hours: 'Stunden',
        days: 'Tage',
        weeks: 'Wochen',
        months: 'Monate',
        years: 'Jahre',
        ago: 'vor',
        later: 'später',
        soon: 'bald',
        recently: 'kürzlich',
      },
    },
    fr: {
      common: {
        greeting: 'Bonjour',
        goodbye: 'Au revoir',
        yes: 'Oui',
        no: 'Non',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        warning: 'Avertissement',
        info: 'Info',
      },
      actions: {
        brandSync: 'Synchronisation des marques',
        categorySync: 'Synchronisation des catégories',
        attributeSync: 'Synchronisation des attributs',
        productUpload: 'Téléchargement de produit',
        variantManage: 'Gestion des variantes',
        bulkUpload: 'Téléchargement en masse',
        syncStarted: 'Synchronisation démarrée',
        syncCompleted: 'Synchronisation terminée',
        syncFailed: 'Synchronisation échouée',
        uploadStarted: 'Téléchargement démarré',
        uploadCompleted: 'Téléchargement terminé',
        uploadFailed: 'Téléchargement échoué',
      },
      platforms: {
        TRENDYOL: 'Trendyol',
        AMAZON: 'Amazon',
        HEPSIBURADA: 'Hepsiburada',
        N11: 'N11',
        CICEKSEPETI: 'Cicek Sepeti',
        PTTAVM: 'PTT AVM',
        GITTIGIDIYOR: 'GittiGidiyor',
        MORHIPO: 'Morhipo',
        ALIBABA: 'Alibaba',
        ALIEXPRESS: 'AliExpress',
        SHOPEE: 'Shopee',
        EBAY: 'eBay',
        ETSY: 'Etsy',
        WALMART: 'Walmart',
        LAZADA: 'Lazada',
      },
      assistant: {
        welcome: "Bienvenue dans l'Assistant AI Sopyo!",
        help: 'Comment puis-je vous aider?',
        understanding: 'Je comprends...',
        processing: 'Traitement en cours...',
        clarification: 'Veuillez être plus spécifique',
        suggestion: 'Voulez-vous essayer ceci?',
        confirmation: 'Êtes-vous sûr de vouloir faire ceci?',
        result: 'Résultat',
        nextSteps: 'Prochaines étapes',
        alternatives: 'Alternatives',
      },
      errors: {
        platformNotFound: 'Plateforme non trouvée',
        invalidCommand: 'Commande invalide',
        syncError: 'Erreur de synchronisation',
        uploadError: 'Erreur de téléchargement',
        networkError: 'Erreur réseau',
        permissionError: 'Erreur de permission',
        unknownError: 'Erreur inconnue',
        retryLater: 'Veuillez réessayer plus tard',
        contactSupport: "Contactez l'équipe de support",
      },
      time: {
        now: 'maintenant',
        today: "aujourd'hui",
        tomorrow: 'demain',
        yesterday: 'hier',
        minutes: 'minutes',
        hours: 'heures',
        days: 'jours',
        weeks: 'semaines',
        months: 'mois',
        years: 'années',
        ago: 'il y a',
        later: 'plus tard',
        soon: 'bientôt',
        recently: 'récemment',
      },
    },
    es: {
      common: {
        greeting: 'Hola',
        goodbye: 'Adiós',
        yes: 'Sí',
        no: 'No',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        warning: 'Advertencia',
        info: 'Info',
      },
      actions: {
        brandSync: 'Sincronización de marca',
        categorySync: 'Sincronización de categoría',
        attributeSync: 'Sincronización de atributo',
        productUpload: 'Subida de producto',
        variantManage: 'Gestión de variantes',
        bulkUpload: 'Subida masiva',
        syncStarted: 'Sincronización iniciada',
        syncCompleted: 'Sincronización completada',
        syncFailed: 'Sincronización fallida',
        uploadStarted: 'Subida iniciada',
        uploadCompleted: 'Subida completada',
        uploadFailed: 'Subida fallida',
      },
      platforms: {
        TRENDYOL: 'Trendyol',
        AMAZON: 'Amazon',
        HEPSIBURADA: 'Hepsiburada',
        N11: 'N11',
        CICEKSEPETI: 'Cicek Sepeti',
        PTTAVM: 'PTT AVM',
        GITTIGIDIYOR: 'GittiGidiyor',
        MORHIPO: 'Morhipo',
        ALIBABA: 'Alibaba',
        ALIEXPRESS: 'AliExpress',
        SHOPEE: 'Shopee',
        EBAY: 'eBay',
        ETSY: 'Etsy',
        WALMART: 'Walmart',
        LAZADA: 'Lazada',
      },
      assistant: {
        welcome: '¡Bienvenido al Asistente AI Sopyo!',
        help: '¿Cómo puedo ayudarte?',
        understanding: 'Entiendo...',
        processing: 'Procesando...',
        clarification: 'Por favor sé más específico',
        suggestion: '¿Te gustaría probar esto?',
        confirmation: '¿Estás seguro de que quieres hacer esto?',
        result: 'Resultado',
        nextSteps: 'Próximos pasos',
        alternatives: 'Alternativas',
      },
      errors: {
        platformNotFound: 'Plataforma no encontrada',
        invalidCommand: 'Comando inválido',
        syncError: 'Error de sincronización',
        uploadError: 'Error de subida',
        networkError: 'Error de red',
        permissionError: 'Error de permiso',
        unknownError: 'Error desconocido',
        retryLater: 'Por favor intenta de nuevo más tarde',
        contactSupport: 'Contacta al equipo de soporte',
      },
      time: {
        now: 'ahora',
        today: 'hoy',
        tomorrow: 'mañana',
        yesterday: 'ayer',
        minutes: 'minutos',
        hours: 'horas',
        days: 'días',
        weeks: 'semanas',
        months: 'meses',
        years: 'años',
        ago: 'hace',
        later: 'después',
        soon: 'pronto',
        recently: 'recientemente',
      },
    },
    ru: {
      common: {
        greeting: 'Привет',
        goodbye: 'До свидания',
        yes: 'Да',
        no: 'Нет',
        cancel: 'Отмена',
        confirm: 'Подтвердить',
        loading: 'Загрузка...',
        error: 'Ошибка',
        success: 'Успех',
        warning: 'Предупреждение',
        info: 'Инфо',
      },
      actions: {
        brandSync: 'Синхронизация брендов',
        categorySync: 'Синхронизация категорий',
        attributeSync: 'Синхронизация атрибутов',
        productUpload: 'Загрузка продукта',
        variantManage: 'Управление вариантами',
        bulkUpload: 'Массовая загрузка',
        syncStarted: 'Синхронизация начата',
        syncCompleted: 'Синхронизация завершена',
        syncFailed: 'Синхронизация не удалась',
        uploadStarted: 'Загрузка начата',
        uploadCompleted: 'Загрузка завершена',
        uploadFailed: 'Загрузка не удалась',
      },
      platforms: {
        TRENDYOL: 'Trendyol',
        AMAZON: 'Amazon',
        HEPSIBURADA: 'Hepsiburada',
        N11: 'N11',
        CICEKSEPETI: 'Cicek Sepeti',
        PTTAVM: 'PTT AVM',
        GITTIGIDIYOR: 'GittiGidiyor',
        MORHIPO: 'Morhipo',
        ALIBABA: 'Alibaba',
        ALIEXPRESS: 'AliExpress',
        SHOPEE: 'Shopee',
        EBAY: 'eBay',
        ETSY: 'Etsy',
        WALMART: 'Walmart',
        LAZADA: 'Lazada',
      },
      assistant: {
        welcome: 'Добро пожаловать в AI помощник Sopyo!',
        help: 'Как я могу помочь?',
        understanding: 'Понимаю...',
        processing: 'Обработка...',
        clarification: 'Пожалуйста, уточните',
        suggestion: 'Хотите попробовать это?',
        confirmation: 'Вы уверены, что хотите это сделать?',
        result: 'Результат',
        nextSteps: 'Следующие шаги',
        alternatives: 'Альтернативы',
      },
      errors: {
        platformNotFound: 'Платформа не найдена',
        invalidCommand: 'Неверная команда',
        syncError: 'Ошибка синхронизации',
        uploadError: 'Ошибка загрузки',
        networkError: 'Ошибка сети',
        permissionError: 'Ошибка доступа',
        unknownError: 'Неизвестная ошибка',
        retryLater: 'Пожалуйста, попробуйте позже',
        contactSupport: 'Свяжитесь с поддержкой',
      },
      time: {
        now: 'сейчас',
        today: 'сегодня',
        tomorrow: 'завтра',
        yesterday: 'вчера',
        minutes: 'минут',
        hours: 'часов',
        days: 'дней',
        weeks: 'недель',
        months: 'месяцев',
        years: 'лет',
        ago: 'назад',
        later: 'позже',
        soon: 'скоро',
        recently: 'недавно',
      },
    },
  };

  // Default context
  private defaultContext: I18nContext = {
    language: 'tr',
    timezone: 'Europe/Istanbul',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'tr-TR',
    currency: 'TRY',
  };

  /**
   * Get translation by key
   */
  translate(
    key: string,
    language?: SupportedLanguage,
    params?: Record<string, string>,
  ): string {
    const lang = language || this.defaultContext.language;
    const translation = this.getNestedValue(this.translations[lang], key);

    if (!translation || typeof translation !== 'string') {
      // Fallback to English
      const fallback = this.getNestedValue(this.translations.en, key);
      if (fallback && typeof fallback === 'string') {
        return this.interpolate(fallback, params);
      }
      return key;
    }

    return this.interpolate(translation, params);
  }

  /**
   * Get all translations for a language
   */
  getTranslations(language: SupportedLanguage): Translation {
    return this.translations[language];
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Array<{
    code: SupportedLanguage;
    name: string;
    nativeName: string;
  }> {
    return [
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    ];
  }

  /**
   * Set default language
   */
  setDefaultLanguage(language: SupportedLanguage): void {
    this.defaultContext.language = language;
  }

  /**
   * Get default context
   */
  getContext(): I18nContext {
    return { ...this.defaultContext };
  }

  /**
   * Format date according to language/locale
   */
  formatDate(
    date: Date,
    language?: SupportedLanguage,
    format?: string,
  ): string {
    const lang = language || this.defaultContext.language;
    const locale = this.getLocale(lang);

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  /**
   * Format number according to language/locale
   */
  formatNumber(
    number: number,
    language?: SupportedLanguage,
    options?: Intl.NumberFormatOptions,
  ): string {
    const lang = language || this.defaultContext.language;
    const locale = this.getLocale(lang);

    return new Intl.NumberFormat(locale, options).format(number);
  }

  /**
   * Format currency
   */
  formatCurrency(
    amount: number,
    currency?: string,
    language?: SupportedLanguage,
  ): string {
    const lang = language || this.defaultContext.language;
    const curr = currency || this.defaultContext.currency;
    const locale = this.getLocale(lang);

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
    }).format(amount);
  }

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  getRelativeTime(date: Date, language?: SupportedLanguage): string {
    const lang = language || this.defaultContext.language;
    const locale = this.getLocale(lang);

    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / 1000 / 60),
      'minute',
    );
  }

  /**
   * Detect language from text
   */
  detectLanguage(text: string): SupportedLanguage {
    // Simple detection based on common words
    const patterns: Record<SupportedLanguage, RegExp[]> = {
      tr: [/\b(merhaba|nasıl|yardım|eşitle|yükle|tamam|teşekkür)\b/i],
      en: [/\b(hello|how|help|sync|upload|ok|thanks)\b/i],
      ar: [/[؀-ۿ]/],
      de: [/\b(hallo|wie|hilfe|synchronisieren|hochladen|danke)\b/i],
      fr: [/\b(bonjour|comment|aide|synchroniser|télécharger|merci)\b/i],
      es: [/\b(hola|cómo|ayuda|sincronizar|subir|gracias)\b/i],
      ru: [/[Ѐ-ӿ]/],
    };

    for (const [lang, regexes] of Object.entries(patterns)) {
      if (regexes.some((regex) => regex.test(text))) {
        return lang as SupportedLanguage;
      }
    }

    return this.defaultContext.language;
  }

  // ==================== PRIVATE METHODS ====================

  private getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  private interpolate(text: string, params?: Record<string, string>): string {
    if (!params) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] || match;
    });
  }

  private getLocale(language: SupportedLanguage): string {
    const localeMap: Record<SupportedLanguage, string> = {
      tr: 'tr-TR',
      en: 'en-US',
      ar: 'ar-SA',
      de: 'de-DE',
      fr: 'fr-FR',
      es: 'es-ES',
      ru: 'ru-RU',
    };

    return localeMap[language];
  }
}
