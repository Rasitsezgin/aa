import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BundleService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.productBundle.findMany({
      where: { tenantId },
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true, sku: true, price: true, stock: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(
    tenantId: string,
    data: {
      name: string;
      sku: string;
      description?: string;
      pricingType?: string;
      pricingValue?: number;
      items: Array<{ productId: string; quantity: number; isOptional?: boolean }>;
      platforms?: string[];
    },
  ) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, id: { in: data.items.map((i) => i.productId) } },
    });
    if (products.length !== data.items.length) {
      throw new BadRequestException('Bazı ürünler bulunamadı');
    }

    const originalTotal = products.reduce((sum, p) => {
      const qty = data.items.find((i) => i.productId === p.id)?.quantity ?? 1;
      return sum + Number(p.price) * qty;
    }, 0);

    const pricingType = data.pricingType ?? 'percentage_off';
    const pricingValue = data.pricingValue ?? 10;
    const finalPrice = this.calcFinalPrice(originalTotal, pricingType, pricingValue);

    return this.prisma.productBundle.create({
      data: {
        tenantId,
        name: data.name,
        sku: data.sku,
        description: data.description,
        status: 'active',
        pricingType,
        pricingValue: new Decimal(pricingValue),
        originalTotal: new Decimal(originalTotal),
        finalPrice: new Decimal(finalPrice),
        platforms: data.platforms ?? [],
        items: {
          create: data.items.map((item, idx) => ({
            productId: item.productId,
            quantity: item.quantity,
            isOptional: item.isOptional ?? false,
            sortOrder: idx,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
  }

  async validateStock(tenantId: string, bundleId: string) {
    const bundle = await this.prisma.productBundle.findFirst({
      where: { id: bundleId, tenantId },
      include: { items: { include: { product: true } } },
    });
    if (!bundle) throw new NotFoundException('Bundle bulunamadı');

    const insufficient = bundle.items
      .filter((i) => !i.isOptional)
      .filter((i) => i.product.stock < i.quantity)
      .map((i) => ({
        productId: i.productId,
        title: i.product.title,
        available: i.product.stock,
        required: i.quantity,
      }));

    return { valid: insufficient.length === 0, insufficient };
  }

  private calcFinalPrice(
    original: number,
    type: string,
    value: number,
  ): number {
    if (type === 'fixed') return value;
    if (type === 'final_price') return value;
    return original * (1 - value / 100);
  }
}
