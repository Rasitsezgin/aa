import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Delete,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import {
  CreateShipmentDto,
  CalculateRateDto,
  BulkCreateShipmentDto,
} from './dto/shipping.dto';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  /** Kargo listesi */
  @Get()
  findAll(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('carrier') carrier?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const tenantId = req.user?.tenantId;
    return this.shippingService.findAll(tenantId, {
      status,
      carrier,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /** Kargo istatistikleri */
  @Get('stats')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  getStats(@Req() req: any) {
    return this.shippingService.getStats(req.user?.tenantId);
  }

  /** Ücret hesaplama */
  @Post('rates')
  calculateRates(@Req() req: any, @Body() dto: CalculateRateDto) {
    return this.shippingService.calculateRates(req.user?.tenantId, dto);
  }

  /** Yeni kargo oluştur */
  @Post()
  createShipment(@Req() req: any, @Body() dto: CreateShipmentDto) {
    return this.shippingService.createShipment(req.user?.tenantId, dto);
  }

  /** Toplu kargo oluştur */
  @Post('bulk')
  async bulkCreateShipments(
    @Req() req: any,
    @Body() dto: BulkCreateShipmentDto,
  ) {
    const tenantId = req.user?.tenantId;
    const results: any[] = [];
    let failed = 0;

    for (const shipmentDto of dto.shipments) {
      try {
        const shipment = await this.shippingService.createShipment(
          tenantId,
          shipmentDto,
        );
        results.push(shipment);
      } catch {
        failed++;
      }
    }

    return { success: results.length, failed, shipments: results };
  }

  /** Kargo detayı */
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.shippingService.findOne(req.user?.tenantId, id);
  }

  /** Kargo takip güncelle */
  @Post(':id/track')
  trackShipment(@Req() req: any, @Param('id') id: string) {
    return this.shippingService.trackShipment(req.user?.tenantId, id);
  }

  /** Takip numarasıyla sorgula */
  @Get('track/:trackingNumber')
  trackByNumber(
    @Req() req: any,
    @Param('trackingNumber') trackingNumber: string,
  ) {
    return this.shippingService.trackByNumber(
      req.user?.tenantId,
      trackingNumber,
    );
  }

  /** Kargo iptal et */
  @Delete(':id')
  cancelShipment(@Req() req: any, @Param('id') id: string) {
    return this.shippingService.cancelShipment(req.user?.tenantId, id);
  }
}
