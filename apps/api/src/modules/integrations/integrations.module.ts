import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { OAuthController } from './oauth.controller';
import { DatabaseModule } from '../../database/database.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';

const schedulerEnabled = process.env.ENABLE_SCHEDULER === 'true';

@Module({
  imports: [
    DatabaseModule,
    MarketplaceModule,
    ...(schedulerEnabled ? [BullModule.registerQueue({ name: 'sync' })] : []),
  ],
  controllers: [IntegrationsController, OAuthController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
