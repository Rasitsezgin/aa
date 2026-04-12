import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SystemModule } from '../system/system.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiImageService } from './image/ai-image.service';
import { AiImageGenerationService } from './image/ai-image-generation.service';
import { ContentSyncService } from './content-sync.service';
import { ContentAnalysisService } from './content-analysis.service';
import { ContentOptimizationService } from './content-optimization.service';
import { SatisPilotuService } from './satis-pilotu.service';
import { AiStudioService } from './ai-studio.service';
import { UserBriefingService } from './user-briefing.service';

@Module({
    imports: [ConfigModule, SystemModule],
    controllers: [AiController],
    providers: [
        AiService,
        AiImageService,
        AiImageGenerationService,
        ContentSyncService,
        ContentAnalysisService,
        ContentOptimizationService,
        SatisPilotuService,
        AiStudioService,
        UserBriefingService,
    ],
    exports: [
        AiService,
        AiImageService,
        AiImageGenerationService,
        ContentSyncService,
        ContentAnalysisService,
        ContentOptimizationService,
        SatisPilotuService,
        AiStudioService,
        UserBriefingService,
    ],
})
export class AiModule { }
