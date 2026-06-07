import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Platform as DbPlatform } from '@pazaryonetimi/database';
import { Decimal } from '@prisma/client/runtime/library';
import {
  MarketplaceService,
  Platform,
} from '../../marketplace/marketplace.service';

/**
 * BuyBox fiyat robotu — rakip fiyatına göre marj korumalı otomatik fiyat güncelleme.
 */
@Injectable()
export class BuyBoxRobotService {
  private readonly logger = new Logger(BuyBoxRobotService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly marketplaceService: MarketplaceService,
  ) {}

  async listRules(tenantId: string) {
    return this.prisma.buyBoxRule.findMany({
      where: { tenantId },
      include: { product: { select: { id: true, title: true, sku: true, price: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async upsertRule(
    tenantId: string,
    data: {
      productId?: string;
      platform: DbPlatform;
      minMarginPct?: number;
      maxDropPct?: number;
      competitorFloor?: number;
    },
  ) {
    return this.prisma.buyBoxRule.create({
      data: {
        tenantId,
        productId: data.productId,
        platform: data.platform,
        minMarginPct: new Decimal(data.minMarginPct ?? 10),
        maxDropPct: new Decimal(data.maxDropPct ?? 5),
        competitorFloor: data.competitorFloor
          ? new Decimal(data.competitorFloor)
          : undefined,
        isActive: true,
      },
    });
  }

  async runRobot(tenantId: string) {
    const rules = await this.prisma.buyBoxRule.findMany({
      where: { tenantId, isActive: true },
      include: { product: true },
    });

    const results: Array<{
      productId: string;
      platform: string;
      oldPrice: number;
      newPrice: number;
      hasBuyBox: boolean;
      applied: boolean;
    }> = [];

    for (const rule of rules) {
      const products = rule.productId
        ? rule.product
          ? [rule.product]
          : []
        : await this.prisma.product.findMany({
            where: { tenantId, status: 'active' },
            take: 50,
          });

      for (const product of products) {
        const ourPrice = Number(product.price);
        const cost = product.costPrice ? Number(product.costPrice) : ourPrice * 0.6;
        const minMargin = Number(rule.minMarginPct) / 100;
        const floorPrice = cost * (1 + minMargin);
        const maxDrop = Number(rule.maxDropPct) / 100;

        const competitor = await this.prisma.competitorProduct.findFirst({
          where: {
            productId: product.id,
            competitor: { tenantId },
          },
          orderBy: { updatedAt: 'desc' },
        });

        const competitorPrice = competitor
          ? Number(competitor.price)
          : ourPrice;

        let targetPrice = Math.max(floorPrice, competitorPrice - 0.01);
        const maxAllowedDrop = ourPrice * (1 - maxDrop);
        targetPrice = Math.max(targetPrice, maxAllowedDrop);

        if (rule.competitorFloor) {
          targetPrice = Math.max(targetPrice, Number(rule.competitorFloor));
        }

        const hasBuyBox = targetPrice <= competitorPrice;
        let applied = false;

        if (Math.abs(targetPrice - ourPrice) >= 0.01) {
          try {
            await this.marketplaceService.updateMarketplacePrice(
              tenantId,
              rule.platform as unknown as Platform,
              product.sku,
              targetPrice,
            );
            await this.prisma.product.update({
              where: { id: product.id },
              data: { price: new Decimal(targetPrice) },
            });
            applied = true;
          } catch (error) {
            this.logger.warn(
              `BuyBox price update failed ${product.sku}: ${(error as Error).message}`,
            );
          }
        }

        await this.prisma.buyBoxSnapshot.create({
          data: {
            tenantId,
            productId: product.id,
            platform: rule.platform,
            ourPrice: new Decimal(applied ? targetPrice : ourPrice),
            competitorPrice: new Decimal(competitorPrice),
            hasBuyBox,
            rank: hasBuyBox ? 1 : 2,
          },
        });

        await this.prisma.buyBoxRule.update({
          where: { id: rule.id },
          data: { lastRunAt: new Date() },
        });

        results.push({
          productId: product.id,
          platform: rule.platform,
          oldPrice: ourPrice,
          newPrice: applied ? targetPrice : ourPrice,
          hasBuyBox,
          applied,
        });
      }
    }

    return { processed: results.length, results };
  }

  async getSnapshots(tenantId: string, limit = 50) {
    return this.prisma.buyBoxSnapshot.findMany({
      where: { tenantId },
      include: { product: { select: { title: true, sku: true } } },
      orderBy: { capturedAt: 'desc' },
      take: limit,
    });
  }
}
