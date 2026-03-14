import { Module } from '@nestjs/common';
import { MarketIntelligenceService } from './market-intelligence.service';
import { MarketIntelligenceController } from './market-intelligence.controller';
import { PricingEngineService } from './pricing-engine.service';
import { ForecastingService } from './forecasting.service';
import { MarketplaceModule } from '../marketplace/marketplace.module';

@Module({
    imports: [MarketplaceModule],
    controllers: [MarketIntelligenceController],
    providers: [MarketIntelligenceService, PricingEngineService, ForecastingService],
    exports: [MarketIntelligenceService, PricingEngineService, ForecastingService],
})
export class MarketIntelligenceModule { }
