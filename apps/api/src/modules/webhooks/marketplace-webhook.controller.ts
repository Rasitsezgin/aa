import {
  Controller,
  Post,
  Headers,
  Body,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Public } from '../auth/public.decorator';
import { MarketplaceService, Platform } from '../marketplace/marketplace.service';
import { Prisma, type Platform as PrismaPlatform } from '@pazaryonetimi/database';

/**
 * Platform Webhook Receivers
 * Trendyol, Hepsiburada, Amazon sipariş ve stok webhook'larını dinler
 */
@Controller('webhooks/marketplace')
export class MarketplaceWebhookController {
  private readonly logger = new Logger(MarketplaceWebhookController.name);

  constructor(
    private prisma: PrismaService,
    private marketplaceService: MarketplaceService,
  ) {}

  @Public()
  @Post('trendyol')
  async handleTrendyolWebhook(
    @Headers('x-trendyol-webhook-secret') secret: string,
    @Headers('x-trendyol-event-type') eventType: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const expectedSecret = process.env.TRENDYOL_WEBHOOK_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    switch (eventType) {
      case 'ORDER_RECEIVED':
      case 'ORDER_UPDATED':
        await this.processTrendyolOrder(payload);
        break;
      case 'STOCK_UPDATED':
        await this.processTrendyolStockUpdate(payload);
        break;
      case 'PRICE_UPDATED':
        await this.processTrendyolPriceUpdate(payload);
        break;
      case 'RETURN_RECEIVED':
        await this.processTrendyolReturn(payload);
        break;
      default:
        this.logger.warn(`Unhandled Trendyol event: ${eventType}`);
    }

    return { received: true };
  }

  @Public()
  @Post('hepsiburada')
  async handleHepsiburadaWebhook(
    @Headers('x-hepsiburada-signature') signature: string,
    @Headers('x-hepsiburada-event') eventType: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const secret = process.env.HEPSIBURADA_WEBHOOK_SECRET;
    if (secret) {
      const crypto = await import('crypto');
      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      if (signature !== expectedSig) {
        throw new UnauthorizedException('Invalid signature');
      }
    }

    switch (eventType) {
      case 'order.created':
      case 'order.updated':
        await this.processHepsiburadaOrder(payload);
        break;
      case 'product.stock_changed':
        await this.processHepsiburadaStockUpdate(payload);
        break;
      case 'product.price_changed':
        await this.processHepsiburadaPriceUpdate(payload);
        break;
      default:
        this.logger.warn(`Unhandled Hepsiburada event: ${eventType}`);
    }

    return { received: true };
  }

  @Public()
  @Post('amazon')
  async handleAmazonNotification(
    @Headers('x-amz-sns-message-type') messageType: string,
    @Body() payload: Record<string, unknown>,
  ) {
    if (messageType === 'SubscriptionConfirmation') {
      const subscribeUrl = payload.SubscribeURL as string | undefined;
      if (subscribeUrl) {
        await fetch(subscribeUrl);
      }
      return { confirmed: true };
    }

    if (messageType === 'Notification') {
      const message = JSON.parse(String(payload.Message));

      switch (message.notificationType) {
        case 'ORDER_CHANGE':
          await this.processAmazonOrder(message.payload);
          break;
        default:
          this.logger.warn(
            `Unhandled Amazon notification: ${message.notificationType}`,
          );
      }
    }

    return { received: true };
  }

  @Public()
  @Post('n11')
  async handleN11Webhook(
    @Headers('x-n11-api-key') apiKey: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const validKeys = await this.getValidN11ApiKeys();
    if (!validKeys.includes(apiKey)) {
      throw new UnauthorizedException('Invalid API key');
    }

    const event = payload.event as string | undefined;
    const data = payload.data as Record<string, unknown> | undefined;

    switch (event) {
      case 'NewOrder':
        if (data) await this.processN11Order(data);
        break;
      case 'OrderStatusUpdate':
        if (data) await this.updateN11OrderStatus(data);
        break;
      case 'StockUpdate':
        if (data) await this.processN11StockUpdate(data);
        break;
      default:
        this.logger.warn(`Unhandled N11 event: ${event}`);
    }

    return { received: true };
  }

  private async processTrendyolOrder(payload: Record<string, unknown>) {
    const supplierId = String(
      payload.supplierId ?? payload.merchantId ?? '',
    );
    const orderNumber = String(payload.orderNumber ?? '');

    const integration = await this.findIntegrationByExternalId(
      'TRENDYOL',
      supplierId,
    );

    if (!integration) {
      this.logger.warn(
        `Trendyol webhook: entegrasyon bulunamadı supplierId=${supplierId}`,
      );
      return;
    }

    await this.logWebhookEvent(integration.tenantId, integration.id, {
      platform: 'TRENDYOL',
      event: 'order',
      orderNumber,
      status: payload.status,
    });

    try {
      await this.marketplaceService.syncPlatformOrdersForTenant(
        integration.tenantId,
        Platform.TRENDYOL,
        integration.id,
      );
    } catch (error) {
      this.logger.error(
        `Trendyol order webhook sync failed: ${(error as Error).message}`,
      );
    }
  }

  private async processTrendyolStockUpdate(payload: Record<string, unknown>) {
    await this.logWebhookByBarcode('TRENDYOL', payload, 'stock');
  }

  private async processTrendyolPriceUpdate(payload: Record<string, unknown>) {
    await this.logWebhookByBarcode('TRENDYOL', payload, 'price');
  }

  private async processTrendyolReturn(payload: Record<string, unknown>) {
    const supplierId = String(payload.supplierId ?? '');
    const integration = await this.findIntegrationByExternalId(
      'TRENDYOL',
      supplierId,
    );
    if (!integration) return;

    await this.logWebhookEvent(integration.tenantId, integration.id, {
      platform: 'TRENDYOL',
      event: 'return',
      orderNumber: payload.orderNumber,
    });
  }

  private async processHepsiburadaOrder(payload: Record<string, unknown>) {
    const merchantId = String(payload.merchantId ?? payload.merchant_id ?? '');
    const integration = await this.findIntegrationByExternalId(
      'HEPSIBURADA',
      merchantId,
    );

    if (!integration) {
      this.logger.warn(
        `Hepsiburada webhook: entegrasyon bulunamadı merchantId=${merchantId}`,
      );
      return;
    }

    await this.logWebhookEvent(integration.tenantId, integration.id, {
      platform: 'HEPSIBURADA',
      event: 'order',
      orderNumber: payload.orderNumber,
      status: payload.status,
    });

    try {
      await this.marketplaceService.syncPlatformOrdersForTenant(
        integration.tenantId,
        Platform.HEPSIBURADA,
        integration.id,
      );
    } catch (error) {
      this.logger.error(
        `Hepsiburada order webhook sync failed: ${(error as Error).message}`,
      );
    }
  }

  private async processHepsiburadaStockUpdate(
    payload: Record<string, unknown>,
  ) {
    await this.logWebhookByMerchant('HEPSIBURADA', payload, 'stock');
  }

  private async processHepsiburadaPriceUpdate(
    payload: Record<string, unknown>,
  ) {
    await this.logWebhookByMerchant('HEPSIBURADA', payload, 'price');
  }

  private async processAmazonOrder(payload: Record<string, unknown>) {
    const sellerId = String(
      payload.SellerId ?? payload.sellerId ?? '',
    );
    const integration = await this.findIntegrationByExternalId(
      'AMAZON',
      sellerId,
    );
    if (!integration) return;

    await this.logWebhookEvent(integration.tenantId, integration.id, {
      platform: 'AMAZON',
      event: 'order',
      payload: { sellerId },
    });

    try {
      await this.marketplaceService.syncPlatformOrdersForTenant(
        integration.tenantId,
        Platform.AMAZON,
        integration.id,
      );
    } catch (error) {
      this.logger.error(
        `Amazon order webhook sync failed: ${(error as Error).message}`,
      );
    }
  }

  private async processN11Order(payload: Record<string, unknown>) {
    this.logger.log(`N11 order webhook: ${JSON.stringify(payload)}`);
  }

  private async updateN11OrderStatus(payload: Record<string, unknown>) {
    this.logger.log(`N11 order status webhook: ${JSON.stringify(payload)}`);
  }

  private async processN11StockUpdate(payload: Record<string, unknown>) {
    this.logger.log(`N11 stock webhook: ${JSON.stringify(payload)}`);
  }

  private async logWebhookByBarcode(
    platform: PrismaPlatform,
    payload: Record<string, unknown>,
    event: string,
  ) {
    const supplierId = String(payload.supplierId ?? '');
    const integration = await this.findIntegrationByExternalId(
      platform,
      supplierId,
    );
    if (!integration) return;

    await this.logWebhookEvent(integration.tenantId, integration.id, {
      platform,
      event,
      barcode: payload.barcode,
      quantity: payload.quantity,
      salePrice: payload.salePrice,
    });
  }

  private async logWebhookByMerchant(
    platform: PrismaPlatform,
    payload: Record<string, unknown>,
    event: string,
  ) {
    const merchantId = String(payload.merchantId ?? '');
    const integration = await this.findIntegrationByExternalId(
      platform,
      merchantId,
    );
    if (!integration) return;

    await this.logWebhookEvent(integration.tenantId, integration.id, {
      platform,
      event,
      sku: payload.sku,
      stock: payload.stock,
      price: payload.price,
    });
  }

  private async logWebhookEvent(
    tenantId: string,
    integrationId: string,
    details: Record<string, unknown>,
  ) {
    await this.prisma.activityLog.create({
      data: {
        tenantId,
        action: 'webhook.order.received',
        resource: 'integration',
        resourceId: integrationId,
        details: details as Prisma.InputJsonValue,
      },
    });
  }

  private async findIntegrationByExternalId(
    platform: PrismaPlatform,
    externalId: string,
  ) {
    if (!externalId) return null;

    const integrations = await this.prisma.integration.findMany({
      where: { platform, isActive: true },
      select: {
        id: true,
        tenantId: true,
        apiExtra: true,
        apiKey: true,
      },
    });

    const normalized = externalId.toLowerCase();

    return (
      integrations.find((integration) => {
        const extra = (integration.apiExtra ?? {}) as Record<string, unknown>;
        const candidates = [
          extra.supplierId,
          extra.merchantId,
          extra.sellerId,
          extra.storeId,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());

        return candidates.includes(normalized);
      }) ?? null
    );
  }

  private async getValidN11ApiKeys(): Promise<string[]> {
    const integrations = await this.prisma.integration.findMany({
      where: { platform: 'N11', isActive: true },
      select: { apiKey: true },
    });
    return integrations.map((i) => i.apiKey);
  }
}
