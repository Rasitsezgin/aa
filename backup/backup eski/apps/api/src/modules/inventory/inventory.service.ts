import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface InventoryFilters {
  tenantId: string;
  status?: 'critical' | 'low' | 'ok';
  category?: string;
  search?: string;
  sortBy?: 'stock' | 'name' | 'trend';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface StockUpdateDto {
  quantity: number;
  type: 'add' | 'remove' | 'set';
  reason?: string;
}

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) { }

  async findAll(filters: InventoryFilters) {
    const { tenantId, status, category, search, sortBy = 'stock', sortOrder = 'asc', page = 1, limit = 20 } = filters;

    const where: any = { tenantId };

    if (category && category !== 'Tümü') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    // Handle low/critical stock status filtering
    if (status === 'critical') {
      where.stock = { lt: 5 };
    } else if (status === 'low') {
      where.stock = { lt: 20, gte: 5 };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { [sortBy === 'name' ? 'title' : sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getStats(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId },
      include: { inventoryLogs: { take: 10, orderBy: { createdAt: 'desc' } } }
    });

    const totalValue = products.reduce((sum, p) => sum + (Number(p.price) * p.stock), 0);
    const critical = products.filter(p => p.stock < 5).length;
    const low = products.filter(p => p.stock < 20 && p.stock >= 5).length;

    return {
      totalProducts: products.length,
      totalValue,
      critical,
      low,
      ok: products.length - critical - low,
      alerts: products
        .filter(p => p.stock < 10)
        .map(p => ({
          id: p.id,
          sku: p.sku,
          name: p.title,
          stock: p.stock,
          minStock: 10,
          status: p.stock < 5 ? 'critical' : 'low'
        }))
        .slice(0, 5)
    };
  }

  async updateStock(id: string, tenantId: string, dto: StockUpdateDto) {
    return {
      id,
      previousStock: 10,
      newStock: dto.type === 'add' ? 10 + dto.quantity : dto.type === 'remove' ? 10 - dto.quantity : dto.quantity,
      type: dto.type,
      quantity: dto.quantity,
      reason: dto.reason,
      updatedAt: new Date()
    };
  }

  async getAIPredictions(tenantId: string) {
    return {
      predictions: [
        {
          sku: 'SKU-001',
          name: 'iPhone 15 Pro Max Kılıf',
          currentStock: 3,
          predictedDemand: 25,
          daysUntilStockout: 2,
          recommendedOrder: 50,
          confidence: 0.92
        },
        {
          sku: 'SKU-002',
          name: 'Samsung Galaxy Buds3 Pro',
          currentStock: 8,
          predictedDemand: 15,
          daysUntilStockout: 5,
          recommendedOrder: 30,
          confidence: 0.87
        },
        {
          sku: 'SKU-003',
          name: 'Apple AirPods Pro 2',
          currentStock: 12,
          predictedDemand: 20,
          daysUntilStockout: 6,
          recommendedOrder: 40,
          confidence: 0.85
        }
      ],
      insights: [
        { type: 'warning', message: '3 ürün önümüzdeki hafta tükenebilir' },
        { type: 'info', message: 'Aksesuar kategorisinde satışlar %15 artış gösteriyor' },
        { type: 'success', message: 'Stok devir hızınız sektör ortalamasının %12 üzerinde' }
      ]
    };
  }

  async bulkUpdate(tenantId: string, updates: { id: string; stock: number }[]) {
    return {
      success: updates.length,
      failed: 0,
      updates: updates.map(u => ({
        id: u.id,
        newStock: u.stock,
        updatedAt: new Date()
      }))
    };
  }

  async getStockHistory(id: string, tenantId: string) {
    return {
      sku: 'SKU-001',
      history: [
        { date: new Date('2024-01-15'), type: 'out', quantity: 2, balance: 3, note: 'Sipariş' },
        { date: new Date('2024-01-14'), type: 'out', quantity: 3, balance: 5, note: 'Sipariş' },
        { date: new Date('2024-01-13'), type: 'in', quantity: 10, balance: 8, note: 'Tedarikçi siparişi' },
        { date: new Date('2024-01-10'), type: 'out', quantity: 5, balance: -2, note: 'Sipariş' }
      ]
    };
  }
}
