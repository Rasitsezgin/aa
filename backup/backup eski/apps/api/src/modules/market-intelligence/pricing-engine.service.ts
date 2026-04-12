import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PricingEngineService {
    constructor(private prisma: PrismaService) { }

    async calculateOptimalPrice(productId: string, competitorProductId: string, rules: any) {
        const competitorProduct = await this.prisma.competitorProduct.findUnique({
            where: { id: competitorProductId },
        });

        if (!competitorProduct) return null;

        const currentCompetitorPrice = Number(competitorProduct.price);

        // Example Rule: Be 1% cheaper than competitor but not below minPrice
        let targetPrice = currentCompetitorPrice * 0.99;

        if (rules.minPrice && targetPrice < rules.minPrice) {
            targetPrice = rules.minPrice;
        }

        if (rules.maxPrice && targetPrice > rules.maxPrice) {
            targetPrice = rules.maxPrice;
        }

        return targetPrice;
    }
}
