import { Controller, Post, Get, Param, Headers, Query, Body } from '@nestjs/common';
import { MarketplaceService, Platform } from './marketplace.service';
import { Public } from '../auth/public.decorator';

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

    @Post('sync-orders/:platform')
    async syncPlatformOrders(
        @Headers('x-tenant-id') tenantId: string,
        @Param('platform') platform: string,
    ) {
        return this.marketplaceService.syncPlatformOrdersForTenant(tenantId, platform.toUpperCase() as Platform);
    }

    @Post('stock/:platform')
    async updateStock(
        @Headers('x-tenant-id') tenantId: string,
        @Param('platform') platform: string,
        @Body() body: { sku: string; stock: number; requestKey?: string },
    ) {
        return this.marketplaceService.updateMarketplaceStock(
            tenantId,
            platform.toUpperCase() as Platform,
            body.sku,
            body.stock,
            body.requestKey,
        );
    }

    @Post('price/:platform')
    async updatePrice(
        @Headers('x-tenant-id') tenantId: string,
        @Param('platform') platform: string,
        @Body() body: { sku: string; price: number; requestKey?: string },
    ) {
        return this.marketplaceService.updateMarketplacePrice(
            tenantId,
            platform.toUpperCase() as Platform,
            body.sku,
            body.price,
            body.requestKey,
        );
    }

    @Get('contract-probe/:platform')
    async probeContract(
        @Headers('x-tenant-id') tenantId: string,
        @Param('platform') platform: string,
        @Query('includeOrders') includeOrders?: string,
        @Query('productLimit') productLimit?: string,
    ) {
        return this.marketplaceService.probeIntegrationContract(
            tenantId,
            platform.toUpperCase() as Platform,
            {
                includeOrders: includeOrders === '1' || includeOrders === 'true',
                productLimit: productLimit ? Number(productLimit) : undefined,
            },
        );
    }

    /**
     * Mağaza analizi - Pazaryerinden gerçek veriler çek ve analiz et
     */
    @Public()
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
    @Public()
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
    @Public()
    @Get('store/:platform/:storeId/info')
    async getStoreInfo(
        @Param('platform') platform: string,
        @Param('storeId') storeId: string
    ) {
        const platformUpper = platform.toUpperCase() as Platform;
        return this.marketplaceService.getStoreInfo(platformUpper, storeId);
    }

    // ==================== STORE MANAGEMENT ====================
    /**
     * Mağazaları listele
     * GET /marketplace/stores
     */
    @Get('stores')
    async getStores(@Query('tenantId') tenantId: string) {
        return this.marketplaceService.getStores(tenantId);
    }

    /**
     * Entegrasyonları listele
     * GET /marketplace/integrations
     */
    @Get('integrations')
    async getIntegrations(@Query('tenantId') tenantId: string) {
        return this.marketplaceService.getIntegrations(tenantId);
    }

    /**
     * Mağaza bağla
     * POST /marketplace/connect
     */
    @Post('connect')
    async connectStore(@Body() data: { tenantId: string; platform: string; credentials: any }) {
        return this.marketplaceService.connectStore(data.tenantId, data.platform, data.credentials);
    }

    /**
     * Mağaza bağlantısını kes
     * POST /marketplace/disconnect/:storeId
     */
    @Post('disconnect/:storeId')
    async disconnectStore(
        @Param('storeId') storeId: string,
        @Body() data: { tenantId: string },
    ) {
        return this.marketplaceService.disconnectStore(data.tenantId, storeId);
    }

    private extractStoreIdFromUrl(url: string, platform: Platform): string {
        try {
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
            const pathname = urlObj.pathname;

            if (platform === Platform.TRENDYOL) {
                // https://www.trendyol.com/magaza/woys-m-203786
                const match = pathname.match(/\/magaza\/([^/]+)/);
                if (match) {
                    const parts = match[1].split('-m-');
                    if (parts.length > 1) return parts[1];
                    return match[1].split('-').pop() || '203786';
                }
                return '203786';
            }

            if (platform === Platform.HEPSIBURADA) {
                // https://www.hepsiburada.com/magaza/happycomtr
                const match = pathname.match(/\/magaza\/([^/?]+)/);
                return match ? match[1] : 'hepsiburada';
            }

            if (platform === Platform.AMAZON) {
                // https://www.amazon.com.tr/sp?seller=A123456789
                const sellerParam = urlObj.searchParams.get('seller') || urlObj.searchParams.get('merchant');
                if (sellerParam) return sellerParam;

                // https://www.amazon.com.tr/s?me=A123456789
                const meParam = urlObj.searchParams.get('me');
                if (meParam) return meParam;
            }

            // Global Fallback: return the last part of the path if no match
            const pathParts = pathname.split('/').filter(p => p.length > 0);
            return pathParts[pathParts.length - 1] || '203786';
        } catch {
            return '203786'; // Default fallback
        }
    }
}

