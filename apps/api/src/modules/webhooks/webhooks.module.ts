import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { MarketplaceWebhookController } from './marketplace-webhook.controller';
import { DatabaseModule } from '../../database/database.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';

@Module({
  imports: [DatabaseModule, MarketplaceModule],
  controllers: [WebhooksController, MarketplaceWebhookController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
