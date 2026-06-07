import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { MarketplaceQaService } from './services/marketplace-qa.service';
import { MarketplaceSeoService } from './services/marketplace-seo.service';
import { ReturnPatternsService } from './services/return-patterns.service';
import { BaremOptimizerService } from './services/bareme-optimizer.service';
import { DesiDisputeService } from './services/desi-dispute.service';
import { ReviewReminderService } from './services/review-reminder.service';
import { PackagingStationService } from './services/packaging-station.service';
import { ProductTransferService } from './services/product-transfer.service';
import { CommissionVerifyService } from './services/commission-verify.service';
import { FxPricingService } from './services/fx-pricing.service';
import { BuyboxInsightsService } from './services/buybox-insights.service';

@Controller('growth-ai')
export class GrowthAiController {
  constructor(
    private readonly qa: MarketplaceQaService,
    private readonly seo: MarketplaceSeoService,
    private readonly returns: ReturnPatternsService,
    private readonly barem: BaremOptimizerService,
    private readonly desi: DesiDisputeService,
    private readonly reviews: ReviewReminderService,
    private readonly packaging: PackagingStationService,
    private readonly transfer: ProductTransferService,
    private readonly commission: CommissionVerifyService,
    private readonly fx: FxPricingService,
    private readonly buybox: BuyboxInsightsService,
  ) {}

  private tenant(h?: string, q?: string) {
    return h || q || '';
  }

  @Get('qa/inbox')
  listQa(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') q?: string,
  ) {
    return this.qa.listInbox(this.tenant(tenantId, q));
  }

  @Post('qa/:ticketId/suggest')
  suggestQa(
    @Headers('x-tenant-id') tenantId: string,
    @Param('ticketId') ticketId: string,
    @Query('tenantId') q?: string,
  ) {
    return this.qa.generateSuggestion(this.tenant(tenantId, q), ticketId);
  }

  @Post('qa/:ticketId/approve')
  approveQa(
    @Headers('x-tenant-id') tenantId: string,
    @Param('ticketId') ticketId: string,
    @Body() body: { content?: string },
    @Query('tenantId') q?: string,
  ) {
    return this.qa.approveAndSend(
      this.tenant(tenantId, q),
      ticketId,
      body.content,
    );
  }

  @Get('seo/bulk')
  bulkSeo(
    @Headers('x-tenant-id') tenantId: string,
    @Query('limit') limit?: string,
    @Query('tenantId') q?: string,
  ) {
    return this.seo.bulkScore(
      this.tenant(tenantId, q),
      limit ? Number(limit) : 20,
    );
  }

  @Get('seo/product/:productId')
  scoreSeo(
    @Headers('x-tenant-id') tenantId: string,
    @Param('productId') productId: string,
    @Query('tenantId') q?: string,
  ) {
    return this.seo.scoreProduct(this.tenant(tenantId, q), productId);
  }

  @Get('returns/patterns')
  returnPatterns(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') q?: string,
  ) {
    return this.returns.analyze(this.tenant(tenantId, q));
  }

  @Get('barem/suggestions')
  baremSuggestions(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') q?: string,
  ) {
    return this.barem.getSuggestions(this.tenant(tenantId, q));
  }

  @Get('desi/disputes')
  desiDisputes(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') q?: string,
  ) {
    return this.desi.listDiscrepancies(this.tenant(tenantId, q));
  }

  @Get('reviews/queue')
  reviewQueue(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') q?: string,
  ) {
    return this.reviews.listQueue(this.tenant(tenantId, q));
  }

  @Post('reviews/schedule')
  scheduleReviews(
    @Headers('x-tenant-id') tenantId: string,
    @Query('days') days?: string,
    @Query('tenantId') q?: string,
  ) {
    return this.reviews.scheduleReminders(
      this.tenant(tenantId, q),
      days ? Number(days) : 7,
    );
  }

  @Post('packaging/scan')
  scanBarcode(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { code: string },
    @Query('tenantId') q?: string,
  ) {
    return this.packaging.scanBarcode(this.tenant(tenantId, q), body.code);
  }

  @Post('packaging/:orderId/label')
  printLabel(
    @Headers('x-tenant-id') tenantId: string,
    @Param('orderId') orderId: string,
    @Query('tenantId') q?: string,
  ) {
    return this.packaging.printLabel(this.tenant(tenantId, q), orderId);
  }

  @Get('transfer/products')
  transferProducts(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') q?: string,
  ) {
    return this.transfer.listTransferable(this.tenant(tenantId, q));
  }

  @Post('transfer')
  doTransfer(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { productId: string; platforms: string[] },
    @Query('tenantId') q?: string,
  ) {
    return this.transfer.transfer(
      this.tenant(tenantId, q),
      body.productId,
      body.platforms || [],
    );
  }

  @Get('commission/verify')
  verifyCommission(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') q?: string,
  ) {
    return this.commission.verifyOrders(this.tenant(tenantId, q));
  }

  @Get('fx/suggestions')
  fxSuggestions(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') q?: string,
  ) {
    return this.fx.getFxSuggestions(this.tenant(tenantId, q));
  }

  @Get('buybox/dashboard')
  buyboxDashboard(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') q?: string,
  ) {
    return this.buybox.getDashboard(this.tenant(tenantId, q));
  }
}
