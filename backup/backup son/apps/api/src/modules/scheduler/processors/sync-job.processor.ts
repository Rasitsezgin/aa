import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../database/prisma.service';
import { MarketplaceService } from '../../marketplace/marketplace.service';

@Processor('sync')
export class SyncJobProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncJobProcessor.name);

  constructor(
    private prisma: PrismaService,
    private marketplaceService: MarketplaceService,
  ) {
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
        case 'marketplace-product-sync':
          return await this.syncMarketplaceProducts(tenantId, platform, integrationId);
        case 'seo-analysis':
          return await this.runSeoAnalysis(tenantId, platform, integrationId, job.data.storeId);
        case 'price-monitoring':
          return await this.runPriceMonitoring(tenantId, platform, integrationId);
        case 'health-check':
          return await this.runHealthCheck(tenantId, platform, integrationId);
        default:
          throw new Error(`Bilinmeyen senkronizasyon tipi: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Senkronizasyon hatası: ${error.message}`, error.stack);

      await this.prisma.activityLog.create({
        data: {
          tenantId,
          action: 'sync.error',
          resource: 'integration',
          resourceId: integrationId,
          details: { error: error.message, platform, jobType: job.name },
        },
      });

      throw error;
    }
  }

  private async syncInventory(tenantId: string, platform: string, integrationId: string) {
    this.logger.log(`Stok senkronizasyonu: ${platform}`);
    
    try {
      const bridge = await this.marketplaceService.getBridgeForTenant(
        tenantId, 
        platform.toUpperCase() as any
      );
      
      const result = await bridge.syncProducts();
      
      await this.prisma.activityLog.create({
        data: {
          tenantId,
          action: 'sync.inventory.success',
          resource: 'integration',
          resourceId: integrationId,
          details: { platform, result },
        },
      });

      return { platform, success: true, result };
    } catch (error) {
      this.logger.error(`Stok senkronizasyonu hatası: ${error.message}`);
      throw error;
    }
  }

  private async syncOrders(tenantId: string, platform: string, integrationId: string) {
    this.logger.log(`Sipariş senkronizasyonu: ${platform}`);
    
    try {
      const bridge = await this.marketplaceService.getBridgeForTenant(
        tenantId,
        platform.toUpperCase() as any
      );
      
      const result = await bridge.syncOrders();
      
      await this.prisma.activityLog.create({
        data: {
          tenantId,
          action: 'sync.orders.success',
          resource: 'integration',
          resourceId: integrationId,
          details: { platform, orderCount: result?.orders?.length || 0 },
        },
      });

      return { platform, success: true, result };
    } catch (error) {
      this.logger.error(`Sipariş senkronizasyonu hatası: ${error.message}`);
      throw error;
    }
  }

  private async syncProducts(tenantId: string, platform: string, integrationId: string) {
    this.logger.log(`Ürün senkronizasyonu: ${platform}`);
    return this.syncInventory(tenantId, platform, integrationId);
  }

  private async syncMarketplaceProducts(tenantId: string, platform: string, integrationId: string) {
    this.logger.log(`Pazaryeri ürün senkronizasyonu: ${platform}`);
    return this.syncInventory(tenantId, platform, integrationId);
  }

  private async runSeoAnalysis(tenantId: string, platform: string, integrationId: string, storeId: string) {
    this.logger.log(`SEO analizi: ${platform} - ${storeId}`);
    
    try {
      const analysis = await this.marketplaceService.analyzeStore(
        platform.toUpperCase() as any,
        storeId
      );

      await this.prisma.activityLog.create({
        data: {
          tenantId,
          action: 'seo.analysis.completed',
          resource: 'integration',
          resourceId: integrationId,
          details: { platform, storeId, metrics: analysis.metrics } as any,
        },
      });

      return { platform, success: true, analysis };
    } catch (error) {
      this.logger.error(`SEO analizi hatası: ${error.message}`);
      throw error;
    }
  }

  private async runPriceMonitoring(tenantId: string, platform: string, integrationId: string) {
    this.logger.log(`Fiyat izleme: ${platform}`);
    
    // Price monitoring implementation
    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'price.monitoring.completed',
        resource: 'integration',
        resourceId: integrationId,
        details: { platform },
      },
    });

    return { platform, success: true };
  }

  // ==================== HEALTH CHECK ====================
  private async runHealthCheck(tenantId: string, platform: string, integrationId: string) {
    this.logger.log(`Sağlık kontrolü: ${platform}`);
    
    try {
      const bridge = await this.marketplaceService.getBridgeForTenant(
        tenantId,
        platform.toUpperCase() as any
      );
      
      // Try to get products (lightweight operation)
      let isHealthy = false;
      let errorMessage = null;
      
      try {
        // Just try to sync a small amount to test connection
        const testResult = await bridge.syncProducts();
        isHealthy = true;
      } catch (error) {
        isHealthy = false;
        errorMessage = error.message;
        this.logger.warn(`Sağlık kontrolü başarısız: ${platform} - ${error.message}`);
      }

      // Update integration status
      await this.prisma.integration.update({
        where: { id: integrationId },
        data: {
          isActive: isHealthy,
          updatedAt: new Date(),
        },
      });

      await this.prisma.activityLog.create({
        data: {
          tenantId,
          action: isHealthy ? 'health.check.success' : 'health.check.failed',
          resource: 'integration',
          resourceId: integrationId,
          details: { 
            platform, 
            isHealthy, 
            error: errorMessage,
            checkedAt: new Date().toISOString()
          } as any,
        },
      });

      return { 
        platform, 
        isHealthy, 
        error: errorMessage,
        checkedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Sağlık kontrolü hatası: ${error.message}`);
      throw error;
    }
  }
}
