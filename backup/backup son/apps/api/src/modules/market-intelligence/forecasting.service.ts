import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

interface ForecastEntry {
    forecastDate: Date;
    predictedSales: number;
    confidenceScore: number;
    metadata: Record<string, unknown>;
}

@Injectable()
export class ForecastingService {
    private readonly logger = new Logger(ForecastingService.name);

    constructor(private prisma: PrismaService) {}

    async generateProductForecast(productId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, tenantId: true, title: true, price: true, stock: true },
        });

        if (!product) return null;

        // Gather historical order data for this product (last 90 days)
        const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000);
        const orderItems = await this.prisma.orderItem.findMany({
            where: {
                productId,
                order: { tenantId: product.tenantId, createdAt: { gte: ninetyDaysAgo } },
            },
            include: { order: { select: { createdAt: true } } },
            orderBy: { order: { createdAt: 'asc' } },
        });

        // Build daily sales series
        const dailySales = this.buildDailySeries(orderItems, ninetyDaysAgo);

        // Get price history to detect price-sensitivity
        const priceHistory = await this.prisma.priceHistory.findMany({
            where: { tenantId: product.tenantId, productId, createdAt: { gte: ninetyDaysAgo } },
            orderBy: { createdAt: 'asc' },
        });

        // Calculate base metrics from historical data
        const totalDays = dailySales.length || 1;
        const totalSales = dailySales.reduce((s, d) => s + d.sales, 0);
        const avgDailySales = totalSales / totalDays;

        // Trend: linear regression slope over daily sales
        const trend = this.calculateTrend(dailySales.map((d) => d.sales));

        // Seasonality: day-of-week factor
        const dowFactors = this.calculateDayOfWeekFactors(dailySales);

        // Price sensitivity factor
        const priceSensitivity = this.estimatePriceSensitivity(dailySales, priceHistory);

        // Generate 14-day forecast using exponential smoothing + trend + seasonality
        const alpha = 0.3; // smoothing
        let level = avgDailySales;
        const forecasts: ForecastEntry[] = [];

        for (let i = 1; i <= 14; i++) {
            const forecastDate = new Date();
            forecastDate.setDate(forecastDate.getDate() + i);

            const dow = forecastDate.getDay();
            const seasonFactor = dowFactors[dow] || 1;
            const trendEffect = trend * i;

            // Exponential smoothing forecast
            const predicted = Math.max(0, Math.round((level + trendEffect) * seasonFactor));

            // Confidence decreases with horizon
            const baseConfidence = totalSales > 0 ? 0.85 : 0.40;
            const horizonDecay = i * 0.025;
            const dataBoost = Math.min(0.1, totalDays * 0.001);
            const confidence = Math.max(0.20, Math.min(0.95, baseConfidence - horizonDecay + dataBoost));

            forecasts.push({
                forecastDate,
                predictedSales: predicted,
                confidenceScore: +confidence.toFixed(3),
                metadata: {
                    method: totalSales > 0 ? 'exponential_smoothing' : 'cold_start',
                    trend: +trend.toFixed(4),
                    seasonFactor: +seasonFactor.toFixed(3),
                    avgDailySales: +avgDailySales.toFixed(2),
                    historicalDays: totalDays,
                    priceSensitivity: +priceSensitivity.toFixed(3),
                },
            });

            // Update level with simple exponential smoothing
            level = alpha * predicted + (1 - alpha) * level;
        }

        // Replace old forecasts
        await this.prisma.salesForecast.deleteMany({ where: { productId } });

        await this.prisma.salesForecast.createMany({
            data: forecasts.map((f) => ({
                productId,
                tenantId: product.tenantId,
                forecastDate: f.forecastDate,
                predictedSales: f.predictedSales,
                confidenceScore: f.confidenceScore,
                metadata: f.metadata as Prisma.InputJsonValue,
            })),
        });

        return {
            productId,
            forecastDays: 14,
            avgDailySales: +avgDailySales.toFixed(2),
            trend: trend > 0 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable',
            trendValue: +trend.toFixed(4),
            totalHistoricalSales: totalSales,
            historicalDays: totalDays,
            forecasts: forecasts.map((f) => ({
                date: f.forecastDate.toISOString().slice(0, 10),
                predictedSales: f.predictedSales,
                confidence: f.confidenceScore,
            })),
            stockWarning: product.stock > 0 && product.stock < avgDailySales * 7
                ? `Mevcut stok (${product.stock}) tahmini 7 gunluk satisi karsilamiyor`
                : null,
        };
    }

    async getForecast(productId: string) {
        return this.prisma.salesForecast.findMany({
            where: { productId },
            orderBy: { forecastDate: 'asc' },
        });
    }

    // ==================== PRIVATE HELPERS ====================

    private buildDailySeries(
        orderItems: Array<{ quantity: number; order: { createdAt: Date } }>,
        startDate: Date,
    ): Array<{ date: string; sales: number; dow: number }> {
        const map = new Map<string, number>();

        // Initialize all days with 0
        const now = new Date();
        const cursor = new Date(startDate);
        while (cursor <= now) {
            map.set(cursor.toISOString().slice(0, 10), 0);
            cursor.setDate(cursor.getDate() + 1);
        }

        // Fill actual sales
        for (const item of orderItems) {
            const day = item.order.createdAt.toISOString().slice(0, 10);
            map.set(day, (map.get(day) || 0) + item.quantity);
        }

        return Array.from(map.entries())
            .sort()
            .map(([date, sales]) => ({
                date,
                sales,
                dow: new Date(date).getDay(),
            }));
    }

    private calculateTrend(values: number[]): number {
        const n = values.length;
        if (n < 7) return 0;

        // Simple linear regression: y = a + bx
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += values[i];
            sumXY += i * values[i];
            sumXX += i * i;
        }

        const denom = n * sumXX - sumX * sumX;
        if (denom === 0) return 0;

        return (n * sumXY - sumX * sumY) / denom;
    }

    private calculateDayOfWeekFactors(
        series: Array<{ sales: number; dow: number }>,
    ): number[] {
        const sums = new Array(7).fill(0);
        const counts = new Array(7).fill(0);

        for (const entry of series) {
            sums[entry.dow] += entry.sales;
            counts[entry.dow] += 1;
        }

        const overallAvg = series.length > 0
            ? series.reduce((s, e) => s + e.sales, 0) / series.length
            : 1;

        if (overallAvg === 0) return new Array(7).fill(1);

        return sums.map((sum, i) => {
            if (counts[i] === 0) return 1;
            const dayAvg = sum / counts[i];
            return dayAvg / overallAvg;
        });
    }

    private estimatePriceSensitivity(
        salesSeries: Array<{ date: string; sales: number }>,
        priceHistory: Array<{ price: Prisma.Decimal | number; createdAt: Date }>,
    ): number {
        if (priceHistory.length < 2 || salesSeries.length < 14) return 0;

        // Simple: check if sales changed after a price change
        let totalElasticity = 0;
        let measurements = 0;

        for (let i = 1; i < priceHistory.length; i++) {
            const oldPrice = Number(priceHistory[i - 1].price);
            const newPrice = Number(priceHistory[i].price);
            if (oldPrice === 0 || newPrice === oldPrice) continue;

            const priceChangeDate = priceHistory[i].createdAt.toISOString().slice(0, 10);
            const beforeIdx = salesSeries.findIndex((s) => s.date === priceChangeDate);
            if (beforeIdx < 7) continue;

            const beforeAvg = this.avgSlice(salesSeries, beforeIdx - 7, beforeIdx);
            const afterAvg = this.avgSlice(salesSeries, beforeIdx, Math.min(beforeIdx + 7, salesSeries.length));

            if (beforeAvg === 0) continue;

            const pctPriceChange = (newPrice - oldPrice) / oldPrice;
            const pctSalesChange = (afterAvg - beforeAvg) / beforeAvg;

            if (pctPriceChange !== 0) {
                totalElasticity += Math.abs(pctSalesChange / pctPriceChange);
                measurements += 1;
            }
        }

        return measurements > 0 ? totalElasticity / measurements : 0;
    }

    private avgSlice(series: Array<{ sales: number }>, from: number, to: number): number {
        const slice = series.slice(from, to);
        if (slice.length === 0) return 0;
        return slice.reduce((s, e) => s + e.sales, 0) / slice.length;
    }
}
