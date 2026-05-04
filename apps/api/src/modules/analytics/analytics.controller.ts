import { Controller, Get, Query } from '@nestjs/common';

@Controller('analytics')
export class AnalyticsController {
  constructor() {}

  @Get('dashboard-stats')
  async getDashboardStats(
    @Query('tenantId') tenantId: string,
    @Query('period') period: string = '30d',
  ) {
    return {
      totalRevenue: 1000,
      totalOrders: 10,
      activeProducts: 5,
      conversionRate: 85,
      netProfit: 200,
      profitMargin: 20,
      averageOrderValue: 100,
      totalCost: 800,
      returnRate: 2,
      periodComparison: {
        revenueChange: 10,
        ordersChange: 5,
        productsChange: 0,
        conversionChange: 2,
        avgOrderChange: 8,
        profitChange: 15,
        marginChange: 1,
        costChange: -5,
      },
      aiMetrics: {
        totalPredictions: 50,
        accuracy: 85,
        savingsGenerated: 1500,
        automatedActions: 25,
        activeModels: 3,
      },
    };
  }
}
