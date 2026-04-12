import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiImageService {
    private readonly logger = new Logger(AiImageService.name);
    private readonly replicateApiKey: string | undefined;
    private readonly removeBgApiKey: string | undefined;

    constructor(private configService: ConfigService) {
        this.replicateApiKey = this.configService.get('REPLICATE_API_KEY');
        this.removeBgApiKey = this.configService.get('REMOVEBG_API_KEY');
    }

    async removeBackground(imageUrl: string): Promise<string> {
        this.logger.log(`Removing background for image: ${imageUrl}`);
        
        if (!this.removeBgApiKey) {
            this.logger.warn('REMOVEBG_API_KEY not configured, returning original image');
            return imageUrl;
        }

        try {
            // Use Remove.bg API for background removal
            const response = await axios.post(
                'https://api.remove.bg/v1.0/removebg',
                { image_url: imageUrl },
                {
                    headers: {
                        'X-Api-Key': this.removeBgApiKey,
                        'Content-Type': 'application/json',
                    },
                    responseType: 'arraybuffer',
                }
            );

            // Upload result to storage and return URL
            const processedUrl = await this.uploadToStorage(Buffer.from(response.data));
            return processedUrl;
        } catch (error) {
            this.logger.error(`Background removal failed: ${(error as Error).message}`);
            throw new BadRequestException('Arka plan kaldırma işlemi başarısız oldu');
        }
    }

    async upscale(imageUrl: string): Promise<string> {
        this.logger.log(`Upscaling image: ${imageUrl}`);
        
        if (!this.replicateApiKey) {
            this.logger.warn('REPLICATE_API_KEY not configured, returning original image');
            return imageUrl;
        }

        try {
            // Use Replicate API for upscaling
            const prediction = await this.createReplicatePrediction(
                'nightmareai/real-esrgan',
                { image: imageUrl, scale: 4 }
            );
            
            return prediction.output || imageUrl;
        } catch (error) {
            this.logger.error(`Upscaling failed: ${(error as Error).message}`);
            throw new BadRequestException('Görüntü büyütme işlemi başarısız oldu');
        }
    }

    private async createReplicatePrediction(model: string, input: Record<string, any>): Promise<any> {
        const response = await axios.post(
            'https://api.replicate.com/v1/predictions',
            { version: model, input },
            {
                headers: {
                    'Authorization': `Token ${this.replicateApiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Poll for completion
        let prediction = response.data;
        const maxAttempts = 30;
        let attempts = 0;

        while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const pollResponse = await axios.get(
                `https://api.replicate.com/v1/predictions/${prediction.id}`,
                { headers: { 'Authorization': `Token ${this.replicateApiKey}` } }
            );
            prediction = pollResponse.data;
            attempts++;
        }

        if (prediction.status === 'failed') {
            throw new Error('Prediction failed');
        }

        return prediction;
    }

    private async uploadToStorage(buffer: Buffer): Promise<string> {
        // In real implementation, upload to S3/Cloudflare R2/etc
        // For now, return data URL as placeholder
        return `data:image/png;base64,${buffer.toString('base64')}`;
    }
}
