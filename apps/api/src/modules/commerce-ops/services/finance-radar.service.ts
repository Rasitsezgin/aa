import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { FinanceService } from '../../finance/finance.service';

/**
 * Pazaryeri komisyon, kargo ve gerçek kârlılık özeti.
 */
@Injectable()
export class FinanceRadarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly finance: FinanceService,
  ) {}

  async getProfitRadar(tenantId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: { tenantId, createdAt: { gte: since } },
      include: { items: { include: { product: true } } },
    });

    let revenue = 0;
    let commission = 0;
    let shipping = 0;
    let productCost = 0;
    let netProfit = 0;

    const byPlatform: Record<string, { orders: number; revenue: number; profit: number }> = {};

    for (const order of orders) {
      const updated = await this.finance.calculateOrderProfit(order.id).catch(() => order);
      const rev = Number(updated.totalAmount);
      const comm = Number(updated.commissionAmount ?? 0);
      const ship = Number(updated.shippingCost ?? 0);
      const profit = Number(updated.netProfit ?? 0);

      revenue += rev;
      commission += comm;
      shipping += ship;
      netProfit += profit;

      for (const item of order.items) {
        if (item.product?.costPrice) {
          productCost += Number(item.product.costPrice) * item.quantity;
        }
      }

      const plat = order.platform;
      if (!byPlatform[plat]) {
        byPlatform[plat] = { orders: 0, revenue: 0, profit: 0 };
      }
      byPlatform[plat].orders += 1;
      byPlatform[plat].revenue += rev;
      byPlatform[plat].profit += profit;
    }

    const topProducts = await this.prisma.product.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: { id: true, title: true, sku: true, price: true, costPrice: true, stock: true },
    });

    return {
      periodDays: days,
      summary: {
        orderCount: orders.length,
        revenue,
        commission,
        shipping,
        productCost,
        netProfit,
        marginPct: revenue > 0 ? (netProfit / revenue) * 100 : 0,
      },
      byPlatform,
      topProducts: topProducts.map((p) => ({
        ...p,
        margin: p.costPrice
          ? ((Number(p.price) - Number(p.costPrice)) / Number(p.price)) * 100
          : null,
      })),
    };
  }
}
