import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge, MarketplaceReview } from './marketplace.service';
import { ScrapingService } from '../scraping/scraping.service';

interface N11Product {
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
    storeUrl?: string;
}

@Injectable()
export class N11Bridge implements MarketplaceBridge {
    private readonly logger = new Logger(N11Bridge.name);
    private readonly baseUrl = 'https://api.n11.com/ws';

    constructor(
        private readonly apiKey: string,
        private readonly apiSecret: string,
        private readonly scrapingService: ScrapingService,
    ) {}

    async syncProducts(): Promise<any> {
        this.logger.log('Syncing products from N11');
        try {
            const url = `${this.baseUrl}/ProductService/`;
            const soapBody = this.buildSoapEnvelope('GetProductList', `
                <pagingData>
                    <currentPage>0</currentPage>
                    <pageSize>100</pageSize>
                </pagingData>
            `);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': '' },
                body: soapBody,
            });

            if (!response.ok) {
                this.logger.warn(`N11 syncProducts failed: ${response.status}`);
                return { success: false, platform: 'N11', error: `HTTP ${response.status}` };
            }

            const text = await response.text();
            const products = this.parseProductListResponse(text);
            return { success: true, platform: 'N11', count: products.length, products };
        } catch (error) {
            this.logger.warn(`N11 syncProducts error: ${(error as Error).message}`);
            return { success: false, platform: 'N11', error: (error as Error).message };
        }
    }

    async syncOrders(): Promise<any> {
        try {
            const url = `${this.baseUrl}/OrderService/`;
            const soapBody = this.buildSoapEnvelope('OrderList', `
                <searchData>
                    <buyerName />
                    <orderNumber />
                    <productSellerCode />
                    <recipient />
                    <period>
                        <startDate>${this.daysAgo(7)}</startDate>
                        <endDate>${this.now()}</endDate>
                    </period>
                    <sortForUpdateDate>true</sortForUpdateDate>
                </searchData>
                <pagingData>
                    <currentPage>0</currentPage>
                    <pageSize>50</pageSize>
                </pagingData>
            `);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'text/xml; charset=utf-8' },
                body: soapBody,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return { success: true, platform: 'N11', orders: [] };
        } catch (error) {
            this.logger.warn(`N11 syncOrders error: ${(error as Error).message}`);
            return { success: false, platform: 'N11', error: (error as Error).message };
        }
    }

    async updateStock(sku: string, stock: number): Promise<any> {
        try {
            const url = `${this.baseUrl}/ProductStockService/`;
            const soapBody = this.buildSoapEnvelope('IncreaseStockByStockSellerCode', `
                <stockItems>
                    <stockItem>
                        <sellerStockCode>${this.escapeXml(sku)}</sellerStockCode>
                        <quantity>${stock}</quantity>
                        <version>1</version>
                    </stockItem>
                </stockItems>
            `);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'text/xml; charset=utf-8' },
                body: soapBody,
            });

            if (response.status === 429 || response.status >= 500) {
                throw new Error(`N11 stock update failed: HTTP ${response.status}`);
            }

            return { success: response.ok, sku, stock, platform: 'N11' };
        } catch (error) {
            this.logger.warn(`N11 updateStock error: ${(error as Error).message}`);
            throw error;
        }
    }

    async updatePrice(sku: string, price: number): Promise<any> {
        try {
            const url = `${this.baseUrl}/ProductService/`;
            const soapBody = this.buildSoapEnvelope('UpdateProductPriceBySellerCode', `
                <productSellerCode>${this.escapeXml(sku)}</productSellerCode>
                <price>${price}</price>
                <currencyType>1</currencyType>
            `);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'text/xml; charset=utf-8' },
                body: soapBody,
            });

            if (response.status === 429 || response.status >= 500) {
                throw new Error(`N11 price update failed: HTTP ${response.status}`);
            }

            return { success: response.ok, sku, price, platform: 'N11' };
        } catch (error) {
            this.logger.warn(`N11 updatePrice error: ${(error as Error).message}`);
            throw error;
        }
    }

    async getStoreInfo(storeId: string): Promise<any> {
        try {
            const url = `https://www.n11.com/magaza/${storeId}`;
            const scraped = await this.scrapingService.scrapeStore(url, 'N11');
            if (scraped) return scraped;
        } catch (error) {
            this.logger.warn(`N11 getStoreInfo scraping failed: ${(error as Error).message}`);
        }

        return {
            storeId,
            storeName: storeId,
            platform: 'N11',
        };
    }

    async getStoreProducts(storeId: string, limit: number = 10): Promise<N11Product[]> {
        try {
            const url = `https://www.n11.com/magaza/${storeId}`;
            const scraped = await this.scrapingService.scrapeStoreProducts(url, 'N11', limit);
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
                    storeUrl: item.storeUrl ? String(item.storeUrl) : undefined,
                }));
            }
        } catch (error) {
            this.logger.warn(`N11 getStoreProducts scraping failed: ${(error as Error).message}`);
        }

        return [];
    }

    // SOAP helpers
    private buildSoapEnvelope(action: string, body: string): string {
        return `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:sch="http://www.n11.com/ws/schemas">
    <soapenv:Header>
        <sch:Authentication>
            <appKey>${this.escapeXml(this.apiKey)}</appKey>
            <appSecret>${this.escapeXml(this.apiSecret)}</appSecret>
        </sch:Authentication>
    </soapenv:Header>
    <soapenv:Body>
        <sch:${action}Request>
            ${body}
        </sch:${action}Request>
    </soapenv:Body>
</soapenv:Envelope>`;
    }

    private escapeXml(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    private parseProductListResponse(xml: string): N11Product[] {
        // Simple regex-based XML parsing for product data
        const products: N11Product[] = [];
        const productBlocks = xml.match(/<product>([\s\S]*?)<\/product>/g) || [];

        for (const block of productBlocks.slice(0, 100)) {
            const getValue = (tag: string): string => {
                const match = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
                return match ? match[1] : '';
            };

            products.push({
                productId: getValue('id') || getValue('productSellerCode'),
                title: getValue('title'),
                price: Number(getValue('displayPrice') || getValue('price') || 0),
                salePrice: Number(getValue('salePrice') || getValue('price') || 0),
                stockCount: Number(getValue('stockAmount') || 0),
                rating: 0,
                reviewCount: 0,
                url: getValue('url'),
                images: [],
            });
        }

        return products;
    }

    private daysAgo(days: number): string {
        const d = new Date(Date.now() - days * 86400000);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    private now(): string {
        const d = new Date();
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    /**
     * N11'den ürün yorumlarını SOAP API ile çek
     */
    async getReviews(page: number = 0, size: number = 100): Promise<MarketplaceReview[]> {
        if (!this.apiKey || !this.apiSecret) {
            this.logger.warn('N11 getReviews: API kimlik bilgileri eksik');
            return [];
        }
        try {
            const url = `${this.baseUrl}/ProductService/`;
            const soapBody = this.buildSoapEnvelope('GetProductQuestionList', `
                <pagingData>
                    <currentPage>${page}</currentPage>
                    <pageSize>${size}</pageSize>
                </pagingData>
            `);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '' },
                body: soapBody,
            });
            if (!response.ok) return [];
            const xml = await response.text();
            return this.parseReviewsFromXml(xml);
        } catch (error) {
            this.logger.warn(`N11 getReviews hatası: ${(error as Error).message}`);
            return [];
        }
    }

    private parseReviewsFromXml(xml: string): MarketplaceReview[] {
        const reviews: MarketplaceReview[] = [];
        const blocks = xml.match(/<review>([\ s\S]*?)<\/review>/g) ||
                       xml.match(/<question>([\ s\S]*?)<\/question>/g) || [];
        for (const block of blocks.slice(0, 100)) {
            const getValue = (tag: string): string => {
                const match = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
                return match ? match[1].trim() : '';
            };
            const id = getValue('id') || getValue('reviewId');
            const comment = getValue('review') || getValue('comment') || getValue('question');
            if (!id || !comment) continue;
            reviews.push({
                externalId: id,
                productName: getValue('productName') || 'N11 Ürün',
                customerName: getValue('reviewer') || getValue('userName') || 'Müşteri',
                rating: Number(getValue('rating') || getValue('rate') || 0),
                comment,
                reviewDate: getValue('createDate') ? new Date(getValue('createDate')) : new Date(),
                verified: getValue('approved') === 'true',
            });
        }
        return reviews;
    }
}
