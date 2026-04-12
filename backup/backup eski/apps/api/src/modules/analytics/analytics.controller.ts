import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard-stats')
  async getDashboardStats(
    @Query('tenantId') tenantId: string,
    @Query('period') period: string = '30d',
  ) {
    return this.analyticsService.getDashboardStats(tenantId, period);
  }

  @Get('platform-performance')
  async getPlatformPerformance(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getPlatformPerformance(tenantId);
  }

  @Get('recent-orders')
  async getRecentOrders(
    @Query('tenantId') tenantId: string,
    @Query('limit') limit: string = '10',
  ) {
    return this.analyticsService.getRecentOrders(tenantId, parseInt(limit));
  }

  @Get('stock-alerts')
  async getStockAlerts(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getStockAlerts(tenantId);
  }

  @Get('top-products')
  async getTopProducts(
    @Query('tenantId') tenantId: string,
    @Query('limit') limit: string = '10',
  ) {
    return this.analyticsService.getTopProducts(tenantId, parseInt(limit));
  }

  @Get('ai-insights')
  async getAiInsights(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getAiInsights(tenantId);
  }

  @Get('performance-trend')
  async getPerformanceTrend(
    @Query('tenantId') tenantId: string,
    @Query('metric') metric: string = 'revenue',
    @Query('period') period: string = '30d',
  ) {
    return this.analyticsService.getPerformanceTrend(tenantId, metric, period);
  }

  @Get('sales-forecast')
  async getSalesForecast(
    @Query('tenantId') tenantId: string,
    @Query('days') days: string = '30',
  ) {
    return this.analyticsService.getSalesForecast(tenantId, parseInt(days));
  }

  @Get('category-performance')
  async getCategoryPerformance(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getCategoryPerformance(tenantId);
  }
}
