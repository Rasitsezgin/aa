import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

interface CoupangProduct {
    productId: string;
    title: string;
    price: number;
    salePrice: number;
    stockCount: number;
    rating: number;
    reviewCount: number;
    url: string;
    images: string[];
    vendorName: string;
    vendorId: string;
    rocketDelivery: boolean;
    freeShipping: boolean;
    category: string;
    salesCount: number;
}

@Injectable()
export class CoupangBridge implements MarketplaceBridge {
    private readonly logger = new Logger(CoupangBridge.name);
    private readonly apiUrl = 'https://api-gateway.coupang.com/v2/providers';

    constructor(
        private readonly accessKey: string,
        private readonly secretKey: string,
        private readonly vendorId: string,
        private readonly scrapingService: ScrapingService,
    ) {}

    private generateSignature(date: string): string {
        const message = date + '\n' + this.accessKey + '\n' + this.secretKey;
        return `HmacSHA256_${message}`;
    }

    private getHeaders(): Record<string, string> {
        const date = new Date().toISOString();
        return {
            'Authorization': `${this.accessKey}:${this.generateSignature(date)}`,
            'X-Requested-By': this.vendorId,
            'Content-Type': 'application/json',
        };
    }

    async syncProducts(): Promise<any> {
        try {
            const response = await fetch(
                `${this.apiUrl}/marketplace_openapi/apis/api/v1/vendor/inventory`,
                { headers: this.getHeaders() }
            );

            if (!response.ok) {
                return { success: false, platform: 'COUPANG', error: `HTTP ${response.status}` };
            }

            const data = await response.json();
            return { success: true, platform: 'COUPANG', count: data.data?.length || 0 };
        } catch (error) {
            return { success: false, platform: 'COUPANG', error: (error as Error).message };
        }
    }

    async syncOrders(): Promise<any> {
        try {
            const response = await fetch(
                `${this.apiUrl}/marketplace_openapi/apis/api/v1/vendor/orders`,
                { headers: this.getHeaders() }
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return { success: true, platform: 'COUPANG', orders: data.data || [] };
        } catch (error) {
            return { success: false, platform: 'COUPANG', error: (error as Error).message };
        }
    }

    async updateStock(sku: string, stock: number): Promise<any> {
        try {
            const response = await fetch(
                `${this.apiUrl}/marketplace_openapi/apis/api/v1/vendor/inventory/${sku}`,
                {
                    method: 'PUT',
                    headers: this.getHeaders(),
                    body: JSON.stringify({ quantity: stock }),
                }
            );
            return { success: response.ok, sku, stock, platform: 'COUPANG' };
        } catch (error) {
            throw error;
        }
    }

    async updatePrice(sku: string, price: number): Promise<any> {
        try {
            const response = await fetch(
                `${this.apiUrl}/marketplace_openapi/apis/api/v1/vendor/products/${sku}/price`,
                {
                    method: 'PUT',
                    headers: this.getHeaders(),
                    body: JSON.stringify({ price }),
                }
            );
            return { success: response.ok, sku, price, platform: 'COUPANG' };
        } catch (error) {
            throw error;
        }
    }

    async getStoreInfo(storeId: string): Promise<any> {
        try {
            const url = `https://www.coupang.com/vp/products?vendorItemId=${storeId}`;
            const scraped = await this.scrapingService.scrapeStore(url, 'COUPANG');
            return {
                storeId,
                storeName: scraped?.storeName || storeId,
                platform: 'COUPANG',
                country: 'South Korea',
                rocketDelivery: true,
            };
        } catch (error) {
            throw error;
        }
    }

    async getStoreProducts(storeId?: string, limit: number = 10): Promise<CoupangProduct[]> {
        try {
            const response = await fetch(
                `${this.apiUrl}/marketplace_openapi/apis/api/v1/vendor/products?limit=${limit}`,
                { headers: this.getHeaders() }
            );
            const data = await response.json();
            return (data.data || []).map((item: any) => ({
                productId: item.productId,
                title: item.productName,
                price: item.originalPrice,
                salePrice: item.salePrice || item.originalPrice,
                stockCount: item.quantity || 0,
                rating: item.rating || 0,
                reviewCount: item.reviewCount || 0,
                url: item.productUrl,
                images: [item.imageUrl],
                vendorName: item.vendorName,
                vendorId: item.vendorId,
                rocketDelivery: item.rocketDelivery || false,
                freeShipping: item.freeShipping || false,
                category: item.categoryName,
                salesCount: item.salesCount || 0,
            }));
        } catch (error) {
            throw error;
        }
    }
}
