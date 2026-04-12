import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiImageService } from './image/ai-image.service';
import { AiImageGenerationService } from './image/ai-image-generation.service';
import { ContentSyncService } from './content-sync.service';
import { CanAccessModuleGuard } from '../../common/guards/module-access.guard';
import { RequireModule } from '../../common/decorators/require-module.decorator';

@Controller('ai')
@UseGuards(CanAccessModuleGuard)
export class AiController {
    constructor(
        private readonly aiService: AiService,
        private readonly aiImageService: AiImageService,
        private readonly aiImageGenService: AiImageGenerationService,
        private readonly syncService: ContentSyncService
    ) { }

    @Post('sync-content')
    async syncContent(
        @Body() body: { productId: string; platform: string; data: any }
    ) {
        return this.syncService.syncToMarketplace(body.productId, body.platform, body.data);
    }

    @Post('generate-image')
    @RequireModule('IMAGE_AI')
    async generateImage(@Body() body: { prompt: string; size?: any }) {
        return { url: await this.aiImageGenService.generateImage(body.prompt, body.size) };
    }

    @Post('analyze-content')
    @RequireModule('AI_CONTENT')
    async analyzeContent(
        @Body() body: { title: string; description: string }
    ) {
        return this.aiService.analyzeProductContent(body.title, body.description);
    }

    @Post('analyze-competitor')
    @RequireModule('COMPETITOR_ANALYSIS')
    async analyzeCompetitor(
        @Body() body: { productInfo: string; competitorInfo: string }
    ) {
        return this.aiService.analyzeCompetitor(body.productInfo, body.competitorInfo);
    }

    @Post('remove-bg')
    @RequireModule('IMAGE_AI')
    async removeBg(@Body() body: { imageUrl: string }) {
        return { url: await this.aiImageService.removeBackground(body.imageUrl) };
    }

    @Post('upscale')
    @RequireModule('IMAGE_AI')
    async upscale(@Body() body: { imageUrl: string }) {
        return { url: await this.aiImageService.upscale(body.imageUrl) };
    }

    @Post('optimize-content')
    @RequireModule('AI_CONTENT')
    async optimizeContent(
        @Body() body: { title: string; description: string; platform: string }
    ) {
        return this.aiService.optimizeProductContent(body.title, body.description, body.platform);
    }
}
