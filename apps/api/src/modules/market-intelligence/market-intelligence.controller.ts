import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Platform } from '@pazaryonetimi/database';
import { MarketIntelligenceService } from './market-intelligence.service';
import { PricingEngineService } from './pricing-engine.service';
import { ForecastingService } from './forecasting.service';

@Controller('market-intelligence')
export class MarketIntelligenceController {
  constructor(
    private readonly service: MarketIntelligenceService,
    private readonly pricingEngine: PricingEngineService,
    private readonly forecasting: ForecastingService,
  ) {}

  @Post('generate-forecast/:productId')
  async generateForecast(@Param('productId') productId: string) {
    return this.forecasting.generateProductForecast(productId);
  }

  @Post('calculate-optimal-price')
  async calculatePrice(
    @Body('productId') pId: string,
    @Body('competitorProductId') cpId: string,
    @Body('rules') rules: any,
  ) {
    return this.pricingEngine.calculateOptimalPrice(pId, cpId, rules);
  }

  @Post('competitors')
  async createCompetitor(
    @Body('tenantId') tenantId: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.service.createCompetitor(tenantId, data);
  }

  @Get('competitors')
  async getCompetitors(@Query('tenantId') tenantId: string) {
    return this.service.getCompetitors(tenantId);
  }

  @Post('competitor-products')
  async addCompetitorProduct(
    @Body('competitorId') competitorId: string,
    @Body() data: any,
  ) {
    return this.service.addCompetitorProduct(competitorId, data);
  }

  @Post('snapshot')
  async runSnapshot(
    @Body('tenantId') tenantId: string,
    @Body('platform') platform?: string,
    @Body('limitPerStore') limitPerStore?: number,
  ) {
    const normalized = platform
      ? (platform.toUpperCase() as Platform)
      : undefined;
    return this.service.runCompetitorSnapshot(tenantId, {
      platform: normalized,
      limitPerStore,
    });
  }

  @Post('map-product')
  async mapProduct(
    @Body('competitorProductId') cpId: string,
    @Body('productId') pId: string,
  ) {
    return this.service.mapCompetitorProduct(cpId, pId);
  }

  @Get('price-history')
  async getPriceHistory(
    @Query('tenantId') tenantId: string,
    @Query('productId') productId?: string,
    @Query('competitorProductId') cpId?: string,
  ) {
    return this.service.getPriceHistory(tenantId, productId, cpId);
  }

  @Post('forecast')
  async createForecast(
    @Body('tenantId') tenantId: string,
    @Body('productId') pId: string,
    @Body() data: any,
  ) {
    return this.service.createForecast(tenantId, pId, data);
  }

  @Get('forecast/:productId')
  async getForecast(
    @Query('tenantId') tenantId: string,
    @Param('productId') pId: string,
  ) {
    return this.service.getForecasts(tenantId, pId);
  }

  // ==================== PRICING ANALYSIS ====================
  @Get('pricing-analysis')
  async getPricingAnalysis(@Query('tenantId') tenantId: string) {
    return this.service.getPricingAnalysis(tenantId);
  }

  @Get('competitor-prices/:productId')
  async getCompetitorPrices(
    @Query('tenantId') tenantId: string,
    @Param('productId') productId: string,
  ) {
    return this.service.getCompetitorPrices(tenantId, productId);
  }

  @Get('competitor-gap/:productId')
  async getCompetitorGap(
    @Query('tenantId') tenantId: string,
    @Param('productId') productId: string,
  ) {
    return this.service.getCompetitorGap(tenantId, productId);
  }

  @Get('competitor-recommendations/:productId')
  async getCompetitorRecommendations(
    @Query('tenantId') tenantId: string,
    @Param('productId') productId: string,
  ) {
    return this.service.getCompetitorRecommendations(tenantId, productId);
  }

  @Get('competitor-alerts')
  async getCompetitorAlerts(
    @Query('tenantId') tenantId: string,
    @Query('priceGapPercent') priceGapPercent?: string,
  ) {
    const threshold = priceGapPercent ? Number(priceGapPercent) : 5;
    return this.service.getCompetitorAlerts(tenantId, threshold);
  }

  @Post('competitor-summary-report')
  async generateCompetitorSummaryReport(
    @Body('tenantId') tenantId: string,
    @Body('days') days?: number,
  ) {
    return this.service.generateCompetitorSummaryReport(tenantId, days);
  }

  @Post('apply-price')
  async applyPriceRecommendation(
    @Body() data: { productId: string; newPrice: number; tenantId: string },
  ) {
    return this.service.applyPriceRecommendation(
      data.tenantId,
      data.productId,
      data.newPrice,
    );
  }

  // ==================== PRICING RULES ====================
  @Get('pricing-rules')
  async getPricingRules(@Query('tenantId') tenantId: string) {
    return this.pricingEngine.getRules(tenantId);
  }

  @Post('pricing-rules')
  async createPricingRule(
    @Body('tenantId') tenantId: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.pricingEngine.createRule(tenantId, data);
  }

  @Patch('pricing-rules/:ruleId')
  async updatePricingRule(
    @Param('ruleId') ruleId: string,
    @Body('tenantId') tenantId: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.pricingEngine.updateRule(ruleId, tenantId, data);
  }

  @Delete('pricing-rules/:ruleId')
  async deletePricingRule(
    @Param('ruleId') ruleId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.pricingEngine.deleteRule(ruleId, tenantId);
  }

  @Post('bulk-reprice')
  async bulkReprice(
    @Body('tenantId') tenantId: string,
    @Body('productIds') productIds?: string[],
  ) {
    return this.pricingEngine.bulkReprice(tenantId, productIds);
  }

  // ==================== COMPETITOR DELETE ====================
  @Delete('competitors/:competitorId')
  async deleteCompetitor(
    @Param('competitorId') competitorId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.service.deleteCompetitor(tenantId, competitorId);
  }

  @Delete('competitor-products/:competitorProductId')
  async deleteCompetitorProduct(
    @Param('competitorProductId') cpId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.service.deleteCompetitorProduct(tenantId, cpId);
  }

  // ==================== A/B EXPERIMENTS ====================
  @Post('experiments')
  async createExperiment(
    @Body('tenantId') tenantId: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.service.createExperiment(tenantId, data);
  }

  @Get('experiments')
  async getExperiments(@Query('tenantId') tenantId: string) {
    return this.service.getExperiments(tenantId);
  }

  @Post('experiments/:experimentId/evaluate')
  async evaluateExperiment(
    @Param('experimentId') experimentId: string,
    @Body('tenantId') tenantId: string,
  ) {
    return this.service.evaluateExperiment(tenantId, experimentId);
  }

  @Post('experiments/:experimentId/stop')
  async stopExperiment(
    @Param('experimentId') experimentId: string,
    @Body('tenantId') tenantId: string,
  ) {
    return this.service.stopExperiment(tenantId, experimentId);
  }

  // ==================== AUTO-DISCOVERY ====================
  @Post('auto-discover')
  async autoDiscoverCompetitors(
    @Body('tenantId') tenantId: string,
    @Body('platform') platform?: string,
  ) {
    const normalized = platform ? (platform.toUpperCase() as any) : undefined;
    return this.service.autoDiscoverCompetitors(tenantId, normalized);
  }
}
