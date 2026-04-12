import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateModuleDto {
  key: string;
  name: string;
  description?: string;
  category: string;
  requiredPlan: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  features?: string[];
  icon?: string;
  isCore?: boolean;
  isActive?: boolean;
}

export interface UpdateModuleDto extends Partial<CreateModuleDto> {}

export interface TenantModuleDto {
  tenantId: string;
  moduleKey: string;
  isEnabled: boolean;
  config?: Record<string, any>;
}

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  // System Modules
  async findAllModules() {
    return this.prisma.systemModule.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findActiveModules() {
    return this.prisma.systemModule.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findModuleByKey(key: string) {
    return this.prisma.systemModule.findUnique({
      where: { key },
    });
  }

  async findModulesByCategory(category: string) {
    return this.prisma.systemModule.findMany({
      where: { category, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findModulesForPlan(plan: string) {
    const planOrder = ['FREE', 'PRO', 'ENTERPRISE'];
    const planIndex = planOrder.indexOf(plan);
    const accessiblePlans = planOrder.slice(0, planIndex + 1);

    return this.prisma.systemModule.findMany({
      where: {
        isActive: true,
        requiredPlan: { in: accessiblePlans },
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async createModule(dto: CreateModuleDto) {
    return this.prisma.systemModule.create({
      data: {
        key: dto.key,
        name: dto.name,
        description: dto.description,
        category: dto.category as any,
        requiredPlan: dto.requiredPlan as any,
        monthlyPrice: dto.monthlyPrice,
        yearlyPrice: dto.yearlyPrice,
        features: dto.features || [],
        icon: dto.icon,
        isCore: dto.isCore ?? false,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateModule(key: string, dto: UpdateModuleDto) {
    return this.prisma.systemModule.update({
      where: { key },
      data: dto as any,
    });
  }

  async toggleModule(key: string, isActive: boolean) {
    return this.prisma.systemModule.update({
      where: { key },
      data: { isActive },
    });
  }

  async deleteModule(key: string) {
    return this.prisma.systemModule.delete({
      where: { key },
    });
  }

  // Tenant Modules
  async getTenantModules(tenantId: string) {
    return this.prisma.tenantModule.findMany({
      where: { tenantId },
      include: { module: true },
    });
  }

  async getEnabledTenantModules(tenantId: string) {
    return this.prisma.tenantModule.findMany({
      where: { tenantId, isEnabled: true },
      include: { module: true },
    });
  }

  async setTenantModule(dto: TenantModuleDto) {
    return this.prisma.tenantModule.upsert({
      where: {
        tenantId_moduleKey: {
          tenantId: dto.tenantId,
          moduleKey: dto.moduleKey,
        },
      },
      create: {
        tenantId: dto.tenantId,
        moduleKey: dto.moduleKey,
        isEnabled: dto.isEnabled,
        customConfig: dto.config,
      },
      update: {
        isEnabled: dto.isEnabled,
        customConfig: dto.config,
      },
    });
  }

  async toggleTenantModule(tenantId: string, moduleKey: string, isEnabled: boolean) {
    return this.prisma.tenantModule.upsert({
      where: {
        tenantId_moduleKey: { tenantId, moduleKey },
      },
      create: {
        tenantId,
        moduleKey,
        isEnabled,
      },
      update: { isEnabled },
    });
  }

  async updateTenantModuleConfig(tenantId: string, moduleKey: string, config: Record<string, any>) {
    return this.prisma.tenantModule.update({
      where: {
        tenantId_moduleKey: { tenantId, moduleKey },
      },
      data: { customConfig: config },
    });
  }

  // Module Access Check
  async hasModuleAccess(tenantId: string, moduleKey: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) return false;

    const systemModule = await this.prisma.systemModule.findUnique({
      where: { key: moduleKey },
    });

    if (!systemModule) return false;

    // Core modules are always accessible
    if (systemModule.isCore) return true;

    // Check plan
    const planOrder = ['FREE', 'PRO', 'ENTERPRISE'];
    const tenantPlanIndex = planOrder.indexOf(tenant.plan);
    const requiredPlanIndex = planOrder.indexOf(systemModule.requiredPlan);

    if (requiredPlanIndex > tenantPlanIndex) return false;

    // Check if module is enabled for tenant
    const tenantModule = await this.prisma.tenantModule.findUnique({
      where: {
        tenantId_moduleKey: { tenantId, moduleKey },
      },
    });

    return tenantModule?.isEnabled ?? false;
  }

  // Statistics
  async getModuleStats() {
    const [total, active, byCategory, byPlan] = await Promise.all([
      this.prisma.systemModule.count(),
      this.prisma.systemModule.count({ where: { isActive: true } }),
      this.prisma.systemModule.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
      this.prisma.systemModule.groupBy({
        by: ['requiredPlan'],
        _count: { requiredPlan: true },
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count.category;
        return acc;
      }, {} as Record<string, number>),
      byPlan: byPlan.reduce((acc, item) => {
        acc[item.requiredPlan] = item._count.requiredPlan;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
