import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiImageService } from './image/ai-image.service';
import { AiImageGenerationService } from './image/ai-image-generation.service';
import { ContentSyncService } from './content-sync.service';

@Module({
    imports: [ConfigModule],
    controllers: [AiController],
    providers: [AiService, AiImageService, AiImageGenerationService, ContentSyncService],
    exports: [AiService, AiImageService, AiImageGenerationService, ContentSyncService],
})
export class AiModule { }
