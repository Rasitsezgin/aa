import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ModulesService, CreateModuleDto, UpdateModuleDto } from './modules.service';

@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  // System Modules
  @Get()
  async findAll() {
    return this.modulesService.findAllModules();
  }

  @Get('active')
  async findActive() {
    return this.modulesService.findActiveModules();
  }

  @Get('stats')
  async getStats() {
    return this.modulesService.getModuleStats();
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: string) {
    return this.modulesService.findModulesByCategory(category);
  }

  @Get('plan/:plan')
  async findForPlan(@Param('plan') plan: string) {
    return this.modulesService.findModulesForPlan(plan);
  }

  @Get(':key')
  async findOne(@Param('key') key: string) {
    return this.modulesService.findModuleByKey(key);
  }

  @Post()
  async create(@Body() dto: CreateModuleDto) {
    return this.modulesService.createModule(dto);
  }

  @Put(':key')
  async update(@Param('key') key: string, @Body() dto: UpdateModuleDto) {
    return this.modulesService.updateModule(key, dto);
  }

  @Put(':key/toggle')
  async toggle(@Param('key') key: string, @Body('isActive') isActive: boolean) {
    return this.modulesService.toggleModule(key, isActive);
  }

  @Delete(':key')
  async delete(@Param('key') key: string) {
    return this.modulesService.deleteModule(key);
  }

  // Tenant Modules
  @Get('tenant/:tenantId')
  async getTenantModules(@Param('tenantId') tenantId: string) {
    return this.modulesService.getTenantModules(tenantId);
  }

  @Get('tenant/:tenantId/enabled')
  async getEnabledTenantModules(@Param('tenantId') tenantId: string) {
    return this.modulesService.getEnabledTenantModules(tenantId);
  }

  @Put('tenant/:tenantId/:moduleKey')
  async setTenantModule(
    @Param('tenantId') tenantId: string,
    @Param('moduleKey') moduleKey: string,
    @Body('isEnabled') isEnabled: boolean,
    @Body('config') config?: Record<string, any>,
  ) {
    return this.modulesService.setTenantModule({
      tenantId,
      moduleKey,
      isEnabled,
      config,
    });
  }

  @Put('tenant/:tenantId/:moduleKey/toggle')
  async toggleTenantModule(
    @Param('tenantId') tenantId: string,
    @Param('moduleKey') moduleKey: string,
    @Body('isEnabled') isEnabled: boolean,
  ) {
    return this.modulesService.toggleTenantModule(tenantId, moduleKey, isEnabled);
  }

  @Put('tenant/:tenantId/:moduleKey/config')
  async updateTenantModuleConfig(
    @Param('tenantId') tenantId: string,
    @Param('moduleKey') moduleKey: string,
    @Body() config: Record<string, any>,
  ) {
    return this.modulesService.updateTenantModuleConfig(tenantId, moduleKey, config);
  }

  // Access Check
  @Get('access/:tenantId/:moduleKey')
  async checkAccess(
    @Param('tenantId') tenantId: string,
    @Param('moduleKey') moduleKey: string,
  ) {
    const hasAccess = await this.modulesService.hasModuleAccess(tenantId, moduleKey);
    return { hasAccess };
  }
}
