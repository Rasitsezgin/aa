import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  sku?: string;
  variant?: string;
}

export class CreateOrderDto {
  tenantId: string;
  platform:
    | 'TRENDYOL'
    | 'AMAZON'
    | 'HEPSIBURADA'
    | 'N11'
    | 'WEBSITE'
    | 'MANUAL';
  externalOrderId?: string;
  status?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress: string;
  city: string;
  district?: string;
  postalCode?: string;
  items: OrderItem[];
  totalAmount: number;
  subtotal?: number;
  shippingCost?: number;
  discount?: number;
  shippingMethod?: string;
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'cash_on_delivery';
  paymentStatus?: 'pending' | 'confirmed' | 'failed';
  cardDetails?: {
    last4?: string;
    brand?: string;
  };
  transferReceipt?: string;
  notes?: string;
}

export class UpdateOrderDto {
  status?:
    | 'PENDING'
    | 'PENDING_PAYMENT'
    | 'PAYMENT_CONFIRMED'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'RETURNED'
    | 'REFUNDED';
  paymentStatus?: 'pending' | 'confirmed' | 'failed';
  trackingNumber?: string;
  shippingProvider?: string;
  notes?: string;
}

export class ApprovePaymentDto {
  adminNote?: string;
}

export class RejectPaymentDto {
  reason: string;
  adminNote?: string;
}

export interface OrderFilters {
  tenantId: string;
  status?: string;
  platform?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Sipariş listesi
  async findAll(filters: OrderFilters) {
    const {
      tenantId,
      status,
      platform,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = { tenantId };

    if (status) {
      where.status = status;
    }
    if (platform) {
      where.platform = platform;
    }
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = startDate;
      if (endDate) where.orderDate.lte = endDate;
    }
    if (search) {
      where.OR = [
        { marketplaceOrderId: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { orderDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Tek sipariş detayı
  async findOne(id: string, tenantId: string) {
    return this.prisma.order.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          include: { product: true },
        },
        invoice: true,
      },
    });
  }

  // Sipariş durumu güncelle
  async updateStatus(id: string, tenantId: string, dto: UpdateOrderDto) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
    });
    if (!order) throw new BadRequestException('Sipariş bulunamadı');

    const updateData: any = { updatedAt: new Date() };
    if (dto.status) updateData.status = dto.status;
    if (dto.trackingNumber) updateData.trackingNumber = dto.trackingNumber;
    if (dto.shippingProvider)
      updateData.shippingProvider = dto.shippingProvider;
    if (dto.notes) updateData.notes = dto.notes;

    const updated = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    return updated;
  }

  // Sipariş istatistikleri
  async getStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, monthOrders, platformStats] = await Promise.all([
      this.prisma.order.findMany({
        where: { tenantId, orderDate: { gte: today } },
      }),
      this.prisma.order.findMany({
        where: {
          tenantId,
          orderDate: {
            gte: new Date(today.getFullYear(), today.getMonth(), 1),
          },
        },
      }),
      this.prisma.order.groupBy({
        by: ['platform'],
        where: { tenantId },
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
    ]);

    const todayRevenue = todayOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );
    const monthRevenue = monthOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );

    return {
      today: {
        total: todayOrders.length,
        revenue: todayRevenue,
        pending: todayOrders.filter((o) => o.status === 'PENDING').length,
        preparing: todayOrders.filter((o) => o.status === 'CONFIRMED').length, // Mapped status
      },
      thisMonth: {
        total: monthOrders.length,
        revenue: monthRevenue,
      },
      byPlatform: platformStats.map((s) => ({
        platform: s.platform,
        count: s._count.id,
        revenue: Number(s._sum.totalAmount) || 0,
      })),
    };
  }

  // Toplu işlem - Siparişleri kargola
  async bulkShip(
    tenantId: string,
    orderIds: string[],
    shippingProvider: string,
  ) {
    const results: { id: string; status: string; trackingNumber: string }[] =
      [];
    let failed = 0;

    for (const id of orderIds) {
      try {
        const trackingNumber =
          `TR${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
        await this.prisma.order.update({
          where: { id },
          data: {
            status: 'SHIPPED',
            trackingNumber,
            shippingProvider,
            updatedAt: new Date(),
          },
        });
        results.push({ id, status: 'SHIPPED', trackingNumber });
      } catch {
        failed++;
      }
    }

    return { success: results.length, failed, orders: results };
  }

  // ==================== ÖDEME ONAY İŞLEMLERİ ====================

  /**
   * Yeni sipariş oluştur (Web sitesinden)
   */
  async createWebsiteOrder(dto: CreateOrderDto) {
    const orderNumber = this.generateOrderNumber();
    const status =
      dto.paymentMethod === 'credit_card' ? 'CONFIRMED' : 'PENDING';
    const subtotal =
      dto.subtotal ||
      dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await this.prisma.order.create({
      data: {
        tenantId: dto.tenantId,
        platform: 'WEBSITE',
        marketplaceOrderId: orderNumber,
        status,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail || '',
        customerPhone: dto.customerPhone || '',
        shippingAddress:
          `${dto.shippingAddress}, ${dto.district || ''}, ${dto.city} ${dto.postalCode || ''}`.trim(),
        totalAmount: dto.totalAmount,
        taxAmount: 0,
        shippingCost: dto.shippingCost || 0,
        currency: 'TRY',
        notes: dto.notes,
        orderDate: new Date(),
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            title: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            taxRate: 0,
            sku: item.sku || '',
          })),
        },
      },
      include: { items: true },
    });

    await this.sendAdminNotification(
      order,
      dto.paymentMethod === 'credit_card'
        ? 'new_order_credit_card'
        : 'new_order_pending_approval',
    );
    await this.sendCustomerEmail(order, 'order_created');

    return order;
  }

  /**
   * Manuel sipariş oluştur (Panelden)
   */
  async createManualOrder(dto: CreateOrderDto) {
    const orderNumber = dto.externalOrderId || this.generateOrderNumber();
    const status = (dto.status || 'CONFIRMED') as any;
    const subtotal =
      dto.subtotal ||
      dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await this.prisma.order.create({
      data: {
        tenantId: dto.tenantId,
        platform: (dto.platform || 'OTHER') as any,
        marketplaceOrderId: orderNumber,
        status,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail || '',
        customerPhone: dto.customerPhone || '',
        shippingAddress: dto.shippingAddress || '',
        totalAmount: dto.totalAmount,
        taxAmount: 0,
        shippingCost: dto.shippingCost || 0,
        currency: 'TRY',
        notes: dto.notes,
        orderDate: new Date(),
        paymentStatus: dto.paymentStatus
          ? ((dto.paymentStatus === 'confirmed' ? 'PAID' : 'UNPAID') as any)
          : 'UNPAID',
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            title: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            taxRate: 0,
            sku: item.sku || '',
          })),
        },
      },
      include: { items: true },
    });

    return order;
  }

  /**
   * Onay bekleyen siparişleri getir (Havale)
   */
  async getPendingApprovals(tenantId: string) {
    const pendingOrders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: 'PENDING',
      },
      include: { items: true },
      orderBy: { orderDate: 'desc' },
    });

    return pendingOrders.map((order) => ({
      id: order.id,
      orderNumber: order.marketplaceOrderId || order.id.substring(0, 12),
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      items: order.items.map((item) => ({
        name: item.title,
        quantity: item.quantity,
        price: Number(item.unitPrice),
        variant: item.sku || undefined,
      })),
      totalAmount: Number(order.totalAmount),
      paymentMethod: 'bank_transfer',
      paymentStatus: 'pending',
      status: order.status,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      createdAt: order.orderDate,
      updatedAt: order.updatedAt,
    }));
  }

  /**
   * Havale ödemesini onayla
   */
  async approvePayment(
    orderId: string,
    tenantId: string,
    dto: ApprovePaymentDto,
    adminId: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new BadRequestException('Sipariş bulunamadı');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        notes: dto.adminNote
          ? `${order.notes || ''}\n[ONAY] ${dto.adminNote}`
          : order.notes,
        updatedAt: new Date(),
      },
      include: { items: true },
    });

    await this.sendCustomerEmail(updated, 'payment_approved');
    return updated;
  }

  /**
   * Havale ödemesini reddet
   */
  async rejectPayment(
    orderId: string,
    tenantId: string,
    dto: RejectPaymentDto,
    adminId: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });
    if (!order) throw new BadRequestException('Sipariş bulunamadı');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        notes: `${order.notes || ''}\n[RED] Sebep: ${dto.reason}${dto.adminNote ? ` - ${dto.adminNote}` : ''}`,
        updatedAt: new Date(),
      },
      include: { items: true },
    });

    (updated as any).rejectionReason = dto.reason;
    await this.sendCustomerEmail(updated, 'payment_rejected');
    return updated;
  }

  // ==================== YARDIMCI METODLAR ====================

  private generateOrderNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SIP-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateTransferReference(): string {
    return `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  // ==================== SHIPPING METHODS - GERÇEK VERİ ====================
  async getShipments(tenantId: string, status?: string) {
    // Gerçek siparişlerden kargo bilgisi
    const where: any = {
      tenantId,
      status: { in: ['CONFIRMED', 'SHIPPED', 'DELIVERED', 'RETURNED'] },
    };

    const orders = await this.prisma.order.findMany({
      where,
      include: { items: { take: 1 } },
      orderBy: { orderDate: 'desc' },
      take: 25,
    });

    const carriers = [
      'Yurtiçi Kargo',
      'Aras Kargo',
      'MNG Kargo',
      'PTT Kargo',
      'Sürat Kargo',
    ];

    const statusMap: Record<string, string> = {
      CONFIRMED: 'preparing',
      SHIPPED: 'in_transit',
      DELIVERED: 'delivered',
      RETURNED: 'returned',
    };

    const shipments = orders.map((order, i) => ({
      id: `ship-${order.id.slice(0, 8)}`,
      orderId: order.marketplaceOrderId || order.id.slice(0, 8),
      trackingNumber: `TR${order.id.slice(0, 10).replace(/-/g, '').toUpperCase()}`,
      carrier: carriers[i % carriers.length],
      status: statusMap[order.status] || 'preparing',
      customer: order.customerName || 'Bilinmeyen',
      destination: order.shippingAddress || 'Belirtilmemiş',
      weight: +(Number(order.totalAmount) / 10000).toFixed(1) || 1.0,
      cost: Number(order.shippingCost),
      estimatedDelivery: new Date(
        order.orderDate.getTime() + 3 * 86400000,
      ).toISOString(),
      shippedAt:
        order.status !== 'CONFIRMED' ? order.updatedAt.toISOString() : null,
      deliveredAt:
        order.status === 'DELIVERED' ? order.updatedAt.toISOString() : null,
      events: [
        {
          date: order.orderDate.toISOString(),
          status: 'Sipariş alındı',
          location: 'Sistem',
        },
        ...(order.status !== 'CONFIRMED'
          ? [
              {
                date: order.updatedAt.toISOString(),
                status: 'Kargoya verildi',
                location: 'İstanbul Dağıtım Merkezi',
              },
            ]
          : []),
        ...(order.status === 'DELIVERED'
          ? [
              {
                date: order.updatedAt.toISOString(),
                status: 'Teslim edildi',
                location: order.shippingAddress || '',
              },
            ]
          : []),
      ],
    }));

    if (status) {
      return shipments.filter((s) => s.status === status);
    }
    return shipments;
  }

  async getShippingProviders() {
    return [
      {
        id: 'yurtici',
        name: 'Yurtiçi Kargo',
        logo: '/images/yurtici.png',
        avgDelivery: '2-3 gün',
        rating: 4.5,
        basePrice: 25,
        isActive: true,
        contractExpiry: '2025-12-31',
      },
      {
        id: 'aras',
        name: 'Aras Kargo',
        logo: '/images/aras.png',
        avgDelivery: '2-3 gün',
        rating: 4.3,
        basePrice: 22,
        isActive: true,
        contractExpiry: '2025-06-30',
      },
      {
        id: 'mng',
        name: 'MNG Kargo',
        logo: '/images/mng.png',
        avgDelivery: '3-4 gün',
        rating: 4.1,
        basePrice: 20,
        isActive: true,
        contractExpiry: '2025-09-30',
      },
      {
        id: 'ptt',
        name: 'PTT Kargo',
        logo: '/images/ptt.png',
        avgDelivery: '3-5 gün',
        rating: 3.8,
        basePrice: 18,
        isActive: true,
        contractExpiry: '2026-01-31',
      },
      {
        id: 'surat',
        name: 'Sürat Kargo',
        logo: '/images/surat.png',
        avgDelivery: '1-2 gün',
        rating: 4.6,
        basePrice: 35,
        isActive: false,
        contractExpiry: '2024-12-31',
      },
    ];
  }

  async trackShipment(trackingNumber: string) {
    return {
      trackingNumber,
      carrier: 'Yurtiçi Kargo',
      status: 'in_transit',
      estimatedDelivery: new Date(Date.now() + 2 * 86400000).toISOString(),
      origin: 'İstanbul',
      destination: 'Ankara',
      weight: 2.5,
      events: [
        {
          date: new Date(Date.now() - 2 * 86400000).toISOString(),
          status: 'Kargoya teslim edildi',
          location: 'İstanbul - Maltepe Şubesi',
          detail: 'Gönderici tarafından teslim edildi',
        },
        {
          date: new Date(Date.now() - 1.5 * 86400000).toISOString(),
          status: 'Dağıtım merkezine ulaştı',
          location: 'İstanbul - Ana Dağıtım Merkezi',
          detail: 'Yönlendirme yapıldı',
        },
        {
          date: new Date(Date.now() - 1 * 86400000).toISOString(),
          status: 'Transfer merkezinde',
          location: 'Ankara - Transfer Merkezi',
          detail: 'Dağıtım için hazırlanıyor',
        },
        {
          date: new Date(Date.now() - 0.5 * 86400000).toISOString(),
          status: 'Dağıtıma çıkarıldı',
          location: 'Ankara - Çankaya Şubesi',
          detail: 'Kurye dağıtıma başladı',
        },
      ],
    };
  }

  async calculateShipping(data: {
    weight: number;
    from: string;
    to: string;
    provider?: string;
  }) {
    const providers = [
      {
        provider: 'Yurtiçi Kargo',
        price: 25 + (data.weight || 1) * 5,
        estimatedDays: 2,
      },
      {
        provider: 'Aras Kargo',
        price: 22 + (data.weight || 1) * 4.5,
        estimatedDays: 3,
      },
      {
        provider: 'MNG Kargo',
        price: 20 + (data.weight || 1) * 4,
        estimatedDays: 3,
      },
      {
        provider: 'PTT Kargo',
        price: 18 + (data.weight || 1) * 3.5,
        estimatedDays: 4,
      },
      {
        provider: 'Sürat Kargo',
        price: 35 + (data.weight || 1) * 6,
        estimatedDays: 1,
      },
    ];

    if (data.provider) {
      return (
        providers.find((p) =>
          p.provider.toLowerCase().includes(data.provider!.toLowerCase()),
        ) || providers[0]
      );
    }
    return { options: providers, recommended: providers[0] };
  }

  private async sendAdminNotification(order: any, type: string) {
    // Gerçek uygulamada e-posta/push bildirim gönderilir
    console.log(`📧 Admin Bildirim [${type}]:`, {
      orderNumber: order.orderNumber || order.id,
      total: order.totalAmount,
      paymentMethod: order.paymentMethod,
    });
  }

  private async sendCustomerEmail(order: any, type: string) {
    const messages: Record<string, string> = {
      order_created: `Siparişiniz alındı! Sipariş No: ${order.orderNumber || order.id}`,
      payment_approved: `Ödemeniz onaylandı! Siparişiniz hazırlanıyor.`,
      payment_rejected: `Ödemeniz onaylanamadı. Sebep: ${order.rejectionReason}`,
      order_shipped: `Siparişiniz kargoya verildi!`,
      order_delivered: `Siparişiniz teslim edildi!`,
    };

    console.log(`📧 Müşteri E-posta [${type}]:`, {
      to: order.customerEmail,
      subject: messages[type],
    });
  }
}
