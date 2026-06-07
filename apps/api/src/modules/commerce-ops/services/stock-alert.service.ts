import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IntegrationSyncQueueService } from '../../integrations-core/queue/integration-sync-queue.service';
import { IntegrationCategory } from '../../integrations-core/enums/integration-category.enum';
import { IntegrationSyncType } from '../../integrations-core/enums/integration-category.enum';

/**
 * Kritik stok uyarıları — yok satmayı önler, çok kanallı stok senkronu tetikler.
 */
@Injectable()
export class StockAlertService {
  private readonly logger = new Logger(StockAlertService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly syncQueue: IntegrationSyncQueueService,
  ) {}

  async listRules(tenantId: string) {
    return this.prisma.stockAlertRule.findMany({
      where: { tenantId },
      include: { product: { select: { id: true, title: true, sku: true, stock: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async upsertRule(
    tenantId: string,
    data: {
      productId?: string;
      criticalLevel?: number;
      reorderLevel?: number;
      autoPauseListing?: boolean;
      syncAllChannels?: boolean;
    },
  ) {
    if (data.productId) {
      const existing = await this.prisma.stockAlertRule.findFirst({
        where: { tenantId, productId: data.productId },
      });
      if (existing) {
        return this.prisma.stockAlertRule.update({
          where: { id: existing.id },
          data: {
            criticalLevel: data.criticalLevel ?? existing.criticalLevel,
            reorderLevel: data.reorderLevel ?? existing.reorderLevel,
            autoPauseListing: data.autoPauseListing ?? existing.autoPauseListing,
            syncAllChannels: data.syncAllChannels ?? existing.syncAllChannels,
          },
        });
      }
    }

    return this.prisma.stockAlertRule.create({
      data: {
        tenantId,
        productId: data.productId,
        criticalLevel: data.criticalLevel ?? 5,
        reorderLevel: data.reorderLevel ?? 10,
        autoPauseListing: data.autoPauseListing ?? false,
        syncAllChannels: data.syncAllChannels ?? true,
      },
    });
  }

  /** Tüm ürünleri tarar, kritik stok altındakileri döner ve aksiyon alır */
  async scanAndAlert(tenantId: string) {
    const rules = await this.prisma.stockAlertRule.findMany({
      where: { tenantId, isActive: true },
      include: { product: true },
    });

    const globalRule = rules.find((r) => !r.productId);
    const defaultCritical = globalRule?.criticalLevel ?? 5;

    const products = await this.prisma.product.findMany({
      where: { tenantId, status: 'active' },
      select: { id: true, title: true, sku: true, stock: true },
    });

    const alerts: Array<{
      productId: string;
      title: string;
      stock: number;
      criticalLevel: number;
      action: string;
    }> = [];

    for (const product of products) {
      const rule = rules.find((r) => r.productId === product.id);
      const critical = rule?.criticalLevel ?? defaultCritical;

      if (product.stock > critical) continue;

      let action = 'alert';
      if (rule?.autoPauseListing) {
        await this.prisma.product.update({
          where: { id: product.id },
          data: { status: 'paused' },
        });
        action = 'paused';
      }

      if (rule?.syncAllChannels ?? globalRule?.syncAllChannels) {
        const integrations = await this.prisma.integration.findMany({
          where: { tenantId, isActive: true },
        });
        for (const integration of integrations) {
          const extra = (integration.apiExtra as Record<string, unknown>) ?? {};
          const providerId = String(extra.marketplaceId ?? integration.platform.toLowerCase());
          await this.syncQueue.enqueueSync({
            tenantId,
            integrationId: integration.id,
            providerId,
            category: IntegrationCategory.MARKETPLACE,
            syncType: IntegrationSyncType.STOCK_UPDATE,
            sku: product.sku,
            quantity: Math.max(0, product.stock),
          }).catch(() => undefined);
        }
        action = `${action}+sync`;
      }

      if (rule) {
        await this.prisma.stockAlertRule.update({
          where: { id: rule.id },
          data: { lastTriggeredAt: new Date() },
        });
      }

      alerts.push({
        productId: product.id,
        title: product.title,
        stock: product.stock,
        criticalLevel: critical,
        action,
      });
    }

    this.logger.log(`[${tenantId}] Stock scan: ${alerts.length} alert`);
    return { total: alerts.length, alerts };
  }
}
