import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { IntegrationsService, IntegrationCredentials } from './integrations.service';
import type { PlatformRegion, SubscriptionPlan } from './marketplace-registry';

@Controller('integrations')
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  // Tüm pazaryerlerini listele
  @Get('marketplaces')
  async getAllMarketplaces(
    @Query('tenantId') tenantId: string,
    @Query('region') region?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.integrationsService.getAllMarketplaces(tenantId, {
      region: region as PlatformRegion,
      category,
      status,
      search,
    });
  }

  // Pazaryeri detayı
  @Get('marketplaces/:marketplaceId')
  async getMarketplaceDetails(
    @Param('marketplaceId') marketplaceId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.integrationsService.getMarketplaceDetails(marketplaceId, tenantId);
  }

  // Kullanıcının entegrasyonlarını listele
  @Get('user')
  async getUserIntegrations(@Query('tenantId') tenantId: string) {
    return this.integrationsService.getUserIntegrations(tenantId);
  }

  // Entegrasyon istatistikleri
  @Get('stats')
  async getIntegrationStats(@Query('tenantId') tenantId: string) {
    return this.integrationsService.getIntegrationStats(tenantId);
  }

  // Pazaryerine bağlan
  @Post('connect')
  async connectMarketplace(
    @Body()
    data: {
      tenantId: string;
      marketplaceId: string;
      credentials: IntegrationCredentials;
    },
  ) {
    return this.integrationsService.connectMarketplace(
      data.tenantId,
      data.marketplaceId,
      data.credentials,
    );
  }

  // Bağlantıyı test et
  @Post('test/:integrationId')
  async testConnection(
    @Param('integrationId') integrationId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.integrationsService.testConnection(integrationId, tenantId);
  }

  // Pazaryeri bağlantısını kes
  @Put('disconnect/:marketplaceId')
  async disconnectMarketplace(
    @Param('marketplaceId') marketplaceId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.integrationsService.disconnectMarketplace(tenantId, marketplaceId);
  }

  // Entegrasyonu sil
  @Delete(':marketplaceId')
  async deleteIntegration(
    @Param('marketplaceId') marketplaceId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.integrationsService.deleteIntegration(tenantId, marketplaceId);
  }

  // Senkronizasyon başlat
  @Post('sync/:marketplaceId')
  async syncMarketplace(
    @Param('marketplaceId') marketplaceId: string,
    @Query('tenantId') tenantId: string,
    @Body() data: { syncType: 'products' | 'orders' | 'inventory' | 'all' },
  ) {
    return this.integrationsService.syncMarketplace(
      tenantId,
      marketplaceId,
      data.syncType,
    );
  }

  // Bölgeye göre pazaryerleri
  @Get('by-region/:region')
  async getMarketplacesByRegion(@Param('region') region: string) {
    return this.integrationsService.getMarketplacesByRegion(region as PlatformRegion);
  }

  // Plana göre erişilebilir pazaryerleri
  @Get('by-plan/:plan')
  async getAccessibleMarketplaces(@Param('plan') plan: string) {
    return this.integrationsService.getAccessibleMarketplaces(plan as SubscriptionPlan);
  }
}
