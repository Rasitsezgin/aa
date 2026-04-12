import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../../common/guards/admin.guard';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ═══════════════════════════════════════════════════════════════════
  // IMPERSONATION
  // ═══════════════════════════════════════════════════════════════════

  @Post('impersonate/:tenantId')
  async impersonate(
    @Param('tenantId') tenantId: string,
    @Body('adminUserId') adminUserId: string,
  ) {
    return this.adminService.impersonateTenant(adminUserId, tenantId);
  }

  @Post('exit-impersonation')
  async exitImpersonation(@Body('adminUserId') adminUserId: string) {
    return this.adminService.exitImpersonation(adminUserId);
  }

  // ═══════════════════════════════════════════════════════════════════
  // FEATURE FLAGS
  // ═══════════════════════════════════════════════════════════════════

  @Get('feature-flags')
  async getFeatureFlags() {
    return this.adminService.getFeatureFlags();
  }

  @Put('feature-flags/:key')
  async updateFeatureFlag(
    @Param('key') key: string,
    @Body() body: { enabled: boolean; tenantOverrides?: string[] },
  ) {
    return this.adminService.updateFeatureFlag(
      key,
      body.enabled,
      body.tenantOverrides,
    );
  }

  @Get('feature-flags/check/:tenantId/:featureKey')
  async checkFeatureFlag(
    @Param('tenantId') tenantId: string,
    @Param('featureKey') featureKey: string,
  ) {
    return this.adminService.checkFeatureFlag(tenantId, featureKey);
  }

  // ═══════════════════════════════════════════════════════════════════
  // BULK OPERATIONS
  // ═══════════════════════════════════════════════════════════════════

  @Post('bulk-operation')
  async bulkOperation(
    @Body()
    body: {
      operation: 'activate' | 'deactivate' | 'upgrade' | 'notify';
      tenantIds: string[];
      data?: any;
    },
  ) {
    return this.adminService.bulkTenantOperation(
      body.operation,
      body.tenantIds,
      body.data,
    );
  }

  @Post('announcement')
  async sendAnnouncement(
    @Body()
    body: {
      title: string;
      message: string;
      type: 'info' | 'warning' | 'critical';
    },
  ) {
    return this.adminService.sendPlatformAnnouncement(
      body.title,
      body.message,
      body.type,
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // MAINTENANCE
  // ═══════════════════════════════════════════════════════════════════

  @Get('maintenance')
  getMaintenanceMode() {
    return this.adminService.getMaintenanceMode();
  }

  @Post('maintenance')
  async setMaintenanceMode(
    @Body() body: { enabled: boolean; message?: string; scheduledEnd?: Date },
  ) {
    return this.adminService.setMaintenanceMode(
      body.enabled,
      body.message,
      body.scheduledEnd,
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // BILLING
  // ═══════════════════════════════════════════════════════════════════

  @Get('billing')
  async getBillingOverview() {
    return this.adminService.getBillingOverview();
  }

  // ═══════════════════════════════════════════════════════════════════
  // API USAGE
  // ═══════════════════════════════════════════════════════════════════

  @Get('api-usage')
  async getApiUsage() {
    return this.adminService.getApiUsageStats();
  }

  // ═══════════════════════════════════════════════════════════════════
  // AUDIT LOGS
  // ═══════════════════════════════════════════════════════════════════

  @Get('audit-logs')
  async getAuditLogs(
    @Query('tenantId') tenantId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAuditLogs({
      tenantId,
      action,
      resource,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // ONBOARDING
  // ═══════════════════════════════════════════════════════════════════

  @Post('tenants')
  async createTenant(
    @Body()
    body: {
      name: string;
      slug: string;
      email: string;
      plan: string;
      ownerName: string;
      ownerEmail: string;
      ownerPassword: string;
    },
  ) {
    return this.adminService.createTenantWithOnboarding(body);
  }

  @Get('onboarding/:tenantId')
  async getOnboardingStatus(@Param('tenantId') tenantId: string) {
    return this.adminService.getOnboardingStatus(tenantId);
  }

  @Post('onboarding/:tenantId/step/:step')
  async completeOnboardingStep(
    @Param('tenantId') tenantId: string,
    @Param('step') step: string,
  ) {
    return this.adminService.completeOnboardingStep(tenantId, parseInt(step));
  }

  // ═══════════════════════════════════════════════════════════════════
  // TENANT DETAIL & MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  @Get('tenants')
  async getTenants(
    @Query('plan') plan?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getTenants({
      plan,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('tenants/:id')
  async getTenantDetail(@Param('id') id: string) {
    return this.adminService.getTenantDetail(id);
  }

  @Put('tenants/:id')
  async updateTenant(
    @Param('id') id: string,
    @Body() body: { name?: string; plan?: string; isOnboarded?: boolean },
  ) {
    return this.adminService.updateTenant(id, body);
  }

  @Delete('tenants/:id')
  async deleteTenant(@Param('id') id: string) {
    return this.adminService.deleteTenant(id);
  }

  // ═══════════════════════════════════════════════════════════════════
  // USER MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  @Get('users')
  async getUsers(
    @Query('tenantId') tenantId?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getUsers({
      tenantId,
      type,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('users/:id')
  async getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: { type?: string; firstName?: string; lastName?: string },
  ) {
    return this.adminService.updateUser(id, body);
  }

  @Post('users/:id/lock')
  async lockUser(@Param('id') id: string) {
    return this.adminService.lockUser(id);
  }

  @Post('users/:id/unlock')
  async unlockUser(@Param('id') id: string) {
    return this.adminService.unlockUser(id);
  }

  @Post('users/:id/force-2fa')
  async force2FA(@Param('id') id: string) {
    return this.adminService.force2FA(id);
  }

  // ═══════════════════════════════════════════════════════════════════
  // ROLE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  @Get('roles')
  async getRoles(@Query('tenantId') tenantId?: string) {
    return this.adminService.getRoles(tenantId);
  }

  @Post('roles')
  async createRole(
    @Body()
    body: {
      name: string;
      description?: string;
      tenantId?: string;
      permissions: string[];
    },
  ) {
    return this.adminService.createRole(body);
  }

  @Put('roles/:id')
  async updateRole(
    @Param('id') id: string,
    @Body()
    body: { name?: string; description?: string; permissions?: string[] },
  ) {
    return this.adminService.updateRole(id, body);
  }

  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string) {
    return this.adminService.deleteRole(id);
  }

  // ═══════════════════════════════════════════════════════════════════
  // BACKUP & DR
  // ═══════════════════════════════════════════════════════════════════

  @Get('backups')
  async getBackups(
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
  ) {
    return this.adminService.getBackups({
      tenantId,
      status,
      page: page ? parseInt(page) : 1,
    });
  }

  @Get('backup-schedules')
  async getBackupSchedules() {
    return this.adminService.getBackupSchedules();
  }

  @Post('backup-schedules')
  async createBackupSchedule(
    @Body()
    body: {
      tenantId: string;
      name: string;
      type: string;
      frequency: string;
      retentionDays: number;
    },
  ) {
    return this.adminService.createBackupSchedule(body);
  }

  @Post('backups/:id/restore')
  async restoreBackup(
    @Param('id') id: string,
    @Body() body: { dryRun?: boolean },
  ) {
    return this.adminService.restoreBackup(id, body.dryRun);
  }

  @Get('dr-settings')
  async getDrSettings() {
    return this.adminService.getDrSettings();
  }

  @Put('dr-settings/:tenantId')
  async updateDrSettings(
    @Param('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    return this.adminService.updateDrSettings(tenantId, body);
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECURITY DASHBOARD
  // ═══════════════════════════════════════════════════════════════════

  @Get('security/login-attempts')
  async getLoginAttempts(
    @Query('email') email?: string,
    @Query('success') success?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getLoginAttempts({
      email,
      isSuccess:
        success === 'true' ? true : success === 'false' ? false : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('security/stats')
  async getSecurityStats() {
    return this.adminService.getSecurityStats();
  }

  @Get('security/suspicious-ips')
  async getSuspiciousIps() {
    return this.adminService.getSuspiciousIps();
  }

  @Post('security/block-ip')
  async blockIp(@Body() body: { ip: string; reason: string }) {
    return this.adminService.blockIp(body.ip, body.reason);
  }

  @Get('security/2fa-stats')
  async get2FAStats() {
    return this.adminService.get2FAStats();
  }

  // ═══════════════════════════════════════════════════════════════════
  // DASHBOARD REALTIME DATA
  // ═══════════════════════════════════════════════════════════════════

  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ═══════════════════════════════════════════════════════════════════
  // ADVANCED REPORTS (Phase 2)
  // ═══════════════════════════════════════════════════════════════════

  @Get('reports/pnl')
  async getProfitLossReport() {
    return this.adminService.getProfitLoss();
  }

  @Get('reports/cohort')
  async getCohortAnalysis() {
    return this.adminService.getCohortAnalysis();
  }

  @Get('reports/bestsellers')
  async getBestSellers() {
    return this.adminService.getBestSellers();
  }

  @Get('reports/geo')
  async getGeoDistribution() {
    return this.adminService.getGeoDistribution();
  }

  // ═══════════════════════════════════════════════════════════════════
  // CRM & OPERATIONS (Phase 3)
  // ═══════════════════════════════════════════════════════════════════

  @Get('customers')
  async getCustomers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getCustomers({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      search,
    });
  }

  @Get('customers/:email')
  async getCustomerDetail(@Param('email') email: string) {
    return this.adminService.getCustomerDetail(email);
  }

  @Get('support-tickets')
  async getSupportTickets(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getSupportTickets({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      status,
    });
  }

  @Get('support-tickets/:id')
  async getSupportTicketDetail(@Param('id') id: string) {
    return this.adminService.getSupportTicketDetail(id);
  }

  @Post('support-tickets/:id/reply')
  async replyToTicket(
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    return this.adminService.replyToTicket(id, body.content);
  }

  // ═══════════════════════════════════════════════════════════════════
  // KANBAN TASKS (Phase 3)
  // ═══════════════════════════════════════════════════════════════════

  @Get('tasks')
  async getTasks(
    @Query('status') status?: string,
    @Query('assigneeId') assigneeId?: string,
  ) {
    return this.adminService.getTasks({ status, assigneeId });
  }

  @Post('tasks')
  async createTask(
    @Body()
    body: {
      title: string;
      description?: string;
      status?: string;
      priority?: string;
      assigneeId?: string;
      dueDate?: string;
      tags?: string[];
    },
  ) {
    return this.adminService.createTask(body);
  }

  @Put('tasks/:id')
  async updateTask(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      assigneeId?: string;
      dueDate?: string | Date | null;
      tags?: string[];
    },
  ) {
    return this.adminService.updateTask(id, body);
  }

  @Delete('tasks/:id')
  async deleteTask(@Param('id') id: string) {
    return this.adminService.deleteTask(id);
  }

  // ═══════════════════════════════════════════════════════════════════
  // PRODUCTS & VARIANTS (Phase 3)
  // ═══════════════════════════════════════════════════════════════════

  @Get('products')
  async getProducts(
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.adminService.getProducts({
      search,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Get('products/:id/variants')
  async getProductVariants(@Param('id') id: string) {
    return this.adminService.getProductVariants(id);
  }

  @Post('products/:id/variants/bulk')
  async bulkUpdateVariants(
    @Param('id') id: string,
    @Body() body: { variants: any[] },
  ) {
    return this.adminService.bulkUpdateVariants(id, body.variants);
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECURITY & AUDIT (Phase 3)
  // ═══════════════════════════════════════════════════════════════════
}
