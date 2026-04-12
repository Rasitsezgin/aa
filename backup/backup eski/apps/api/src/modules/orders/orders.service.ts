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

export interface CreateOrderDto {
  tenantId: string;
  platform: 'TRENDYOL' | 'AMAZON' | 'HEPSIBURADA' | 'N11' | 'WEBSITE';
  externalOrderId?: string;
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

export interface UpdateOrderDto {
  status?: 'PENDING' | 'PENDING_PAYMENT' | 'PAYMENT_CONFIRMED' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
  paymentStatus?: 'pending' | 'confirmed' | 'failed';
  trackingNumber?: string;
  shippingProvider?: string;
  notes?: string;
}

export interface ApprovePaymentDto {
  adminNote?: string;
}

export interface RejectPaymentDto {
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
  constructor(private prisma: PrismaService) { }

  // Sipariş listesi
  async findAll(filters: OrderFilters) {
    const { tenantId, status, platform, startDate, endDate, search, page = 1, limit = 20 } = filters;

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
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Tek sipariş detayı
  async findOne(id: string, tenantId: string) {
    return this.prisma.order.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          include: { product: true }
        },
        invoice: true
      }
    });
  }

  // Sipariş durumu güncelle
  async updateStatus(id: string, tenantId: string, dto: UpdateOrderDto) {
    // Gerçek uygulamada Prisma ile güncelleme yapılır
    return {
      id,
      ...dto,
      updatedAt: new Date()
    };
  }

  // Sipariş istatistikleri
  async getStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, monthOrders, platformStats] = await Promise.all([
      this.prisma.order.findMany({
        where: { tenantId, orderDate: { gte: today } }
      }),
      this.prisma.order.findMany({
        where: {
          tenantId,
          orderDate: { gte: new Date(today.getFullYear(), today.getMonth(), 1) }
        }
      }),
      this.prisma.order.groupBy({
        by: ['platform'],
        where: { tenantId },
        _count: { id: true },
        _sum: { totalAmount: true }
      })
    ]);

    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const monthRevenue = monthOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    return {
      today: {
        total: todayOrders.length,
        revenue: todayRevenue,
        pending: todayOrders.filter(o => o.status === 'PENDING').length,
        preparing: todayOrders.filter(o => o.status === 'CONFIRMED').length, // Mapped status
      },
      thisMonth: {
        total: monthOrders.length,
        revenue: monthRevenue
      },
      byPlatform: platformStats.map(s => ({
        platform: s.platform,
        count: s._count.id,
        revenue: Number(s._sum.totalAmount) || 0
      }))
    };
  }

  // Toplu işlem - Siparişleri kargola
  async bulkShip(tenantId: string, orderIds: string[], shippingProvider: string) {
    return {
      success: orderIds.length,
      failed: 0,
      orders: orderIds.map(id => ({
        id,
        status: 'SHIPPED',
        trackingNumber: `TR${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase()
      }))
    };
  }

  // ==================== ÖDEME ONAY İŞLEMLERİ ====================

  /**
   * Yeni sipariş oluştur (Web sitesinden)
   */
  async createWebsiteOrder(dto: CreateOrderDto) {
    const orderNumber = this.generateOrderNumber();

    // Ödeme yöntemine göre durum belirle
    const status = dto.paymentMethod === 'credit_card'
      ? 'PAYMENT_CONFIRMED'  // Kredi kartı - otomatik onay
      : 'PENDING_PAYMENT';   // Havale - admin onayı gerekli

    const paymentStatus = dto.paymentMethod === 'credit_card'
      ? 'confirmed'
      : 'pending';

    const order = {
      id: orderNumber,
      orderNumber,
      tenantId: dto.tenantId,
      platform: 'WEBSITE',
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      items: dto.items,
      subtotal: dto.subtotal || dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      shippingCost: dto.shippingCost || 0,
      discount: dto.discount || 0,
      totalAmount: dto.totalAmount,
      paymentMethod: dto.paymentMethod,
      paymentStatus,
      status,
      shippingAddress: dto.shippingAddress,
      city: dto.city,
      district: dto.district,
      postalCode: dto.postalCode,
      cardDetails: dto.paymentMethod === 'credit_card' ? dto.cardDetails : null,
      transferReference: dto.paymentMethod === 'bank_transfer'
        ? this.generateTransferReference()
        : null,
      transferReceipt: dto.transferReceipt,
      notes: dto.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
      confirmedAt: dto.paymentMethod === 'credit_card' ? new Date() : null,
      confirmedBy: dto.paymentMethod === 'credit_card' ? 'Sistem (Otomatik)' : null,
    };

    // Admin bildirim gönder
    if (dto.paymentMethod === 'credit_card') {
      await this.sendAdminNotification(order, 'new_order_credit_card');
    } else {
      await this.sendAdminNotification(order, 'new_order_pending_approval');
    }

    // Müşteriye e-posta gönder
    await this.sendCustomerEmail(order, 'order_created');

    return order;
  }

  /**
   * Onay bekleyen siparişleri getir (Havale)
   */
  async getPendingApprovals(tenantId: string) {
    // Demo data - gerçek uygulamada Prisma sorgusu
    return [
      {
        id: 'SIP-A7B2C9D4',
        orderNumber: 'SIP-A7B2C9D4',
        customerName: 'Ahmet Yılmaz',
        customerEmail: 'ahmet@example.com',
        customerPhone: '0532 123 45 67',
        items: [
          { name: 'iPhone 15 Pro Max', quantity: 1, price: 52999, variant: '256GB - Titanyum' },
          { name: 'AirPods Pro 2', quantity: 1, price: 7499 },
        ],
        totalAmount: 59998,
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        status: 'PENDING_PAYMENT',
        shippingAddress: {
          fullName: 'Ahmet Yılmaz',
          address: 'Barbaros Mah. Şebboy Sk. No:15/3',
          city: 'İstanbul',
          district: 'Beşiktaş',
          postalCode: '34349',
        },
        transferReceipt: 'receipt-001.pdf',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        id: 'SIP-K9L2M6N8',
        orderNumber: 'SIP-K9L2M6N8',
        customerName: 'Mehmet Demir',
        customerEmail: 'mehmet@example.com',
        customerPhone: '0555 111 22 33',
        items: [
          { name: 'Samsung Galaxy S24 Ultra', quantity: 2, price: 54999, variant: '512GB' },
          { name: 'Galaxy Buds Pro', quantity: 2, price: 3499 },
        ],
        totalAmount: 114996,
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        status: 'PENDING_PAYMENT',
        shippingAddress: {
          fullName: 'Mehmet Demir',
          address: 'Kordon Boyu Cad. Marina Apt. No:88/12',
          city: 'İzmir',
          district: 'Konak',
          postalCode: '35260',
        },
        notes: 'Hızlı teslimat talep edildi',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ];
  }

  /**
   * Havale ödemesini onayla
   */
  async approvePayment(orderId: string, tenantId: string, dto: ApprovePaymentDto, adminId: string) {
    // Gerçek uygulamada sipariş kontrolü ve güncelleme yapılır
    const order = {
      id: orderId,
      status: 'PAYMENT_CONFIRMED',
      paymentStatus: 'confirmed',
      confirmedAt: new Date(),
      confirmedBy: adminId,
      adminNotes: dto.adminNote,
      updatedAt: new Date(),
    };

    // Müşteriye bildirim gönder
    await this.sendCustomerEmail(order, 'payment_approved');

    return order;
  }

  /**
   * Havale ödemesini reddet
   */
  async rejectPayment(orderId: string, tenantId: string, dto: RejectPaymentDto, adminId: string) {
    const order = {
      id: orderId,
      status: 'CANCELLED',
      paymentStatus: 'failed',
      rejectedAt: new Date(),
      rejectedBy: adminId,
      rejectionReason: dto.reason,
      adminNotes: dto.adminNote,
      updatedAt: new Date(),
    };

    // Müşteriye red sebebiyle birlikte bildirim gönder
    await this.sendCustomerEmail(order, 'payment_rejected');

    return order;
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
