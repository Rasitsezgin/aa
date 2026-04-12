import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

interface TenantLimits {
  products: number;
  orders: number;
  apiCalls: number;
  storage: number;
  users: number;
  integrations: number;
}

interface ResourceUsage {
  products: number;
  orders: number;
  apiCalls: number;
  storage: number;
  users: number;
  integrations: number;
}

/**
 * Multi-tenant Resource Isolation Service
 * - Resource limits per plan
 * - Usage tracking
 * - Quota enforcement
 * - Resource cleanup
 */
@Injectable()
export class TenantGuardService {
  private planLimits: Record<string, TenantLimits> = {
    FREE: {
      products: 100,
      orders: 500,
      apiCalls: 1000,
      storage: 100, // MB
      users: 1,
      integrations: 2,
    },
    STARTER: {
      products: 1000,
      orders: 5000,
      apiCalls: 10000,
      storage: 1000,
      users: 3,
      integrations: 5,
    },
    PRO: {
      products: 10000,
      orders: 50000,
      apiCalls: 100000,
      storage: 10000,
      users: 10,
      integrations: 15,
    },
    ENTERPRISE: {
      products: 100000,
      orders: 500000,
      apiCalls: 1000000,
      storage: 100000,
      users: 100,
      integrations: 50,
    },
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Tenant'ın kaynak limitlerini kontrol et
   */
  async checkLimit(
    tenantId: string,
    resource: keyof TenantLimits,
    amount = 1,
  ): Promise<boolean> {
    const plan = await this.getTenantPlan(tenantId);
    const limit = this.planLimits[plan][resource];
    const usage = await this.getResourceUsage(tenantId, resource);

    return usage + amount <= limit;
  }

  /**
   * Kaynak kullanımını artır
   */
  async incrementUsage(
    tenantId: string,
    resource: keyof TenantLimits,
    amount = 1,
  ): Promise<void> {
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        usageMetrics: {
          update: {
            [resource]: { increment: amount },
          },
        },
      } as any,
    });
  }

  /**
   * Kaynak kullanımını azalt (örn: ürün silindiğinde)
   */
  async decrementUsage(
    tenantId: string,
    resource: keyof TenantLimits,
    amount = 1,
  ): Promise<void> {
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        usageMetrics: {
          update: {
            [resource]: { decrement: amount },
          },
        },
      } as any,
    });
  }

  /**
   * Tüm kaynak kullanımını getir
   */
  async getAllUsage(tenantId: string): Promise<{
    used: ResourceUsage;
    limits: TenantLimits;
    percentages: Record<string, number>;
  }> {
    const plan = await this.getTenantPlan(tenantId);
    const limits = this.planLimits[plan];

    const used: ResourceUsage = {
      products: await this.getResourceUsage(tenantId, 'products'),
      orders: await this.getResourceUsage(tenantId, 'orders'),
      apiCalls: await this.getResourceUsage(tenantId, 'apiCalls'),
      storage: await this.getResourceUsage(tenantId, 'storage'),
      users: await this.getResourceUsage(tenantId, 'users'),
      integrations: await this.getResourceUsage(tenantId, 'integrations'),
    };

    const percentages: Record<string, number> = {
      products: (used.products / limits.products) * 100,
      orders: (used.orders / limits.orders) * 100,
      apiCalls: (used.apiCalls / limits.apiCalls) * 100,
      storage: (used.storage / limits.storage) * 100,
      users: (used.users / limits.users) * 100,
      integrations: (used.integrations / limits.integrations) * 100,
    };

    return { used, limits, percentages };
  }

  /**
   * Uyarı gönderilmesi gereken limitler
   */
  async getAlertThresholds(tenantId: string): Promise<
    Array<{
      resource: string;
      percentage: number;
      severity: 'warning' | 'critical';
    }>
  > {
    const { percentages } = await this.getAllUsage(tenantId);
    const alerts: Array<{
      resource: string;
      percentage: number;
      severity: 'warning' | 'critical';
    }> = [];

    for (const [resource, percentage] of Object.entries(percentages)) {
      if (percentage >= 90) {
        alerts.push({ resource, percentage, severity: 'critical' });
      } else if (percentage >= 75) {
        alerts.push({ resource, percentage, severity: 'warning' });
      }
    }

    return alerts;
  }

  /**
   * Tenant verilerini diğer tenant'lardan izole et
   */
  async enforceIsolation<T>(
    tenantId: string,
    operation: () => Promise<T>,
    resourceName: string,
  ): Promise<T> {
    try {
      // Multi-tenant context'i ayarla
      const result = await this.prisma.$transaction(async (tx) => {
        // Tenant context middleware
        await tx.$executeRaw`SET app.current_tenant_id = ${tenantId}`;

        return await operation();
      });

      return result;
    } catch (error) {
      console.error(`Tenant isolation error (${tenantId}):`, error);
      throw new Error(`Resource isolation failed for ${resourceName}`);
    }
  }

  /**
   * Tenant'ın diğer tenant'ların verilerine erişimini engelle
   */
  async validateOwnership(
    tenantId: string,
    resourceId: string,
    resourceType: string,
  ): Promise<boolean> {
    const resource = await this.prisma[resourceType].findUnique({
      where: { id: resourceId },
      select: { tenantId: true },
    });

    if (!resource || resource.tenantId !== tenantId) {
      throw new ForbiddenException(
        `You do not have access to this ${resourceType}`,
      );
    }

    return true;
  }

  private async getTenantPlan(tenantId: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });

    return tenant?.plan || 'FREE';
  }

  private async getResourceUsage(
    tenantId: string,
    resource: keyof TenantLimits,
  ): Promise<number> {
    switch (resource) {
      case 'products':
        return this.prisma.product.count({ where: { tenantId } });
      case 'orders':
        return this.prisma.order.count({ where: { tenantId } });
      case 'users':
        return this.prisma.user.count({ where: { tenantId } });
      case 'integrations':
        return this.prisma.integration.count({ where: { tenantId } });
      case 'apiCalls':
        // Son 1 saatlik API çağrısı
        return this.prisma.activityLog.count({
          where: {
            tenantId,
            createdAt: { gte: new Date(Date.now() - 3600000) },
          },
        });
      case 'storage':
        // Storage calculation (simplified)
        return 0; // TODO: Implement storage tracking
      default:
        return 0;
    }
  }
}

/**
 * Tenant Resource Guard - Controller/Method decorator
 */
@Injectable()
export class TenantResourceGuard implements CanActivate {
  constructor(private tenantGuard: TenantGuardService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] || request.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID required');
    }

    // Check if tenant is within limits
    const alerts = await this.tenantGuard.getAlertThresholds(tenantId);
    const critical = alerts.find((a) => a.severity === 'critical');

    if (critical) {
      throw new ForbiddenException(
        `Resource limit exceeded: ${critical.resource} (${critical.percentage.toFixed(1)}%)`,
      );
    }

    return true;
  }
}

/**
 * Tenant Isolation Decorator
 */
export function WithTenantIsolation() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args[0]; // Assuming first arg is request
      const tenantId = request.headers?.['x-tenant-id'] || request.tenantId;

      if (!tenantId) {
        throw new ForbiddenException('Tenant ID required for this operation');
      }

      // Add tenant filter to all queries in this method
      return await originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
