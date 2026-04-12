import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CanAccessModuleGuard } from '../../common/guards/module-access.guard';
import { RequireModule } from '../../common/decorators/require-module.decorator';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('stats')
  async getStats(@Query('tenantId') tenantId: string) {
    return this.financeService.getFinanceStats(tenantId);
  }

  @Post('calculate-profit')
  async calculateProfit(@Query('orderId') orderId: string) {
    return this.financeService.calculateOrderProfit(orderId);
  }

  @Get('payments')
  async getPayments(@Query('tenantId') tenantId: string) {
    return this.financeService.getPayments(tenantId);
  }

  @Get('payment-stats')
  async getPaymentStats(@Query('tenantId') tenantId: string) {
    return this.financeService.getPaymentStats(tenantId);
  }

  @Get('pending-payments')
  async getPendingPayments(@Query('tenantId') tenantId: string) {
    return this.financeService.getPendingPayments(tenantId);
  }
}
