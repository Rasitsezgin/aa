import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiImageGenerationService {
    private readonly logger = new Logger(AiImageGenerationService.name);
    private openai: OpenAI | null = null;
    private isAvailable: boolean = false;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (apiKey) {
            try {
                this.openai = new OpenAI({ apiKey });
                this.isAvailable = true;
                this.logger.log('OpenAI service initialized successfully');
            } catch (error) {
                this.logger.warn('Failed to initialize OpenAI service');
            }
        } else {
            this.logger.warn('OPENAI_API_KEY not configured - AI image generation disabled');
        }
    }

    async generateImage(prompt: string, size: '256x256' | '512x512' | '1024x1024' = '1024x1024'): Promise<string> {
        if (!this.isAvailable || !this.openai) {
            this.logger.warn('OpenAI service is not available');
            throw new Error('AI image generation is not configured. Please set OPENAI_API_KEY environment variable.');
        }

        this.logger.log(`Generating image for prompt: ${prompt}`);
        try {
            const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: size,
            });

            return response.data?.[0]?.url || '';
        } catch (error) {
            this.logger.error('DALL-E Generation Error:', error);
            throw new Error('AI image generation failed');
        }
    }
}
