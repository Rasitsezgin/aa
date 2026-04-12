import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface PerformanceMetrics {
  period: string;
  sales: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  orders: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  revenue: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  customers: {
    total: number;
    newCustomers: number;
    change: number;
  };
  platforms: {
    name: string;
    sales: number;
    orders: number;
    percentage: number;
  }[];
}

@Injectable()
export class PerformanceService {
  constructor(private prisma: PrismaService) { }

  async getDashboardMetrics(tenantId: string): Promise<PerformanceMetrics> {
    // Demo veriler
    return {
      period: 'Bu Ay',
      sales: {
        total: 245890,
        change: 12.5,
        trend: 'up'
      },
      orders: {
        total: 1247,
        change: 8.3,
        trend: 'up'
      },
      revenue: {
        total: 198567,
        change: 15.2,
        trend: 'up'
      },
      customers: {
        total: 892,
        newCustomers: 45,
        change: 5.1
      },
      platforms: [
        { name: 'Trendyol', sales: 125000, orders: 567, percentage: 45 },
        { name: 'Hepsiburada', sales: 78000, orders: 342, percentage: 30 },
        { name: 'Amazon', sales: 35000, orders: 189, percentage: 15 },
        { name: 'N11', sales: 25000, orders: 149, percentage: 10 }
      ]
    };
  }

  async getSalesAnalytics(tenantId: string, period: string = '30d') {
    // Günlük satış verileri
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const salesData: any[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      salesData.push({
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 10000) + 5000,
        orders: Math.floor(Math.random() * 50) + 20,
        revenue: Math.floor(Math.random() * 8000) + 4000
      });
    }

    return {
      period,
      data: salesData,
      summary: {
        totalSales: salesData.reduce((a, b) => a + b.sales, 0),
        totalOrders: salesData.reduce((a, b) => a + b.orders, 0),
        totalRevenue: salesData.reduce((a, b) => a + b.revenue, 0),
        avgOrderValue: Math.floor(salesData.reduce((a, b) => a + b.sales, 0) / salesData.reduce((a, b) => a + b.orders, 0))
      }
    };
  }

  async getProductPerformance(tenantId: string, limit: number = 10) {
    // En iyi performans gösteren ürünler
    const products = [
      { id: 'PRD-001', name: 'Samsung Galaxy S24 Ultra', sales: 89, revenue: 3861111, rating: 4.8 },
      { id: 'PRD-002', name: 'iPhone 15 Pro Max', sales: 67, revenue: 4020000, rating: 4.9 },
      { id: 'PRD-003', name: 'Apple MacBook Pro M3', sales: 34, revenue: 3060000, rating: 4.7 },
      { id: 'PRD-004', name: 'Sony WH-1000XM5', sales: 156, revenue: 936000, rating: 4.6 },
      { id: 'PRD-005', name: 'Apple AirPods Pro 2', sales: 234, revenue: 819000, rating: 4.8 },
      { id: 'PRD-006', name: 'Samsung QLED 65"', sales: 23, revenue: 1150000, rating: 4.5 },
      { id: 'PRD-007', name: 'PlayStation 5', sales: 45, revenue: 900000, rating: 4.7 },
      { id: 'PRD-008', name: 'Nintendo Switch OLED', sales: 78, revenue: 546000, rating: 4.6 },
      { id: 'PRD-009', name: 'iPad Pro 12.9', sales: 56, revenue: 1120000, rating: 4.8 },
      { id: 'PRD-010', name: 'Dyson V15 Detect', sales: 67, revenue: 670000, rating: 4.4 }
    ];

    return products.slice(0, limit);
  }

  async getCategoryPerformance(tenantId: string) {
    return [
      { category: 'Elektronik', sales: 456000, orders: 234, growth: 15.2 },
      { category: 'Moda', sales: 234000, orders: 567, growth: 8.4 },
      { category: 'Ev & Yaşam', sales: 178000, orders: 189, growth: -2.1 },
      { category: 'Kozmetik', sales: 145000, orders: 412, growth: 22.5 },
      { category: 'Spor', sales: 98000, orders: 156, growth: 5.7 },
      { category: 'Kitap & Hobi', sales: 67000, orders: 234, growth: 11.3 }
    ];
  }

  async getPlatformComparison(tenantId: string) {
    return {
      platforms: [
        {
          name: 'Trendyol',
          logo: '/images/pazaryeri/trendyol.png',
          metrics: {
            sales: 125000,
            orders: 567,
            avgOrderValue: 220,
            rating: 4.7,
            returnRate: 3.2,
            conversionRate: 12.5
          },
          trend: { sales: 15.2, orders: 12.1 }
        },
        {
          name: 'Hepsiburada',
          logo: '/images/pazaryeri/hepsiburada.png',
          metrics: {
            sales: 78000,
            orders: 342,
            avgOrderValue: 228,
            rating: 4.5,
            returnRate: 4.1,
            conversionRate: 10.8
          },
          trend: { sales: 8.4, orders: 6.2 }
        },
        {
          name: 'Amazon',
          logo: '/images/pazaryeri/amazon.png',
          metrics: {
            sales: 35000,
            orders: 189,
            avgOrderValue: 185,
            rating: 4.6,
            returnRate: 2.8,
            conversionRate: 14.2
          },
          trend: { sales: 22.5, orders: 18.7 }
        },
        {
          name: 'N11',
          logo: '/images/pazaryeri/n11.png',
          metrics: {
            sales: 25000,
            orders: 149,
            avgOrderValue: 168,
            rating: 4.3,
            returnRate: 5.5,
            conversionRate: 8.9
          },
          trend: { sales: -2.1, orders: -4.5 }
        }
      ]
    };
  }

  async getHourlyDistribution(tenantId: string) {
    // Saatlik sipariş dağılımı
    const distribution: any[] = [];
    for (let hour = 0; hour < 24; hour++) {
      // Gerçekçi dağılım: gece az, öğle ve akşam saatlerinde yoğun
      let baseValue = 10;
      if (hour >= 10 && hour <= 14) baseValue = 50;
      if (hour >= 19 && hour <= 23) baseValue = 80;
      if (hour >= 0 && hour <= 6) baseValue = 5;

      distribution.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        orders: baseValue + Math.floor(Math.random() * 20)
      });
    }
    return distribution;
  }

  async getRealtimeStats(tenantId: string) {
    // Gerçek zamanlı istatistikler
    return {
      timestamp: new Date(),
      activeVisitors: Math.floor(Math.random() * 100) + 50,
      ordersLastHour: Math.floor(Math.random() * 20) + 5,
      revenueLastHour: Math.floor(Math.random() * 5000) + 2000,
      pendingOrders: Math.floor(Math.random() * 30) + 10,
      lowStockAlerts: Math.floor(Math.random() * 10),
      conversionRate: (Math.random() * 5 + 8).toFixed(1)
    };
  }

  async getCompetitorInsights(tenantId: string) {
    // Rakip analiz verileri
    return {
      pricePosition: {
        belowMarket: 34,
        atMarket: 45,
        aboveMarket: 21
      },
      opportunities: [
        { product: 'Samsung Galaxy S24', currentPrice: 42999, competitorPrice: 44999, potentialProfit: 2000 },
        { product: 'iPhone 15 Pro', currentPrice: 59999, competitorPrice: 62999, potentialProfit: 3000 },
        { product: 'AirPods Pro 2', currentPrice: 6999, competitorPrice: 7499, potentialProfit: 500 }
      ],
      threats: [
        { product: 'MacBook Air M2', yourPrice: 42999, lowestPrice: 39999, seller: 'Rakip A' },
        { product: 'iPad Air', yourPrice: 24999, lowestPrice: 23499, seller: 'Rakip B' }
      ]
    };
  }
}
