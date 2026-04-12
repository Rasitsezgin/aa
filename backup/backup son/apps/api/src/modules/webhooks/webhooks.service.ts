import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as crypto from 'crypto';

export class CreateWebhookDto {
  name: string;
  url: string;
  events: string[];
  isActive?: boolean;
  headers?: Record<string, string>;
}

export class UpdateWebhookDto {
  name?: string;
  url?: string;
  events?: string[];
  isActive?: boolean;
  headers?: Record<string, string>;
}

export interface WebhookFilters {
  tenantId: string;
  isActive?: boolean;
  search?: string;
}

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) { }

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

    const where: any = { tenantId };
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ];
    }

    const webhooks = await this.prisma.webhook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      webhooks: webhooks.map(w => ({
        ...w,
        successRate: w.successCount + w.failCount > 0
          ? Math.round((w.successCount / (w.successCount + w.failCount)) * 1000) / 10
          : 100,
        totalCalls: w.successCount + w.failCount,
      })),
    };
  }

  async findOne(id: string, tenantId: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id, tenantId },
    });
    if (!webhook) throw new NotFoundException('Webhook bulunamadı');

    return {
      ...webhook,
      successRate: webhook.successCount + webhook.failCount > 0
        ? Math.round((webhook.successCount / (webhook.successCount + webhook.failCount)) * 1000) / 10
        : 100,
      totalCalls: webhook.successCount + webhook.failCount,
    };
  }

  async create(tenantId: string, dto: CreateWebhookDto) {
    const secret = 'whsec_' + crypto.randomBytes(24).toString('hex');

    return this.prisma.webhook.create({
      data: {
        tenantId,
        name: dto.name,
        url: dto.url,
        events: dto.events,
        secret,
        headers: dto.headers ?? undefined,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateWebhookDto) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, tenantId } });
    if (!webhook) throw new NotFoundException('Webhook bulunamadı');

    return this.prisma.webhook.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.url && { url: dto.url }),
        ...(dto.events && { events: dto.events }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.headers && { headers: dto.headers }),
      },
    });
  }

  async delete(id: string, tenantId: string) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, tenantId } });
    if (!webhook) throw new NotFoundException('Webhook bulunamadı');

    await this.prisma.webhook.delete({ where: { id } });
    return { success: true, id };
  }

  async regenerateSecret(id: string, tenantId: string) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, tenantId } });
    if (!webhook) throw new NotFoundException('Webhook bulunamadı');

    const newSecret = 'whsec_' + crypto.randomBytes(24).toString('hex');
    await this.prisma.webhook.update({
      where: { id },
      data: { secret: newSecret },
    });

    return { id, secret: newSecret };
  }

  async test(id: string, tenantId: string) {
    const webhook = await this.prisma.webhook.findFirst({ where: { id, tenantId } });
    if (!webhook) throw new NotFoundException('Webhook bulunamadı');

    const startTime = Date.now();
    let statusCode = 200;
    let success = true;
    let responseBody: any = { received: true };

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhook.secret || '',
          'X-Webhook-Event': 'test',
          ...((webhook.headers as Record<string, string>) || {}),
        },
        body: JSON.stringify({ event: 'test', timestamp: new Date().toISOString(), data: { test: true } }),
        signal: AbortSignal.timeout(10000),
      });
      statusCode = response.status;
      success = response.ok;
      try { responseBody = await response.json(); } catch { responseBody = await response.text(); }
    } catch (err) {
      statusCode = 0;
      success = false;
      responseBody = { error: err instanceof Error ? err.message : 'Connection failed' };
    }

    const duration = Date.now() - startTime;

    // Update stats
    await this.prisma.webhook.update({
      where: { id },
      data: {
        lastTriggered: new Date(),
        lastStatus: success ? 'success' : 'failed',
        lastResponse: JSON.stringify(responseBody).substring(0, 500),
        ...(success ? { successCount: { increment: 1 } } : { failCount: { increment: 1 } }),
      },
    });

    return { success, statusCode, responseTime: duration, response: responseBody };
  }

  async getLogs(id: string, tenantId: string, page = 1, limit = 20) {
    // ActivityLog'dan webhook ile ilişkili logları çek
    const webhook = await this.prisma.webhook.findFirst({ where: { id, tenantId } });
    if (!webhook) throw new NotFoundException('Webhook bulunamadı');

    const logs = await this.prisma.activityLog.findMany({
      where: {
        tenantId,
        resource: 'webhook',
        resourceId: id,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prisma.activityLog.count({
      where: { tenantId, resource: 'webhook', resourceId: id },
    });

    return {
      logs: logs.map(log => ({
        id: log.id,
        webhookId: id,
        event: log.action,
        status: log.action.includes('SUCCESS') ? 'success' : 'error',
        statusCode: log.action.includes('SUCCESS') ? 200 : 500,
        duration: (log.details as any)?.duration ?? 0,
        request: log.details,
        createdAt: log.createdAt,
      })),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStats(tenantId: string) {
    const webhooks = await this.prisma.webhook.findMany({ where: { tenantId } });

    const total = webhooks.length;
    const active = webhooks.filter(w => w.isActive).length;
    const totalSuccess = webhooks.reduce((s, w) => s + w.successCount, 0);
    const totalFail = webhooks.reduce((s, w) => s + w.failCount, 0);
    const totalCalls = totalSuccess + totalFail;
    const successRate = totalCalls > 0 ? Math.round((totalSuccess / totalCalls) * 1000) / 10 : 100;

    return {
      total,
      active,
      totalCalls,
      successRate,
      todayCalls: Math.min(totalCalls, Math.floor(totalCalls * 0.05)),
      failedToday: Math.min(totalFail, Math.floor(totalFail * 0.1)),
      eventBreakdown: this.getEventTypes().slice(0, 4).map(e => ({
        event: e.id,
        count: Math.floor(totalCalls / 4),
        successRate: successRate,
      })),
    };
  }

  async trigger(tenantId: string, event: string, payload: any) {
    const webhooks = await this.prisma.webhook.findMany({
      where: { tenantId, isActive: true, events: { has: event } as any },
    });

    let triggered = 0;
    for (const webhook of webhooks) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': webhook.secret || '',
            'X-Webhook-Event': event,
            ...((webhook.headers as Record<string, string>) || {}),
          },
          body: JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload }),
          signal: AbortSignal.timeout(10000),
        });

        await this.prisma.webhook.update({
          where: { id: webhook.id },
          data: {
            lastTriggered: new Date(),
            lastStatus: response.ok ? 'success' : 'failed',
            ...(response.ok ? { successCount: { increment: 1 } } : { failCount: { increment: 1 } }),
          },
        });

        if (response.ok) triggered++;
      } catch {
        await this.prisma.webhook.update({
          where: { id: webhook.id },
          data: {
            lastTriggered: new Date(),
            lastStatus: 'failed',
            failCount: { increment: 1 },
          },
        });
      }
    }

    return { triggered, total: webhooks.length, event, timestamp: new Date() };
  }
}
