import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

@Injectable()
export class AmazonBridge implements MarketplaceBridge {
    private readonly logger = new Logger(AmazonBridge.name);

    constructor(
        private readonly sellerId: string,
        private readonly mwsAuthToken: string,
        private readonly scrapingService: ScrapingService,
    ) { }

    async syncProducts(): Promise<any> {
        const sellerId = this.sellerId?.trim();
        if (!sellerId || sellerId === 'public') {
            throw new Error('Amazon syncProducts için sellerId zorunludur');
        }

        this.logger.log(`Syncing products for Amazon Seller: ${sellerId}`);
        const storeUrl = sellerId.startsWith('http')
            ? sellerId
            : `https://www.amazon.com.tr/s?me=${encodeURIComponent(sellerId)}`;

        const products = await this.scrapingService.scrapeStoreProducts(storeUrl, 'AMAZON', 100);
        if (!Array.isArray(products)) {
            throw new Error('Amazon ürün verisi alınamadı');
        }

        return { success: true, platform: 'AMAZON', count: products.length, products };
    }

    async getStoreInfo(storeId?: string): Promise<any> {
        const resolvedStoreId = (storeId || this.sellerId || '').trim();
        if (!resolvedStoreId || resolvedStoreId === 'public') {
            throw new Error('Amazon getStoreInfo için sellerId zorunludur');
        }

        const storeUrl = resolvedStoreId.startsWith('http')
            ? resolvedStoreId
            : `https://www.amazon.com.tr/s?me=${encodeURIComponent(resolvedStoreId)}`;

        const scraped = await this.scrapingService.scrapeStore(storeUrl, 'AMAZON');
        return {
            storeId: resolvedStoreId,
            storeName: scraped?.storeName || resolvedStoreId,
            totalProducts: scraped?.productCount ?? 0,
            averageRating: scraped?.rating ?? 0,
            totalReviews: scraped?.totalReviews ?? 0,
            followersCount: scraped?.followerCount ?? 0,
            platform: 'AMAZON',
        };
    }

    async getStoreProducts(storeId?: string, limit: number = 10): Promise<any[]> {
        const resolvedStoreId = (storeId || this.sellerId || '').trim();
        if (!resolvedStoreId || resolvedStoreId === 'public') {
            throw new Error('Amazon getStoreProducts için sellerId zorunludur');
        }

        const storeUrl = resolvedStoreId.startsWith('http')
            ? resolvedStoreId
            : `https://www.amazon.com.tr/s?me=${encodeURIComponent(resolvedStoreId)}`;

        const scrapedProducts = await this.scrapingService.scrapeStoreProducts(storeUrl, 'AMAZON', limit);
        return (Array.isArray(scrapedProducts) ? scrapedProducts : []).map((product, index) => {
            const entry = product as unknown as Record<string, unknown>;
            return {
                productId: String(entry.productId || entry.id || `AMZ-${index + 1}`),
                title: String(entry.title || entry.name || ''),
                salePrice: Number(entry.salePrice || entry.price || 0),
                price: Number(entry.price || entry.salePrice || 0),
                stockCount: Number(entry.stock ?? entry.stockCount ?? 0),
                rating: Number(entry.rating || 0),
                reviewCount: Number(entry.reviewCount || 0),
                images: Array.isArray(entry.images) ? entry.images : [],
                url: String(entry.url || ''),
            };
        });
    }

    async syncOrders(): Promise<any> {
        throw new Error('Amazon sipariş senkronizasyonu için SP-API entegrasyonu zorunludur');
    }

    async updateStock(sku: string, stock: number): Promise<any> {
        void sku;
        void stock;
        throw new Error('Amazon stok güncelleme için SP-API entegrasyonu zorunludur');
    }

    async updatePrice(sku: string, price: number): Promise<any> {
        void sku;
        void price;
        throw new Error('Amazon fiyat güncelleme için SP-API entegrasyonu zorunludur');
    }

    // Amazon SP-API review entegrasyonu — henüz aktif değil
    async getReviews(_page: number = 0, _size: number = 100): Promise<MarketplaceReview[]> {
        this.logger.warn('Amazon getReviews: SP-API entegrasyonu henüz aktif değil');
        return [];
    }
}
