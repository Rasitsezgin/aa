import { Controller, Get, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // Dashboard ana metrikleri
  @Get('dashboard')
  getDashboardMetrics(@Query('tenantId') tenantId: string = 'tenant-1') {
    return this.performanceService.getDashboardMetrics(tenantId);
  }

  // Satış analitiği
  @Get('sales')
  getSalesAnalytics(
    @Query('tenantId') tenantId: string = 'tenant-1',
    @Query('period') period: string = '30d',
  ) {
    return this.performanceService.getSalesAnalytics(tenantId, period);
  }

  // Ürün performansı
  @Get('products')
  getProductPerformance(
    @Query('tenantId') tenantId: string = 'tenant-1',
    @Query('limit') limit: string = '10',
  ) {
    return this.performanceService.getProductPerformance(
      tenantId,
      parseInt(limit),
    );
  }

  // Kategori performansı
  @Get('categories')
  getCategoryPerformance(@Query('tenantId') tenantId: string = 'tenant-1') {
    return this.performanceService.getCategoryPerformance(tenantId);
  }

  // Platform karşılaştırması
  @Get('platforms')
  getPlatformComparison(@Query('tenantId') tenantId: string = 'tenant-1') {
    return this.performanceService.getPlatformComparison(tenantId);
  }

  // Saatlik dağılım
  @Get('hourly')
  getHourlyDistribution(@Query('tenantId') tenantId: string = 'tenant-1') {
    return this.performanceService.getHourlyDistribution(tenantId);
  }

  // Gerçek zamanlı istatistikler
  @Get('realtime')
  getRealtimeStats(@Query('tenantId') tenantId: string = 'tenant-1') {
    return this.performanceService.getRealtimeStats(tenantId);
  }

  // Rakip içgörüleri
  @Get('competitors')
  getCompetitorInsights(@Query('tenantId') tenantId: string = 'tenant-1') {
    return this.performanceService.getCompetitorInsights(tenantId);
  }
}
