import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

export interface Anomaly {
    id: string;
    type: 'PRICE_DROP' | 'PRICE_HIKE' | 'STOCKOUT_RISK' | 'COMPETITOR_ATTACK';
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    title: string;
    description: string;
    productId?: string;
    sku?: string;
    platform?: string;
    data: any;
    timestamp: Date;
}

@Injectable()
export class AnomalyDetectionService {
    private readonly logger = new Logger(AnomalyDetectionService.name);

    constructor(
        private prisma: PrismaService,
        private notificationsGateway: NotificationsGateway,
    ) { }

    /**
     * Run all anomaly checks for a tenant
     */
    async checkAllAnomalies(tenantId: string): Promise<Anomaly[]> {
        const anomalies: Anomaly[] = [];

        const priceAnomalies = await this.detectPriceAnomalies(tenantId);
        anomalies.push(...priceAnomalies);

        const stockAnomalies = await this.detectStockAnomalies(tenantId);
        anomalies.push(...stockAnomalies);

        const competitorAnomalies = await this.detectCompetitorAggression(tenantId);
        anomalies.push(...competitorAnomalies);

        // Broadcast critical anomalies via WebSocket
        for (const anomaly of anomalies) {
            if (anomaly.severity === 'CRITICAL') {
                this.notificationsGateway.broadcastToTenant(tenantId, {
                    id: anomaly.id,
                    type: 'system',
                    title: `ANOMALİ TESPİT EDİLDİ: ${anomaly.title}`,
                    message: anomaly.description,
                    severity: 'error',
                    timestamp: anomaly.timestamp.toISOString(),
                    data: anomaly.data,
                    tenantId,
                });
            }
        }

        return anomalies;
    }

    /**
     * Detects unusual price movements (compared to competitors or history)
     */
    async detectPriceAnomalies(tenantId: string): Promise<Anomaly[]> {
        const anomalies: Anomaly[] = [];

        const products = await this.prisma.product.findMany({
            where: { tenantId, status: 'active' },
            include: {
                competitorProducts: true,
            },
        });

        for (const product of products) {
            const ourPrice = Number(product.price);

            for (const cp of product.competitorProducts) {
                const compPrice = Number(cp.price);

                // If competitor is more than 30% cheaper - CRITICAL
                if (compPrice < ourPrice * 0.7) {
                    anomalies.push({
                        id: `price-gap-${product.id}-${cp.id}`,
                        type: 'PRICE_DROP',
                        severity: 'CRITICAL',
                        title: 'Kritik Fiyat Farkı',
                        description: `${cp.title} ürünü rakipte %30 daha ucuz. Satış kaybı riski yüksek!`,
                        productId: product.id,
                        sku: product.sku,
                        data: { ourPrice, compPrice, compName: cp.title },
                        timestamp: new Date(),
                    });
                }
            }
        }

        return anomalies;
    }

    /**
     * Detects items selling faster than restock capability or out of stock items with high demand
     */
    async detectStockAnomalies(tenantId: string): Promise<Anomaly[]> {
        const anomalies: Anomaly[] = [];

        // Last 7 days orders to check velocity
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const products = await this.prisma.product.findMany({
            where: { tenantId },
            include: {
                orderItems: {
                    where: { createdAt: { gte: sevenDaysAgo } },
                }
            },
        });

        for (const product of products) {
            const salesLastWeek = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
            const dailySalesRate = salesLastWeek / 7;

            if (product.stock === 0 && dailySalesRate > 0) {
                anomalies.push({
                    id: `stockout-highdemand-${product.id}`,
                    type: 'STOCKOUT_RISK',
                    severity: 'CRITICAL',
                    title: 'Talep Var, Stok Yok!',
                    description: `${product.title} ürünü günlük ${dailySalesRate.toFixed(1)} satış hızına sahipken stoğu tükendi.`,
                    productId: product.id,
                    sku: product.sku,
                    data: { dailySalesRate, currentStock: 0 },
                    timestamp: new Date(),
                });
            } else if (product.stock > 0 && product.stock < dailySalesRate * 3) {
                // Less than 3 days of stock left based on velocity
                anomalies.push({
                    id: `stock-depletion-${product.id}`,
                    type: 'STOCKOUT_RISK',
                    severity: 'WARNING',
                    title: 'Stok Erime Riski',
                    description: `${product.title} ürününün stoğu 3 günden az bir sürede tükenebilir.`,
                    productId: product.id,
                    sku: product.sku,
                    data: { dailySalesRate, currentStock: product.stock, daysLeft: (product.stock / dailySalesRate).toFixed(1) },
                    timestamp: new Date(),
                });
            }
        }

        return anomalies;
    }

    /**
     * Detects if multiple competitors dropped prices simultaneously
     */
    async detectCompetitorAggression(tenantId: string): Promise<Anomaly[]> {
        const anomalies: Anomaly[] = [];

        // Check price histories from last 24h
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);

        const priceDrops = await this.prisma.priceHistory.findMany({
            where: {
                tenantId,
                createdAt: { gte: yesterday },
                competitorProductId: { not: null },
            },
            include: {
                competitorProduct: true,
            },
        });

        // Group by platform/competitor
        const dropsByCompetitor: Record<string, number> = {};
        for (const drop of priceDrops) {
            const compId = drop.competitorProduct?.competitorId;
            if (compId) {
                dropsByCompetitor[compId] = (dropsByCompetitor[compId] || 0) + 1;
            }
        }

        for (const [compId, count] of Object.entries(dropsByCompetitor)) {
            if (count >= 5) { // If a competitor dropped price on 5+ items in 24h
                const competitor = await this.prisma.competitor.findUnique({ where: { id: compId } });
                anomalies.push({
                    id: `comp-attack-${compId}`,
                    type: 'COMPETITOR_ATTACK',
                    severity: 'WARNING',
                    title: 'Rakip Fiyat Saldırısı',
                    description: `${competitor?.name} son 24 saatte ${count} üründe toplu fiyat indirimine gitti.`,
                    data: { competitorId: compId, dropCount: count },
                    timestamp: new Date(),
                });
            }
        }

        return anomalies;
    }
}
