import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { DashboardSystemService } from './dashboard-system.service';

@Controller('system')
export class DashboardSystemController {
  constructor(private readonly dashboardSystemService: DashboardSystemService) {}

  // ==================== SECURITY ====================
  @Get('security-overview')
  async getSecurityOverview(@Query('tenantId') tenantId: string) {
    return this.dashboardSystemService.getSecurityOverview(tenantId);
  }

  @Get('login-history')
  async getLoginHistory(@Query('tenantId') tenantId: string) {
    return this.dashboardSystemService.getLoginHistory(tenantId);
  }

  @Get('active-sessions')
  async getActiveSessions(@Query('tenantId') tenantId: string) {
    return this.dashboardSystemService.getActiveSessions(tenantId);
  }

  @Get('api-keys')
  async getApiKeys(@Query('tenantId') tenantId: string) {
    return this.dashboardSystemService.getApiKeys(tenantId);
  }

  @Post('api-keys')
  async createApiKey(@Body() data: { name: string; permissions: string[]; tenantId: string }) {
    return this.dashboardSystemService.createApiKey(data);
  }

  @Delete('api-keys/:id')
  async revokeApiKey(@Param('id') id: string) {
    return this.dashboardSystemService.revokeApiKey(id);
  }

  @Post('2fa')
  async toggle2FA(@Body() data: { enabled: boolean; tenantId: string }) {
    return this.dashboardSystemService.toggle2FA(data.tenantId, data.enabled);
  }

  @Delete('sessions/:sessionId')
  async revokeSession(@Param('sessionId') sessionId: string) {
    return this.dashboardSystemService.revokeSession(sessionId);
  }

  // ==================== AUTOMATIONS ====================
  @Get('automations')
  async getAutomations(@Query('tenantId') tenantId: string) {
    return this.dashboardSystemService.getAutomations(tenantId);
  }

  @Post('automations')
  async createAutomation(@Body() data: any) {
    return this.dashboardSystemService.createAutomation(data);
  }

  @Patch('automations/:id')
  async updateAutomation(@Param('id') id: string, @Body() data: any) {
    return this.dashboardSystemService.updateAutomation(id, data);
  }

  @Post('automations/:id/toggle')
  async toggleAutomation(@Param('id') id: string, @Body() data: { isActive: boolean }) {
    return this.dashboardSystemService.toggleAutomation(id, data.isActive);
  }

  @Delete('automations/:id')
  async deleteAutomation(@Param('id') id: string) {
    return this.dashboardSystemService.deleteAutomation(id);
  }

  @Get('automations/:id/history')
  async getAutomationHistory(@Param('id') id: string) {
    return this.dashboardSystemService.getAutomationHistory(id);
  }

  // ==================== NOTIFICATIONS ====================
  @Get('notifications')
  async getNotifications(@Query('tenantId') tenantId: string) {
    return this.dashboardSystemService.getNotifications(tenantId);
  }

  @Post('notifications/:id/read')
  async markNotificationRead(@Param('id') id: string) {
    return this.dashboardSystemService.markNotificationRead(id);
  }

  // ==================== DASHBOARD LAYOUT ====================
  @Post('dashboard-layout')
  async saveDashboardLayout(@Body() data: { layout: any; tenantId: string }) {
    return this.dashboardSystemService.saveDashboardLayout(data.tenantId, data.layout);
  }

  @Get('dashboard-layout')
  async getDashboardLayout(@Query('tenantId') tenantId: string) {
    return this.dashboardSystemService.getDashboardLayout(tenantId);
  }
}
