import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';
import {
    MarketplaceAnalysisResponse,
    computeConfidenceFromSources,
} from './analysis.types';

interface EbayProduct {
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
    sellerUrl: string;
    condition: string;
    listingStatus: string;
}

@Injectable()
export class EbayBridge implements MarketplaceBridge {
    private readonly logger = new Logger(EbayBridge.name);
    private readonly apiUrl = 'https://api.ebay.com/sell/inventory/v1';
    private readonly tradingApiUrl = 'https://api.ebay.com/wsapi';

    constructor(
        private readonly appId: string,
        private readonly certId: string,
        private readonly devId: string,
        private readonly authToken: string,
        private readonly scrapingService: ScrapingService,
        private readonly isSandbox: boolean = false,
    ) {}

    private getBaseUrl(): string {
        return this.isSandbox 
            ? 'https://api.sandbox.ebay.com/sell/inventory/v1'
            : this.apiUrl;
    }

    async syncProducts(): Promise<any> {
        this.logger.log('Syncing products from eBay');
        try {
            const token = await this.getOAuthToken();
            
            const response = await fetch(`${this.getBaseUrl()}/inventory_item`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
                },
            });

            if (!response.ok) {
                this.logger.warn(`eBay syncProducts failed: ${response.status}`);
                return { success: false, platform: 'EBAY', error: `HTTP ${response.status}` };
            }

            const data = await response.json();
            const products = data.inventoryItems || [];
            
            return { 
                success: true, 
                platform: 'EBAY', 
                count: products.length, 
                products: products.map(this.mapEbayProduct)
            };
        } catch (error) {
            this.logger.warn(`eBay syncProducts error: ${(error as Error).message}`);
            return { success: false, platform: 'EBAY', error: (error as Error).message };
        }
    }

    async syncOrders(): Promise<any> {
        try {
            const token = await this.getOAuthToken();
            
            const response = await fetch(`https://api.ebay.com/sell/fulfillment/v1/order`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return { 
                success: true, 
                platform: 'EBAY', 
                orders: data.orders || [] 
            };
        } catch (error) {
            this.logger.warn(`eBay syncOrders error: ${(error as Error).message}`);
            return { success: false, platform: 'EBAY', error: (error as Error).message };
        }
    }

    async updateStock(sku: string, stock: number): Promise<any> {
        try {
            const token = await this.getOAuthToken();
            
            const response = await fetch(`${this.getBaseUrl()}/inventory_item/${sku}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
                },
                body: JSON.stringify({
                    availability: {
                        shipToLocationAvailability: {
                            quantity: stock,
                        },
                    },
                }),
            });

            if (response.status === 429 || response.status >= 500) {
                throw new Error(`eBay stock update failed: HTTP ${response.status}`);
            }

            return { success: response.ok, sku, stock, platform: 'EBAY' };
        } catch (error) {
            this.logger.warn(`eBay updateStock error: ${(error as Error).message}`);
            throw error;
        }
    }

    async updatePrice(sku: string, price: number): Promise<any> {
        try {
            const token = await this.getOAuthToken();
            
            // Get current listing
            const getResponse = await fetch(`${this.getBaseUrl()}/inventory_item/${sku}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!getResponse.ok) {
                throw new Error(`Failed to get item: HTTP ${getResponse.status}`);
            }

            const item = await getResponse.json();
            
            // Update with new price
            const response = await fetch(`${this.getBaseUrl()}/inventory_item/${sku}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
                },
                body: JSON.stringify({
                    ...item,
                    pricingSummary: {
                        ...item.pricingSummary,
                        price: {
                            currency: 'USD',
                            value: price.toString(),
                        },
                    },
                }),
            });

            if (response.status === 429 || response.status >= 500) {
                throw new Error(`eBay price update failed: HTTP ${response.status}`);
            }

            return { success: response.ok, sku, price, platform: 'EBAY' };
        } catch (error) {
            this.logger.warn(`eBay updatePrice error: ${(error as Error).message}`);
            throw error;
        }
    }

    async getStoreInfo(storeId: string): Promise<any> {
        try {
            const token = await this.getOAuthToken();
            
            const response = await fetch(`https://api.ebay.com/ws/api.dll`, {
                method: 'POST',
                headers: {
                    'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
                    'X-EBAY-API-CALL-NAME': 'GetSellerDashboard',
                    'X-EBAY-API-SITEID': '0',
                    'Content-Type': 'text/xml',
                },
                body: this.buildTradingApiRequest('GetSellerDashboard'),
            });

            if (!response.ok) {
                // Fallback to scraping
                const url = `https://www.ebay.com/str/${storeId}`;
                const scraped = await this.scrapingService.scrapeStore(url, 'EBAY');
                if (scraped) {
                    return {
                        storeId,
                        storeName: scraped.storeName || storeId,
                        totalProducts: scraped.productCount ?? 0,
                        averageRating: scraped.rating ?? 0,
                        totalReviews: scraped.totalReviews ?? 0,
                        platform: 'EBAY',
                    };
                }
                throw new Error('eBay store info could not be retrieved');
            }

            const xmlText = await response.text();
            // Parse XML response (simplified)
            return {
                storeId,
                platform: 'EBAY',
                rawData: xmlText,
            };
        } catch (error) {
            this.logger.error(`eBay getStoreInfo error: ${(error as Error).message}`);
            throw error;
        }
    }

    async getStoreProducts(storeId?: string, limit: number = 10): Promise<EbayProduct[]> {
        try {
            const token = await this.getOAuthToken();
            
            const response = await fetch(`${this.getBaseUrl()}/inventory_item?limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const items = data.inventoryItems || [];
            
            return items.slice(0, limit).map((item: any, index: number) => this.mapEbayProduct(item, index));
        } catch (error) {
            this.logger.error(`eBay getStoreProducts error: ${(error as Error).message}`);
            throw error;
        }
    }

    private async getOAuthToken(): Promise<string> {
        // OAuth token implementation
        // In production, this should use proper OAuth flow with refresh tokens
        return this.authToken;
    }

    private buildTradingApiRequest(callName: string): string {
        return `<?xml version="1.0" encoding="utf-8"?>
<eBayCredentials xmlns="urn:ebay:apis:eBLBaseComponents">
    <RequesterCredentials>
        <eBayAuthToken>${this.authToken}</eBayAuthToken>
    </RequesterCredentials>
</eBayCredentials>`;
    }

    private mapEbayProduct(item: any, index: number = 0): EbayProduct {
        return {
            productId: item.sku || `EBAY-${index}`,
            title: item.product?.title || 'Unknown',
            price: parseFloat(item.pricingSummary?.price?.value) || 0,
            salePrice: parseFloat(item.pricingSummary?.price?.value) || 0,
            stockCount: item.availability?.shipToLocationAvailability?.quantity || 0,
            rating: 0,
            reviewCount: 0,
            url: item.product?.imageUrls?.[0] || '',
            images: item.product?.imageUrls || [],
            sellerName: '',
            sellerUrl: '',
            condition: item.condition || 'NEW',
            listingStatus: item.status || 'ACTIVE',
        };
    }
}
