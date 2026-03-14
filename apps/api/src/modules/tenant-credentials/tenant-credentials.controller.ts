import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenantCredentialsService } from './tenant-credentials.service';
import {
  CreateServiceCredentialDto,
  UpdateServiceCredentialDto,
} from './dto/tenant-credential.dto';

@ApiTags('Tenant Credentials')
@Controller('tenant-credentials')
export class TenantCredentialsController {
  constructor(private readonly service: TenantCredentialsService) {}

  /** Tüm servis kimlik bilgilerini listele */
  @Get()
  findAll(@Req() req: any, @Query('type') typePrefix?: string) {
    return this.service.findAll(req.user?.tenantId, typePrefix);
  }

  /** Yeni servis kimlik bilgisi oluştur */
  @Post()
  create(@Req() req: any, @Body() dto: CreateServiceCredentialDto) {
    return this.service.create(req.user?.tenantId, dto);
  }

  /** Servis kimlik bilgisini güncelle */
  @Put(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateServiceCredentialDto,
  ) {
    return this.service.update(req.user?.tenantId, id, dto);
  }

  /** Servis kimlik bilgisini sil */
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user?.tenantId, id);
  }

  /** Bağlantıyı test et */
  @Post(':id/test')
  testConnection(@Req() req: any, @Param('id') id: string) {
    return this.service.testConnection(req.user?.tenantId, id);
  }

  /** API anahtarı rotasyonu */
  @Post(':id/rotate')
  rotateCredentials(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { apiKey?: string; apiSecret?: string; apiUrl?: string },
  ) {
    return this.service.rotateCredentials(req.user?.tenantId, id, body);
  }

  /** Webhook secret al veya oluştur */
  @Get('webhook-secret')
  getWebhookSecret(@Req() req: any) {
    return this.service
      .getOrCreateWebhookSecret(req.user?.tenantId)
      .then((secret) => ({ secret }));
  }

  /** Webhook secret rotasyonu */
  @Post('webhook-secret/rotate')
  rotateWebhookSecret(@Req() req: any) {
    return this.service
      .rotateWebhookSecret(req.user?.tenantId)
      .then((secret) => ({ secret, message: 'Webhook secret başarıyla yenilendi' }));
  }
}
