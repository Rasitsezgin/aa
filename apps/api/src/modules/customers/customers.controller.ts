import { Controller, Get, Post, Delete, Param, Query, Body, Headers } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: 'vip' | 'regular' | 'new' | 'at-risk' | 'inactive',
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.customersService.findAll({
      tenantId: tenantId || 'demo-tenant',
      status,
      search,
      sortBy,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('stats')
  async getStats(@Headers('x-tenant-id') tenantId: string) {
    return this.customersService.getStats(tenantId || 'demo-tenant');
  }

  @Get('segments')
  async getSegments(@Headers('x-tenant-id') tenantId: string) {
    return this.customersService.getSegments(tenantId || 'demo-tenant');
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.customersService.findOne(id, tenantId || 'demo-tenant');
  }

  @Post(':id/tags')
  async addTag(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { tag: string },
  ) {
    return this.customersService.addTag(id, tenantId || 'demo-tenant', body.tag);
  }

  @Delete(':id/tags/:tag')
  async removeTag(
    @Param('id') id: string,
    @Param('tag') tag: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.customersService.removeTag(id, tenantId || 'demo-tenant', tag);
  }

  @Post(':id/notes')
  async addNote(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { note: string },
  ) {
    return this.customersService.addNote(id, tenantId || 'demo-tenant', body.note);
  }
}
