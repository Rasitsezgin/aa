/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  MarketplaceService,
  Platform,
} from '../../marketplace/marketplace.service';
import { AIAssistantGateway } from '../ai-assistant.gateway';
import { AiService } from '../../ai/ai.service';

export interface SyncJob {
  id: string;
  tenantId: string;
  userId: string;
  platform: string;
  type: 'BRAND' | 'CATEGORY' | 'ATTRIBUTE' | 'PRODUCT' | 'STOCK' | 'PRICE';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  result?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

@Injectable()
export class AIAssistantMarketplaceIntegrationService {
  private readonly logger = new Logger(
    AIAssistantMarketplaceIntegrationService.name,
  );

  constructor(
    private prisma: PrismaService,
    private marketplaceService: MarketplaceService,
    private gateway: AIAssistantGateway,
    private aiService: AiService,
  ) {}

  // ==================== BRAND SYNC ====================

  async syncBrands(
    tenantId: string,
    userId: string,
    platform: string,
  ): Promise<SyncJob> {
    // Create job record
    const job = await this.createSyncJob(tenantId, userId, platform, 'BRAND');

    // Start async processing
    this.processBrandSync(job.id, tenantId, userId, platform).catch((error) => {
      this.logger.error(`Brand sync failed for ${platform}:`, error);
    });

    return job;
  }

  private async processBrandSync(
    jobId: string,
    tenantId: string,
    userId: string,
    platform: string,
  ): Promise<void> {
    try {
      await this.updateJobStatus(jobId, 'PROCESSING');

      // Notify user
      this.gateway.notifySyncProgress(userId, {
        jobId,
        type: 'BRAND_SYNC',
        platform,
        progress: 0,
        status: 'processing',
        message: `${platform} markaları çekiliyor...`,
      });

      // Get the bridge for this platform
      const bridge = await this.marketplaceService.getBridgeForTenant(
        tenantId,
        platform as Platform,
      );

      // Fetch brands from marketplace
      const brands = await this.fetchBrandsFromBridge(bridge, platform);

      // Process and save brands
      let processed = 0;
      const total = brands.length;

      for (const brand of brands) {
        await this.saveBrand(tenantId, platform, brand);
        processed++;

        // Update progress every 10 items
        if (processed % 10 === 0 || processed === total) {
          const progress = Math.round((processed / total) * 100);
          await this.updateJobProgress(jobId, progress, processed, 0, total);

          this.gateway.notifySyncProgress(userId, {
            jobId,
            type: 'BRAND_SYNC',
            platform,
            progress,
            status: 'processing',
            message: `${processed}/${total} marka işlendi`,
            details: { current: processed, total },
          });
        }
      }

      // Complete job
      await this.completeJob(jobId, {
        totalBrands: total,
        newBrands: processed,
        platform,
      });

      // Notify completion
      this.gateway.notifySyncCompleted(userId, {
        jobId,
        type: 'BRAND_SYNC',
        platform,
        success: true,
        message: `${total} marka başarıyla eşitlendi`,
        stats: {
          total,
          processed,
          failed: 0,
        },
      });
    } catch (error) {
      await this.failJob(
        jobId,
        error instanceof Error ? error.message : 'Sync failed',
      );

      this.gateway.notifySyncCompleted(userId, {
        jobId,
        type: 'BRAND_SYNC',
        platform,
        success: false,
        message: `Marka eşitleme başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
      });
    }
  }

  // ==================== CATEGORY SYNC ====================

  async syncCategories(
    tenantId: string,
    userId: string,
    platform: string,
  ): Promise<SyncJob> {
    const job = await this.createSyncJob(
      tenantId,
      userId,
      platform,
      'CATEGORY',
    );

    this.processCategorySync(job.id, tenantId, userId, platform).catch(
      (error) => {
        this.logger.error(`Category sync failed for ${platform}:`, error);
      },
    );

    return job;
  }

  private async processCategorySync(
    jobId: string,
    tenantId: string,
    userId: string,
    platform: string,
  ): Promise<void> {
    try {
      await this.updateJobStatus(jobId, 'PROCESSING');

      this.gateway.notifySyncProgress(userId, {
        jobId,
        type: 'CATEGORY_SYNC',
        platform,
        progress: 0,
        status: 'processing',
        message: `${platform} kategorileri çekiliyor...`,
      });

      const bridge = await this.marketplaceService.getBridgeForTenant(
        tenantId,
        platform as Platform,
      );

      const categories = await this.fetchCategoriesFromBridge(bridge, platform);

      // Process categories recursively
      let processed = 0;
      const total = this.countCategories(categories);

      await this.processCategoryTree(
        tenantId,
        platform,
        categories,
        null,
        async () => {
          processed++;
          if (processed % 5 === 0 || processed === total) {
            const progress = Math.round((processed / total) * 100);
            await this.updateJobProgress(jobId, progress, processed, 0, total);

            this.gateway.notifySyncProgress(userId, {
              jobId,
              type: 'CATEGORY_SYNC',
              platform,
              progress,
              status: 'processing',
              message: `${processed}/${total} kategori işlendi`,
            });
          }
        },
      );

      await this.completeJob(jobId, { totalCategories: total, platform });

      this.gateway.notifySyncCompleted(userId, {
        jobId,
        type: 'CATEGORY_SYNC',
        platform,
        success: true,
        message: `${total} kategori başarıyla eşitlendi`,
        stats: { total, processed, failed: 0 },
      });
    } catch (error) {
      await this.failJob(
        jobId,
        error instanceof Error ? error.message : 'Sync failed',
      );

      this.gateway.notifySyncCompleted(userId, {
        jobId,
        type: 'CATEGORY_SYNC',
        platform,
        success: false,
        message: `Kategori eşitleme başarısız`,
      });
    }
  }

  // ==================== PRODUCT UPLOAD ====================

  async uploadProduct(
    tenantId: string,
    userId: string,
    platform: string,
    productData: {
      productId?: string;
      sku?: string;
      optimize?: boolean;
    },
  ): Promise<SyncJob> {
    const job = await this.createSyncJob(tenantId, userId, platform, 'PRODUCT');

    this.processProductUpload(
      job.id,
      tenantId,
      userId,
      platform,
      productData,
    ).catch((error) => {
      this.logger.error(`Product upload failed for ${platform}:`, error);
    });

    return job;
  }

  private async processProductUpload(
    jobId: string,
    tenantId: string,
    userId: string,
    platform: string,
    productData: any,
  ): Promise<void> {
    try {
      await this.updateJobStatus(jobId, 'PROCESSING');

      this.gateway.notifySyncProgress(userId, {
        jobId,
        type: 'PRODUCT_UPLOAD',
        platform,
        progress: 10,
        status: 'processing',
        message: 'Ürün bilgileri hazırlanıyor...',
      });

      // Get product from database
      const product = await this.getProduct(
        tenantId,
        productData.productId,
        productData.sku,
      );

      if (!product) {
        throw new Error('Ürün bulunamadı');
      }

      // AI optimization if requested
      if (productData.optimize) {
        this.gateway.notifySyncProgress(userId, {
          jobId,
          type: 'PRODUCT_UPLOAD',
          platform,
          progress: 30,
          status: 'processing',
          message: 'AI ile içerik optimizasyonu yapılıyor...',
        });

        await this.optimizeProductContent(product);
      }

      this.gateway.notifySyncProgress(userId, {
        jobId,
        type: 'PRODUCT_UPLOAD',
        platform,
        progress: 60,
        status: 'processing',
        message: `${platform} API'sine gönderiliyor...`,
      });

      // Get bridge and upload
      const bridge = await this.marketplaceService.getBridgeForTenant(
        tenantId,
        platform as Platform,
      );

      const result = await this.uploadProductToBridge(bridge, product);

      await this.completeJob(jobId, {
        productId: product.id,
        platformProductId: result.platformProductId,
        platform,
      });

      this.gateway.notifySyncCompleted(userId, {
        jobId,
        type: 'PRODUCT_UPLOAD',
        platform,
        success: true,
        message: `"${product.title}" ürünü ${platform}'a başarıyla yüklendi`,
        stats: { total: 1, processed: 1, failed: 0 },
      });
    } catch (error) {
      await this.failJob(
        jobId,
        error instanceof Error ? error.message : 'Upload failed',
      );

      this.gateway.notifySyncCompleted(userId, {
        jobId,
        type: 'PRODUCT_UPLOAD',
        platform,
        success: false,
        message: `Ürün yükleme başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
      });
    }
  }

  // ==================== STOCK SYNC ====================

  async syncStock(
    tenantId: string,
    userId: string,
    platform: string,
    filters?: { productIds?: string[]; categoryId?: string },
  ): Promise<SyncJob> {
    const job = await this.createSyncJob(tenantId, userId, platform, 'STOCK');

    this.processStockSync(job.id, tenantId, userId, platform, filters).catch(
      (error) => {
        this.logger.error(`Stock sync failed for ${platform}:`, error);
      },
    );

    return job;
  }

  private async processStockSync(
    jobId: string,
    tenantId: string,
    userId: string,
    platform: string,
    filters?: any,
  ): Promise<void> {
    try {
      await this.updateJobStatus(jobId, 'PROCESSING');

      // Get products to sync
      const products = await this.getProductsForStockSync(tenantId, filters);
      const total = products.length;

      this.gateway.notifySyncProgress(userId, {
        jobId,
        type: 'STOCK_SYNC',
        platform,
        progress: 0,
        status: 'processing',
        message: `${total} ürün için stok senkronizasyonu başlatıldı`,
      });

      const bridge = await this.marketplaceService.getBridgeForTenant(
        tenantId,
        platform as Platform,
      );

      let processed = 0;
      let failed = 0;

      for (const product of products) {
        try {
          await bridge.updateStock(product.sku, product.stock);
          processed++;
        } catch {
          failed++;
        }

        if ((processed + failed) % 10 === 0 || processed + failed === total) {
          const progress = Math.round(((processed + failed) / total) * 100);
          await this.updateJobProgress(
            jobId,
            progress,
            processed,
            failed,
            total,
          );

          this.gateway.notifySyncProgress(userId, {
            jobId,
            type: 'STOCK_SYNC',
            platform,
            progress,
            status: 'processing',
            message: `${processed + failed}/${total} ürün işlendi (${failed} hata)`,
          });
        }
      }

      await this.completeJob(jobId, { total, processed, failed, platform });

      this.gateway.notifySyncCompleted(userId, {
        jobId,
        type: 'STOCK_SYNC',
        platform,
        success: failed === 0,
        message: `Stok senkronizasyonu tamamlandı. ${processed} başarılı, ${failed} başarısız`,
        stats: { total, processed, failed },
      });
    } catch (error) {
      await this.failJob(
        jobId,
        error instanceof Error ? error.message : 'Sync failed',
      );

      this.gateway.notifySyncCompleted(userId, {
        jobId,
        type: 'STOCK_SYNC',
        platform,
        success: false,
        message: 'Stok senkronizasyonu başarısız',
      });
    }
  }

  // ==================== HELPER METHODS ====================

  private async createSyncJob(
    tenantId: string,
    userId: string,
    platform: string,
    type: SyncJob['type'],
  ): Promise<SyncJob> {
    const job = await this.prisma.aIAssistantSyncJob.create({
      data: {
        tenantId,
        userId,
        platform,
        type: `${type}_SYNC` as any,
        status: 'PENDING',
        totalItems: 0,
        processedItems: 0,
        failedItems: 0,
      },
    });

    return {
      id: job.id,
      tenantId: job.tenantId,
      userId: job.userId,
      platform: job.platform,
      type: type,
      status: job.status as SyncJob['status'],
      progress: Math.round((job.processedItems / (job.totalItems || 1)) * 100),
      totalItems: job.totalItems,
      processedItems: job.processedItems,
      failedItems: job.failedItems,
    };
  }

  private async updateJobStatus(
    jobId: string,
    status: SyncJob['status'],
  ): Promise<void> {
    await this.prisma.aIAssistantSyncJob.update({
      where: { id: jobId },
      data: {
        status,
        ...(status === 'PROCESSING' && { startedAt: new Date() }),
      },
    });
  }

  private async updateJobProgress(
    jobId: string,
    progress: number,
    processed: number,
    failed: number,
    total: number,
  ): Promise<void> {
    await this.prisma.aIAssistantSyncJob.update({
      where: { id: jobId },
      data: {
        processedItems: processed,
        failedItems: failed,
        totalItems: total,
      },
    });
  }

  private async completeJob(jobId: string, result: any): Promise<void> {
    await this.prisma.aIAssistantSyncJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        result: result,
      },
    });
  }

  private async failJob(jobId: string, error: string): Promise<void> {
    await this.prisma.aIAssistantSyncJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errors: JSON.stringify({ message: error }),
      },
    });
  }

  // ==================== BRIDGE INTEGRATION METHODS ====================

  private async fetchBrandsFromBridge(
    bridge: any,
    platform: string,
  ): Promise<any[]> {
    // Each bridge should have a getBrands method
    if (bridge.getBrands) {
      return bridge.getBrands();
    }

    // Fallback: sync products and extract unique brands
    if (bridge.syncProducts) {
      const products = await bridge.syncProducts();
      const brands = new Map();

      for (const product of products) {
        if (product.brand) {
          brands.set(product.brand.id || product.brand, product.brand);
        }
      }

      return Array.from(brands.values());
    }

    return [];
  }

  private async saveBrand(
    tenantId: string,
    platform: string,
    brand: any,
  ): Promise<void> {
    await this.prisma.marketplaceBrand.upsert({
      where: {
        tenantId_platform_brandId: {
          tenantId,
          platform,
          brandId: brand.id || brand.name,
        },
      },
      update: {
        name: brand.name,
        updatedAt: new Date(),
        lastSyncedAt: new Date(),
      },
      create: {
        tenantId,
        platform,
        brandId: brand.id || brand.name,
        name: brand.name,
        lastSyncedAt: new Date(),
      },
    });
  }

  private async fetchCategoriesFromBridge(
    bridge: any,
    platform: string,
  ): Promise<any[]> {
    if (bridge.getCategories) {
      return bridge.getCategories();
    }

    // Fallback implementation
    return [];
  }

  private countCategories(categories: any[]): number {
    let count = 0;
    for (const cat of categories) {
      count++;
      if (cat.children) {
        count += this.countCategories(cat.children);
      }
    }
    return count;
  }

  private async processCategoryTree(
    tenantId: string,
    platform: string,
    categories: any[],
    parentId: string | null,
    onProgress: () => Promise<void>,
  ): Promise<void> {
    for (const category of categories) {
      await this.saveCategory(tenantId, platform, category, parentId);
      await onProgress();

      if (category.children) {
        await this.processCategoryTree(
          tenantId,
          platform,
          category.children,
          category.id,
          onProgress,
        );
      }
    }
  }

  private async saveCategory(
    tenantId: string,
    platform: string,
    category: any,
    parentId: string | null,
  ): Promise<void> {
    await this.prisma.marketplaceCategory.upsert({
      where: {
        tenantId_platform_categoryId: {
          tenantId,
          platform,
          categoryId: category.id,
        },
      },
      update: {
        name: category.name,
        parentId,
        isLeaf: !category.children || category.children.length === 0,
        updatedAt: new Date(),
        lastSyncedAt: new Date(),
      },
      create: {
        tenantId,
        platform,
        categoryId: category.id,
        name: category.name,
        parentId,
        isLeaf: !category.children || category.children.length === 0,
        lastSyncedAt: new Date(),
      },
    });
  }

  private async getProduct(
    tenantId: string,
    productId?: string,
    sku?: string,
  ): Promise<any> {
    if (productId) {
      return this.prisma.product.findFirst({
        where: { id: productId, tenantId },
      });
    }

    if (sku) {
      return this.prisma.product.findFirst({
        where: { sku, tenantId },
      });
    }

    return null;
  }

  private async optimizeProductContent(product: any): Promise<{
    optimizedTitle: string;
    optimizedDescription: string;
    seoScore: number;
  }> {
    try {
      if (!this.aiService) {
        this.logger.warn('AI service not available, skipping optimization');
        return {
          optimizedTitle: product.title,
          optimizedDescription: product.description || '',
          seoScore: 0,
        };
      }

      const result = await this.aiService.analyzeProductContent(
        product.title,
        product.description || '',
      );

      return {
        optimizedTitle: result.improvedTitle || product.title,
        optimizedDescription:
          result.improvedDescription || product.description || '',
        seoScore: result.seoScore || 0,
      };
    } catch (error) {
      this.logger.error('Product content optimization failed:', error);
      return {
        optimizedTitle: product.title,
        optimizedDescription: product.description || '',
        seoScore: 0,
      };
    }
  }

  private async uploadProductToBridge(bridge: any, product: any): Promise<any> {
    if (bridge.createProduct) {
      return bridge.createProduct(product);
    }

    if (bridge.updateProduct) {
      return bridge.updateProduct(product.sku, product);
    }

    throw new Error('Platform does not support product upload');
  }

  private async getProductsForStockSync(
    tenantId: string,
    filters?: any,
  ): Promise<any[]> {
    const where: any = { tenantId };

    if (filters?.productIds) {
      where.id = { in: filters.productIds };
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    return this.prisma.product.findMany({
      where,
      select: {
        id: true,
        sku: true,
        stock: true,
        title: true,
      },
    });
  }

  // ==================== JOB MANAGEMENT ====================

  async getJobStatus(jobId: string): Promise<SyncJob | null> {
    const job = await this.prisma.aIAssistantSyncJob.findUnique({
      where: { id: jobId },
    });

    if (!job) return null;

    return {
      id: job.id,
      tenantId: job.tenantId,
      userId: job.userId,
      platform: job.platform,
      type: job.type as SyncJob['type'],
      status: job.status as SyncJob['status'],
      progress: Math.round((job.processedItems / (job.totalItems || 1)) * 100),
      totalItems: job.totalItems,
      processedItems: job.processedItems,
      failedItems: job.failedItems,
      result: job.result as any,
      error: job.errors ? JSON.stringify(job.errors) : undefined,
      startedAt: job.startedAt || undefined,
      completedAt: job.completedAt || undefined,
    };
  }

  async getActiveJobs(tenantId: string, userId: string): Promise<SyncJob[]> {
    const jobs = await this.prisma.aIAssistantSyncJob.findMany({
      where: {
        tenantId,
        userId,
        status: { in: ['PENDING', 'PROCESSING'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map((job) => ({
      id: job.id,
      tenantId: job.tenantId,
      userId: job.userId,
      platform: job.platform,
      type: job.type as SyncJob['type'],
      status: job.status as SyncJob['status'],
      progress: Math.round((job.processedItems / (job.totalItems || 1)) * 100),
      totalItems: job.totalItems,
      processedItems: job.processedItems,
      failedItems: job.failedItems,
      startedAt: job.startedAt || undefined,
    }));
  }

  async cancelJob(jobId: string, tenantId: string): Promise<void> {
    await this.prisma.aIAssistantSyncJob.updateMany({
      where: { id: jobId, tenantId },
      data: {
        status: 'FAILED',
        errors: JSON.stringify({ message: 'Cancelled by user' }),
      },
    });
  }
}
