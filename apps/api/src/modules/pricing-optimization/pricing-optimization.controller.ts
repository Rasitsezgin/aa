import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PricingOptimizationService } from './pricing-optimization.service';

@ApiTags('AI Pricing Optimization')
@Controller('pricing')
export class PricingOptimizationController {
  constructor(private pricingService: PricingOptimizationService) {}

  @Get('recommendations')
  @ApiOperation({ summary: 'AI fiyat önerileri al' })
  @ApiResponse({ status: 200, description: 'Fiyat optimizasyon önerileri' })
  async getRecommendations(@Query('tenantId') tenantId: string) {
    return this.pricingService.getPriceRecommendations(tenantId);
  }

  @Get('competitors')
  @ApiOperation({ summary: 'Rakip fiyat analizi' })
  async getCompetitorAnalysis(@Query('tenantId') tenantId: string) {
    return this.pricingService.getCompetitorAnalysis(tenantId);
  }

  @Get('history/:productId')
  @ApiOperation({ summary: 'Ürün fiyat geçmişi' })
  async getPriceHistory(
    @Param('productId') productId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.pricingService.getPriceHistory(productId, tenantId);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Tek fiyat değişikliği uygula' })
  async applyPriceChange(
    @Body() dto: { productId: string; newPrice: number; tenantId: string },
  ) {
    return this.pricingService.applyPriceChange(
      dto.productId,
      dto.newPrice,
      dto.tenantId,
    );
  }

  @Post('apply-bulk')
  @ApiOperation({ summary: 'Toplu fiyat değişikliği uygula' })
  async applyBulkPriceChanges(
    @Body()
    dto: {
      changes: { productId: string; newPrice: number }[];
      tenantId: string;
    },
  ) {
    return this.pricingService.applyBulkPriceChanges(dto.changes, dto.tenantId);
  }

  @Get('buybox-rules')
  @ApiOperation({ summary: 'BuyBox kurallarını listele' })
  async getBuyBoxRules(@Query('tenantId') tenantId: string) {
    return this.pricingService.getBuyBoxRules(tenantId);
  }

  @Post('buybox-rules')
  @ApiOperation({ summary: 'BuyBox kuralı ekle / güncelle' })
  async saveBuyBoxRule(
    @Body()
    dto: {
      tenantId: string;
      productId?: string;
      platform: any;
      minMarginPct?: number;
      maxDropPct?: number;
      competitorFloor?: number;
      isActive?: boolean;
    },
  ) {
    return this.pricingService.saveBuyBoxRule(dto.tenantId, dto);
  }

  @Post('buybox/run')
  @ApiOperation({ summary: 'Otopilot BuyBox & Fiyatlama Motorunu Çalıştır' })
  async runAutoRepricer(@Body() dto: { tenantId: string }) {
    return this.pricingService.runAutoRepricer(dto.tenantId);
  }

  @Get('buybox-snapshots')
  @ApiOperation({ summary: 'BuyBox snapshot geçmişi' })
  async getBuyBoxSnapshots(
    @Query('tenantId') tenantId: string,
    @Query('limit') limit?: string,
  ) {
    return this.pricingService.getBuyBoxSnapshots(
      tenantId,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
