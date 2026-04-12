import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as crypto from 'crypto';

interface CreateAffiliateDto {
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  commissionRate: number; // Yüzde
  paymentMethod: 'bank_transfer' | 'paypal';
  paymentDetails?: string;
}

interface AffiliateStats {
  affiliateId: string;
  name: string;
  code: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  totalRevenue: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
}

@Injectable()
export class AffiliateService {
  constructor(private prisma: PrismaService) {}

  /**
   * Affiliate listesi
   */
  async findAll(tenantId: string): Promise<{ affiliates: any[]; stats: any }> {
    // Gerçek uygulamada Affiliate modeli kullanılır
    // Şimdilik simüle edilmiş veri
    const affiliates = [
      {
        id: 'aff-1',
        tenantId,
        name: 'Mehmet Yıldırım',
        email: 'mehmet@influencer.com',
        code: 'MEHMET10',
        commissionRate: 10,
        status: 'active',
        clicks: 1520,
        conversions: 87,
        totalRevenue: 45600,
        totalCommission: 4560,
        pendingCommission: 1200,
        paidCommission: 3360,
        createdAt: new Date('2024-06-15'),
      },
      {
        id: 'aff-2',
        tenantId,
        name: 'Ayşe Kaya',
        email: 'ayse@blogger.com',
        code: 'AYSE15',
        commissionRate: 15,
        status: 'active',
        clicks: 2340,
        conversions: 156,
        totalRevenue: 89200,
        totalCommission: 13380,
        pendingCommission: 3500,
        paidCommission: 9880,
        createdAt: new Date('2024-04-20'),
      },
      {
        id: 'aff-3',
        tenantId,
        name: 'Tech Review TR',
        email: 'contact@techreview.com',
        code: 'TECHREV',
        commissionRate: 8,
        status: 'active',
        clicks: 5680,
        conversions: 234,
        totalRevenue: 156800,
        totalCommission: 12544,
        pendingCommission: 0,
        paidCommission: 12544,
        createdAt: new Date('2024-02-10'),
      },
      {
        id: 'aff-4',
        tenantId,
        name: 'Sosyal Medya Fenomeni',
        email: 'fenomen@social.com',
        code: 'FENOMEN20',
        commissionRate: 20,
        status: 'pending',
        clicks: 0,
        conversions: 0,
        totalRevenue: 0,
        totalCommission: 0,
        pendingCommission: 0,
        paidCommission: 0,
        createdAt: new Date('2025-01-08'),
      },
    ];

    const stats = {
      totalAffiliates: affiliates.length,
      activeAffiliates: affiliates.filter((a) => a.status === 'active').length,
      totalClicks: affiliates.reduce((s, a) => s + a.clicks, 0),
      totalConversions: affiliates.reduce((s, a) => s + a.conversions, 0),
      totalRevenue: affiliates.reduce((s, a) => s + a.totalRevenue, 0),
      totalCommission: affiliates.reduce((s, a) => s + a.totalCommission, 0),
      pendingPayments: affiliates.reduce((s, a) => s + a.pendingCommission, 0),
      avgConversionRate:
        affiliates.length > 0
          ? Math.round(
              (affiliates.reduce(
                (s, a) =>
                  s + (a.clicks > 0 ? (a.conversions / a.clicks) * 100 : 0),
                0,
              ) /
                affiliates.filter((a) => a.clicks > 0).length) *
                100,
            ) / 100
          : 0,
    };

    return { affiliates, stats };
  }

  /**
   * Affiliate detayı
   */
  async findOne(id: string, tenantId: string) {
    const { affiliates } = await this.findAll(tenantId);
    const affiliate = affiliates.find((a) => a.id === id);

    if (!affiliate) {
      throw new NotFoundException('Affiliate bulunamadı');
    }

    // Son işlemler
    const recentTransactions = Array.from({ length: 10 }, (_, i) => ({
      id: `trx-${id}-${i}`,
      type: i % 3 === 0 ? 'commission' : i % 3 === 1 ? 'click' : 'conversion',
      amount: i % 3 === 0 ? Math.floor(Math.random() * 500) + 50 : null,
      orderId: i % 3 === 2 ? `ORD-${10000 + i}` : null,
      createdAt: new Date(Date.now() - i * 86400000 * 2),
    }));

    return {
      ...affiliate,
      recentTransactions,
      conversionRate:
        affiliate.clicks > 0
          ? Math.round((affiliate.conversions / affiliate.clicks) * 100 * 100) /
            100
          : 0,
    };
  }

  /**
   * Yeni affiliate oluştur
   */
  async create(dto: CreateAffiliateDto) {
    // Benzersiz affiliate kodu oluştur
    const code = this.generateAffiliateCode(dto.name);

    const affiliate = {
      id: `aff-${Date.now()}`,
      ...dto,
      code,
      status: 'pending',
      clicks: 0,
      conversions: 0,
      totalRevenue: 0,
      totalCommission: 0,
      pendingCommission: 0,
      paidCommission: 0,
      createdAt: new Date(),
    };

    // Activity log
    await this.prisma.activityLog.create({
      data: {
        tenantId: dto.tenantId,
        action: 'affiliate.create',
        resource: 'affiliate',
        resourceId: affiliate.id,
        details: { name: dto.name, code, email: dto.email },
      },
    });

    return affiliate;
  }

  /**
   * Affiliate güncelle
   */
  async update(id: string, data: Partial<CreateAffiliateDto>) {
    return {
      id,
      ...data,
      updatedAt: new Date(),
    };
  }

  /**
   * Affiliate durumunu değiştir
   */
  async updateStatus(
    id: string,
    status: 'active' | 'inactive' | 'pending',
    tenantId: string,
  ) {
    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'affiliate.status_change',
        resource: 'affiliate',
        resourceId: id,
        details: { newStatus: status },
      },
    });

    return { id, status, updatedAt: new Date() };
  }

  /**
   * Referans linki ile tıklama kaydet
   */
  async trackClick(
    code: string,
    metadata: { ip?: string; userAgent?: string; referer?: string },
  ) {
    // Gerçek uygulamada click tracking tablosu kullanılır
    return {
      code,
      tracked: true,
      timestamp: new Date().toISOString(),
      metadata,
    };
  }

  /**
   * Satış dönüşümü kaydet
   */
  async trackConversion(
    code: string,
    orderId: string,
    orderAmount: number,
    tenantId: string,
  ) {
    const { affiliates } = await this.findAll(tenantId);
    const affiliate = affiliates.find((a) => a.code === code);

    if (!affiliate) {
      return { tracked: false, reason: 'Invalid affiliate code' };
    }

    const commission = orderAmount * (affiliate.commissionRate / 100);

    // Activity log
    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'affiliate.conversion',
        resource: 'affiliate',
        resourceId: affiliate.id,
        details: {
          code,
          orderId,
          orderAmount,
          commission,
          commissionRate: affiliate.commissionRate,
        },
      },
    });

    return {
      tracked: true,
      affiliateId: affiliate.id,
      affiliateName: affiliate.name,
      orderId,
      orderAmount,
      commission,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Komisyon ödemesi yap
   */
  async payCommission(affiliateId: string, amount: number, tenantId: string) {
    const { affiliates } = await this.findAll(tenantId);
    const affiliate = affiliates.find((a) => a.id === affiliateId);

    if (!affiliate) {
      throw new NotFoundException('Affiliate bulunamadı');
    }

    if (amount > affiliate.pendingCommission) {
      throw new BadRequestException(
        'Ödeme tutarı bekleyen komisyondan fazla olamaz',
      );
    }

    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'affiliate.payment',
        resource: 'affiliate',
        resourceId: affiliateId,
        details: {
          amount,
          method: 'bank_transfer',
          status: 'completed',
        },
      },
    });

    return {
      affiliateId,
      amount,
      newPendingCommission: affiliate.pendingCommission - amount,
      newPaidCommission: affiliate.paidCommission + amount,
      paidAt: new Date().toISOString(),
    };
  }

  /**
   * Affiliate dashboard istatistikleri
   */
  async getDashboard(affiliateId: string, tenantId: string) {
    const affiliate = await this.findOne(affiliateId, tenantId);

    // Son 30 gün performansı
    const dailyStats = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - i * 86400000);
      return {
        date: date.toISOString().split('T')[0],
        clicks: Math.floor(Math.random() * 100) + 10,
        conversions: Math.floor(Math.random() * 10),
        revenue: Math.floor(Math.random() * 5000) + 500,
        commission: Math.floor(Math.random() * 500) + 50,
      };
    }).reverse();

    return {
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        code: affiliate.code,
        status: affiliate.status,
      },
      summary: {
        totalClicks: affiliate.clicks,
        totalConversions: affiliate.conversions,
        conversionRate: affiliate.conversionRate,
        totalRevenue: affiliate.totalRevenue,
        totalCommission: affiliate.totalCommission,
        pendingCommission: affiliate.pendingCommission,
      },
      dailyStats,
      topProducts: [
        { name: 'iPhone 15 Kılıf', conversions: 45, revenue: 8900 },
        { name: 'Airpods Pro', conversions: 32, revenue: 12800 },
        { name: 'Samsung Galaxy Buds', conversions: 28, revenue: 7560 },
      ],
    };
  }

  /**
   * Benzersiz affiliate kodu oluştur
   */
  private generateAffiliateCode(name: string): string {
    const namePart = name.split(' ')[0].toUpperCase().slice(0, 6);
    const randomPart = Math.floor(Math.random() * 100);
    return `${namePart}${randomPart}`;
  }
}
