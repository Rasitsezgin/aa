import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { FinanceService } from '../../finance/finance.service';

@Injectable()
export class CommissionVerifyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly finance: FinanceService,
  ) {}

  async verifyOrders(tenantId: string, limit = 30) {
    const orders = await this.prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const results = await Promise.all(
      orders.map(async (order) => {
        const rate = await this.finance.getCommissionRate(order.platform);
        const revenue = Number(order.totalAmount);
        const expected =
          revenue * (Number(rate.rate) / 100) + Number(rate.fixedFee);
        const actual = Number(order.commissionAmount ?? 0);
        const delta = Math.round((actual - expected) * 100) / 100;
        const mismatch = Math.abs(delta) > 0.5;

        return {
          orderId: order.id,
          platform: order.platform,
          revenue,
          expectedCommission: Math.round(expected * 100) / 100,
          actualCommission: actual,
          delta,
          mismatch,
          status: mismatch ? 'review' : 'ok',
        };
      }),
    );

    const mismatches = results.filter((r) => r.mismatch);
    const recoverable = mismatches.reduce(
      (s, r) => s + Math.max(0, r.delta),
      0,
    );

    return {
      checked: results.length,
      mismatches: mismatches.length,
      recoverableAmount: Math.round(recoverable * 100) / 100,
      orders: results,
    };
  }
}
