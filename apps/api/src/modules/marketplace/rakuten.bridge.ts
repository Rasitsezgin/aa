import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

interface RakutenProduct {
    productId: string;
    title: string;
    price: number;
    salePrice: number;
    stockCount: number;
    rating: number;
    reviewCount: number;
    url: string;
    images: string[];
    shopName: string;
    shopCode: string;
    shippingFrom: string;
    shippingCost: number;
    pointsRate: number;
}

@Injectable()
export class RakutenBridge implements MarketplaceBridge {
    private readonly logger = new Logger(RakutenBridge.name);
    private readonly apiUrl = 'https://api.rms.rakuten.co.jp/es/2.0';
    private readonly ichibaApiUrl = 'https://app.rakuten.co.jp/services/api';

    constructor(
        private readonly serviceSecret: string,
        private readonly licenseKey: string,
        private readonly applicationId: string,
        private readonly scrapingService: ScrapingService,
    ) {}

    private getAuthHeader(): string {
        return 'ESA ' + Buffer.from(`${this.serviceSecret}:${this.licenseKey}`).toString('base64');
    }

    async syncProducts(): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/item/search`, {
                method: 'GET',
                headers: {
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                return { success: false, platform: 'RAKUTEN', error: `HTTP ${response.status}` };
            }

            const data = await response.json();
            return { 
                success: true, 
                platform: 'RAKUTEN', 
                count: data.items?.length || 0 
            };
        } catch (error) {
            return { success: false, platform: 'RAKUTEN', error: (error as Error).message };
        }
    }

    async syncOrders(): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/order/search`, {
                method: 'POST',
                headers: { 
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    dateType: 1,
                    startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                }),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return { success: true, platform: 'RAKUTEN', orders: data.orders || [] };
        } catch (error) {
            return { success: false, platform: 'RAKUTEN', error: (error as Error).message };
        }
    }

    async updateStock(sku: string, stock: number): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/item/update`, {
                method: 'POST',
                headers: { 
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item: {
                        itemNumber: sku,
                        inventory: { inventoryCount: stock },
                    },
                }),
            });
            return { success: response.ok, sku, stock, platform: 'RAKUTEN' };
        } catch (error) {
            throw error;
        }
    }

    async updatePrice(sku: string, price: number): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/item/update`, {
                method: 'POST',
                headers: { 
                    'Authorization': this.getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item: {
                        itemNumber: sku,
                        price: { price: price },
                    },
                }),
            });
            return { success: response.ok, sku, price, platform: 'RAKUTEN' };
        } catch (error) {
            throw error;
        }
    }

    async getStoreInfo(storeId: string): Promise<any> {
        try {
            const url = `https://www.rakuten.co.jp/${storeId}`;
            const scraped = await this.scrapingService.scrapeStore(url, 'RAKUTEN');
            return {
                storeId,
                storeName: scraped?.storeName || storeId,
                platform: 'RAKUTEN',
                country: 'Japan',
            };
        } catch (error) {
            throw error;
        }
    }

    async getStoreProducts(storeId?: string, limit: number = 10): Promise<RakutenProduct[]> {
        try {
            const response = await fetch(
                `${this.ichibaApiUrl}/IchibaItem/Search/20170706?applicationId=${this.applicationId}&shopCode=${storeId}&hits=${limit}`
            );
            const data = await response.json();
            return (data.Items || []).map((item: any) => ({
                productId: item.Item.itemCode,
                title: item.Item.itemName,
                price: item.Item.itemPrice,
                salePrice: item.Item.itemPrice,
                stockCount: 0,
                rating: 0,
                reviewCount: item.Item.reviewCount || 0,
                url: item.Item.itemUrl,
                images: [item.Item.mediumImageUrls?.[0]?.imageUrl],
                shopName: item.Item.shopName,
                shopCode: item.Item.shopCode,
                shippingFrom: '',
                shippingCost: item.Item.postageFlag === 0 ? 0 : item.Item.postage,
                pointsRate: item.Item.pointRate || 0,
            }));
        } catch (error) {
            throw error;
        }
    }
}
