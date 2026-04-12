import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

interface CreateWarehouseDto {
  tenantId: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  district?: string;
  phone?: string;
  isDefault?: boolean;
  type?: 'main' | 'secondary' | 'dropship' | 'fulfillment';
}

interface TransferStockDto {
  productId: string;
  quantity: number;
  fromWarehouseId: string;
  toWarehouseId: string;
  reason?: string;
}

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  /**
   * Depo listesi
   */
  async findAll(tenantId: string) {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { tenantId },
      include: {
        stocks: {
          select: { quantity: true, reserved: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const warehousesWithStats = warehouses.map((wh) => {
      const totalStock = wh.stocks.reduce((sum, s) => sum + s.quantity, 0);
      const totalProducts = wh.stocks.filter((s) => s.quantity > 0).length;
      const lowStockProducts = wh.stocks.filter(
        (s) => s.quantity > 0 && s.quantity < 10,
      ).length;
      return {
        ...wh,
        stocks: undefined,
        totalProducts,
        totalStock,
        lowStockProducts,
      };
    });

    const stats = {
      totalWarehouses: warehousesWithStats.length,
      activeWarehouses: warehousesWithStats.filter((w) => w.isActive).length,
      totalProducts: warehousesWithStats.reduce(
        (sum, w) => sum + w.totalProducts,
        0,
      ),
      totalStock: warehousesWithStats.reduce((sum, w) => sum + w.totalStock, 0),
      lowStockAlerts: warehousesWithStats.reduce(
        (sum, w) => sum + w.lowStockProducts,
        0,
      ),
    };

    return { warehouses: warehousesWithStats, stats };
  }

  /**
   * Depo detayı
   */
  async findOne(id: string, tenantId: string) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, tenantId },
    });

    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }

    // Depo bazlı stok detayları
    const stocks = await this.prisma.warehouseStock.findMany({
      where: { warehouseId: id },
      take: 50,
    });

    const productIds = stocks.map((s) => s.productId);
    const products =
      productIds.length > 0
        ? await this.prisma.product.findMany({
            where: { id: { in: productIds }, tenantId },
            select: {
              id: true,
              sku: true,
              title: true,
              stock: true,
              price: true,
            },
          })
        : [];

    const productMap = new Map(products.map((p) => [p.id, p]));

    return {
      ...warehouse,
      products: stocks.map((s) => {
        const product = productMap.get(s.productId);
        return {
          id: s.productId,
          sku: product?.sku || '',
          title: product?.title || '',
          price: product?.price || 0,
          warehouseStock: s.quantity,
          reserved: s.reserved,
          available: s.quantity - s.reserved,
        };
      }),
    };
  }

  /**
   * Yeni depo oluştur
   */
  async create(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: {
        tenantId: dto.tenantId,
        name: dto.name,
        code: dto.code,
        type: dto.type || 'main',
        address: dto.address,
        city: dto.city,
        district: dto.district,
        phone: dto.phone,
        isDefault: dto.isDefault || false,
      },
    });
  }

  /**
   * Depo güncelle
   */
  async update(id: string, data: Partial<CreateWarehouseDto>) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException('Depo bulunamadı');
    }
    return this.prisma.warehouse.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        address: data.address,
        city: data.city,
        district: data.district,
        phone: data.phone,
        isDefault: data.isDefault,
      },
    });
  }

  /**
   * Depolar arası stok transferi
   */
  async transferStock(dto: TransferStockDto, tenantId: string) {
    const { productId, quantity, fromWarehouseId, toWarehouseId, reason } = dto;

    if (quantity <= 0) {
      throw new BadRequestException("Miktar 0'dan büyük olmalı");
    }

    if (fromWarehouseId === toWarehouseId) {
      throw new BadRequestException('Kaynak ve hedef depo aynı olamaz');
    }

    // Ürün kontrolü
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
    });
    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    // Kaynak depodaki stok kontrolü
    const sourceStock = await this.prisma.warehouseStock.findUnique({
      where: {
        warehouseId_productId: { warehouseId: fromWarehouseId, productId },
      },
    });
    const availableQty =
      (sourceStock?.quantity || 0) - (sourceStock?.reserved || 0);
    if (availableQty < quantity) {
      throw new BadRequestException(
        `Kaynak depoda yeterli stok yok (mevcut: ${availableQty})`,
      );
    }

    // Transaction ile transfer yap
    const transfer = await this.prisma.$transaction(async (tx) => {
      // Kaynak depodan düş
      await tx.warehouseStock.update({
        where: {
          warehouseId_productId: { warehouseId: fromWarehouseId, productId },
        },
        data: { quantity: { decrement: quantity } },
      });

      // Hedef depoya ekle
      await tx.warehouseStock.upsert({
        where: {
          warehouseId_productId: { warehouseId: toWarehouseId, productId },
        },
        update: { quantity: { increment: quantity } },
        create: { warehouseId: toWarehouseId, productId, quantity },
      });

      // Transfer kaydı
      return tx.warehouseTransfer.create({
        data: {
          tenantId,
          productId,
          quantity,
          fromWarehouseId,
          toWarehouseId,
          reason: reason || 'Manuel transfer',
          status: 'completed',
          completedAt: new Date(),
        },
      });
    });

    // Activity log
    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'warehouse.transfer',
        resource: 'warehouse',
        resourceId: transfer.id,
        details: {
          productId,
          quantity,
          from: fromWarehouseId,
          to: toWarehouseId,
        },
      },
    });

    return {
      ...transfer,
      productSku: product.sku,
      productTitle: product.title,
    };
  }

  /**
   * Depo bazlı stok özeti
   */
  async getStockSummary(tenantId: string) {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { tenantId },
      include: {
        stocks: true,
      },
    });

    const products = await this.prisma.product.findMany({
      where: { tenantId },
      select: {
        id: true,
        sku: true,
        title: true,
        stock: true,
        category: true,
        price: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Depo bazlı stok dağılımı
    const totalUnits = warehouses.reduce(
      (sum, wh) => sum + wh.stocks.reduce((s, st) => s + st.quantity, 0),
      0,
    );

    const distribution = warehouses.map((wh) => {
      const units = wh.stocks.reduce((s, st) => s + st.quantity, 0);
      const value = wh.stocks.reduce((s, st) => {
        const p = productMap.get(st.productId);
        return s + st.quantity * Number(p?.price || 0);
      }, 0);
      return {
        warehouseId: wh.id,
        warehouseName: wh.name,
        warehouseCode: wh.code,
        percentage: totalUnits > 0 ? Math.round((units / totalUnits) * 100) : 0,
        products: wh.stocks.filter((s) => s.quantity > 0).length,
        units,
        value: Math.round(value),
      };
    });

    // Kritik stok uyarıları
    const lowStockAlerts = products
      .filter((p) => p.stock < 10)
      .map((p) => ({
        productId: p.id,
        sku: p.sku,
        title: p.title,
        currentStock: p.stock,
        minStock: 10,
        status: p.stock === 0 ? 'out_of_stock' : 'low_stock',
      }));

    return {
      totalWarehouses: warehouses.length,
      totalProducts: products.length,
      totalUnits: products.reduce((sum, p) => sum + p.stock, 0),
      distribution,
      lowStockAlerts,
    };
  }

  /**
   * Transfer geçmişi
   */
  async getTransferHistory(tenantId: string, warehouseId?: string) {
    const where: any = { tenantId };
    if (warehouseId) {
      where.OR = [
        { fromWarehouseId: warehouseId },
        { toWarehouseId: warehouseId },
      ];
    }

    const transfers = await this.prisma.warehouseTransfer.findMany({
      where,
      include: {
        fromWarehouse: { select: { name: true } },
        toWarehouse: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Ürün bilgilerini getir
    const productIds = [...new Set(transfers.map((t) => t.productId))];
    const products =
      productIds.length > 0
        ? await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, sku: true, title: true },
          })
        : [];
    const productMap = new Map(products.map((p) => [p.id, p]));

    return {
      transfers: transfers.map((t) => ({
        id: t.id,
        productSku: productMap.get(t.productId)?.sku || '',
        productTitle: productMap.get(t.productId)?.title || '',
        quantity: t.quantity,
        fromWarehouse: t.fromWarehouse.name,
        toWarehouse: t.toWarehouse.name,
        status: t.status,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
      })),
      total: transfers.length,
    };
  }
}
