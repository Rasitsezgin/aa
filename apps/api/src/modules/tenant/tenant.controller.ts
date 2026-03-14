import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';

@Controller('tenant')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Get(':id/settings/seo')
    async getSeoSettings(@Param('id') id: string) {
        return this.tenantService.getSeoSettings(id);
    }

    @Patch(':id/settings/seo')
    async updateSeoSettings(
        @Param('id') id: string,
        @Body() seoData: {
            googleVerificationCode?: string;
            bingVerificationCode?: string;
            yandexVerificationCode?: string;
            metaExtra?: any;
        }
    ) {
        return this.tenantService.updateSeoSettings(id, seoData);
    }
}
