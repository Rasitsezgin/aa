import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Query,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

import {
  OrdersService,
  UpdateOrderDto,
  CreateOrderDto,
  ApprovePaymentDto,
  RejectPaymentDto,
} from './orders.service';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { Permission } from '../rbac/rbac.service';

@Controller('orders')
@UseGuards(PermissionsGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Sipariş listesi
   * GET /orders
   */
  @Get()
  @RequirePermission(Permission.ORDER_VIEW)
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
    @Query('platform') platform?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findAll({
      tenantId: tenantId || 'demo-tenant',
      status,
      platform,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  /**
   * Sipariş istatistikleri
   * GET /orders/stats
   */
  @Get('stats')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  async getStats(@Headers('x-tenant-id') tenantId: string) {
    return this.ordersService.getStats(tenantId || 'demo-tenant');
  }

  /**
   * Onay bekleyen havale siparişleri
   * GET /orders/pending-approvals
   */
  @Get('pending-approvals')
  async getPendingApprovals(@Headers('x-tenant-id') tenantId: string) {
    const orders = await this.ordersService.getPendingApprovals(
      tenantId || 'demo-tenant',
    );
    return {
      success: true,
      data: orders,
      count: orders.length,
    };
  }

  /**
   * Tek sipariş detayı
   * GET /orders/:id
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.ordersService.findOne(id, tenantId || 'demo-tenant');
  }

  /**
   * Web sitesinden yeni sipariş oluştur
   * POST /orders/website
   */
  @Post('website')
  @HttpCode(HttpStatus.CREATED)
  async createWebsiteOrder(
    @Body() dto: CreateOrderDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    dto.tenantId = tenantId || 'demo-tenant';
    const order = await this.ordersService.createWebsiteOrder(dto);

    return {
      success: true,
      message:
        dto.paymentMethod === 'credit_card'
          ? 'Siparişiniz oluşturuldu ve ödeme onaylandı!'
          : 'Siparişiniz oluşturuldu. Havale onayı bekleniyor.',
      data: order,
    };
  }

  /**
   * Manuel sipariş oluştur (Panelden)
   * POST /orders
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission(Permission.ORDER_CREATE)
  async createManualOrder(
    @Body() dto: CreateOrderDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    dto.tenantId = tenantId || 'demo-tenant';
    const order = await this.ordersService.createManualOrder(dto);

    return {
      success: true,
      message: 'Sipariş başarıyla oluşturuldu.',
      data: order,
    };
  }

  /**
   * Sipariş durumu güncelle
   * PATCH /orders/:id/status
   */
  @Patch(':id/status')
  @RequirePermission(Permission.ORDER_EDIT)
  async updateStatus(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.updateStatus(id, tenantId || 'demo-tenant', dto);
  }

  /**
   * Havale ödemesini onayla
   * PUT /orders/:id/approve
   */
  @Put(':id/approve')
  @RequirePermission(Permission.ORDER_EDIT)
  async approvePayment(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: ApprovePaymentDto,
  ) {
    const adminId = 'admin'; // Gerçek uygulamada JWT'den alınır
    const order = await this.ordersService.approvePayment(
      id,
      tenantId || 'demo-tenant',
      dto,
      adminId,
    );

    return {
      success: true,
      message: 'Ödeme onaylandı ve müşteriye bildirim gönderildi.',
      data: order,
    };
  }

  /**
   * Havale ödemesini reddet
   * PUT /orders/:id/reject
   */
  @Put(':id/reject')
  @RequirePermission(Permission.ORDER_EDIT)
  async rejectPayment(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: RejectPaymentDto,
  ) {
    const adminId = 'admin';
    const order = await this.ordersService.rejectPayment(
      id,
      tenantId || 'demo-tenant',
      dto,
      adminId,
    );

    return {
      success: true,
      message: 'Sipariş reddedildi ve müşteriye bildirim gönderildi.',
      data: order,
    };
  }

  /**
   * Toplu kargo işlemi
   * POST /orders/bulk/ship
   */
  @Post('bulk/ship')
  @RequirePermission(Permission.ORDER_SHIP)
  async bulkShip(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { orderIds: string[]; shippingProvider: string },
  ) {
    return this.ordersService.bulkShip(
      tenantId || 'demo-tenant',
      body.orderIds,
      body.shippingProvider,
    );
  }

  // ==================== SHIPPING ENDPOINTS ====================
  /**
   * Kargo listesi
   * GET /orders/shipments
   */
  @Get('shipments')
  async getShipments(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
  ) {
    return this.ordersService.getShipments(tenantId || 'demo-tenant', status);
  }

  /**
   * Kargo firmaları
   * GET /orders/shipping-providers
   */
  @Get('shipping-providers')
  async getShippingProviders(@Headers('x-tenant-id') tenantId: string) {
    return this.ordersService.getShippingProviders();
  }

  /**
   * Kargo takibi
   * GET /orders/track/:trackingNumber
   */
  @Get('track/:trackingNumber')
  async trackShipment(@Param('trackingNumber') trackingNumber: string) {
    return this.ordersService.trackShipment(trackingNumber);
  }

  /**
   * Kargo ücreti hesapla
   * POST /orders/calculate-shipping
   */
  @Post('calculate-shipping')
  async calculateShipping(@Body() data: any) {
    return this.ordersService.calculateShipping(data);
  }
}
