import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { DatabaseModule } from '../../database/database.module';
import { TenantCredentialsModule } from '../tenant-credentials/tenant-credentials.module';

@Module({
  imports: [DatabaseModule, TenantCredentialsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
