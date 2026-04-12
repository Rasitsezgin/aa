import { Module } from '@nestjs/common';
import { MarketIntelligenceService } from './market-intelligence.service';
import { MarketIntelligenceController } from './market-intelligence.controller';
import { PricingEngineService } from './pricing-engine.service';

@Module({
    controllers: [MarketIntelligenceController],
    providers: [MarketIntelligenceService, PricingEngineService],
    exports: [MarketIntelligenceService, PricingEngineService],
})
export class MarketIntelligenceModule { }
