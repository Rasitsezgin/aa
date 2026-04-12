import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Headers,
  Param,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  ScrapingService,
  ScrapedStoreData,
  ScrapedProductData,
} from './scraping.service';
import { Public } from '../auth/public.decorator';

class ScrapeStoreDto {
  url!: string;
  platform?: string;
}

class ScrapeProductsDto {
  url!: string;
  platform!: string;
  limit?: number;
}

@ApiTags('Scraping')
@Controller('scraping')
export class ScrapingController {
  private readonly logger = new Logger(ScrapingController.name);

  constructor(private readonly scrapingService: ScrapingService) {}

  @Public()
  @Post('store')
  @ApiOperation({ summary: 'Scrape store information from marketplace URL' })
  @ApiResponse({ status: 200, description: 'Store data scraped successfully' })
  @ApiResponse({ status: 400, description: 'Invalid URL or scraping failed' })
  async scrapeStore(
    @Body() dto: ScrapeStoreDto,
  ): Promise<ScrapedStoreData | null> {
    return this.scrapingService.scrapeStore(dto.url, dto.platform);
  }

  @Public()
  @Post('products')
  @ApiOperation({ summary: 'Scrape products from store URL' })
  @ApiResponse({ status: 200, description: 'Products scraped successfully' })
  @ApiResponse({ status: 400, description: 'Invalid URL or scraping failed' })
  async scrapeProducts(
    @Body() dto: ScrapeProductsDto,
  ): Promise<ScrapedProductData[]> {
    return this.scrapingService.scrapeStoreProducts(
      dto.url,
      dto.platform,
      dto.limit || 10,
    );
  }

  @Post('analyze-competitor')
  @ApiOperation({ summary: 'Analyze competitor store (authenticated)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Competitor analysis complete' })
  async analyzeCompetitor(
    @Body() dto: ScrapeStoreDto,
    @Headers('x-tenant-id') tenantId?: string,
  ): Promise<{
    store: ScrapedStoreData | null;
    products: ScrapedProductData[];
    analysis: {
      avgPrice: number;
      avgRating: number;
      totalProducts: number;
      platform: string;
    };
  }> {
    const store = await this.scrapingService.scrapeStore(dto.url, dto.platform);
    const platform = store?.platform || dto.platform || 'UNKNOWN';

    const products = await this.scrapingService.scrapeStoreProducts(
      dto.url,
      platform,
      20,
    );

    const avgPrice =
      products.length > 0
        ? products.reduce((sum, p) => sum + p.price, 0) / products.length
        : 0;
    const avgRating =
      products.length > 0
        ? products.reduce((sum, p) => sum + p.rating, 0) / products.length
        : 0;

    return {
      store,
      products,
      analysis: {
        avgPrice: Math.round(avgPrice * 100) / 100,
        avgRating: Math.round(avgRating * 100) / 100,
        totalProducts: store?.productCount || products.length,
        platform,
      },
    };
  }

  @Public()
  @Get('analyze/:platform/:storeId')
  @ApiOperation({ summary: 'Analyze store by platform and store ID (public)' })
  @ApiResponse({ status: 200, description: 'Store analysis complete' })
  @ApiResponse({ status: 400, description: 'Invalid URL or scraping failed' })
  async analyzeStoreById(
    @Param('platform') platform: string,
    @Param('storeId') storeId: string,
    @Query('url') url: string,
  ): Promise<{
    metrics: {
      storeName: string;
      storeId: string;
      platform: string;
      rating: number;
      followers: number;
      productCount: number;
      totalReviews?: number;
    };
    products: ScrapedProductData[];
    seoScore: number;
    analysis: {
      avgPrice: number;
      avgRating: number;
      totalProducts: number;
      platform: string;
    };
  }> {
    if (!url) {
      throw new Error('URL parameter is required');
    }

    try {
      const store = await this.scrapingService.scrapeStore(url, platform);
      const detectedPlatform = store?.platform || platform.toUpperCase();

      const products = await this.scrapingService.scrapeStoreProducts(
        url,
        detectedPlatform,
        20,
      );

      const avgPrice =
        products.length > 0
          ? products.reduce((sum, p) => sum + p.price, 0) / products.length
          : 0;
      const avgRating =
        products.length > 0
          ? products.reduce((sum, p) => sum + p.rating, 0) / products.length
          : 0;

      // Calculate SEO score based on store metrics
      const seoScore = this.calculateSeoScore(store, products);

      return {
        metrics: {
          storeName: store?.storeName || storeId,
          storeId: storeId,
          platform: detectedPlatform,
          rating: store?.rating || 0,
          followers: store?.followerCount || 0,
          productCount: store?.productCount || products.length,
          totalReviews: store?.totalReviews,
        },
        products,
        seoScore,
        analysis: {
          avgPrice: Math.round(avgPrice * 100) / 100,
          avgRating: Math.round(avgRating * 100) / 100,
          totalProducts: store?.productCount || products.length,
          platform: detectedPlatform,
        },
      };
    } catch (error: any) {
      this.logger.error(`Analysis failed for ${url}: ${error.message}`);
      // Return fallback data instead of throwing
      return {
        metrics: {
          storeName: storeId,
          storeId: storeId,
          platform: platform.toUpperCase(),
          rating: 0,
          followers: 0,
          productCount: 0,
        },
        products: [],
        seoScore: 0,
        analysis: {
          avgPrice: 0,
          avgRating: 0,
          totalProducts: 0,
          platform: platform.toUpperCase(),
        },
      };
    }
  }

  private calculateSeoScore(
    store: ScrapedStoreData | null,
    products: ScrapedProductData[],
  ): number {
    if (!store) return 0;

    let score = 50; // Base score

    // Rating factor (0-20 points)
    if (store.rating > 0) {
      score += Math.min(20, store.rating * 2);
    }

    // Followers factor (0-15 points)
    if (store.followerCount > 0) {
      score += Math.min(15, store.followerCount / 1000);
    }

    // Product count factor (0-10 points)
    if (store.productCount > 0) {
      score += Math.min(10, store.productCount / 50);
    }

    // Products with images factor (0-5 points)
    const productsWithImages = products.filter(
      (p) => p.images && p.images.length > 0,
    ).length;
    if (products.length > 0) {
      score += Math.min(5, (productsWithImages / products.length) * 5);
    }

    return Math.min(100, Math.round(score));
  }
}
