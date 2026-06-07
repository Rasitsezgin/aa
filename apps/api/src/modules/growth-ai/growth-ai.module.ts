import { Module } from '@nestjs/common';
import { GrowthAiController } from './growth-ai.controller';
import { MarketplaceQaService } from './services/marketplace-qa.service';
import { MarketplaceSeoService } from './services/marketplace-seo.service';
import { ReturnPatternsService } from './services/return-patterns.service';
import { BaremOptimizerService } from './services/bareme-optimizer.service';
import { DesiDisputeService } from './services/desi-dispute.service';
import { ReviewReminderService } from './services/review-reminder.service';
import { PackagingStationService } from './services/packaging-station.service';
import { ProductTransferService } from './services/product-transfer.service';
import { CommissionVerifyService } from './services/commission-verify.service';
import { FxPricingService } from './services/fx-pricing.service';
import { BuyboxInsightsService } from './services/buybox-insights.service';
import { CommerceOpsModule } from '../commerce-ops/commerce-ops.module';
import { FinanceModule } from '../finance/finance.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [CommerceOpsModule, FinanceModule, CurrencyModule],
  controllers: [GrowthAiController],
  providers: [
    MarketplaceQaService,
    MarketplaceSeoService,
    ReturnPatternsService,
    BaremOptimizerService,
    DesiDisputeService,
    ReviewReminderService,
    PackagingStationService,
    ProductTransferService,
    CommissionVerifyService,
    FxPricingService,
    BuyboxInsightsService,
  ],
  exports: [
    MarketplaceQaService,
    MarketplaceSeoService,
    ReturnPatternsService,
    BuyboxInsightsService,
  ],
})
export class GrowthAiModule {}
