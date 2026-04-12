import { Injectable, Logger } from '@nestjs/common';
import { AiImageService } from './image/ai-image.service';
import { AiImageGenerationService } from './image/ai-image-generation.service';
import { PrismaService } from '../../database/prisma.service';

export interface LifestyleRequest {
    productId: string;
    originalImageUrl: string;
    theme: 'minimalist' | 'luxury' | 'nature' | 'urban' | 'cozy';
    customDescription?: string;
}

@Injectable()
export class AiStudioService {
    private readonly logger = new Logger(AiStudioService.name);

    constructor(
        private prisma: PrismaService,
        private imageService: AiImageService,
        private imageGenService: AiImageGenerationService,
    ) { }

    /**
     * Generates a lifestyle version of a product image
     */
    async generateLifestyleImage(request: LifestyleRequest): Promise<string> {
        this.logger.log(`Generating lifestyle image for product: ${request.productId} with theme: ${request.theme}`);

        // 1. Remove background from original image (simulated for now)
        const transparentProductUrl = await this.imageService.removeBackground(request.originalImageUrl);

        // 2. Construct an advanced prompt for the lifestyle scene
        const themePrompts = {
            minimalist: "placed in a premium minimalist modern living room with soft natural lighting, high-end textures, 8k resolution, professional product photography",
            luxury: "placed in a luxury penthouse setting at sunset, marble surfaces, elegant atmosphere, cinematic lighting, ultra-realistic",
            nature: "on a smooth stone in a serene Zen garden near a waterfall, soft morning mist, macro photography, vibrant colors",
            urban: "in a modern urban industrial loft with brick walls and large windows, city skyline background, trendy vibe",
            cozy: "on a wooden table next to a warm fireplace with a knitted blanket, warm orange glow, cozy autumn atmosphere"
        };

        const finalPrompt = `A high-quality commercial photo of a product (represented by: ${request.customDescription || 'the main object'}) ${themePrompts[request.theme]}. The product should be the central focus, perfectly integrated into the scene.`;

        // 3. Generate the scene using AI
        const generatedSceneUrl = await this.imageGenService.generateImage(finalPrompt, '1024x1024');

        // 4. Log the studio activity
        await this.prisma.activityLog.create({
            data: {
                tenantId: 'system', // Should be dynamic
                action: 'ai.lifestyle_generated',
                resource: 'ai_studio',
                details: { productId: request.productId, theme: request.theme, resultUrl: generatedSceneUrl },
            },
        });

        return generatedSceneUrl;
    }

    /**
     * Generates a short video script and assets (simulation)
     */
    async generateVideoShort(productId: string): Promise<any> {
        this.logger.log(`Generating video short concept for product: ${productId}`);

        // In a real implementation, this would call APIs like HeyGen, RunWayML, or Sora
        return {
            id: `vid-${Date.now()}`,
            status: 'completed',
            previewUrl: 'https://example.com/mock-video.mp4',
            scenes: [
                { time: '0-2s', text: 'Zarafeti Hissedin' },
                { time: '2-5s', text: 'Size Özel Tasarım' },
                { time: '5-7s', text: 'Şimdi Keşfedin' }
            ]
        };
    }
}
