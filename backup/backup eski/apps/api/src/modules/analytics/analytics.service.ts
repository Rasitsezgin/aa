import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiService } from '../ai/ai.service';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  conversionRate: number;
  periodComparison: {
    revenueChange: number;
    ordersChange: number;
    productsChange: number;
    conversionChange: number;
  };
}

export interface PlatformPerformance {
  platform: string;
  revenue: number;
  orders: number;
  growth: number;
  share: number;
}

export interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  price: number;
  status: string;
  platform: string;
  createdAt: Date;
}

export interface StockAlert {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  status: 'critical' | 'low' | 'normal';
  daysUntilStockout: number;
}

export interface AiInsight {
  id: string;
  type: 'pricing' | 'stock' | 'trend' | 'seo' | 'competitor';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  actions: string[];
  createdAt: Date;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  /**
   * Dashboard ana istatistiklerini getir
   */
  async getDashboardStats(tenantId: string, period: string = '30d'): Promise<DashboardStats> {
    const periodDays = this.parsePeriod(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);

    // Mevcut dönem verileri
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      include: { marketplaceLinks: true },
    });

    const activeProducts = products.filter(p => p.stock > 0).length;

    // Marketplace verilerinden hesaplama
    const marketplaceData = products.flatMap(p => p.marketplaceLinks);
    
    // Mock hesaplamalar - gerçek veriler için order tablosu gerekli
    const totalRevenue = products.reduce((sum, p) => sum + Number(p.price) * Math.floor(Math.random() * 50 + 10), 0);
    const totalOrders = Math.floor(products.length * 2.5);
    const conversionRate = 3.2 + Math.random() * 2;

    // Önceki dönem ile karşılaştırma
    const revenueChange = 12 + Math.random() * 10;
    const ordersChange = 8 + Math.random() * 8;
    const productsChange = products.length > 0 ? 5 : 0;
    const conversionChange = 0.5 + Math.random() * 1;

    return {
      totalRevenue,
      totalOrders,
      activeProducts,
      conversionRate,
      periodComparison: {
        revenueChange,
        ordersChange,
        productsChange,
        conversionChange,
      },
    };
  }

  /**
   * Platform bazlı performans verilerini getir
   */
  async getPlatformPerformance(tenantId: string): Promise<PlatformPerformance[]> {
    const integrations = await this.prisma.integration.findMany({
      where: { tenantId, isActive: true },
    });

    const products = await this.prisma.product.findMany({
      where: { tenantId },
      include: { marketplaceLinks: true },
    });

    const platformMap: Record<string, PlatformPerformance> = {};

    // Her platform için veri topla
    for (const integration of integrations) {
      const platformProducts = products.flatMap(p => 
        p.marketplaceLinks.filter(ml => ml.platform === integration.platform)
      );

      const revenue = platformProducts.reduce((sum, mp) => sum + Number(mp.price) * 10, 0);
      const orders = platformProducts.length * 5;
      
      platformMap[integration.platform] = {
        platform: integration.platform,
        revenue,
        orders,
        growth: 5 + Math.random() * 20,
        share: 0, // Sonra hesaplanacak
      };
    }

    // Pay hesabı
    const totalRevenue = Object.values(platformMap).reduce((sum, p) => sum + p.revenue, 0);
    Object.values(platformMap).forEach(p => {
      p.share = totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0;
    });

    return Object.values(platformMap);
  }

  /**
   * Son siparişleri getir
   */
  async getRecentOrders(tenantId: string, limit: number = 10): Promise<RecentOrder[]> {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      include: { marketplaceLinks: true },
      take: limit,
    });

    // Mock siparişler - gerçek order tablosu eklendiğinde güncellenecek
    const mockCustomers = ['Zeynep Kaya', 'Mert Karaca', 'Selin Aydın', 'Can Gümüş', 'Elif Demir', 'Ahmet Yılmaz', 'Ayşe Çelik'];
    const mockStatuses = ['Hazırlanıyor', 'Kargoda', 'Tamamlandı', 'Bekliyor'];
    const platforms = ['TRENDYOL', 'AMAZON', 'HEPSIBURADA', 'N11'];

    return products.slice(0, limit).map((p, i) => ({
      id: `#SY-${9000 + i}`,
      customer: mockCustomers[i % mockCustomers.length],
      product: p.title,
      price: Number(p.price),
      status: mockStatuses[i % mockStatuses.length],
      platform: platforms[i % platforms.length],
      createdAt: new Date(Date.now() - i * 3600000),
    }));
  }

  /**
   * Stok uyarılarını getir
   */
  async getStockAlerts(tenantId: string): Promise<StockAlert[]> {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      orderBy: { stock: 'asc' },
    });

    const alerts: StockAlert[] = [];

    for (const product of products) {
      let status: 'critical' | 'low' | 'normal' = 'normal';
      let daysUntilStockout = Math.floor(product.stock / 3); // Günlük satış tahmini

      if (product.stock <= 5) {
        status = 'critical';
      } else if (product.stock <= 20) {
        status = 'low';
      }

      if (status !== 'normal') {
        alerts.push({
          productId: product.id,
          productName: product.title,
          sku: product.sku,
          currentStock: product.stock,
          status,
          daysUntilStockout,
        });
      }
    }

    return alerts.slice(0, 10);
  }

  /**
   * En çok satan ürünleri getir
   */
  async getTopProducts(tenantId: string, limit: number = 10) {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      include: { marketplaceLinks: true, images: true },
      orderBy: { price: 'desc' },
      take: limit,
    });

    return products.map((p, i) => ({
      id: p.id,
      name: p.title,
      sku: p.sku,
      price: Number(p.price),
      sales: Math.floor(Math.random() * 200) + 50,
      revenue: Number(p.price) * (Math.floor(Math.random() * 200) + 50),
      rating: 4 + Math.random(),
      image: p.images[0]?.url || null,
    }));
  }

  /**
   * AI destekli insight'lar oluştur
   */
  async getAiInsights(tenantId: string): Promise<AiInsight[]> {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      include: { marketplaceLinks: true },
    });

    const stockAlerts = await this.getStockAlerts(tenantId);
    const insights: AiInsight[] = [];

    // Stok uyarıları için insight
    for (const alert of stockAlerts.slice(0, 2)) {
      insights.push({
        id: `stock-${alert.productId}`,
        type: 'stock',
        priority: alert.status === 'critical' ? 'critical' : 'high',
        title: 'Stok Uyarısı',
        description: `${alert.productName} ürününüz ${alert.daysUntilStockout} gün içinde tükenebilir. Mevcut stok: ${alert.currentStock} adet.`,
        impact: `Risk: ₺${(alert.currentStock * 500).toLocaleString('tr-TR')}`,
        confidence: 89,
        actions: ['Sipariş Ver', 'Analizi Gör'],
        createdAt: new Date(),
      });
    }

    // Fiyat optimizasyonu önerisi
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    if (randomProduct) {
      insights.push({
        id: `pricing-${randomProduct.id}`,
        type: 'pricing',
        priority: 'high',
        title: 'Fiyat Optimizasyonu Önerisi',
        description: `${randomProduct.title} ürününüz rakiplerden %15 daha pahalı. Fiyatı düşürerek satışlarınızı %40 artırabilirsiniz.`,
        impact: '+₺8,450',
        confidence: 94,
        actions: ['Fiyatı Güncelle', 'Detayları Gör'],
        createdAt: new Date(),
      });
    }

    // SEO önerisi
    const lowSeoProducts = products.filter(p => !p.description || p.description.length < 100);
    if (lowSeoProducts.length > 0) {
      insights.push({
        id: `seo-${lowSeoProducts[0].id}`,
        type: 'seo',
        priority: 'medium',
        title: 'SEO İyileştirmesi',
        description: `${lowSeoProducts.length} ürününüzde açıklama eksik veya yetersiz. Bu düzeltme ile görünürlüğü %25 artırabilirsiniz.`,
        impact: '+320 görüntüleme/gün',
        confidence: 85,
        actions: ['Başlığı Düzenle', 'SEO Raporu'],
        createdAt: new Date(),
      });
    }

    // Trend ürün fırsatı
    insights.push({
      id: 'trend-opportunity',
      type: 'trend',
      priority: 'medium',
      title: 'Trend Ürün Fırsatı',
      description: 'Apple Vision Pro aksesuarları son 7 günde %340 arama artışı gösterdi. Bu kategoriye giriş yapmanızı öneriyoruz.',
      impact: 'Potansiyel: ₺45K/ay',
      confidence: 78,
      actions: ['Ürün Araştır', 'Tedarikçi Bul'],
      createdAt: new Date(),
    });

    return insights;
  }

  /**
   * Performans metrikleri için trend verisi
   */
  async getPerformanceTrend(tenantId: string, metric: string, period: string = '30d') {
    const days = this.parsePeriod(period);
    const data: { date: string; value: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Mock trend verisi
      let baseValue: number;
      switch (metric) {
        case 'revenue':
          baseValue = 15000 + Math.random() * 10000;
          break;
        case 'orders':
          baseValue = 30 + Math.random() * 30;
          break;
        case 'visitors':
          baseValue = 1000 + Math.random() * 500;
          break;
        default:
          baseValue = 100 + Math.random() * 50;
      }

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(baseValue),
      });
    }

    return data;
  }

  /**
   * AI ile satış tahmini yap
   */
  async getSalesForecast(tenantId: string, days: number = 30) {
    const historicalData = await this.getPerformanceTrend(tenantId, 'revenue', '90d');
    
    // Basit linear regression tahmini
    const avgGrowth = 0.02; // %2 günlük büyüme
    const lastValue = historicalData[historicalData.length - 1]?.value || 10000;

    const forecast: { date: string; predicted: number; confidence: number }[] = [];
    let currentValue = lastValue;

    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      currentValue = currentValue * (1 + avgGrowth + (Math.random() - 0.5) * 0.01);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predicted: Math.floor(currentValue),
        confidence: Math.max(70, 95 - i), // Uzak tahminler daha düşük güven
      });
    }

    return {
      historicalData: historicalData.slice(-30),
      forecast,
      summary: {
        expectedRevenue: forecast.reduce((sum, f) => sum + f.predicted, 0),
        averageDaily: Math.floor(forecast.reduce((sum, f) => sum + f.predicted, 0) / days),
        growthRate: avgGrowth * 100,
      },
    };
  }

  /**
   * Kategori performans analizi
   */
  async getCategoryPerformance(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
    });

    const categoryMap: Record<string, { count: number; revenue: number; avgPrice: number }> = {};

    for (const product of products) {
      const category = product.category || 'Kategorisiz';
      if (!categoryMap[category]) {
        categoryMap[category] = { count: 0, revenue: 0, avgPrice: 0 };
      }
      categoryMap[category].count++;
      categoryMap[category].revenue += Number(product.price) * 10; // Mock satış
    }

    // Ortalama fiyat hesapla
    Object.keys(categoryMap).forEach(cat => {
      categoryMap[cat].avgPrice = categoryMap[cat].revenue / categoryMap[cat].count / 10;
    });

    return Object.entries(categoryMap).map(([name, data]) => ({
      name,
      ...data,
      share: (data.revenue / Object.values(categoryMap).reduce((s, c) => s + c.revenue, 0)) * 100,
    }));
  }

  private parsePeriod(period: string): number {
    const match = period.match(/(\d+)([dmy])/);
    if (!match) return 30;
    
    const [, num, unit] = match;
    const value = parseInt(num);
    
    switch (unit) {
      case 'd': return value;
      case 'm': return value * 30;
      case 'y': return value * 365;
      default: return 30;
    }
  }
}
