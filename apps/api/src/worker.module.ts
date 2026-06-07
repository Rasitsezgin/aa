import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { MarketIntelligenceModule } from './modules/market-intelligence/market-intelligence.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { EncryptionModule } from './common/encryption.module';
import { IntegrationsCoreModule } from './modules/integrations-core/integrations-core.module';

function getBullConnection() {
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL);
    return {
      host: url.hostname,
      port: Number(url.port || '6379'),
      password: url.password || undefined,
      username: url.username || undefined,
    };
  }

  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    username: process.env.REDIS_USERNAME || undefined,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: getBullConnection(),
    }),
    DatabaseModule,
    EncryptionModule,
    SchedulerModule,
    MarketIntelligenceModule,
    MarketplaceModule,
    IntegrationsCoreModule,
  ],
})
export class WorkerModule {}
