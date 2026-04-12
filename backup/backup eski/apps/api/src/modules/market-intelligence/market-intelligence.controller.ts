import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { MarketIntelligenceService } from './market-intelligence.service';
import { PricingEngineService } from './pricing-engine.service';
import { ForecastingService } from './forecasting.service';

@Controller('market-intelligence')
export class MarketIntelligenceController {
    constructor(
        private readonly service: MarketIntelligenceService,
        private readonly pricingEngine: PricingEngineService,
        private readonly forecasting: ForecastingService,
    ) { }

    @Post('generate-forecast/:productId')
    async generateForecast(@Param('productId') productId: string) {
        return this.forecasting.generateProductForecast(productId);
    }

    @Post('calculate-optimal-price')
    async calculatePrice(
        @Body('productId') pId: string,
        @Body('competitorProductId') cpId: string,
        @Body('rules') rules: any
    ) {
        return this.pricingEngine.calculateOptimalPrice(pId, cpId, rules);
    }

    @Post('competitors')
    async createCompetitor(@Body('tenantId') tenantId: string, @Body() data: any) {
        return this.service.createCompetitor(tenantId, data);
    }

    @Get('competitors')
    async getCompetitors(@Query('tenantId') tenantId: string) {
        return this.service.getCompetitors(tenantId);
    }

    @Post('competitor-products')
    async addCompetitorProduct(@Body('competitorId') competitorId: string, @Body() data: any) {
        return this.service.addCompetitorProduct(competitorId, data);
    }

    @Post('map-product')
    async mapProduct(@Body('competitorProductId') cpId: string, @Body('productId') pId: string) {
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
    async createForecast(@Body('tenantId') tenantId: string, @Body('productId') pId: string, @Body() data: any) {
        return this.service.createForecast(tenantId, pId, data);
    }

    @Get('forecast/:productId')
    async getForecast(@Query('tenantId') tenantId: string, @Param('productId') pId: string) {
        return this.service.getForecasts(tenantId, pId);
    }
}
