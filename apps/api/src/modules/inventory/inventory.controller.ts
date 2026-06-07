import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { InventoryService, StockUpdateDto, SkuGroupDto } from './inventory.service';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { Permission } from '../rbac/rbac.service';

@Controller('inventory')
@UseGuards(PermissionsGuard)
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

  @Get('discrepancies')
  @RequirePermission(Permission.PRODUCT_VIEW)
  async getDiscrepancies(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const finalTenantId = queryTenantId || tenantId;
    if (!finalTenantId) throw new Error('tenantId is required');
    return this.inventoryService.getStockDiscrepancies(finalTenantId);
  }

  @Get('sku-groups')
  @RequirePermission(Permission.PRODUCT_VIEW)
  async getSkuGroups(
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const finalTenantId = queryTenantId || tenantId;
    if (!finalTenantId) throw new Error('tenantId is required');
    return this.inventoryService.getSkuGroups(finalTenantId);
  }

  @Put('sku-groups')
  @RequirePermission(Permission.PRODUCT_EDIT)
  async replaceSkuGroups(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { tenantId?: string; groups: SkuGroupDto[] },
  ) {
    const finalTenantId = body.tenantId || tenantId;
    if (!finalTenantId) throw new Error('tenantId is required');
    return this.inventoryService.replaceSkuGroups(finalTenantId, body.groups || []);
  }

  @Post('sku-groups')
  @RequirePermission(Permission.PRODUCT_EDIT)
  async upsertSkuGroup(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { tenantId?: string; group: SkuGroupDto },
  ) {
    const finalTenantId = body.tenantId || tenantId;
    if (!finalTenantId) throw new Error('tenantId is required');
    return this.inventoryService.upsertSkuGroup(finalTenantId, body.group);
  }

  @Delete('sku-groups/:masterSku')
  @RequirePermission(Permission.PRODUCT_EDIT)
  async deleteSkuGroup(
    @Param('masterSku') masterSku: string,
    @Headers('x-tenant-id') tenantId: string,
    @Query('tenantId') queryTenantId?: string,
  ) {
    const finalTenantId = queryTenantId || tenantId;
    if (!finalTenantId) throw new Error('tenantId is required');
    return this.inventoryService.deleteSkuGroup(finalTenantId, decodeURIComponent(masterSku));
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
  @RequirePermission(Permission.PRODUCT_EDIT)
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
  @RequirePermission(Permission.PRODUCT_EDIT)
  async bulkUpdate(
    @Headers('x-tenant-id') tenantId: string,
    @Body()
    body: { tenantId?: string; updates: { id: string; stock: number }[] },
  ) {
    const finalTenantId = body.tenantId || tenantId || 'demo-tenant';
    return this.inventoryService.bulkUpdate(finalTenantId, body.updates);
  }
}
