import { Module } from '@nestjs/common';
import { AIAssistantController } from './ai-assistant.controller';
import { AIAssistantService } from './ai-assistant.service';
import { AIAssistantGateway } from './ai-assistant.gateway';
import { DatabaseModule } from '../../database/database.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { AiModule } from '../ai/ai.module';

// Services
import { AIContextMemoryService } from './services/ai-context-memory.service';
import { AISmartIntentService } from './services/ai-smart-intent.service';
import { AILearningService } from './services/ai-learning.service';
import { AIPredictiveService } from './services/ai-predictive.service';
import { AIAnalyticsService } from './services/ai-analytics.service';
import { AISchedulerService } from './services/ai-scheduler.service';
import { AIWorkflowBuilderService } from './services/ai-workflow-builder.service';
import { AII18nService } from './services/ai-i18n.service';
import { AIIntegrationService } from './services/ai-integration.service';
import { AIVoiceService } from './services/ai-voice.service';
import { AITeamChatService } from './services/ai-team-chat.service';

import { AIAssistantMarketplaceIntegrationService } from './services/ai-marketplace-integration.service';

@Module({
  imports: [DatabaseModule, MarketplaceModule, AiModule],
  controllers: [AIAssistantController],
  providers: [
    // Main services
    AIAssistantService,
    AIAssistantGateway,
    AIAssistantMarketplaceIntegrationService,
    
    // Core AI services
    AIContextMemoryService,
    AISmartIntentService,
    AILearningService,
    AIPredictiveService,
    
    // Feature services
    AIAnalyticsService,
    AISchedulerService,
    AIWorkflowBuilderService,
    AII18nService,
    AIIntegrationService,
    AIVoiceService,
    AITeamChatService,
  ],
  exports: [
    AIAssistantService,
    AIAssistantMarketplaceIntegrationService,
    AIContextMemoryService,
    AILearningService,
    AIPredictiveService,
    AIAnalyticsService,
    AII18nService,
    AITeamChatService,
  ],
})
export class AIAssistantModule {}
