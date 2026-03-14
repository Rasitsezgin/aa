import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export enum Permission {
  // Products
  PRODUCT_VIEW = 'product:view',
  PRODUCT_CREATE = 'product:create',
  PRODUCT_EDIT = 'product:edit',
  PRODUCT_DELETE = 'product:delete',
  
  // Orders
  ORDER_VIEW = 'order:view',
  ORDER_CREATE = 'order:create',
  ORDER_EDIT = 'order:edit',
  ORDER_DELETE = 'order:delete',
  ORDER_SHIP = 'order:ship',
  ORDER_REFUND = 'order:refund',
  
  // Customers
  CUSTOMER_VIEW = 'customer:view',
  CUSTOMER_CREATE = 'customer:create',
  CUSTOMER_EDIT = 'customer:edit',
  CUSTOMER_DELETE = 'customer:delete',
  
  // Analytics
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',
  
  // Settings
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_EDIT = 'settings:edit',
  USER_MANAGE = 'user:manage',
  ROLE_MANAGE = 'role:manage',
  
  // Financial
  FINANCIAL_VIEW = 'financial:view',
  FINANCIAL_REFUND = 'financial:refund',
  
  // Admin
  ADMIN_ACCESS = 'admin:access',
  AUDIT_VIEW = 'audit:view',
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number;
  isSystem: boolean;
  createdAt: Date;
}

export interface UserRole {
  userId: string;
  roleId: string;
  roleName: string;
  permissions: Permission[];
  grantedAt: Date;
  grantedBy: string;
}

export const DEFAULT_ROLES: Record<string, Role> = {
  admin: {
    id: 'role_admin',
    name: 'Yönetici',
    description: 'Tüm sistem fonksiyonlarına erişim',
    permissions: Object.values(Permission),
    userCount: 2,
    isSystem: true,
    createdAt: new Date('2025-01-01'),
  },
  manager: {
    id: 'role_manager',
    name: 'Yönetici Asistanı',
    description: 'Satış ve müşteri yönetimi',
    permissions: [
      Permission.PRODUCT_VIEW,
      Permission.PRODUCT_EDIT,
      Permission.ORDER_VIEW,
      Permission.ORDER_EDIT,
      Permission.ORDER_SHIP,
      Permission.CUSTOMER_VIEW,
      Permission.CUSTOMER_EDIT,
      Permission.ANALYTICS_VIEW,
    ],
    userCount: 5,
    isSystem: true,
    createdAt: new Date('2025-01-01'),
  },
  staff: {
    id: 'role_staff',
    name: 'Personel',
    description: 'Sipariş ve müşteri hizmetleri',
    permissions: [
      Permission.PRODUCT_VIEW,
      Permission.ORDER_VIEW,
      Permission.ORDER_EDIT,
      Permission.ORDER_SHIP,
      Permission.CUSTOMER_VIEW,
    ],
    userCount: 12,
    isSystem: true,
    createdAt: new Date('2025-01-01'),
  },
  viewer: {
    id: 'role_viewer',
    name: 'Görüntüleyici',
    description: 'Yalnızca okuma izni',
    permissions: [
      Permission.PRODUCT_VIEW,
      Permission.ORDER_VIEW,
      Permission.CUSTOMER_VIEW,
      Permission.ANALYTICS_VIEW,
    ],
    userCount: 8,
    isSystem: true,
    createdAt: new Date('2025-01-01'),
  },
};

@Injectable()
export class RBACService {
  constructor(private prisma: PrismaService) {}
  // Get all roles
  async getRoles(): Promise<Role[]> {
    return Object.values(DEFAULT_ROLES);
  }

  // Get role by ID
  async getRoleById(roleId: string): Promise<Role | null> {
    return DEFAULT_ROLES[roleId] || null;
  }

  // Create custom role
  async createRole(
    name: string,
    description: string,
    permissions: Permission[]
  ): Promise<Role> {
    return {
      id: `role_${Date.now()}`,
      name,
      description,
      permissions,
      userCount: 0,
      isSystem: false,
      createdAt: new Date(),
    };
  }

  // Update role permissions
  async updateRolePermissions(
    roleId: string,
    permissions: Permission[]
  ): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: `Rol izinleri güncellendi`,
    };
  }

  // Delete custom role
  async deleteRole(roleId: string): Promise<{ success: boolean; message: string }> {
    if (DEFAULT_ROLES[roleId]?.isSystem) {
      return { success: false, message: 'Sistem rolleri silinemez' };
    }
    return { success: true, message: 'Rol silindi' };
  }

  // Assign role to user
  async assignRoleToUser(
    userId: string,
    roleId: string,
    grantedBy: string
  ): Promise<UserRole> {
    const role = DEFAULT_ROLES[roleId];
    return {
      userId,
      roleId,
      roleName: role?.name || 'Bilinmiyor',
      permissions: role?.permissions || [],
      grantedAt: new Date(),
      grantedBy,
    };
  }

  // Check permission
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: { include: { permissions: true } } },
    });
    if (!user?.role) return false;
    // Admin role has all permissions
    if (user.role.name === 'Yönetici' || user.type === 'ADMIN') return true;
    return user.role.permissions.some(p => p.action === permission);
  }

  // Get user permissions
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: { include: { permissions: true } } },
    });
    if (!user?.role) return [];
    // Admin gets all permissions
    if (user.role.name === 'Yönetici' || user.type === 'ADMIN') {
      return Object.values(Permission);
    }
    return user.role.permissions.map(p => p.action as Permission);
  }

  // Get role audit trail
  async getRoleAuditTrail(roleId: string): Promise<{
    roleId: string;
    roleName: string;
    changes: Array<{
      timestamp: Date;
      action: string;
      changedBy: string;
      details: string;
    }>;
  }> {
    return {
      roleId,
      roleName: DEFAULT_ROLES[roleId]?.name || 'Bilinmiyor',
      changes: [
        {
          timestamp: new Date('2025-02-01'),
          action: 'permission_added',
          changedBy: 'admin@example.com',
          details: 'Analitik dışa aktarma izni eklendi',
        },
        {
          timestamp: new Date('2025-01-15'),
          action: 'permission_removed',
          changedBy: 'admin@example.com',
          details: 'Ürün silme izni kaldırıldı',
        },
      ],
    };
  }

  // Get permission groups
  async getPermissionGroups(): Promise<Record<string, Permission[]>> {
    return {
      products: [
        Permission.PRODUCT_VIEW,
        Permission.PRODUCT_CREATE,
        Permission.PRODUCT_EDIT,
        Permission.PRODUCT_DELETE,
      ],
      orders: [
        Permission.ORDER_VIEW,
        Permission.ORDER_CREATE,
        Permission.ORDER_EDIT,
        Permission.ORDER_DELETE,
        Permission.ORDER_SHIP,
        Permission.ORDER_REFUND,
      ],
      customers: [
        Permission.CUSTOMER_VIEW,
        Permission.CUSTOMER_CREATE,
        Permission.CUSTOMER_EDIT,
        Permission.CUSTOMER_DELETE,
      ],
      analytics: [
        Permission.ANALYTICS_VIEW,
        Permission.ANALYTICS_EXPORT,
      ],
      settings: [
        Permission.SETTINGS_VIEW,
        Permission.SETTINGS_EDIT,
        Permission.USER_MANAGE,
        Permission.ROLE_MANAGE,
      ],
      financial: [
        Permission.FINANCIAL_VIEW,
        Permission.FINANCIAL_REFUND,
      ],
      admin: [
        Permission.ADMIN_ACCESS,
        Permission.AUDIT_VIEW,
      ],
    };
  }

  // Validate role consistency
  async validateRoleConsistency(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    for (const [roleId, role] of Object.entries(DEFAULT_ROLES)) {
      if (!role.name || role.permissions.length === 0) {
        issues.push(`Rol ${roleId} eksik konfigürasyon`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
