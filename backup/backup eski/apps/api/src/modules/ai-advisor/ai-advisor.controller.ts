import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AiAdvisorService } from './ai-advisor.service';

@Controller('ai-advisor')
export class AiAdvisorController {
  constructor(private readonly aiAdvisorService: AiAdvisorService) {}

  @Post('chat')
  async chat(
    @Body() body: { tenantId: string; message: string; history?: any[] },
  ) {
    const response = await this.aiAdvisorService.chat(
      body.tenantId,
      body.message,
      body.history || [],
    );
    return { response };
  }

  @Get('recommendations')
  async getRecommendations(@Query('tenantId') tenantId: string) {
    return this.aiAdvisorService.generateRecommendations(tenantId);
  }

  @Get('performance-scores')
  async getPerformanceScores(@Query('tenantId') tenantId: string) {
    return this.aiAdvisorService.calculatePerformanceScores(tenantId);
  }

  @Post('optimize-product')
  async optimizeProduct(
    @Body() body: { tenantId: string; productId: string },
  ) {
    return this.aiAdvisorService.optimizeProduct(body.tenantId, body.productId);
  }

  @Get('bulk-analyze')
  async bulkAnalyze(@Query('tenantId') tenantId: string) {
    return this.aiAdvisorService.bulkAnalyze(tenantId);
  }
}
