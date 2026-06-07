import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

import { Platform } from '@pazaryonetimi/database';

const TARGET_PLATFORMS: Platform[] = [
  Platform.HEPSIBURADA,
  Platform.N11,
  Platform.AMAZON,
  Platform.CICEKSEPETI,
  Platform.TRENDYOL,
];

@Injectable()
export class ProductTransferService {
  constructor(private readonly prisma: PrismaService) {}

  async listTransferable(tenantId: string, limit = 20) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, status: 'active' },
      include: { marketplaceLinks: true },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    return products.map((p) => {
      const linked = new Set(p.marketplaceLinks.map((l) => l.platform));
      const source = p.marketplaceLinks[0]?.platform || 'TRENDYOL';
      const targets = TARGET_PLATFORMS.map((plat) => ({
        platform: plat,
        status: linked.has(plat)
          ? ('active' as const)
          : linked.size > 0
            ? ('pending' as const)
            : ('waiting' as const),
      }));

      return {
        productId: p.id,
        title: p.title,
        sku: p.sku,
        barcode: p.barcode,
        sourcePlatform: source,
        barcodeMatched: !!p.barcode,
        targets,
      };
    });
  }

  async transfer(
    tenantId: string,
    productId: string,
    targetPlatforms: string[],
  ) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, tenantId },
      include: { images: true, variants: true },
    });
    if (!product) return { success: false, message: 'Ürün bulunamadı' };

    const results = targetPlatforms.map((plat) => ({
      platform: plat,
      status: 'queued',
      message: 'Aktarım kuyruğa alındı',
    }));

    return {
      success: true,
      productId,
      transferred: results.length,
      results,
      payload: {
        title: product.title,
        imageCount: product.images.length,
        variantCount: product.variants.length,
      },
    };
  }
}
