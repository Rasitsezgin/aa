import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AiModule } from './modules/ai/ai.module';
import { AiModelsModule } from './modules/ai-models/ai-models.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { ProductModule } from './modules/product/product.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiAdvisorModule } from './modules/ai-advisor/ai-advisor.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { SystemModule } from './modules/system/system.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CustomersModule } from './modules/customers/customers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MarketIntelligenceModule } from './modules/market-intelligence/market-intelligence.module';
import { FinanceModule } from './modules/finance/finance.module';
import { SupportModule } from './modules/support/support.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    DatabaseModule,
    AiModule,
    AiModelsModule,
    MarketplaceModule,
    TenantModule,
    ProductModule,
    AnalyticsModule,
    AiAdvisorModule,
    IntegrationsModule,
    SystemModule,
    OrdersModule,
    CustomersModule,
    InventoryModule,
    WebhooksModule,
    PerformanceModule,
    SubscriptionsModule,
    ReportsModule,
    MarketIntelligenceModule,
    FinanceModule,
    SupportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
