import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { SupportService } from './support.service';
import { Platform } from '@pazaryonetimi/database';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('tickets')
  async getTickets(@Query('tenantId') tenantId: string) {
    return this.supportService.getTickets(tenantId || 'demo-tenant-id');
  }

  @Get('tickets/:id')
  async getTicketDetails(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.supportService.getTicketDetails(
      tenantId || 'demo-tenant-id',
      id,
    );
  }

  @Post('messages')
  async createMessage(
    @Body()
    body: {
      tenantId: string;
      ticketId: string;
      content: string;
      senderType: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
    },
  ) {
    return this.supportService.createMessage(
      body.tenantId || 'demo-tenant-id',
      body.ticketId,
      body.content,
      body.senderType,
    );
  }

  @Post('sync')
  async syncMessages(@Body() body: { tenantId: string; platform: Platform }) {
    return this.supportService.syncMarketplaceMessages(
      body.tenantId || 'demo-tenant-id',
      body.platform,
    );
  }
}
