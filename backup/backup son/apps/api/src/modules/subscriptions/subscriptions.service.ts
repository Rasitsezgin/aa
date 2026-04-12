import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

// Types
export type SubscriptionStatus = 'pending' | 'active' | 'cancelled' | 'expired' | 'suspended';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PackageType = 'starter' | 'professional' | 'enterprise';
export type BillingPeriod = 'monthly' | 'yearly';

// DTOs
export class CreateSubscriptionDto {
  userId?: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  companyName?: string;
  packageType: PackageType;
  billingPeriod: BillingPeriod;
  paymentMethod: 'credit_card' | 'bank_transfer';
  notes?: string;
}

export class UpdateSubscriptionDto {
  status?: SubscriptionStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
}

export class ApproveSubscriptionDto {
  adminNote?: string;
}

export class RejectSubscriptionDto {
  reason: string;
  adminNote?: string;
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  packageType?: PackageType;
  paymentStatus?: PaymentStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// Package prices
const packagePrices: Record<PackageType, { monthly: number; yearly: number }> = {
  starter: { monthly: 299, yearly: 2990 },
  professional: { monthly: 599, yearly: 5990 },
  enterprise: { monthly: 1299, yearly: 12990 },
};

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Yeni abonelik oluştur (fiyatlandırma sayfasından)
   */
  async createSubscription(dto: CreateSubscriptionDto) {
    const subscriptionId = this.generateId();
    const amount = packagePrices[dto.packageType][dto.billingPeriod];

    // Ödeme yöntemine göre durum belirle
    const status: SubscriptionStatus = dto.paymentMethod === 'credit_card'
      ? 'active'  // Kredi kartı - otomatik aktif
      : 'pending'; // Havale - admin onayı gerekli

    const paymentStatus: PaymentStatus = dto.paymentMethod === 'credit_card'
      ? 'paid'
      : 'pending';

    const startDate = dto.paymentMethod === 'credit_card' ? new Date() : undefined;
    const endDate = startDate
      ? new Date(startDate.getTime() + (dto.billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
      : undefined;

    const subscription = {
      id: subscriptionId,
      userId: dto.userId || this.generateId('user'),
      userName: dto.userName,
      userEmail: dto.userEmail,
      userPhone: dto.userPhone,
      companyName: dto.companyName,
      packageType: dto.packageType,
      billingPeriod: dto.billingPeriod,
      paymentMethod: dto.paymentMethod,
      paymentStatus,
      status,
      amount,
      startDate,
      endDate,
      notes: dto.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedAt: dto.paymentMethod === 'credit_card' ? new Date() : undefined,
      approvedBy: dto.paymentMethod === 'credit_card' ? 'Sistem (Otomatik)' : undefined,
    };

    // Admin bildirimi gönder
    if (dto.paymentMethod === 'credit_card') {
      await this.sendAdminNotification(subscription, 'new_subscription_auto');
    } else {
      await this.sendAdminNotification(subscription, 'new_subscription_pending');
    }

    // Müşteriye e-posta gönder
    await this.sendCustomerEmail(subscription, 'subscription_created');

    return subscription;
  }

  /**
   * Abonelikleri listele
   */
  async findAll(filters: SubscriptionFilters) {
    // Demo data
    let subscriptions = this.getDemoSubscriptions();

    // Filtrele
    if (filters.status) {
      subscriptions = subscriptions.filter(s => s.status === filters.status);
    }

    if (filters.packageType) {
      subscriptions = subscriptions.filter(s => s.packageType === filters.packageType);
    }

    if (filters.paymentStatus) {
      subscriptions = subscriptions.filter(s => s.paymentStatus === filters.paymentStatus);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      subscriptions = subscriptions.filter(s =>
        s.userName.toLowerCase().includes(search) ||
        s.userEmail.toLowerCase().includes(search) ||
        s.userPhone.includes(search) ||
        (s.companyName && s.companyName.toLowerCase().includes(search))
      );
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const paginatedData = subscriptions.slice(start, start + limit);

    return {
      data: paginatedData,
      total: subscriptions.length,
      page,
      limit,
      totalPages: Math.ceil(subscriptions.length / limit),
    };
  }

  /**
   * Tek abonelik detayı
   */
  async findOne(id: string) {
    const subscriptions = this.getDemoSubscriptions();
    const subscription = subscriptions.find(s => s.id === id);

    if (!subscription) {
      throw new NotFoundException('Abonelik bulunamadı');
    }

    return subscription;
  }

  /**
   * Onay bekleyen abonelikler
   */
  async getPendingApprovals() {
    const subscriptions = this.getDemoSubscriptions();
    return subscriptions.filter(s => s.status === 'pending');
  }

  /**
   * Aboneliği onayla
   */
  async approveSubscription(id: string, dto: ApproveSubscriptionDto, adminId: string) {
    const subscription = await this.findOne(id);

    if (subscription.status !== 'pending') {
      throw new BadRequestException('Bu abonelik zaten onaylanmış veya iptal edilmiş');
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() +
      (subscription.billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);

    const updatedSubscription = {
      ...subscription,
      status: 'active' as SubscriptionStatus,
      paymentStatus: 'paid' as PaymentStatus,
      startDate,
      endDate,
      approvedAt: new Date(),
      approvedBy: adminId,
      adminNotes: dto.adminNote,
      updatedAt: new Date(),
    };

    // Müşteriye bildirim gönder
    await this.sendCustomerEmail(updatedSubscription, 'subscription_approved');

    return updatedSubscription;
  }

  /**
   * Aboneliği reddet
   */
  async rejectSubscription(id: string, dto: RejectSubscriptionDto, adminId: string) {
    const subscription = await this.findOne(id);

    if (subscription.status !== 'pending') {
      throw new BadRequestException('Bu abonelik zaten işlenmiş');
    }

    const updatedSubscription = {
      ...subscription,
      status: 'cancelled' as SubscriptionStatus,
      paymentStatus: 'refunded' as PaymentStatus,
      rejectedAt: new Date(),
      rejectedBy: adminId,
      rejectionReason: dto.reason,
      adminNotes: dto.adminNote,
      updatedAt: new Date(),
    };

    // Müşteriye red sebebiyle birlikte bildirim gönder
    await this.sendCustomerEmail(updatedSubscription, 'subscription_rejected');

    return updatedSubscription;
  }

  /**
   * Aboneliği askıya al
   */
  async suspendSubscription(id: string, reason: string, adminId: string) {
    const subscription = await this.findOne(id);

    if (subscription.status !== 'active') {
      throw new BadRequestException('Sadece aktif abonelikler askıya alınabilir');
    }

    const updatedSubscription = {
      ...subscription,
      status: 'suspended' as SubscriptionStatus,
      suspendedAt: new Date(),
      suspendedBy: adminId,
      suspensionReason: reason,
      updatedAt: new Date(),
    };

    await this.sendCustomerEmail(updatedSubscription, 'subscription_suspended');

    return updatedSubscription;
  }

  /**
   * Aboneliği iptal et
   */
  async cancelSubscription(id: string, reason: string, adminId: string) {
    const subscription = await this.findOne(id);

    const updatedSubscription = {
      ...subscription,
      status: 'cancelled' as SubscriptionStatus,
      cancelledAt: new Date(),
      cancelledBy: adminId,
      cancellationReason: reason,
      updatedAt: new Date(),
    };

    await this.sendCustomerEmail(updatedSubscription, 'subscription_cancelled');

    return updatedSubscription;
  }

  /**
   * Abonelik istatistikleri
   */
  async getStats() {
    const subscriptions = this.getDemoSubscriptions();

    const active = subscriptions.filter(s => s.status === 'active');
    const pending = subscriptions.filter(s => s.status === 'pending');

    const monthlyRevenue = active.reduce((sum, s) =>
      sum + (s.billingPeriod === 'monthly' ? s.amount : s.amount / 12), 0
    );

    const byPackage = {
      starter: subscriptions.filter(s => s.packageType === 'starter').length,
      professional: subscriptions.filter(s => s.packageType === 'professional').length,
      enterprise: subscriptions.filter(s => s.packageType === 'enterprise').length,
    };

    return {
      total: subscriptions.length,
      active: active.length,
      pending: pending.length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      monthlyRevenue: Math.round(monthlyRevenue),
      yearlyRevenue: Math.round(monthlyRevenue * 12),
      byPackage,
      byBillingPeriod: {
        monthly: subscriptions.filter(s => s.billingPeriod === 'monthly').length,
        yearly: subscriptions.filter(s => s.billingPeriod === 'yearly').length,
      },
    };
  }

  // ========== Helper Methods ==========

  private generateId(prefix = 'sub'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendAdminNotification(subscription: any, type: string) {
    const packageNames: Record<PackageType, string> = {
      starter: 'Başlangıç',
      professional: 'Profesyonel',
      enterprise: 'Kurumsal',
    };

    console.log(`📧 Admin Bildirim [${type}]:`, {
      customer: subscription.userName,
      package: packageNames[subscription.packageType as PackageType],
      amount: subscription.amount,
      paymentMethod: subscription.paymentMethod,
    });
  }

  private async sendCustomerEmail(subscription: any, type: string) {
    const messages: Record<string, string> = {
      subscription_created: `Abonelik talebiniz alındı! ${subscription.paymentMethod === 'bank_transfer' ? 'Havale onayı sonrası hesabınız aktif olacaktır.' : 'Hesabınız aktif!'}`,
      subscription_approved: `Aboneliğiniz onaylandı! Hesabınız artık aktif.`,
      subscription_rejected: `Abonelik talebiniz onaylanamadı. Sebep: ${subscription.rejectionReason}`,
      subscription_suspended: `Aboneliğiniz askıya alındı.`,
      subscription_cancelled: `Aboneliğiniz iptal edildi.`,
    };

    console.log(`📧 Müşteri E-posta [${type}]:`, {
      to: subscription.userEmail,
      subject: messages[type],
    });
  }

  private getDemoSubscriptions(): any[] {
    return [
      {
        id: 'sub-001',
        userId: 'user-001',
        userName: 'Ahmet Yılmaz',
        userEmail: 'ahmet@example.com',
        userPhone: '0532 123 45 67',
        companyName: 'Yılmaz Ticaret Ltd.',
        packageType: 'professional',
        billingPeriod: 'yearly',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        status: 'pending',
        amount: 5990,
        notes: 'Hızlı aktivasyon talep edildi',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        id: 'sub-002',
        userId: 'user-002',
        userName: 'Ayşe Kaya',
        userEmail: 'ayse@example.com',
        userPhone: '0544 987 65 43',
        companyName: 'Kaya E-Ticaret',
        packageType: 'enterprise',
        billingPeriod: 'yearly',
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        status: 'active',
        amount: 12990,
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        approvedBy: 'Sistem (Otomatik)',
      },
      {
        id: 'sub-003',
        userId: 'user-003',
        userName: 'Mehmet Demir',
        userEmail: 'mehmet@example.com',
        userPhone: '0555 111 22 33',
        packageType: 'starter',
        billingPeriod: 'monthly',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        status: 'pending',
        amount: 299,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        id: 'sub-004',
        userId: 'user-004',
        userName: 'Zeynep Arslan',
        userEmail: 'zeynep@example.com',
        userPhone: '0533 444 55 66',
        companyName: 'Arslan Moda',
        packageType: 'professional',
        billingPeriod: 'monthly',
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        status: 'active',
        amount: 599,
        startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        approvedBy: 'Sistem (Otomatik)',
      },
      {
        id: 'sub-005',
        userId: 'user-005',
        userName: 'Can Öztürk',
        userEmail: 'can@example.com',
        userPhone: '0542 777 88 99',
        companyName: 'Öztürk Elektronik',
        packageType: 'enterprise',
        billingPeriod: 'monthly',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        status: 'pending',
        amount: 1299,
        notes: '3 mağaza için kullanılacak',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    ];
  }
}
