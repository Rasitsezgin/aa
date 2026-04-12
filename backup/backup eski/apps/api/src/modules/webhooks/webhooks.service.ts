import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as crypto from 'crypto';

export interface CreateWebhookDto {
  name: string;
  url: string;
  events: string[];
  isActive?: boolean;
}

export interface UpdateWebhookDto {
  name?: string;
  url?: string;
  events?: string[];
  isActive?: boolean;
}

export interface WebhookFilters {
  tenantId: string;
  isActive?: boolean;
  search?: string;
}

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  // Tüm event türleri
  getEventTypes() {
    return [
      { id: 'order.created', label: 'Yeni Sipariş', category: 'Sipariş' },
      { id: 'order.updated', label: 'Sipariş Güncellendi', category: 'Sipariş' },
      { id: 'order.cancelled', label: 'Sipariş İptal', category: 'Sipariş' },
      { id: 'order.shipped', label: 'Sipariş Kargoda', category: 'Sipariş' },
      { id: 'order.delivered', label: 'Sipariş Teslim Edildi', category: 'Sipariş' },
      { id: 'product.created', label: 'Yeni Ürün', category: 'Ürün' },
      { id: 'product.updated', label: 'Ürün Güncellendi', category: 'Ürün' },
      { id: 'product.deleted', label: 'Ürün Silindi', category: 'Ürün' },
      { id: 'stock.low', label: 'Düşük Stok', category: 'Stok' },
      { id: 'stock.critical', label: 'Kritik Stok', category: 'Stok' },
      { id: 'stock.updated', label: 'Stok Güncellendi', category: 'Stok' },
      { id: 'customer.created', label: 'Yeni Müşteri', category: 'Müşteri' },
      { id: 'customer.vip', label: 'VIP Müşteri', category: 'Müşteri' },
      { id: 'payment.received', label: 'Ödeme Alındı', category: 'Finans' },
      { id: 'payment.failed', label: 'Ödeme Başarısız', category: 'Finans' },
    ];
  }

  async findAll(filters: WebhookFilters) {
    const { tenantId, isActive, search } = filters;

    // Demo webhook verileri
    const demoWebhooks = [
      {
        id: 'wh-1',
        name: 'ERP Sipariş Senkronizasyonu',
        url: 'https://erp.firma.com/api/webhooks/orders',
        events: ['order.created', 'order.updated', 'order.shipped'],
        isActive: true,
        secret: 'whsec_' + crypto.randomBytes(16).toString('hex'),
        lastTriggered: new Date('2024-01-15T14:30:00'),
        successRate: 98.5,
        totalCalls: 1247,
        createdAt: new Date('2023-10-01')
      },
      {
        id: 'wh-2',
        name: 'Stok Yönetim Sistemi',
        url: 'https://stock.firma.com/webhook/receive',
        events: ['stock.low', 'stock.critical', 'stock.updated'],
        isActive: true,
        secret: 'whsec_' + crypto.randomBytes(16).toString('hex'),
        lastTriggered: new Date('2024-01-15T13:15:00'),
        successRate: 100,
        totalCalls: 456,
        createdAt: new Date('2023-11-15')
      },
      {
        id: 'wh-3',
        name: 'Slack Bildirimleri',
        url: 'https://hooks.slack.com/services/xxx',
        events: ['order.created', 'stock.critical', 'payment.failed'],
        isActive: true,
        secret: 'whsec_' + crypto.randomBytes(16).toString('hex'),
        lastTriggered: new Date('2024-01-15T15:22:00'),
        successRate: 99.2,
        totalCalls: 892,
        createdAt: new Date('2023-09-20')
      }
    ];

    let filtered = demoWebhooks;
    if (isActive !== undefined) {
      filtered = filtered.filter(w => w.isActive === isActive);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(searchLower) ||
        w.url.toLowerCase().includes(searchLower)
      );
    }

    return { webhooks: filtered };
  }

  async findOne(id: string, tenantId: string) {
    return {
      id,
      name: 'ERP Sipariş Senkronizasyonu',
      url: 'https://erp.firma.com/api/webhooks/orders',
      events: ['order.created', 'order.updated', 'order.shipped'],
      isActive: true,
      secret: 'whsec_' + crypto.randomBytes(16).toString('hex'),
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'value'
      },
      lastTriggered: new Date('2024-01-15T14:30:00'),
      successRate: 98.5,
      totalCalls: 1247,
      createdAt: new Date('2023-10-01'),
      updatedAt: new Date('2024-01-15')
    };
  }

  async create(tenantId: string, dto: CreateWebhookDto) {
    const secret = 'whsec_' + crypto.randomBytes(24).toString('hex');
    
    return {
      id: 'wh-' + Date.now(),
      ...dto,
      secret,
      isActive: dto.isActive ?? true,
      successRate: 100,
      totalCalls: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async update(id: string, tenantId: string, dto: UpdateWebhookDto) {
    return {
      id,
      ...dto,
      updatedAt: new Date()
    };
  }

  async delete(id: string, tenantId: string) {
    return { success: true, id };
  }

  async regenerateSecret(id: string, tenantId: string) {
    const newSecret = 'whsec_' + crypto.randomBytes(24).toString('hex');
    return { id, secret: newSecret };
  }

  async test(id: string, tenantId: string) {
    // Test payload gönder
    return {
      success: true,
      statusCode: 200,
      responseTime: 245,
      response: { received: true }
    };
  }

  async getLogs(id: string, tenantId: string, page = 1, limit = 20) {
    const logs = [
      {
        id: 'log-1',
        webhookId: id,
        event: 'order.created',
        status: 'success',
        statusCode: 200,
        duration: 245,
        request: { orderId: 'ORD-001', event: 'order.created' },
        response: { received: true },
        createdAt: new Date()
      },
      {
        id: 'log-2',
        webhookId: id,
        event: 'order.shipped',
        status: 'success',
        statusCode: 200,
        duration: 189,
        request: { orderId: 'ORD-002', event: 'order.shipped' },
        response: { received: true },
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        id: 'log-3',
        webhookId: id,
        event: 'stock.critical',
        status: 'error',
        statusCode: 500,
        duration: 5023,
        request: { sku: 'SKU-001', event: 'stock.critical' },
        response: { error: 'Internal Server Error' },
        createdAt: new Date(Date.now() - 7200000)
      }
    ];

    return {
      logs,
      pagination: {
        total: logs.length,
        page,
        limit,
        totalPages: 1
      }
    };
  }

  async getStats(tenantId: string) {
    return {
      total: 4,
      active: 3,
      totalCalls: 2829,
      successRate: 98.7,
      todayCalls: 156,
      failedToday: 2,
      eventBreakdown: [
        { event: 'order.created', count: 892, successRate: 99.2 },
        { event: 'order.shipped', count: 567, successRate: 98.5 },
        { event: 'stock.critical', count: 45, successRate: 100 },
        { event: 'payment.received', count: 234, successRate: 97.8 }
      ]
    };
  }

  // Webhook tetikleme (internal use)
  async trigger(tenantId: string, event: string, payload: any) {
    // Gerçek uygulamada:
    // 1. Bu tenant için event'i dinleyen webhook'ları bul
    // 2. Her birine HTTP POST gönder
    // 3. Log kaydet
    // 4. Retry logic uygula
    
    return {
      triggered: 3,
      event,
      timestamp: new Date()
    };
  }
}
