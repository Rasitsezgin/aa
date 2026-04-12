import { Injectable, Scope } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TrendyolBridge } from './trendyol.bridge';
import { AmazonBridge } from './amazon.bridge';

export interface MarketplaceBridge {
    syncProducts(): Promise<any>;
    syncOrders(): Promise<any>;
    updateStock(sku: string, stock: number): Promise<any>;
    updatePrice(sku: string, price: number): Promise<any>;
}

export enum Platform {
    TRENDYOL = 'TRENDYOL',
    AMAZON = 'AMAZON',
    HEPSIBURADA = 'HEPSIBURADA',
}

@Injectable({ scope: Scope.REQUEST })
export class MarketplaceService {
    constructor(private prisma: PrismaService) { }

    async getBridgeForTenant(tenantId: string, platform: Platform): Promise<MarketplaceBridge> {
        const integration = await this.prisma.integration.findFirst({
            where: { tenantId, platform: platform as any, isActive: true }
        });

        if (!integration) {
            throw new Error(`${platform} entegrasyonu bu mağaza için bulunamadı veya pasif.`);
        }

        switch (platform) {
            case Platform.TRENDYOL:
                const extra = integration.apiExtra as any;
                return new TrendyolBridge(
                    integration.apiKey,
                    integration.apiSecret,
                    extra?.supplierId || ''
                );
            case Platform.AMAZON:
                return new AmazonBridge(
                    integration.apiKey,
                    integration.apiSecret
                );
            default:
                throw new Error(`${platform} köprüsü henüz hazır değil.`);
        }
    }

    async syncAllPlatformsForTenant(tenantId: string) {
        const integrations = await this.prisma.integration.findMany({
            where: { tenantId, isActive: true }
        });

        const results: any[] = [];
        for (const integration of integrations) {
            const bridge = await this.getBridgeForTenant(tenantId, integration.platform as unknown as Platform);
            const res = await bridge.syncProducts();
            results.push(res);
        }
        return results;
    }

    /**
     * Pazaryerinden mağaza analizi yap
     */
    async analyzeStore(platform: Platform, storeId: string) {
        const bridge = await this.getTempBridge(platform) as any;
        
        if (platform === Platform.TRENDYOL) {
            return bridge.analyzeStoreSEO(storeId);
        }

        throw new Error(`${platform} için analiz henüz implementasyon edilmedi`);
    }

    /**
     * Mağaza ürünlerini getir
     */
    async getStoreProducts(platform: Platform, storeId: string, limit: number = 10) {
        const bridge = await this.getTempBridge(platform) as any;
        
        if (platform === Platform.TRENDYOL) {
            return bridge.getStoreProducts(storeId, limit);
        }

        throw new Error(`${platform} için ürün getirme henüz implementasyon edilmedi`);
    }

    /**
     * Mağaza bilgilerini getir
     */
    async getStoreInfo(platform: Platform, storeId: string) {
        const bridge = await this.getTempBridge(platform) as any;
        
        if (platform === Platform.TRENDYOL) {
            return bridge.getStoreInfo(storeId);
        }

        throw new Error(`${platform} için mağaza bilgisi henüz implementasyon edilmedi`);
    }

    /**
     * API Key olmadan geçici bridge oluştur (public store analizi için)
     */
    private async getTempBridge(platform: Platform): Promise<MarketplaceBridge> {
        switch (platform) {
            case Platform.TRENDYOL:
                // Trendyol public API'si kullanıyoruz
                return new TrendyolBridge('public', 'public', '');
            case Platform.AMAZON:
                return new AmazonBridge('public', 'public');
            default:
                throw new Error(`${platform} köprüsü henüz hazır değil.`);
        }
    }
}
