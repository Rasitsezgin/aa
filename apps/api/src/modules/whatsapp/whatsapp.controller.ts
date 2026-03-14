import { Controller, Get, Post, Put, Body, Headers, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappCommandService } from './whatsapp-command.service';

@Controller('whatsapp')
export class WhatsappController {
    constructor(
        private readonly whatsappService: WhatsappService,
        private readonly commandService: WhatsappCommandService,
    ) { }

    @Get('config')
    async getConfig(@Headers('x-tenant-id') tenantId: string) {
        return this.whatsappService.getConfig(tenantId);
    }

    @Put('config')
    async updateConfig(@Headers('x-tenant-id') tenantId: string, @Body() data: any) {
        return this.whatsappService.updateConfig(tenantId, data);
    }

    @Post('test')
    async sendTestMessage(
        @Headers('x-tenant-id') tenantId: string,
        @Body() data: { phone: string; message: string },
    ) {
        return this.whatsappService.sendTestMessage(tenantId, data.phone, data.message);
    }

    @Post('send')
    async sendMessage(
        @Headers('x-tenant-id') tenantId: string,
        @Body() data: { phone: string; template: string; variables: Record<string, string> },
    ) {
        return this.whatsappService.sendMessage(tenantId, data.phone, data.template, data.variables);
    }

    @Get('templates')
    async getTemplates(@Headers('x-tenant-id') tenantId: string) {
        return this.whatsappService.getTemplates(tenantId);
    }

    @Get('logs')
    async getLogs(
        @Headers('x-tenant-id') tenantId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.whatsappService.getLogs(tenantId, parseInt(page || '1'), parseInt(limit || '20'));
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(@Body() body: any, @Headers('x-tenant-id') tenantId: string) {
        // Meta/Twilio Webhook Logic
        const from = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || body.From;
        const text = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || body.Body;
        const type = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.type === 'audio' ? 'voice' : 'text';

        if (text) {
            const response = await this.commandService.handleIncoming(tenantId || 'default', from, text, type);

            // Send response back to user
            await this.whatsappService.sendTestMessage(tenantId || 'default', from, response);
        }

        return { success: true };
    }

    @Get('webhook')
    verifyWebhook(@Query('hub.verify_token') token: string, @Query('hub.challenge') challenge: string) {
        // Meta Webhook Verification
        return challenge;
    }
}
