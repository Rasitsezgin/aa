import { Module } from '@nestjs/common';
import { TenantCredentialsController } from './tenant-credentials.controller';
import { TenantCredentialsService } from './tenant-credentials.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TenantCredentialsController],
  providers: [TenantCredentialsService],
  exports: [TenantCredentialsService],
})
export class TenantCredentialsModule {}
