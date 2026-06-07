import { Global, Module } from '@nestjs/common';
import { AiCreditsService } from './ai-credits.service';
import { DatabaseModule } from '../../database/database.module';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [AiCreditsService],
  exports: [AiCreditsService],
})
export class TenantServicesModule {}
