import { Controller, Post, Get, Param, Headers, Query, Body } from '@nestjs/common';
import { MarketplaceService, Platform } from './marketplace.service';

@Controller('marketplace')
export class MarketplaceController {
    constructor(private readonly marketplaceService: MarketplaceService) { }

    @Post('sync-all')
    async syncAll(@Headers('x-tenant-id') tenantId: string) {
        return this.marketplaceService.syncAllPlatformsForTenant(tenantId);
    }

    @Post('sync/:platform')
    async syncPlatform(
        @Headers('x-tenant-id') tenantId: string,
        @Param('platform') platform: string
    ) {
        const bridge = await this.marketplaceService.getBridgeForTenant(tenantId, platform.toUpperCase() as Platform);
        return bridge.syncProducts();
    }

    /**
     * Mağaza analizi - Pazaryerinden gerçek veriler çek ve analiz et
     */
    @Get('analyze/:platform/:storeId')
    async analyzeStore(
        @Param('platform') platform: string,
        @Param('storeId') storeId: string,
        @Query('url') url?: string
    ) {
        const platformUpper = platform.toUpperCase() as Platform;
        
        // Eğer URL verilmişse, URL'den store ID'sini çıkart
        let actualStoreId = storeId;
        if (url) {
            actualStoreId = this.extractStoreIdFromUrl(url, platformUpper);
        }

        return this.marketplaceService.analyzeStore(platformUpper, actualStoreId);
    }

    /**
     * Mağaza ürünlerini getir
     */
    @Get('store/:platform/:storeId/products')
    async getStoreProducts(
        @Param('platform') platform: string,
        @Param('storeId') storeId: string,
        @Query('limit') limit: number = 10
    ) {
        const platformUpper = platform.toUpperCase() as Platform;
        return this.marketplaceService.getStoreProducts(platformUpper, storeId, limit);
    }

    /**
     * Mağaza bilgilerini getir
     */
    @Get('store/:platform/:storeId/info')
    async getStoreInfo(
        @Param('platform') platform: string,
        @Param('storeId') storeId: string
    ) {
        const platformUpper = platform.toUpperCase() as Platform;
        return this.marketplaceService.getStoreInfo(platformUpper, storeId);
    }

    private extractStoreIdFromUrl(url: string, platform: Platform): string {
        try {
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
            const pathname = urlObj.pathname;

            if (platform === Platform.TRENDYOL) {
                // https://www.trendyol.com/magaza/woys-m-203786
                const match = pathname.match(/\/magaza\/([^/]+)/);
                return match ? match[1].split('-').pop() || '203786' : '203786';
            }

            return '203786'; // Default fallback
        } catch {
            return '203786'; // Default fallback
        }
    }
}

