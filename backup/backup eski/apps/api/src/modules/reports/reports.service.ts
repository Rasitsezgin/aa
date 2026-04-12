import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'yearly';
export type PlanType = 'professional' | 'enterprise';

export interface ReportData {
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  storeName: string;
  storeId: string;
  planType: PlanType;
  
  // Özet Metrikleri
  summary: {
    totalRevenue: number;
    previousRevenue: number;
    revenueChange: number;
    totalOrders: number;
    previousOrders: number;
    ordersChange: number;
    totalProducts: number;
    activeProducts: number;
    avgOrderValue: number;
    previousAvgOrder: number;
    avgOrderChange: number;
    conversionRate: number;
    previousConversion: number;
    conversionChange: number;
  };

  // Pazaryeri Performansı
  marketplaces: {
    name: string;
    logo: string;
    revenue: number;
    orders: number;
    products: number;
    rating: number;
    growth: number;
    topProducts: { name: string; sales: number; revenue: number }[];
  }[];

  // En Çok Satan Ürünler
  topProducts: {
    rank: number;
    name: string;
    sku: string;
    image?: string;
    totalSales: number;
    revenue: number;
    marketplace: string;
    growth: number;
    stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  }[];

  // Düşük Performanslı Ürünler
  lowPerformers: {
    name: string;
    sku: string;
    views: number;
    sales: number;
    conversionRate: number;
    recommendation: string;
  }[];

  // Stok Analizi
  inventory: {
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    overstockCount: number;
    turnoverRate: number;
    alerts: { product: string; currentStock: number; avgDailySales: number; daysUntilStockout: number }[];
  };

  // Kategori Performansı
  categories: {
    name: string;
    revenue: number;
    percentage: number;
    growth: number;
    productCount: number;
  }[];

  // Zaman Bazlı Analiz
  timeline: {
    labels: string[];
    revenue: number[];
    orders: number[];
  };

  // Müşteri Analizi (Kurumsal için)
  customers?: {
    newCustomers: number;
    returningCustomers: number;
    avgLifetimeValue: number;
    topCustomers: { name: string; orders: number; totalSpent: number }[];
    satisfactionScore: number;
  };

  // Rakip Analizi (Kurumsal için)
  competitors?: {
    marketShare: number;
    priceComparison: { category: string; yourAvg: number; marketAvg: number; difference: number }[];
    rankingChanges: { keyword: string; yourRank: number; previousRank: number; topCompetitor: string }[];
  };

  // AI Önerileri
  aiRecommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    potentialImpact: string;
    action: string;
  }[];

  // Hedefler ve İlerleme
  goals: {
    name: string;
    target: number;
    current: number;
    percentage: number;
    status: 'on_track' | 'at_risk' | 'behind';
  }[];
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Rapor periyoduna göre tarih aralığı hesapla
   */
  getDateRange(period: ReportPeriod): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarterly':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'semi-annual':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case 'yearly':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    return { startDate, endDate };
  }

  /**
   * Mağaza analiz raporu oluştur
   */
  async generateReport(storeId: string, period: ReportPeriod, planType: PlanType): Promise<ReportData> {
    const { startDate, endDate } = this.getDateRange(period);
    
    // Demo data - gerçek uygulamada veritabanından çekilecek
    const report: ReportData = {
      period,
      startDate,
      endDate,
      storeName: 'Demo Mağaza',
      storeId,
      planType,

      summary: {
        totalRevenue: 487650,
        previousRevenue: 425800,
        revenueChange: 14.5,
        totalOrders: 1247,
        previousOrders: 1089,
        ordersChange: 14.5,
        totalProducts: 856,
        activeProducts: 742,
        avgOrderValue: 391,
        previousAvgOrder: 391,
        avgOrderChange: 0,
        conversionRate: 3.8,
        previousConversion: 3.2,
        conversionChange: 18.7,
      },

      marketplaces: [
        {
          name: 'Trendyol',
          logo: 'trendyol',
          revenue: 245000,
          orders: 628,
          products: 412,
          rating: 4.8,
          growth: 18.5,
          topProducts: [
            { name: 'Bluetooth Kulaklık Pro', sales: 145, revenue: 43500 },
            { name: 'Akıllı Saat X200', sales: 89, revenue: 35600 },
            { name: 'Kablosuz Şarj Cihazı', sales: 234, revenue: 23400 },
          ],
        },
        {
          name: 'Hepsiburada',
          logo: 'hepsiburada',
          revenue: 156000,
          orders: 398,
          products: 356,
          rating: 4.6,
          growth: 12.3,
          topProducts: [
            { name: 'Laptop Standı Ergonomik', sales: 112, revenue: 22400 },
            { name: 'USB-C Hub 7in1', sales: 87, revenue: 17400 },
            { name: 'Mekanik Klavye RGB', sales: 65, revenue: 16250 },
          ],
        },
        {
          name: 'Amazon',
          logo: 'amazon',
          revenue: 86650,
          orders: 221,
          products: 198,
          rating: 4.7,
          growth: 8.9,
          topProducts: [
            { name: 'Webcam 4K Pro', sales: 56, revenue: 14000 },
            { name: 'Mikrofon Stüdyo', sales: 43, revenue: 12900 },
            { name: 'LED Masa Lambası', sales: 89, revenue: 8900 },
          ],
        },
      ],

      topProducts: [
        { rank: 1, name: 'Bluetooth Kulaklık Pro X3', sku: 'BT-KLK-X3', totalSales: 289, revenue: 86700, marketplace: 'Trendyol', growth: 45.2, stockStatus: 'in_stock' },
        { rank: 2, name: 'Akıllı Saat Premium', sku: 'AS-PRM-01', totalSales: 198, revenue: 79200, marketplace: 'Hepsiburada', growth: 32.1, stockStatus: 'in_stock' },
        { rank: 3, name: 'Kablosuz Mouse Ergonomik', sku: 'KM-ERG-01', totalSales: 456, revenue: 45600, marketplace: 'Amazon', growth: 28.5, stockStatus: 'low_stock' },
        { rank: 4, name: 'USB-C Dock Station', sku: 'USB-DCK-01', totalSales: 167, revenue: 41750, marketplace: 'Trendyol', growth: 22.3, stockStatus: 'in_stock' },
        { rank: 5, name: 'Webcam 4K Ultra', sku: 'WC-4K-01', totalSales: 134, revenue: 40200, marketplace: 'Amazon', growth: 18.9, stockStatus: 'in_stock' },
        { rank: 6, name: 'Mekanik Klavye Pro', sku: 'MK-PRO-01', totalSales: 145, revenue: 36250, marketplace: 'Hepsiburada', growth: 15.6, stockStatus: 'in_stock' },
        { rank: 7, name: 'Monitör Standı Ayarlanabilir', sku: 'MS-ADJ-01', totalSales: 234, revenue: 35100, marketplace: 'Trendyol', growth: 12.4, stockStatus: 'in_stock' },
        { rank: 8, name: 'Laptop Soğutucu', sku: 'LS-CLR-01', totalSales: 312, revenue: 31200, marketplace: 'Hepsiburada', growth: 8.7, stockStatus: 'low_stock' },
        { rank: 9, name: 'Kablo Düzenleyici Set', sku: 'KD-SET-01', totalSales: 567, revenue: 28350, marketplace: 'Amazon', growth: 5.2, stockStatus: 'in_stock' },
        { rank: 10, name: 'LED Strip Akıllı', sku: 'LED-AK-01', totalSales: 289, revenue: 26010, marketplace: 'Trendyol', growth: 3.8, stockStatus: 'out_of_stock' },
      ],

      lowPerformers: [
        { name: 'Eski Model Kulaklık', sku: 'EM-KLK-01', views: 1245, sales: 3, conversionRate: 0.24, recommendation: 'Fiyat indirimi veya kampanya önerilir' },
        { name: 'Standart USB Kablo', sku: 'USB-STD-01', views: 856, sales: 12, conversionRate: 1.4, recommendation: 'Bundle ürün olarak satışa sunulabilir' },
        { name: 'Mouse Pad Basic', sku: 'MP-BSC-01', views: 2341, sales: 45, conversionRate: 1.92, recommendation: 'Görsel ve açıklama güncellemesi yapılmalı' },
      ],

      inventory: {
        totalValue: 245680,
        lowStockCount: 23,
        outOfStockCount: 8,
        overstockCount: 12,
        turnoverRate: 4.2,
        alerts: [
          { product: 'Bluetooth Kulaklık Pro X3', currentStock: 15, avgDailySales: 8, daysUntilStockout: 2 },
          { product: 'Kablosuz Mouse Ergonomik', currentStock: 28, avgDailySales: 12, daysUntilStockout: 2 },
          { product: 'Laptop Soğutucu', currentStock: 45, avgDailySales: 10, daysUntilStockout: 5 },
        ],
      },

      categories: [
        { name: 'Elektronik Aksesuarlar', revenue: 186500, percentage: 38.2, growth: 22.5, productCount: 234 },
        { name: 'Bilgisayar Çevre Birimleri', revenue: 145200, percentage: 29.8, growth: 15.8, productCount: 189 },
        { name: 'Akıllı Cihazlar', revenue: 98400, percentage: 20.2, growth: 28.3, productCount: 87 },
        { name: 'Kablolar ve Adaptörler', revenue: 57550, percentage: 11.8, growth: 8.4, productCount: 346 },
      ],

      timeline: {
        labels: this.getTimelineLabels(period),
        revenue: this.generateRandomData(period, 30000, 60000),
        orders: this.generateRandomData(period, 30, 80),
      },

      aiRecommendations: [
        {
          priority: 'high',
          category: 'Stok',
          title: 'Acil Stok Yenileme Gerekli',
          description: '3 ürününüz 48 saat içinde tükenecek. Bluetooth Kulaklık Pro X3 ve Kablosuz Mouse için acil sipariş verin.',
          potentialImpact: 'Tahmini ₺45,000 kayıp önlenebilir',
          action: 'Tedarikçi siparişi oluştur',
        },
        {
          priority: 'high',
          category: 'Fiyatlandırma',
          title: 'Fiyat Optimizasyonu Fırsatı',
          description: 'Akıllı Saat Premium ürününüz rakiplerinizden %12 daha ucuz. Fiyat artışı yapılabilir.',
          potentialImpact: 'Aylık ₺8,500 ek gelir',
          action: 'Fiyatı güncelle',
        },
        {
          priority: 'medium',
          category: 'Pazarlama',
          title: 'Kampanya Önerisi',
          description: 'Hafta sonu satışlarınız %35 düşük. Cuma-Pazar arası flash indirim kampanyası önerilir.',
          potentialImpact: '%25 satış artışı bekleniyor',
          action: 'Kampanya oluştur',
        },
        {
          priority: 'medium',
          category: 'Ürün',
          title: 'Yeni Pazaryeri Fırsatı',
          description: 'N11 pazaryerinde kategorinizde düşük rekabet tespit edildi. Mağaza açmanız önerilir.',
          potentialImpact: 'Aylık ₺35,000 ek satış potansiyeli',
          action: 'N11 entegrasyonu',
        },
        {
          priority: 'low',
          category: 'Optimizasyon',
          title: 'Ürün Görselleri Güncellemesi',
          description: '45 ürününüzün görselleri 360° görüntüleme ile güncellenebilir.',
          potentialImpact: '%15 dönüşüm artışı',
          action: 'Görselleri güncelle',
        },
      ],

      goals: [
        { name: 'Aylık Satış Hedefi', target: 500000, current: 487650, percentage: 97.5, status: 'on_track' },
        { name: 'Yeni Müşteri Hedefi', target: 500, current: 423, percentage: 84.6, status: 'at_risk' },
        { name: 'Ortalama Sipariş Değeri', target: 400, current: 391, percentage: 97.8, status: 'on_track' },
        { name: 'Müşteri Memnuniyeti', target: 4.8, current: 4.7, percentage: 97.9, status: 'on_track' },
      ],
    };

    // Kurumsal plan için ek veriler
    if (planType === 'enterprise') {
      report.customers = {
        newCustomers: 423,
        returningCustomers: 824,
        avgLifetimeValue: 2450,
        topCustomers: [
          { name: 'ABC Teknoloji Ltd.', orders: 45, totalSpent: 125600 },
          { name: 'XYZ E-Ticaret', orders: 38, totalSpent: 98400 },
          { name: 'Demo Şirketi', orders: 32, totalSpent: 87200 },
        ],
        satisfactionScore: 4.7,
      };

      report.competitors = {
        marketShare: 12.5,
        priceComparison: [
          { category: 'Kulaklık', yourAvg: 299, marketAvg: 325, difference: -8 },
          { category: 'Akıllı Saat', yourAvg: 450, marketAvg: 420, difference: 7.1 },
          { category: 'Mouse', yourAvg: 120, marketAvg: 115, difference: 4.3 },
        ],
        rankingChanges: [
          { keyword: 'bluetooth kulaklık', yourRank: 3, previousRank: 5, topCompetitor: 'TechStore' },
          { keyword: 'akıllı saat', yourRank: 7, previousRank: 12, topCompetitor: 'GadgetWorld' },
          { keyword: 'gaming mouse', yourRank: 2, previousRank: 2, topCompetitor: 'GameZone' },
        ],
      };
    }

    return report;
  }

  private getTimelineLabels(period: ReportPeriod): string[] {
    switch (period) {
      case 'daily':
        return ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
      case 'weekly':
        return ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
      case 'monthly':
        return ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta'];
      case 'quarterly':
        return ['1. Ay', '2. Ay', '3. Ay'];
      case 'semi-annual':
        return ['1. Ay', '2. Ay', '3. Ay', '4. Ay', '5. Ay', '6. Ay'];
      case 'yearly':
        return ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      default:
        return [];
    }
  }

  private generateRandomData(period: ReportPeriod, min: number, max: number): number[] {
    const length = this.getTimelineLabels(period).length;
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min) + min));
  }

  /**
   * Periyot adını Türkçe olarak döndür
   */
  getPeriodName(period: ReportPeriod): string {
    const names: Record<ReportPeriod, string> = {
      daily: 'Günlük',
      weekly: 'Haftalık',
      monthly: 'Aylık',
      quarterly: '3 Aylık',
      'semi-annual': '6 Aylık',
      yearly: 'Yıllık',
    };
    return names[period];
  }

  /**
   * Plana göre kullanılabilir rapor periyotlarını döndür
   */
  getAvailablePeriods(planType: PlanType): ReportPeriod[] {
    if (planType === 'enterprise') {
      return ['daily', 'weekly', 'monthly', 'quarterly', 'semi-annual', 'yearly'];
    }
    // Professional plan
    return ['weekly', 'monthly', 'quarterly', 'yearly'];
  }
}
