import { Injectable, Logger } from '@nestjs/common';
import { MarketplaceBridge } from './marketplace.service';

@Injectable()
export class AmazonBridge implements MarketplaceBridge {
    private readonly logger = new Logger(AmazonBridge.name);

    constructor(
        private readonly sellerId: string,
        private readonly mwsAuthToken: string,
    ) { }

    async syncProducts(): Promise<any> {
        this.logger.log(`Syncing products for Amazon Seller: ${this.sellerId}`);
        return { success: true, platform: 'AMAZON', count: 15 };
    }

    async syncOrders(): Promise<any> {
        return { success: true, platform: 'AMAZON', orders: [] };
    }

    async updateStock(sku: string, stock: number): Promise<any> {
        return { success: true, sku, stock };
    }

    async updatePrice(sku: string, price: number): Promise<any> {
        return { success: true, sku, price };
    }
}
