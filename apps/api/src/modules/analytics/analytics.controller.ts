import { Controller, Get, Headers, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  private resolveTenantId(header?: string, query?: string) {
    return query || header || '';
  }

  @Get('dashboard-stats')
  async getDashboardStats(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
    @Query('period') period: string = '30d',
  ) {
    const id = this.resolveTenantId(tenantId, queryTenantId);
    return this.analyticsService.getDashboardStats(id, period);
  }

  @Get('platform-performance')
  async getPlatformPerformance(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const id = this.resolveTenantId(tenantId, queryTenantId);
    return this.analyticsService.getPlatformPerformance(id);
  }

  @Get('recent-orders')
  async getRecentOrders(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
    @Query('limit') limit?: string,
  ) {
    const id = this.resolveTenantId(tenantId, queryTenantId);
    return this.analyticsService.getRecentOrders(id, limit ? parseInt(limit, 10) : 10);
  }

  @Get('stock-alerts')
  async getStockAlerts(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const id = this.resolveTenantId(tenantId, queryTenantId);
    return this.analyticsService.getStockAlerts(id);
  }

  @Get('top-products')
  async getTopProducts(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
    @Query('limit') limit?: string,
  ) {
    const id = this.resolveTenantId(tenantId, queryTenantId);
    return this.analyticsService.getTopProducts(id, limit ? parseInt(limit, 10) : 10);
  }

  @Get('ai-insights')
  async getAiInsights(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const id = this.resolveTenantId(tenantId, queryTenantId);
    return this.analyticsService.getAiInsights(id);
  }

  @Get('performance-trend')
  async getPerformanceTrend(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
    @Query('metric') metric: string = 'revenue',
    @Query('period') period: string = '30d',
  ) {
    const id = this.resolveTenantId(tenantId, queryTenantId);
    return this.analyticsService.getPerformanceTrend(id, metric, period);
  }

  @Get('sales-forecast')
  async getSalesForecast(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
    @Query('days') days?: string,
  ) {
    const id = this.resolveTenantId(tenantId, queryTenantId);
    return this.analyticsService.getSalesForecast(id, days ? parseInt(days, 10) : 30);
  }

  @Get('category-performance')
  async getCategoryPerformance(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const id = this.resolveTenantId(tenantId, queryTenantId);
    return this.analyticsService.getCategoryPerformance(id);
  }

  @Get('ai-summary')
  async getAiSummary(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const id = this.resolveTenantId(tenantId, queryTenantId);
    return this.analyticsService.getAiSummary(id);
  }

  @Get('marketplace-health')
  async getMarketplaceHealth(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const id = this.resolveTenantId(tenantId, queryTenantId);
    return this.analyticsService.getMarketplaceHealth(id);
  }

  @Get('goals')
  async getGoals(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const id = this.resolveTenantId(tenantId, queryTenantId);
    return this.analyticsService.getGoals(id);
  }

  @Get('activity-feed')
  async getActivityFeed(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
    @Query('limit') limit?: string,
  ) {
    const id = this.resolveTenantId(tenantId, queryTenantId);
    return this.analyticsService.getActivityFeed(id, limit ? parseInt(limit, 10) : 12);
  }
}
