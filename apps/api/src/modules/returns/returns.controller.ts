import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Headers,
  Query,
  Body,
} from '@nestjs/common';
import { ReturnsService } from './returns.service';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  async create(@Headers('x-tenant-id') tenantId: string, @Body() data: any) {
    return this.returnsService.create(tenantId, data);
  }

  @Get()
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.returnsService.findAll(tenantId, {
      status,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
    });
  }

  @Get('stats')
  async getStats(@Headers('x-tenant-id') tenantId: string) {
    return this.returnsService.getStats(tenantId);
  }

  @Get(':id')
  async findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.returnsService.findOne(tenantId, id);
  }

  @Put(':id/status')
  async updateStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() data: { status: string; notes?: string; resolution?: string },
  ) {
    return this.returnsService.updateStatus(tenantId, id, data);
  }

  @Put(':id/refund')
  async processRefund(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() data: { refundAmount: number; refundMethod: string },
  ) {
    return this.returnsService.processRefund(tenantId, id, data);
  }
}
