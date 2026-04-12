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
    return this.pricingService.applyPriceChange(dto.productId, dto.newPrice, dto.tenantId);
  }

  @Post('apply-bulk')
  @ApiOperation({ summary: 'Toplu fiyat değişikliği uygula' })
  async applyBulkPriceChanges(
    @Body() dto: { changes: { productId: string; newPrice: number }[]; tenantId: string },
  ) {
    return this.pricingService.applyBulkPriceChanges(dto.changes, dto.tenantId);
  }
}
