import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

interface CdiscountProduct {
    productId: string;
    title: string;
    price: number;
    salePrice: number;
    stockCount: number;
    rating: number;
    reviewCount: number;
    url: string;
    images: string[];
    sellerName: string;
    sellerId: string;
    shippingTime: string;
    freeShipping: boolean;
    isCdiscountSold: boolean;
    category: string;
}

@Injectable()
export class CdiscountBridge implements MarketplaceBridge {
    private readonly logger = new Logger(CdiscountBridge.name);
    private readonly apiUrl = 'https://api.cdiscount.com/api/v1';

    constructor(
        private readonly apiLogin: string,
        private readonly apiPassword: string,
        private readonly token: string,
        private readonly scrapingService: ScrapingService,
    ) {}

    private getAuthHeaders(): Record<string, string> {
        return {
            'Authorization': `Basic ${Buffer.from(`${this.apiLogin}:${this.apiPassword}`).toString('base64')}`,
            'Api-Token': this.token,
            'Content-Type': 'application/json',
        };
    }

    async syncProducts(): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/products`, {
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                return { success: false, platform: 'CDISCOUNT', error: `HTTP ${response.status}` };
            }

            const data = await response.json();
            return { success: true, platform: 'CDISCOUNT', count: data.products?.length || 0 };
        } catch (error) {
            return { success: false, platform: 'CDISCOUNT', error: (error as Error).message };
        }
    }

    async syncOrders(): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/orders`, {
                headers: this.getAuthHeaders(),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return { success: true, platform: 'CDISCOUNT', orders: data.orders || [] };
        } catch (error) {
            return { success: false, platform: 'CDISCOUNT', error: (error as Error).message };
        }
    }

    async updateStock(sku: string, stock: number): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/products/${sku}/stock`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ stock }),
            });
            return { success: response.ok, sku, stock, platform: 'CDISCOUNT' };
        } catch (error) {
            throw error;
        }
    }

    async updatePrice(sku: string, price: number): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/products/${sku}/price`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ price }),
            });
            return { success: response.ok, sku, price, platform: 'CDISCOUNT' };
        } catch (error) {
            throw error;
        }
    }

    async getStoreInfo(storeId: string): Promise<any> {
        try {
            const url = `https://www.cdiscount.com/vendeur/${storeId}`;
            const scraped = await this.scrapingService.scrapeStore(url, 'CDISCOUNT');
            return {
                storeId,
                storeName: scraped?.storeName || storeId,
                platform: 'CDISCOUNT',
                country: 'France',
            };
        } catch (error) {
            throw error;
        }
    }

    async getStoreProducts(storeId?: string, limit: number = 10): Promise<CdiscountProduct[]> {
        try {
            const response = await fetch(
                `${this.apiUrl}/products?seller_id=${storeId}&limit=${limit}`,
                { headers: this.getAuthHeaders() }
            );
            const data = await response.json();
            return (data.products || []).map((item: any) => ({
                productId: item.id,
                title: item.name,
                price: item.price,
                salePrice: item.sale_price || item.price,
                stockCount: item.stock || 0,
                rating: item.rating || 0,
                reviewCount: item.review_count || 0,
                url: item.url,
                images: item.images || [],
                sellerName: item.seller_name,
                sellerId: item.seller_id,
                shippingTime: item.shipping_time,
                freeShipping: item.free_shipping || false,
                isCdiscountSold: item.is_cdiscount_sold || false,
                category: item.category,
            }));
        } catch (error) {
            throw error;
        }
    }
}
