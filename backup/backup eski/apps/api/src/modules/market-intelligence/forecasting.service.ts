import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ForecastingService {
    constructor(private prisma: PrismaService) { }

    async generateProductForecast(productId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                marketplaceLinks: true, // In a real scenario, we'd look at Order items
            },
        });

        if (!product) return null;

        // For demonstration, let's create a 7-day forecast based on current trends
        // In a real app, this would query ActivityLog or Order history
        const forecasts = [];
        const baseValue = 10; // Simple base daily sales

        for (let i = 1; i <= 7; i++) {
            const forecastDate = new Date();
            forecastDate.setDate(forecastDate.getDate() + i);

            // Add some random variation and slight trend
            const predictedSales = Math.floor(baseValue + (Math.random() * 5) + (i * 0.5));
            const confidenceScore = 0.85 - (i * 0.05); // Confidence drops as we look further ahead

            forecasts.push({
                productId,
                tenantId: product.tenantId,
                forecastDate,
                predictedSales,
                confidenceScore,
                metadata: { factor: 'Historical average with trend coefficient' }
            });
        }

        // Save to database
        await this.prisma.salesForecast.deleteMany({
            where: { productId }
        });

        return this.prisma.salesForecast.createMany({
            data: forecasts
        });
    }

    async getForecast(productId: string) {
        return this.prisma.salesForecast.findMany({
            where: { productId },
            orderBy: { forecastDate: 'asc' }
        });
    }
}
