import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';
import {
    MarketplaceAnalysisResponse,
    computeConfidenceFromSources,
} from './analysis.types';

interface AlibabaProduct {
    productId: string;
    title: string;
    price: number;
    salePrice: number;
    stockCount: number;
    rating: number;
    reviewCount: number;
    url: string;
    images: string[];
    supplierName: string;
    supplierUrl: string;
    minOrder: number;
    unit: string;
    shippingTerms: string;
    paymentTerms: string;
}

@Injectable()
export class AlibabaBridge implements MarketplaceBridge {
    private readonly logger = new Logger(AlibabaBridge.name);
    private readonly apiUrl = 'https://openapi.alibaba.com/gateway.do';

    constructor(
        private readonly appKey: string,
        private readonly appSecret: string,
        private readonly accessToken: string,
        private readonly scrapingService: ScrapingService,
    ) {}

    async syncProducts(): Promise<any> {
        this.logger.log('Syncing products from Alibaba');
        try {
            // Alibaba API uses signature-based authentication
            const timestamp = new Date().toISOString();
            const params = {
                app_key: this.appKey,
                timestamp: timestamp,
                method: 'alibaba.product.list',
                access_token: this.accessToken,
                format: 'json',
                v: '2.0',
                pageSize: '100',
            };

            const signature = this.generateSignature(params);
            
            const queryString = new URLSearchParams({
                ...params,
                sign: signature,
                sign_method: 'hmac-sha256',
            }).toString();

            const response = await fetch(`${this.apiUrl}?${queryString}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                this.logger.warn(`Alibaba syncProducts failed: ${response.status}`);
                return { success: false, platform: 'ALIBABA', error: `HTTP ${response.status}` };
            }

            const data = await response.json();
            const products = data.productList || [];
            
            return { 
                success: true, 
                platform: 'ALIBABA', 
                count: products.length, 
                products: products.map(this.mapAlibabaProduct)
            };
        } catch (error) {
            this.logger.warn(`Alibaba syncProducts error: ${(error as Error).message}`);
            return { success: false, platform: 'ALIBABA', error: (error as Error).message };
        }
    }

    async syncOrders(): Promise<any> {
        try {
            const timestamp = new Date().toISOString();
            const params = {
                app_key: this.appKey,
                timestamp: timestamp,
                method: 'alibaba.trade.order.list',
                access_token: this.accessToken,
                format: 'json',
                v: '2.0',
            };

            const signature = this.generateSignature(params);
            
            const queryString = new URLSearchParams({
                ...params,
                sign: signature,
                sign_method: 'hmac-sha256',
            }).toString();

            const response = await fetch(`${this.apiUrl}?${queryString}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return { 
                success: true, 
                platform: 'ALIBABA', 
                orders: data.orderList || [] 
            };
        } catch (error) {
            this.logger.warn(`Alibaba syncOrders error: ${(error as Error).message}`);
            return { success: false, platform: 'ALIBABA', error: (error as Error).message };
        }
    }

    async updateStock(sku: string, stock: number): Promise<any> {
        try {
            const timestamp = new Date().toISOString();
            const params = {
                app_key: this.appKey,
                timestamp: timestamp,
                method: 'alibaba.product.update',
                access_token: this.accessToken,
                format: 'json',
                v: '2.0',
                productId: sku,
                stockQuantity: stock.toString(),
            };

            const signature = this.generateSignature(params);
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    ...params,
                    sign: signature,
                    sign_method: 'hmac-sha256',
                }).toString(),
            });

            if (response.status === 429 || response.status >= 500) {
                throw new Error(`Alibaba stock update failed: HTTP ${response.status}`);
            }

            return { success: response.ok, sku, stock, platform: 'ALIBABA' };
        } catch (error) {
            this.logger.warn(`Alibaba updateStock error: ${(error as Error).message}`);
            throw error;
        }
    }

    async updatePrice(sku: string, price: number): Promise<any> {
        try {
            const timestamp = new Date().toISOString();
            const params = {
                app_key: this.appKey,
                timestamp: timestamp,
                method: 'alibaba.product.update',
                access_token: this.accessToken,
                format: 'json',
                v: '2.0',
                productId: sku,
                price: price.toString(),
            };

            const signature = this.generateSignature(params);
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    ...params,
                    sign: signature,
                    sign_method: 'hmac-sha256',
                }).toString(),
            });

            if (response.status === 429 || response.status >= 500) {
                throw new Error(`Alibaba price update failed: HTTP ${response.status}`);
            }

            return { success: response.ok, sku, price, platform: 'ALIBABA' };
        } catch (error) {
            this.logger.warn(`Alibaba updatePrice error: ${(error as Error).message}`);
            throw error;
        }
    }

    async getStoreInfo(storeId: string): Promise<any> {
        try {
            // Alibaba supplier info via scraping fallback
            const url = `https://${storeId}.en.alibaba.com`;
            const scraped = await this.scrapingService.scrapeStore(url, 'ALIBABA');
            if (scraped) {
                return {
                    storeId,
                    storeName: scraped.storeName || storeId,
                    totalProducts: scraped.productCount ?? 0,
                    averageRating: scraped.rating ?? 0,
                    totalReviews: scraped.totalReviews ?? 0,
                    followersCount: scraped.followerCount ?? 0,
                    platform: 'ALIBABA',
                    isGoldSupplier: false,
                    yearsInBusiness: 0,
                };
            }
            
            throw new Error('Alibaba supplier info could not be retrieved');
        } catch (error) {
            this.logger.error(`Alibaba getStoreInfo error: ${(error as Error).message}`);
            throw error;
        }
    }

    async getStoreProducts(storeId?: string, limit: number = 10): Promise<AlibabaProduct[]> {
        try {
            const timestamp = new Date().toISOString();
            const params = {
                app_key: this.appKey,
                timestamp: timestamp,
                method: 'alibaba.product.search',
                access_token: this.accessToken,
                format: 'json',
                v: '2.0',
                sellerId: storeId || '',
                pageSize: limit.toString(),
            };

            const signature = this.generateSignature(params);
            
            const queryString = new URLSearchParams({
                ...params,
                sign: signature,
                sign_method: 'hmac-sha256',
            }).toString();

            const response = await fetch(`${this.apiUrl}?${queryString}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const items = data.productList || [];
            
            return items.slice(0, limit).map((item: any, index: number) => this.mapAlibabaProduct(item, index));
        } catch (error) {
            this.logger.error(`Alibaba getStoreProducts error: ${(error as Error).message}`);
            throw error;
        }
    }

    private generateSignature(params: Record<string, string>): string {
        // HMAC-SHA256 signature for Alibaba API
        const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
            acc[key] = params[key];
            return acc;
        }, {} as Record<string, string>);

        const signString = Object.entries(sortedParams)
            .map(([k, v]) => `${k}${v}`)
            .join('');

        // In production, use crypto library for HMAC
        return `hmac_sha256_${signString}`;
    }

    private mapAlibabaProduct(item: any, index: number = 0): AlibabaProduct {
        return {
            productId: item.productId || `ALIBABA-${index}`,
            title: item.subject || 'Unknown',
            price: parseFloat(item.fobPrice?.value) || 0,
            salePrice: parseFloat(item.fobPrice?.value) || 0,
            stockCount: item.stockQuantity || 0,
            rating: item.supplier?.rating || 0,
            reviewCount: 0,
            url: item.productUrl || '',
            images: item.imageUrls || [],
            supplierName: item.supplier?.name || '',
            supplierUrl: item.supplier?.url || '',
            minOrder: item.minOrderQuantity || 1,
            unit: item.unit || 'piece',
            shippingTerms: item.shippingTerms || '',
            paymentTerms: item.paymentTerms || '',
        };
    }
}
