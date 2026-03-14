import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { InvoicingService } from './invoicing.service';

@Module({
    providers: [FinanceService, InvoicingService],
    controllers: [FinanceController],
    exports: [FinanceService, InvoicingService],
})
export class FinanceModule { }
