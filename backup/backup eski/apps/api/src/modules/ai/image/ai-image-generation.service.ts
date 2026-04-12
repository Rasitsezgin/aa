import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiImageGenerationService {
    private readonly logger = new Logger(AiImageGenerationService.name);
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        this.openai = new OpenAI({
            apiKey: apiKey,
        });
    }

    async generateImage(prompt: string, size: '256x256' | '512x512' | '1024x1024' = '1024x1024'): Promise<string> {
        this.logger.log(`Generating image for prompt: ${prompt}`);
        try {
            const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: size,
            });

            return response.data[0].url;
        } catch (error) {
            this.logger.error('DALL-E Generation Error:', error);
            throw new Error('AI image generation failed');
        }
    }
}
