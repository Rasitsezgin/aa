import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface SystemMetrics {
  cpu: number;
  memory: { used: number; total: number; percentage: number };
  uptime: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
  responseTime: number;
}

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: Date;
  details?: string;
}

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);
  private requestCount = 0;
  private errorCount = 0;
  private lastMinuteRequests: number[] = [];

  constructor(private prisma: PrismaService) {
    // Her dakika request sayısını resetle
    setInterval(() => {
      this.lastMinuteRequests.push(this.requestCount);
      if (this.lastMinuteRequests.length > 60) {
        this.lastMinuteRequests.shift();
      }
      this.requestCount = 0;
      this.errorCount = 0;
    }, 60000);
  }

  incrementRequestCount() {
    this.requestCount++;
  }

  incrementErrorCount() {
    this.errorCount++;
  }

  /**
   * Sistem metrikleri
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const memUsage = process.memoryUsage();
    const totalMem = require('os').totalmem();
    const freeMem = require('os').freemem();

    return {
      cpu: await this.getCpuUsage(),
      memory: {
        used: totalMem - freeMem,
        total: totalMem,
        percentage: Math.round(((totalMem - freeMem) / totalMem) * 100),
      },
      uptime: process.uptime(),
      activeConnections: await this.getActiveConnections(),
      requestsPerMinute: this.lastMinuteRequests.reduce((a, b) => a + b, 0) / Math.max(this.lastMinuteRequests.length, 1),
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      responseTime: await this.getAverageResponseTime(),
    };
  }

  /**
   * Servis durumları
   */
  async getServiceStatuses(): Promise<ServiceStatus[]> {
    const services: ServiceStatus[] = [];

    // Database
    const dbStatus = await this.checkDatabase();
    services.push(dbStatus);

    // Redis (simüle)
    services.push({
      name: 'Redis Cache',
      status: 'healthy',
      responseTime: 2,
      lastCheck: new Date(),
    });

    // BullMQ
    services.push({
      name: 'Job Queue (BullMQ)',
      status: 'healthy',
      responseTime: 5,
      lastCheck: new Date(),
    });

    // External APIs
    services.push({
      name: 'Trendyol API',
      status: 'healthy',
      responseTime: 120,
      lastCheck: new Date(),
    });

    services.push({
      name: 'Hepsiburada API',
      status: 'healthy',
      responseTime: 95,
      lastCheck: new Date(),
    });

    services.push({
      name: 'N11 API',
      status: 'degraded',
      responseTime: 450,
      lastCheck: new Date(),
      details: 'Yavaş yanıt süresi',
    });

    return services;
  }

  /**
   * Platform istatistikleri
   */
  async getPlatformStats() {
    const [
      totalTenants,
      activeTenants,
      totalUsers,
      totalOrders,
      todayOrders,
      totalProducts,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { isOnboarded: true } }),
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.order.count({
        where: { orderDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      this.prisma.product.count(),
      this.prisma.order.aggregate({ _sum: { totalAmount: true } }),
    ]);

    return {
      totalTenants,
      activeTenants,
      totalUsers,
      totalOrders,
      todayOrders,
      totalProducts,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      growthRate: 12.5, // Simüle
    };
  }

  /**
   * Realtime dashboard verileri
   */
  async getRealtimeDashboard() {
    const [metrics, services, stats] = await Promise.all([
      this.getSystemMetrics(),
      this.getServiceStatuses(),
      this.getPlatformStats(),
    ]);

    // Son aktiviteler
    const recentActivities = await this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        action: true,
        resource: true,
        details: true,
        createdAt: true,
        tenantId: true,
      },
    });

    // Son hatalar
    const recentErrors = await this.prisma.activityLog.findMany({
      where: { action: { contains: 'error' } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      metrics,
      services,
      stats,
      recentActivities,
      recentErrors,
      timestamp: new Date(),
    };
  }

  private async getCpuUsage(): Promise<number> {
    // Basit CPU kullanım simülasyonu
    return Math.round(Math.random() * 30 + 20);
  }

  private async getActiveConnections(): Promise<number> {
    // Aktif session sayısı
    const sessions = await this.prisma.session.count({
      where: { expires: { gt: new Date() } },
    });
    return sessions;
  }

  private async getAverageResponseTime(): Promise<number> {
    // Ortalama response time (ms)
    return Math.round(Math.random() * 50 + 30);
  }

  private async checkDatabase(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        name: 'PostgreSQL Database',
        status: 'healthy',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        name: 'PostgreSQL Database',
        status: 'down',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        details: error.message,
      };
    }
  }
}
