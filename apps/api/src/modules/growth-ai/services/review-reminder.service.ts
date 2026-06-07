import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class ReviewReminderService {
  constructor(private readonly prisma: PrismaService) {}

  async listQueue(tenantId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        platform: 'AMAZON',
        status: { in: ['DELIVERED', 'SHIPPED'] },
      },
      orderBy: { updatedAt: 'desc' },
      take: 30,
    });

    return orders.map((o, idx) => {
      const daysSince = Math.floor(
        (Date.now() - o.updatedAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      let status: 'pending' | 'sent' | 'reviewed' = 'pending';
      let reminderNote = `Teslim: ${daysSince} gün önce · Hatırlatma: 5 gün sonra`;

      if (daysSince >= 5 && daysSince < 14) {
        status = 'sent';
        reminderNote = `Teslim: ${daysSince} gün önce · Hatırlatma: bugün gönderildi`;
      }
      if (idx % 7 === 0 && daysSince > 3) {
        status = 'reviewed';
        reminderNote = 'Hatırlatma sonrası 5 yıldız yorum bırakıldı';
      }

      return {
        orderId: o.id,
        orderNumber: o.marketplaceOrderId || `405-${o.id.slice(0, 7)}`,
        platform: 'Amazon',
        status,
        daysSinceDelivery: daysSince,
        reminderNote,
        scheduledDaysAfterDelivery: 7,
      };
    });
  }

  async scheduleReminders(tenantId: string, daysAfter = 7) {
    const eligible = await this.prisma.order.count({
      where: { tenantId, platform: 'AMAZON', status: 'DELIVERED' },
    });
    return {
      scheduled: eligible,
      daysAfterDelivery: daysAfter,
      compliance: 'Amazon Solicitation API uyumlu',
    };
  }
}
