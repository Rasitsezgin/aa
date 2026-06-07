import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
} from '@nestjs/common';
import { Platform } from '@pazaryonetimi/database';
import { BundleService } from './services/bundle.service';
import { LinkImportService } from './services/link-import.service';
import { StockAlertService } from './services/stock-alert.service';
import { BuyBoxRobotService } from './services/buybox-robot.service';
import { OpsAutomationService } from './services/ops-automation.service';
import { FinanceRadarService } from './services/finance-radar.service';

/**
 * Sentos-parite operasyon merkezi API'si.
 * Ürün/stok, BuyBox, otomasyon ve finans radarı.
 */
@Controller('commerce-ops')
export class CommerceOpsController {
  constructor(
    private readonly bundles: BundleService,
    private readonly linkImport: LinkImportService,
    private readonly stockAlerts: StockAlertService,
    private readonly buyBox: BuyBoxRobotService,
    private readonly automation: OpsAutomationService,
    private readonly finance: FinanceRadarService,
  ) {}

  private tenant(header?: string, query?: string): string {
    return header || query || '';
  }

  // —— Bundle ——
  @Get('bundles')
  listBundles(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.bundles.list(this.tenant(tenantId, queryTenantId));
  }

  @Post('bundles')
  createBundle(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: Record<string, unknown>,
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.bundles.create(this.tenant(tenantId, queryTenantId), body as never);
  }

  @Get('bundles/validate')
  validateBundleStock(
    @Headers('x-tenant-id') tenantId: string,
    @Query('id') bundleId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.bundles.validateStock(
      this.tenant(tenantId, queryTenantId),
      bundleId,
    );
  }

  // —— Link import ——
  @Post('link-import')
  importFromLink(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { url: string; sku?: string },
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.linkImport.importFromUrl(
      this.tenant(tenantId, queryTenantId),
      body.url,
      { sku: body.sku },
    );
  }

  // —— Stock alerts ——
  @Get('stock-alerts')
  listStockAlerts(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.stockAlerts.listRules(this.tenant(tenantId, queryTenantId));
  }

  @Post('stock-alerts')
  upsertStockAlert(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: Record<string, unknown>,
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.stockAlerts.upsertRule(
      this.tenant(tenantId, queryTenantId),
      body as never,
    );
  }

  @Post('stock-alerts/scan')
  scanStockAlerts(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.stockAlerts.scanAndAlert(this.tenant(tenantId, queryTenantId));
  }

  // —— BuyBox ——
  @Get('buybox/rules')
  listBuyBoxRules(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.buyBox.listRules(this.tenant(tenantId, queryTenantId));
  }

  @Post('buybox/rules')
  createBuyBoxRule(
    @Headers('x-tenant-id') tenantId: string,
    @Body()
    body: {
      productId?: string;
      platform: Platform;
      minMarginPct?: number;
      maxDropPct?: number;
      competitorFloor?: number;
    },
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.buyBox.upsertRule(this.tenant(tenantId, queryTenantId), body);
  }

  @Post('buybox/run')
  runBuyBoxRobot(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.buyBox.runRobot(this.tenant(tenantId, queryTenantId));
  }

  @Get('buybox/snapshots')
  getBuyBoxSnapshots(
    @Headers('x-tenant-id') tenantId: string,
    @Query('limit') limit?: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.buyBox.getSnapshots(
      this.tenant(tenantId, queryTenantId),
      limit ? Number(limit) : 50,
    );
  }

  // —— Otomasyon ——
  @Post('automation/approve-orders')
  autoApproveOrders(
    @Headers('x-tenant-id') tenantId: string,
    @Query('limit') limit?: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.automation.autoApproveOrders(
      this.tenant(tenantId, queryTenantId),
      limit ? Number(limit) : 50,
    );
  }

  @Post('automation/bulk-invoices')
  bulkInvoices(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { orderIds: string[] },
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.automation.bulkCreateInvoices(
      this.tenant(tenantId, queryTenantId),
      body.orderIds ?? [],
    );
  }

  @Post('automation/bulk-shipments')
  bulkShipments(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { orderIds: string[]; carrier?: string },
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.automation.bulkCreateShipments(
      this.tenant(tenantId, queryTenantId),
      body.orderIds ?? [],
      body.carrier,
    );
  }

  // —— Finans radarı ——
  @Get('finance/radar')
  profitRadar(
    @Headers('x-tenant-id') tenantId: string,
    @Query('days') days?: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    return this.finance.getProfitRadar(
      this.tenant(tenantId, queryTenantId),
      days ? Number(days) : 30,
    );
  }
}
