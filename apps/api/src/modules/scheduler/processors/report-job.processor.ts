import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../database/prisma.service';

@Processor('reports')
export class ReportJobProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportJobProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(
    job: Job<{ tenantId: string; type: string; period?: string }>,
  ): Promise<any> {
    this.logger.log(
      `Rapor işleniyor: ${job.name} - Tenant: ${job.data.tenantId}`,
    );

    const { tenantId, type, period } = job.data;

    try {
      switch (job.name) {
        case 'daily-report':
          return await this.generateDailyReport(tenantId);
        case 'weekly-report':
          return await this.generateWeeklyReport(tenantId);
        case 'custom-report':
          return await this.generateCustomReport(tenantId, type, period);
        default:
          throw new Error(`Bilinmeyen rapor tipi: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Rapor hatası: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async generateDailyReport(tenantId: string) {
    const yesterday = new Date(Date.now() - 86400000);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [orders, revenue, products] = await Promise.all([
      this.prisma.order.count({
        where: { tenantId, orderDate: { gte: yesterday, lt: today } },
      }),
      this.prisma.order.aggregate({
        where: { tenantId, orderDate: { gte: yesterday, lt: today } },
        _sum: { totalAmount: true },
      }),
      this.prisma.product.count({
        where: { tenantId, stock: { lt: 5 } },
      }),
    ]);

    // Raporu kaydet
    const report = await this.prisma.report.create({
      data: {
        tenantId,
        name: `Günlük Rapor - ${yesterday.toLocaleDateString('tr-TR')}`,
        type: 'daily',
        parameters: { date: yesterday.toISOString() },
        data: {
          orders,
          revenue: Number(revenue._sum.totalAmount) || 0,
          lowStockProducts: products,
          generatedAt: new Date().toISOString(),
        },
        format: 'json',
        status: 'completed',
      },
    });

    this.logger.log(`Günlük rapor oluşturuldu: ${report.id}`);
    return {
      reportId: report.id,
      orders,
      revenue: Number(revenue._sum.totalAmount) || 0,
    };
  }

  private async generateWeeklyReport(tenantId: string) {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const today = new Date();

    const [totalOrders, totalRevenue, topProducts] = await Promise.all([
      this.prisma.order.count({
        where: { tenantId, orderDate: { gte: weekAgo } },
      }),
      this.prisma.order.aggregate({
        where: { tenantId, orderDate: { gte: weekAgo } },
        _sum: { totalAmount: true },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: { tenantId, orderDate: { gte: weekAgo } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
    ]);

    const report = await this.prisma.report.create({
      data: {
        tenantId,
        name: `Haftalık Rapor - ${weekAgo.toLocaleDateString('tr-TR')} - ${today.toLocaleDateString('tr-TR')}`,
        type: 'weekly',
        parameters: {
          startDate: weekAgo.toISOString(),
          endDate: today.toISOString(),
        },
        data: {
          totalOrders,
          totalRevenue: Number(totalRevenue._sum.totalAmount) || 0,
          topProducts: topProducts.map((p) => ({
            productId: p.productId,
            quantity: p._sum.quantity,
          })),
        },
        format: 'json',
        status: 'completed',
      },
    });

    return { reportId: report.id };
  }

  private async generateCustomReport(
    tenantId: string,
    type: string,
    period?: string,
  ) {
    this.logger.log(`Custom rapor: ${type}, period: ${period}`);
    // Custom rapor mantığı burada uygulanabilir
    return { type, period, status: 'completed' };
  }
}
