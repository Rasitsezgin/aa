import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Platform } from '@prisma/client';

@Injectable()
export class FinanceService {
    private readonly logger = new Logger(FinanceService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Calculates net profit for an order based on marketplace rules
     */
    async calculateOrderProfit(orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!order) throw new Error('Order not found');

        // Total revenue
        const revenue = Number(order.totalAmount);

        // Costs
        let totalCommission = 0;

        // Simplified commission calculation
        // In reality, we would fetch commission rules from MarketplaceCommission table
        for (const item of order.items) {
            const commission = await this.getCommissionRate(order.platform, item.sku);
            const itemPrice = Number(item.unitPrice) * item.quantity;
            totalCommission += (itemPrice * (Number(commission.rate) / 100)) + Number(commission.fixedFee);
        }

        const shippingCost = Number(order.shippingCost);
        const taxAmount = Number(order.taxAmount);

        // Net Profit = Revenue - Commission - Shipping - Tax - (Product Cost * Quantity)
        // We'll assume product cost is stored in Product model
        let totalProductCost = 0;
        for (const item of order.items) {
            if (item.productId) {
                const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
                if (product) {
                    // product.cost field needed in schema, but for now we use metadata or assume a percentage
                    const cost = 0.5 * Number(product.price); // Mock 50% cost for demo
                    totalProductCost += cost * item.quantity;
                }
            }
        }

        const netProfit = revenue - totalCommission - shippingCost - taxAmount - totalProductCost;

        // Update order with calculated values
        return this.prisma.order.update({
            where: { id: orderId },
            data: {
                commissionAmount: totalCommission,
                netProfit: netProfit
            }
        });
    }

    async getCommissionRate(platform: Platform, categoryOrSku?: string) {
        // Fetch from MarketplaceCommission
        const rule = await this.prisma.marketplaceCommission.findFirst({
            where: { platform }
        });

        return {
            rate: rule?.commissionRate || 15, // Default 15%
            fixedFee: rule?.fixedFee || 0
        };
    }

    async getFinanceStats(tenantId: string) {
        const orders = await this.prisma.order.findMany({
            where: {
                tenantId,
                status: 'DELIVERED'
            }
        });

        const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
        const totalProfit = orders.reduce((sum, o) => sum + Number(o.netProfit), 0);
        const totalCommission = orders.reduce((sum, o) => sum + Number(o.commissionAmount), 0);

        return {
            totalRevenue,
            totalProfit,
            totalCommission,
            margin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
            orderCount: orders.length
        };
    }
}
