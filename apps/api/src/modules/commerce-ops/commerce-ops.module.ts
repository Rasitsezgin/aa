import { Module } from '@nestjs/common';
import { CommerceOpsController } from './commerce-ops.controller';
import { BundleService } from './services/bundle.service';
import { LinkImportService } from './services/link-import.service';
import { StockAlertService } from './services/stock-alert.service';
import { BuyBoxRobotService } from './services/buybox-robot.service';
import { OpsAutomationService } from './services/ops-automation.service';
import { FinanceRadarService } from './services/finance-radar.service';
import { ScrapingModule } from '../scraping/scraping.module';
import { IntegrationsCoreModule } from '../integrations-core/integrations-core.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { OrdersModule } from '../orders/orders.module';
import { ShippingModule } from '../shipping/shipping.module';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [
    ScrapingModule,
    IntegrationsCoreModule,
    MarketplaceModule,
    OrdersModule,
    ShippingModule,
    FinanceModule,
  ],
  controllers: [CommerceOpsController],
  providers: [
    BundleService,
    LinkImportService,
    StockAlertService,
    BuyBoxRobotService,
    OpsAutomationService,
    FinanceRadarService,
  ],
  exports: [
    BundleService,
    LinkImportService,
    StockAlertService,
    BuyBoxRobotService,
    OpsAutomationService,
    FinanceRadarService,
  ],
})
export class CommerceOpsModule {}
