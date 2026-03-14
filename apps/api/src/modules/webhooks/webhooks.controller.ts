import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WebhooksService, CreateWebhookDto, UpdateWebhookDto } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  // Event türlerini listele
  @Get('event-types')
  getEventTypes() {
    return this.webhooksService.getEventTypes();
  }

  // Genel istatistikler
  @Get('stats')
  getStats(@Query('tenantId') tenantId: string = 'tenant-1') {
    return this.webhooksService.getStats(tenantId);
  }

  // Tüm webhook'ları listele
  @Get()
  findAll(
    @Query('tenantId') tenantId: string = 'tenant-1',
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    return this.webhooksService.findAll({
      tenantId,
      isActive: isActive ? isActive === 'true' : undefined,
      search,
    });
  }

  // Tek bir webhook
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string = 'tenant-1',
  ) {
    return this.webhooksService.findOne(id, tenantId);
  }

  // Webhook logları
  @Get(':id/logs')
  getLogs(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string = 'tenant-1',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.webhooksService.getLogs(id, tenantId, parseInt(page), parseInt(limit));
  }

  // Yeni webhook oluştur
  @Post()
  create(
    @Body() createDto: CreateWebhookDto,
    @Query('tenantId') tenantId: string = 'tenant-1',
  ) {
    return this.webhooksService.create(tenantId, createDto);
  }

  // Webhook güncelle
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWebhookDto,
    @Query('tenantId') tenantId: string = 'tenant-1',
  ) {
    return this.webhooksService.update(id, tenantId, updateDto);
  }

  // Webhook sil
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string = 'tenant-1',
  ) {
    return this.webhooksService.delete(id, tenantId);
  }

  // Secret yenile
  @Post(':id/regenerate-secret')
  regenerateSecret(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string = 'tenant-1',
  ) {
    return this.webhooksService.regenerateSecret(id, tenantId);
  }

  // Webhook test et
  @Post(':id/test')
  test(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string = 'tenant-1',
  ) {
    return this.webhooksService.test(id, tenantId);
  }

  // Internal: Event tetikle (diğer servisler tarafından kullanılır)
  @Post('trigger')
  trigger(
    @Body() body: { event: string; payload: any },
    @Query('tenantId') tenantId: string = 'tenant-1',
  ) {
    return this.webhooksService.trigger(tenantId, body.event, body.payload);
  }
}
