import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Headers,
} from '@nestjs/common';
import { InventoryService, StockUpdateDto } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
    @Query('status') status?: 'critical' | 'low' | 'ok',
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'stock' | 'name' | 'trend',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const finalTenantId = queryTenantId || tenantId;
    if (!finalTenantId) {
      throw new Error('tenantId is required');
    }
    return this.inventoryService.findAll({
      tenantId: finalTenantId,
      status,
      category,
      search,
      sortBy,
      sortOrder,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('stats')
  async getStats(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const finalTenantId = queryTenantId || tenantId;
    if (!finalTenantId) {
      throw new Error('tenantId is required');
    }
    return this.inventoryService.getStats(finalTenantId);
  }

  @Get('predictions')
  async getAIPredictions(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const finalTenantId = queryTenantId || tenantId;
    if (!finalTenantId) {
      throw new Error('tenantId is required');
    }
    return this.inventoryService.getAIPredictions(finalTenantId);
  }

  @Get(':id/history')
  async getStockHistory(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const finalTenantId = queryTenantId || tenantId || 'demo-tenant';
    return this.inventoryService.getStockHistory(id, finalTenantId);
  }

  @Patch(':id/stock')
  async updateStock(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: StockUpdateDto,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const finalTenantId = queryTenantId || tenantId || 'demo-tenant';
    return this.inventoryService.updateStock(id, finalTenantId, dto);
  }

  @Post('bulk-update')
  async bulkUpdate(
    @Headers('x-tenant-id') tenantId: string,
    @Body()
    body: { tenantId?: string; updates: { id: string; stock: number }[] },
  ) {
    const finalTenantId = body.tenantId || tenantId || 'demo-tenant';
    return this.inventoryService.bulkUpdate(finalTenantId, body.updates);
  }
}
