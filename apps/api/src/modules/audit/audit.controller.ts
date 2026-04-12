import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import {
  AuditService,
  AuditQuery,
  AuditAction,
  AuditSeverity,
} from './audit.service';

// Placeholder for auth guard
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('audit')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async getLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('action') action?: string,
    @Query('severity') severity?: string,
    @Query('userId') userId?: string,
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('success') success?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const query: AuditQuery = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      action: action ? (action as AuditAction) : undefined,
      severity: severity ? (severity as AuditSeverity) : undefined,
      userId,
      resourceType,
      resourceId,
      success: success !== undefined ? success === 'true' : undefined,
      search,
      sortBy,
      sortOrder,
    };

    return this.auditService.query(query);
  }

  @Get('activity-log')
  async getActivityLog(
    @Query('tenantId') tenantId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const query: AuditQuery = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    };
    return this.auditService.query(query);
  }

  @Get('stats')
  async getStats(@Query('tenantId') tenantId?: string) {
    return this.auditService.getStats(tenantId);
  }

  @Get('timeline')
  async getTimeline(
    @Query('tenantId') tenantId: string,
    @Query('hours') hours?: string,
  ) {
    return this.auditService.getActivityTimeline(
      tenantId,
      hours ? parseInt(hours) : 24,
    );
  }

  @Get('actions')
  async getAvailableActions() {
    return {
      actions: Object.values(AuditAction),
      severities: Object.values(AuditSeverity),
    };
  }

  @Get(':id')
  async getLogById(@Param('id') id: string) {
    const log = await this.auditService.getById(id);
    if (!log) {
      return { error: 'Log not found' };
    }
    return log;
  }
}
