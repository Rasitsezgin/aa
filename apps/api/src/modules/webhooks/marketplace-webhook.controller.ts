import {
  Controller,
  Post,
  Headers,
  Body,
  Query,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Public } from '../auth/public.decorator';

/**
 * Platform Webhook Receivers
 * Trendyol, Hepsiburada, Amazon sipariş ve stok webhook'larını dinler
 */
@Controller('webhooks/marketplace')
export class MarketplaceWebhookController {
  constructor(private prisma: PrismaService) {}

  /**
   * Trendyol Webhook Handler
   * POST /webhooks/marketplace/trendyol
   * Headers: X-Trendyol-Webhook-Secret
   */
  @Public()
  @Post('trendyol')
  async handleTrendyolWebhook(
    @Headers('x-trendyol-webhook-secret') secret: string,
    @Headers('x-trendyol-event-type') eventType: string,
    @Body() payload: any,
  ) {
    // Verify webhook secret
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
        console.log(`Unhandled Trendyol event: ${eventType}`);
    }

    return { received: true };
  }

  /**
   * Hepsiburada Webhook Handler
   * POST /webhooks/marketplace/hepsiburada
   */
  @Public()
  @Post('hepsiburada')
  async handleHepsiburadaWebhook(
    @Headers('x-hepsiburada-signature') signature: string,
    @Headers('x-hepsiburada-event') eventType: string,
    @Body() payload: any,
  ) {
    // Verify signature (HMAC)
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
        console.log(`Unhandled Hepsiburada event: ${eventType}`);
    }

    return { received: true };
  }

  /**
   * Amazon SP-API Notifications (SQS or direct HTTP)
   * POST /webhooks/marketplace/amazon
   */
  @Public()
  @Post('amazon')
  async handleAmazonNotification(
    @Headers('x-amz-sns-message-type') messageType: string,
    @Body() payload: any,
  ) {
    // Amazon SNS message handling
    if (messageType === 'SubscriptionConfirmation') {
      // Confirm subscription
      await fetch(payload.SubscribeURL);
      return { confirmed: true };
    }

    if (messageType === 'Notification') {
      const message = JSON.parse(payload.Message);

      switch (message.notificationType) {
        case 'ORDER_CHANGE':
          await this.processAmazonOrder(message.payload);
          break;
        case 'FEE_PROMOTION':
          // Handle fee changes
          break;
        default:
          console.log(
            `Unhandled Amazon notification: ${message.notificationType}`,
          );
      }
    }

    return { received: true };
  }

  /**
   * N11 Webhook Handler
   * POST /webhooks/marketplace/n11
   */
  @Public()
  @Post('n11')
  async handleN11Webhook(
    @Headers('x-n11-api-key') apiKey: string,
    @Body() payload: any,
  ) {
    // Verify API key
    const validKeys = await this.getValidN11ApiKeys();
    if (!validKeys.includes(apiKey)) {
      throw new UnauthorizedException('Invalid API key');
    }

    switch (payload.event) {
      case 'NewOrder':
        await this.processN11Order(payload.data);
        break;
      case 'OrderStatusUpdate':
        await this.updateN11OrderStatus(payload.data);
        break;
      case 'StockUpdate':
        await this.processN11StockUpdate(payload.data);
        break;
      default:
        console.log(`Unhandled N11 event: ${payload.event}`);
    }

    return { received: true };
  }

  // ==================== PRIVATE PROCESSORS ====================

  private async processTrendyolOrder(payload: any) {
    try {
      // Simplified webhook processor - just log for now
      console.log(`[WEBHOOK] Trendyol order received: ${payload.orderNumber}`, {
        status: payload.status,
        totalAmount: payload.totalAmount,
        customer: `${payload.customerFirstName} ${payload.customerLastName}`,
      });

      // Trigger event for async processing via BullMQ
      // await this.webhookQueue.add('process-trendyol-order', payload);
    } catch (error) {
      console.error('Error processing Trendyol order webhook:', error);
    }
  }

  private async processTrendyolStockUpdate(payload: any) {
    console.log('[WEBHOOK] Trendyol stock update:', {
      barcode: payload.barcode,
      quantity: payload.quantity,
    });
  }

  private async processTrendyolPriceUpdate(payload: any) {
    console.log('[WEBHOOK] Trendyol price update:', {
      barcode: payload.barcode,
      salePrice: payload.salePrice,
      listPrice: payload.listPrice,
    });
  }

  private async processTrendyolReturn(payload: any) {
    console.log('[WEBHOOK] Trendyol return:', {
      orderNumber: payload.orderNumber,
      reason: payload.reason,
      status: payload.status,
    });
  }

  private async processHepsiburadaOrder(payload: any) {
    console.log('[WEBHOOK] Hepsiburada order:', {
      orderNumber: payload.orderNumber,
      status: payload.status,
      customer: payload.customerName,
    });
  }

  private async processHepsiburadaStockUpdate(payload: any) {
    // Similar to Trendyol
    console.log('Hepsiburada stock update:', payload);
  }

  private async processHepsiburadaPriceUpdate(payload: any) {
    console.log('Hepsiburada price update:', payload);
  }

  private async processAmazonOrder(payload: any) {
    console.log('Amazon order:', payload);
  }

  private async processN11Order(payload: any) {
    console.log('N11 order:', payload);
  }

  private async updateN11OrderStatus(payload: any) {
    console.log('N11 order status update:', payload);
  }

  private async processN11StockUpdate(payload: any) {
    console.log('N11 stock update:', payload);
  }

  // ==================== HELPERS ====================

  private mapTrendyolStatus(status: string): string {
    const statusMap: Record<string, string> = {
      Created: 'PENDING',
      Picking: 'PROCESSING',
      Invoiced: 'CONFIRMED',
      Shipped: 'SHIPPED',
      Delivered: 'DELIVERED',
      Cancelled: 'CANCELLED',
      Returned: 'RETURNED',
    };
    return statusMap[status] || 'PENDING';
  }

  private mapHepsiburadaStatus(status: string): string {
    const statusMap: Record<string, string> = {
      Awaiting: 'PENDING',
      Processing: 'PROCESSING',
      Shipped: 'SHIPPED',
      Delivered: 'DELIVERED',
      Cancelled: 'CANCELLED',
    };
    return statusMap[status] || 'PENDING';
  }

  private formatAddress(address: any): string {
    if (!address) return '';
    return `${address.fullAddress}, ${address.district}/${address.city}`;
  }

  private async getTenantIdForIntegration(
    platform: string,
    externalId: string,
  ): Promise<string> {
    const integration = await this.prisma.integration.findFirst({
      where: {
        platform: platform as any,
        apiExtra: {
          path: ['supplierId'],
          equals: externalId,
        },
      },
    });
    return integration?.tenantId || 'default';
  }

  private async getValidN11ApiKeys(): Promise<string[]> {
    const integrations = await this.prisma.integration.findMany({
      where: { platform: 'N11', isActive: true },
      select: { apiKey: true },
    });
    return integrations.map((i) => i.apiKey);
  }
}
