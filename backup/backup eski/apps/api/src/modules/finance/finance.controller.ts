import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CanAccessModuleGuard } from '../../common/guards/module-access.guard';
import { RequireModule } from '../../common/decorators/require-module.decorator';

@Controller('finance')
@UseGuards(CanAccessModuleGuard)
export class FinanceController {
    constructor(private readonly financeService: FinanceService) { }

    @Get('stats')
    @RequireModule('FINANCE')
    async getStats(@Query('tenantId') tenantId: string) {
        return this.financeService.getFinanceStats(tenantId);
    }

    @Post('calculate-profit')
    @RequireModule('FINANCE')
    async calculateProfit(@Query('orderId') orderId: string) {
        return this.financeService.calculateOrderProfit(orderId);
    }
}
