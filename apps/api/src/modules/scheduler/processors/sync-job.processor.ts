import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../database/prisma.service';

@Processor('sync')
export class SyncJobProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncJobProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Senkronizasyon işleniyor: ${job.name} - Platform: ${job.data.platform}`);

    const { tenantId, platform, integrationId } = job.data;

    try {
      switch (job.name) {
        case 'inventory-sync':
          return await this.syncInventory(tenantId, platform, integrationId);
        case 'order-sync':
          return await this.syncOrders(tenantId, platform, integrationId);
        case 'products-sync':
          return await this.syncProducts(tenantId, platform, integrationId);
        default:
          throw new Error(`Bilinmeyen senkronizasyon tipi: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Senkronizasyon hatası: ${error.message}`, error.stack);

      // Hata logu oluştur
      await this.prisma.activityLog.create({
        data: {
          tenantId,
          action: 'sync.error',
          resource: 'integration',
          resourceId: integrationId,
          details: { error: error.message, platform },
        },
      });

      throw error;
    }
  }

  private async syncInventory(tenantId: string, platform: string, integrationId: string) {
    this.logger.log(`Stok senkronizasyonu: ${platform}`);

    // Simüle edilmiş senkronizasyon
    // Gerçek uygulamada marketplace API'leri çağrılır
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      select: { id: true, sku: true, stock: true },
    });

    // Başarılı senkronizasyon logu
    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'sync.inventory.success',
        resource: 'integration',
        resourceId: integrationId,
        details: { platform, productCount: products.length },
      },
    });

    return {
      platform,
      syncedProducts: products.length,
      timestamp: new Date().toISOString(),
    };
  }

  private async syncOrders(tenantId: string, platform: string, integrationId: string) {
    this.logger.log(`Sipariş senkronizasyonu: ${platform}`);

    // Simüle edilmiş sipariş çekme
    // Gerçek uygulamada marketplace API'lerinden yeni siparişler çekilir

    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'sync.orders.success',
        resource: 'integration',
        resourceId: integrationId,
        details: { platform },
      },
    });

    return {
      platform,
      newOrders: 0,
      updatedOrders: 0,
      timestamp: new Date().toISOString(),
    };
  }

  private async syncProducts(tenantId: string, platform: string, integrationId: string) {
    this.logger.log(`Ürün senkronizasyonu: ${platform}`);

    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'sync.products.success',
        resource: 'integration',
        resourceId: integrationId,
        details: { platform },
      },
    });

    return {
      platform,
      syncedProducts: 0,
      timestamp: new Date().toISOString(),
    };
  }
}
