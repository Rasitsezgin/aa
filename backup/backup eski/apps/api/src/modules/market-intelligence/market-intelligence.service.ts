import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MarketIntelligenceService {
    constructor(private prisma: PrismaService) { }

    // Competitor Management
    async createCompetitor(tenantId: string, data: any) {
        return this.prisma.competitor.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async getCompetitors(tenantId: string) {
        return this.prisma.competitor.findMany({
            where: { tenantId },
            include: { products: true },
        });
    }

    // Competitor Product Management
    async addCompetitorProduct(competitorId: string, data: any) {
        return this.prisma.competitorProduct.create({
            data: {
                ...data,
                competitorId,
            },
        });
    }

    async mapCompetitorProduct(competitorProductId: string, productId: string) {
        return this.prisma.competitorProduct.update({
            where: { id: competitorProductId },
            data: { productId },
        });
    }

    // Price History & Tracking
    async recordPrice(tenantId: string, data: { productId?: string; competitorProductId?: string; price: number; platform: any }) {
        return this.prisma.priceHistory.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async getPriceHistory(tenantId: string, productId?: string, competitorProductId?: string) {
        return this.prisma.priceHistory.findMany({
            where: {
                tenantId,
                productId,
                competitorProductId,
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    // Forecast Management
    async createForecast(tenantId: string, productId: string, data: any) {
        return this.prisma.salesForecast.create({
            data: {
                ...data,
                tenantId,
                productId,
            },
        });
    }

    async getForecasts(tenantId: string, productId: string) {
        return this.prisma.salesForecast.findMany({
            where: { tenantId, productId },
            orderBy: { forecastDate: 'asc' },
        });
    }
}
