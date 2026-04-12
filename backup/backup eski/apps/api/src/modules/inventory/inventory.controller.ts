import { Controller, Get, Post, Patch, Param, Query, Body, Headers } from '@nestjs/common';
import { InventoryService, StockUpdateDto } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: 'critical' | 'low' | 'ok',
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'stock' | 'name' | 'trend',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.findAll({
      tenantId: tenantId || 'demo-tenant',
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
  async getStats(@Headers('x-tenant-id') tenantId: string) {
    return this.inventoryService.getStats(tenantId || 'demo-tenant');
  }

  @Get('predictions')
  async getAIPredictions(@Headers('x-tenant-id') tenantId: string) {
    return this.inventoryService.getAIPredictions(tenantId || 'demo-tenant');
  }

  @Get(':id/history')
  async getStockHistory(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.inventoryService.getStockHistory(id, tenantId || 'demo-tenant');
  }

  @Patch(':id/stock')
  async updateStock(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: StockUpdateDto,
  ) {
    return this.inventoryService.updateStock(id, tenantId || 'demo-tenant', dto);
  }

  @Post('bulk-update')
  async bulkUpdate(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { updates: { id: string; stock: number }[] },
  ) {
    return this.inventoryService.bulkUpdate(tenantId || 'demo-tenant', body.updates);
  }
}
