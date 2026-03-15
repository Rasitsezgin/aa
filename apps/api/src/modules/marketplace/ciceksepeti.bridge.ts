import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

interface CicekSepetiProduct {
    productId: string;
    title: string;
    price: number;
    salePrice: number;
    stockCount: number;
    rating: number;
    reviewCount: number;
    url: string;
    images: string[];
    storeName?: string;
}

@Injectable()
export class CicekSepetiBridge implements MarketplaceBridge {
    private readonly logger = new Logger(CicekSepetiBridge.name);
    private readonly baseUrl = 'https://apis.ciceksepeti.com/api/v1';

    constructor(
        private readonly apiKey: string,
        private readonly apiSecret: string,
        private readonly scrapingService: ScrapingService,
    ) {}

    async syncProducts(): Promise<any> {
        this.logger.log('Syncing products from ÇiçekSepeti');
        try {
            const response = await fetch(`${this.baseUrl}/Products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                },
                body: JSON.stringify({ pageSize: 100, page: 1 }),
            });

            if (!response.ok) {
                this.logger.warn(`CicekSepeti syncProducts failed: ${response.status}`);
                return { success: false, platform: 'CICEKSEPETI', error: `HTTP ${response.status}` };
            }

            const data = await response.json();
            const products = data?.products ?? [];
            return { success: true, platform: 'CICEKSEPETI', count: products.length, products };
        } catch (error) {
            this.logger.warn(`CicekSepeti syncProducts error: ${(error as Error).message}`);
            return { success: false, platform: 'CICEKSEPETI', error: (error as Error).message };
        }
    }

    async syncOrders(): Promise<any> {
        try {
            const startDate = new Date(Date.now() - 7 * 86400000).toISOString();
            const endDate = new Date().toISOString();

            const response = await fetch(`${this.baseUrl}/Order/GetOrders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                },
                body: JSON.stringify({
                    startDate,
                    endDate,
                    pageSize: 50,
                    page: 1,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return { success: true, platform: 'CICEKSEPETI', orders: data?.supplierOrderListDetailVO ?? [] };
        } catch (error) {
            this.logger.warn(`CicekSepeti syncOrders error: ${(error as Error).message}`);
            return { success: false, platform: 'CICEKSEPETI', error: (error as Error).message };
        }
    }

    async updateStock(sku: string, stock: number): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/Products/stock-or-price`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                },
                body: JSON.stringify({
                    items: [{
                        stockCode: sku,
                        stockQuantity: stock,
                    }],
                }),
            });

            if (response.status === 429 || response.status >= 500) {
                throw new Error(`CicekSepeti stock update failed: HTTP ${response.status}`);
            }

            return { success: response.ok, sku, stock, platform: 'CICEKSEPETI' };
        } catch (error) {
            this.logger.warn(`CicekSepeti updateStock error: ${(error as Error).message}`);
            throw error;
        }
    }

    async updatePrice(sku: string, price: number): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/Products/stock-or-price`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                },
                body: JSON.stringify({
                    items: [{
                        stockCode: sku,
                        salesPrice: price,
                    }],
                }),
            });

            if (response.status === 429 || response.status >= 500) {
                throw new Error(`CicekSepeti price update failed: HTTP ${response.status}`);
            }

            return { success: response.ok, sku, price, platform: 'CICEKSEPETI' };
        } catch (error) {
            this.logger.warn(`CicekSepeti updatePrice error: ${(error as Error).message}`);
            throw error;
        }
    }

    async getStoreInfo(storeId: string): Promise<any> {
        try {
            const url = `https://www.ciceksepeti.com/magaza/${storeId}`;
            const scraped = await this.scrapingService.scrapeStore(url, 'CICEKSEPETI');
            if (scraped) {
                return {
                    storeId,
                    storeName: scraped.storeName || storeId,
                    totalProducts: scraped.productCount ?? 0,
                    averageRating: scraped.rating ?? 0,
                    totalReviews: scraped.totalReviews ?? 0,
                    followersCount: scraped.followerCount ?? 0,
                    platform: 'CICEKSEPETI',
                };
            }
        } catch (error) {
            this.logger.warn(`CicekSepeti getStoreInfo scraping failed: ${(error as Error).message}`);
        }

        return {
            storeId,
            storeName: storeId,
            platform: 'CICEKSEPETI',
        };
    }

    async getStoreProducts(storeId: string, limit: number = 10): Promise<CicekSepetiProduct[]> {
        try {
            const url = `https://www.ciceksepeti.com/magaza/${storeId}`;
            const scraped = await this.scrapingService.scrapeStoreProducts(url, 'CICEKSEPETI', limit);
            if (Array.isArray(scraped) && scraped.length > 0) {
                return (scraped as unknown as Array<Record<string, unknown>>).map((item) => ({
                    productId: String(item.productId || item.id || ''),
                    title: String(item.title || ''),
                    price: Number(item.price || 0),
                    salePrice: Number(item.salePrice || item.price || 0),
                    stockCount: Number(item.stock ?? item.stockCount ?? 0),
                    rating: Number(item.rating || 0),
                    reviewCount: Number(item.reviewCount || 0),
                    url: String(item.url || ''),
                    images: Array.isArray(item.images) ? (item.images as string[]) : [],
                    storeName: item.storeName ? String(item.storeName) : undefined,
                }));
            }
        } catch (error) {
            this.logger.warn(`CicekSepeti getStoreProducts scraping failed: ${(error as Error).message}`);
        }

        return [];
    }

    /**
     * ÇiçekSepeti'nden ürün yorumlarını çek
     * API: GET /api/v1/products/reviews?page=1&pageSize=100
     */
    async getReviews(page: number = 1, size: number = 100): Promise<MarketplaceReview[]> {
        if (!this.apiKey) {
            this.logger.warn('CicekSepeti getReviews: API anahtarı eksik');
            return [];
        }
        try {
            const response = await fetch(`${this.baseUrl}/Product/GetProductReviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                },
                body: JSON.stringify({ page, pageSize: size }),
            });
            if (!response.ok) return [];
            const data = await response.json() as Record<string, unknown>;
            const reviews: Record<string, unknown>[] =
                Array.isArray(data.data) ? data.data as Record<string, unknown>[] :
                Array.isArray(data.reviews) ? data.reviews as Record<string, unknown>[] : [];
            return reviews.map(r => ({
                externalId: String(r.id ?? r.reviewId ?? ''),
                productId: r.productSupplierId ? String(r.productSupplierId) : undefined,
                productName: String(r.productName ?? 'Ürün'),
                customerName: String(r.customerName ?? r.userName ?? 'Müşteri'),
                rating: Math.round(Number(r.point ?? r.rating ?? 0)),
                title: r.title ? String(r.title) : undefined,
                comment: String(r.comment ?? r.description ?? ''),
                reviewDate: r.createdDate ? new Date(r.createdDate as string) : new Date(),
                helpful: Number(r.helpfulCount ?? 0),
                verified: Boolean(r.isVerified ?? false),
            })).filter(r => r.externalId && r.comment);
        } catch (error) {
            this.logger.warn(`CicekSepeti getReviews hatası: ${(error as Error).message}`);
            return [];
        }
    }
}
