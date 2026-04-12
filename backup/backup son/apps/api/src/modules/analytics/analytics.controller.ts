import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard-stats')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(120000)
  async getDashboardStats(
    @Query('tenantId') tenantId: string,
    @Query('period') period: string = '30d',
  ) {
    return this.analyticsService.getDashboardStats(tenantId, period);
  }

  @Get('platform-performance')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(120000)
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

  // ==================== CAMPAIGNS ====================
  @Get('campaigns')
  async getCampaigns(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getCampaigns(tenantId);
  }

  @Post('campaigns')
  async createCampaign(@Body() data: any) {
    return this.analyticsService.createCampaign(data);
  }

  @Patch('campaigns/:id')
  async updateCampaign(@Param('id') id: string, @Body() data: any) {
    return this.analyticsService.updateCampaign(id, data);
  }

  @Delete('campaigns/:id')
  async deleteCampaign(@Param('id') id: string) {
    return this.analyticsService.deleteCampaign(id);
  }

  // ==================== REVIEWS ====================
  @Get('reviews')
  async getReviews(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getReviews(tenantId);
  }

  @Post('reviews/:reviewId/reply')
  async replyToReview(
    @Param('reviewId') reviewId: string,
    @Body() data: { reply: string; tenantId: string },
  ) {
    return this.analyticsService.replyToReview(
      reviewId,
      data.reply,
      data.tenantId,
    );
  }

  @Get('review-stats')
  async getReviewStats(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getReviewStats(tenantId);
  }

  // ==================== SEO ====================
  @Get('seo-analysis')
  async getSeoAnalysis(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getSeoAnalysis(tenantId);
  }

  // ==================== PREDICTIONS ====================
  @Get('predictions')
  async getPredictions(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getPredictions(tenantId);
  }

  // ==================== AI SUMMARY ====================
  @Get('ai-summary')
  async getAiSummary(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getAiSummary(tenantId);
  }

  // ==================== MARKETPLACE HEALTH ====================
  @Get('marketplace-health')
  async getMarketplaceHealth(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getMarketplaceHealth(tenantId);
  }

  // ==================== GOALS ====================
  @Get('goals')
  async getGoals(@Query('tenantId') tenantId: string) {
    return this.analyticsService.getGoals(tenantId);
  }

  // ==================== ACTIVITY FEED ====================
  @Get('activity-feed')
  async getActivityFeed(
    @Query('tenantId') tenantId: string,
    @Query('limit') limit: string = '12',
  ) {
    return this.analyticsService.getActivityFeed(tenantId, parseInt(limit));
  }
}
