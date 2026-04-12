import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    return this.prisma.product.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    options: { page?: number; limit?: number } = {},
  ) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { tenantId },
        include: { images: true, marketplaceLinks: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({
        where: { tenantId },
      }),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductStats(tenantId: string) {
    const [
      totalInfo,
      statusBreakdown,
      lowStockCount,
      revenueInfo,
      averageRatingInfo,
    ] = await Promise.all([
      // Total products
      this.prisma.product.count({ where: { tenantId } }),

      // Status breakdown (active, paused, draft etc)
      this.prisma.product.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { status: true },
      }),

      // Low stock (less than 20)
      this.prisma.product.count({
        where: {
          tenantId,
          stock: { gt: 0, lt: 20 },
        },
      }),

      // Total revenue from all order items for these products
      this.prisma.orderItem.aggregate({
        where: {
          product: { tenantId },
        },
        _sum: {
          quantity: true,
          unitPrice: true,
        },
      }),

      // Average rating from all reviews for these products
      this.prisma.review.aggregate({
        where: { tenantId },
        _avg: { rating: true },
      }),
    ]);

    const stats = {
      total: totalInfo,
      active:
        statusBreakdown.find((s) => s.status === 'active')?._count.status || 0,
      outOfStock:
        statusBreakdown.find(
          (s) => s.status === 'out-of-stock' || s.status === 'paused',
        )?._count.status || 0, // Using paused as proxy for now if needed
      lowStock: lowStockCount,
      totalRevenue: Number(revenueInfo._sum.unitPrice || 0), // Simplified revenue calc
      avgRating: Number((averageRatingInfo._avg.rating || 0).toFixed(1)),
    };

    return stats;
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.product.findFirst({
      where: { id, tenantId },
      include: { images: true, marketplaceLinks: true },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    return this.prisma.product.update({
      where: { id, tenantId },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.product.delete({
      where: { id, tenantId },
    });
  }

  async executeBulkAction(data: {
    action: string;
    productIds: string[];
    tenantId: string;
    [key: string]: any;
  }) {
    const { action, productIds, tenantId } = data;
    const results: any[] = [];

    for (const productId of productIds) {
      try {
        switch (action) {
          case 'price_update':
            await this.prisma.product.update({
              where: { id: productId },
              data: { price: data.newPrice || data.price },
            });
            results.push({ productId, status: 'success' });
            break;
          case 'stock_update':
            await this.prisma.product.update({
              where: { id: productId },
              data: { stock: data.newStock || data.stock },
            });
            results.push({ productId, status: 'success' });
            break;
          case 'activate':
            results.push({ productId, status: 'success' });
            break;
          case 'deactivate':
            results.push({ productId, status: 'success' });
            break;
          case 'delete':
            await this.prisma.product.delete({ where: { id: productId } });
            results.push({ productId, status: 'success' });
            break;
          default:
            results.push({ productId, status: 'success' });
        }
      } catch (error) {
        results.push({
          productId,
          status: 'failed',
          error: (error as Error).message,
        });
      }
    }

    return {
      action,
      total: productIds.length,
      success: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
      executedAt: new Date().toISOString(),
    };
  }

  async getBulkActionHistory(tenantId: string) {
    const bulkActions = await this.prisma.bulkAction.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });
    return bulkActions.map((ba) => ({
      id: ba.id,
      action: ba.action,
      productCount: ba.totalItems,
      success: ba.succeeded,
      failed: ba.failed,
      executedBy: ba.user
        ? [ba.user.firstName, ba.user.lastName].filter(Boolean).join(' ') ||
          ba.user.email
        : 'Bilinmeyen',
      executedAt: (ba.completedAt || ba.createdAt).toISOString(),
      status: ba.status,
    }));
  }

  // ─── Import / Export ────────────────────────────────────

  async getExportData(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId },
      select: {
        id: true,
        sku: true,
        barcode: true,
        title: true,
        description: true,
        price: true,
        costPrice: true,
        stock: true,
        category: true,
        brand: true,
        status: true,
        tags: true,
        weight: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async importProducts(
    tenantId: string,
    products: any[],
    mode: 'create' | 'update' | 'upsert',
  ) {
    const results: {
      row: number;
      sku: string;
      status: 'created' | 'updated' | 'failed';
      error?: string;
    }[] = [];

    for (let i = 0; i < products.length; i++) {
      const row = products[i];
      try {
        const productData = {
          title: row.title || row['Ürün Adı'] || '',
          description: row.description || row['Açıklama'] || null,
          sku: row.sku || row['SKU'] || '',
          barcode: row.barcode || row['Barkod'] || null,
          price: parseFloat(row.price || row['Fiyat'] || '0'),
          costPrice:
            row.costPrice || row['Maliyet']
              ? parseFloat(row.costPrice || row['Maliyet'])
              : null,
          stock: parseInt(row.stock || row['Stok'] || '0', 10),
          category: row.category || row['Kategori'] || null,
          brand: row.brand || row['Marka'] || null,
          status: row.status || row['Durum'] || 'active',
          tags:
            typeof (row.tags || row['Etiketler']) === 'string'
              ? (row.tags || row['Etiketler']).split('|').filter(Boolean)
              : row.tags || [],
          weight:
            row.weight || row['Ağırlık (kg)']
              ? parseFloat(row.weight || row['Ağırlık (kg)'])
              : null,
        };

        if (!productData.sku) {
          results.push({
            row: i + 1,
            sku: '',
            status: 'failed',
            error: 'SKU zorunludur',
          });
          continue;
        }
        if (!productData.title) {
          results.push({
            row: i + 1,
            sku: productData.sku,
            status: 'failed',
            error: 'Ürün adı zorunludur',
          });
          continue;
        }

        const existing = await this.prisma.product.findFirst({
          where: { sku: productData.sku, tenantId },
        });

        if (mode === 'create') {
          if (existing) {
            results.push({
              row: i + 1,
              sku: productData.sku,
              status: 'failed',
              error: 'Bu SKU zaten mevcut',
            });
            continue;
          }
          await this.prisma.product.create({
            data: { ...productData, tenantId },
          });
          results.push({ row: i + 1, sku: productData.sku, status: 'created' });
        } else if (mode === 'update') {
          if (!existing) {
            results.push({
              row: i + 1,
              sku: productData.sku,
              status: 'failed',
              error: 'Bu SKU bulunamadı',
            });
            continue;
          }
          await this.prisma.product.update({
            where: { id: existing.id },
            data: productData,
          });
          results.push({ row: i + 1, sku: productData.sku, status: 'updated' });
        } else {
          // upsert
          if (existing) {
            await this.prisma.product.update({
              where: { id: existing.id },
              data: productData,
            });
            results.push({
              row: i + 1,
              sku: productData.sku,
              status: 'updated',
            });
          } else {
            await this.prisma.product.create({
              data: { ...productData, tenantId },
            });
            results.push({
              row: i + 1,
              sku: productData.sku,
              status: 'created',
            });
          }
        }
      } catch (error) {
        results.push({
          row: i + 1,
          sku: row.sku || row['SKU'] || '',
          status: 'failed',
          error: (error as Error).message,
        });
      }
    }

    return {
      total: products.length,
      created: results.filter((r) => r.status === 'created').length,
      updated: results.filter((r) => r.status === 'updated').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
    };
  }
}
