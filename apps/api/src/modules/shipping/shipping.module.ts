import { Module } from '@nestjs/common';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { DatabaseModule } from '../../database/database.module';
import { TenantCredentialsModule } from '../tenant-credentials/tenant-credentials.module';

@Module({
  imports: [DatabaseModule, TenantCredentialsModule],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
