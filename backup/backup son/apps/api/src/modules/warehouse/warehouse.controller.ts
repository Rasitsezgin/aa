import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WarehouseService } from './warehouse.service';

@ApiTags('Warehouse Management')
@Controller('warehouses')
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm depoları listele' })
  @ApiResponse({ status: 200, description: 'Depo listesi ve istatistikler' })
  async findAll(@Query('tenantId') tenantId: string) {
    return this.warehouseService.findAll(tenantId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Depo bazlı stok özeti' })
  async getStockSummary(@Query('tenantId') tenantId: string) {
    return this.warehouseService.getStockSummary(tenantId);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Transfer geçmişi' })
  async getTransferHistory(
    @Query('tenantId') tenantId: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.warehouseService.getTransferHistory(tenantId, warehouseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Depo detayı' })
  async findOne(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.warehouseService.findOne(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni depo oluştur' })
  async create(@Body() dto: any) {
    return this.warehouseService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Depo güncelle' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.warehouseService.update(id, data);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Depolar arası stok transferi' })
  async transferStock(@Body() dto: any, @Query('tenantId') tenantId: string) {
    return this.warehouseService.transferStock(dto, tenantId);
  }
}
