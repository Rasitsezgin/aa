import { Module } from '@nestjs/common';
import { EInvoiceController } from './e-invoice.controller';
import { EInvoiceService } from './e-invoice.service';
import { DatabaseModule } from '../../database/database.module';
import { TenantCredentialsModule } from '../tenant-credentials/tenant-credentials.module';

@Module({
  imports: [DatabaseModule, TenantCredentialsModule],
  controllers: [EInvoiceController],
  providers: [EInvoiceService],
  exports: [EInvoiceService],
})
export class EInvoiceModule {}
