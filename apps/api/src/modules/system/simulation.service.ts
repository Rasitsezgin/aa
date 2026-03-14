import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface SimulationScenario {
    priceChangePercent: number; // e.g., -10 for 10% discount
    competitorPriceChangePercent: number; // e.g., -5 for competitor drop
    marketTrendPercent: number; // e.g., +5 for seasonal growth
    productId?: string;
}

export interface SimulationResult {
    currentMonthlyRevenue: number;
    projectedMonthlyRevenue: number;
    revenueChangePercent: number;
    currentMonthlyOrders: number;
    projectedMonthlyOrders: number;
    orderChangePercent: number;
    confidenceScore: number;
    insights: string[];
}

@Injectable()
export class SimulationService {
    private readonly logger = new Logger(SimulationService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Simulates a market scenario and returns projected metrics
     */
    async runSimulation(tenantId: string, scenario: SimulationScenario): Promise<SimulationResult> {
        this.logger.log(`Running what-if simulation for tenant ${tenantId}`);

        // 1. Get current baseline (simplified for demo)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const products = await this.prisma.product.findMany({
            where: {
                tenantId,
                ...(scenario.productId ? { id: scenario.productId } : {})
            },
            include: {
                orderItems: {
                    where: { order: { orderDate: { gte: thirtyDaysAgo } } }
                }
            }
        });

        let currentMonthlyRevenue = 0;
        let currentMonthlyOrders = 0;

        products.forEach(p => {
            currentMonthlyRevenue += Number(p.price) * p.orderItems.reduce((s, i) => s + i.quantity, 0);
            currentMonthlyOrders += p.orderItems.reduce((s, i) => s + i.quantity, 0);
        });

        // Dummy data for baseline if store is empty
        if (currentMonthlyRevenue === 0) {
            currentMonthlyRevenue = 150000;
            currentMonthlyOrders = 450;
        }

        // 2. Perform Scenario Calculations (Basic Elasticity Model)
        // Price Elasticity: Typically -2.0 for e-commerce (1% price drop = 2% volume increase)
        const elasticity = -2.0;

        // Impact of our price change
        const priceImpactOnVolume = (scenario.priceChangePercent / 100) * elasticity;

        // Impact of competitor price change (Cross-price elasticity)
        const competitorImpactOnVolume = (scenario.competitorPriceChangePercent / 100) * 1.2;

        // General Market Trend
        const marketImpactOnVolume = scenario.marketTrendPercent / 100;

        // Combined Volume Impact
        const totalVolumeMultiplier = 1 + priceImpactOnVolume - competitorImpactOnVolume + marketImpactOnVolume;

        // Calculate Projected Results
        const projectedMonthlyOrders = Math.round(currentMonthlyOrders * totalVolumeMultiplier);
        const avgPrice = currentMonthlyRevenue / (currentMonthlyOrders || 1);
        const newAvgPrice = avgPrice * (1 + scenario.priceChangePercent / 100);
        const projectedMonthlyRevenue = Math.round(projectedMonthlyOrders * newAvgPrice);

        // 3. Generate Insights
        const insights: string[] = [];
        if (projectedMonthlyRevenue > currentMonthlyRevenue) {
            insights.push("Yüksek hacim artışı fiyat indirimini telafi ediyor ve ciroda artış öngörülüyor.");
        } else if (scenario.priceChangePercent < 0) {
            insights.push("İndirim beklenen hacim artışını getirmeyebilir, karlılık riski mevcut.");
        }

        if (scenario.competitorPriceChangePercent < 0) {
            insights.push("Rakip fiyat kırılımı pazar payınızı %" + Math.abs(competitorImpactOnVolume * 10).toFixed(1) + " oranında düşürebilir.");
        }

        return {
            currentMonthlyRevenue,
            projectedMonthlyRevenue,
            revenueChangePercent: Number(((projectedMonthlyRevenue - currentMonthlyRevenue) / currentMonthlyRevenue * 100).toFixed(2)),
            currentMonthlyOrders,
            projectedMonthlyOrders,
            orderChangePercent: Number(((projectedMonthlyOrders - currentMonthlyOrders) / currentMonthlyOrders * 100).toFixed(2)),
            confidenceScore: 0.85,
            insights
        };
    }
}
