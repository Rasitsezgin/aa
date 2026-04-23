// Advanced RBAC (Role-Based Access Control) System
// Resource-based permissions with fine-grained access control

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'approve' | 'publish' | 'manage';
export type ResourceType = 
  | 'product'
  | 'order'
  | 'customer'
  | 'integration'
  | 'settings'
  | 'user'
  | 'role'
  | 'analytics'
  | 'campaign'
  | 'report'
  | 'billing';

export interface Permission {
  resource: ResourceType;
  action: PermissionAction;
  conditions?: Record<string, unknown>; // e.g., { ownData: true }
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean; // Cannot be deleted
  tenantId?: string; // null for global roles
}

// Predefined system roles
export const SYSTEM_ROLES: Omit<Role, 'id'>[] = [
  {
    name: 'Super Admin',
    description: 'Full system access',
    isSystem: true,
    permissions: [
      { resource: 'product', action: 'manage' },
      { resource: 'order', action: 'manage' },
      { resource: 'customer', action: 'manage' },
      { resource: 'integration', action: 'manage' },
      { resource: 'settings', action: 'manage' },
      { resource: 'user', action: 'manage' },
      { resource: 'role', action: 'manage' },
      { resource: 'analytics', action: 'manage' },
      { resource: 'campaign', action: 'manage' },
      { resource: 'report', action: 'manage' },
      { resource: 'billing', action: 'manage' },
    ],
  },
  {
    name: 'Tenant Admin',
    description: 'Full tenant access',
    isSystem: true,
    permissions: [
      { resource: 'product', action: 'manage' },
      { resource: 'order', action: 'manage' },
      { resource: 'customer', action: 'manage' },
      { resource: 'integration', action: 'manage' },
      { resource: 'settings', action: 'read' },
      { resource: 'analytics', action: 'read' },
      { resource: 'campaign', action: 'manage' },
      { resource: 'report', action: 'read' },
    ],
  },
  {
    name: 'Manager',
    description: 'Can manage products and orders',
    isSystem: true,
    permissions: [
      { resource: 'product', action: 'create' },
      { resource: 'product', action: 'read' },
      { resource: 'product', action: 'update' },
      { resource: 'product', action: 'delete' },
      { resource: 'order', action: 'read' },
      { resource: 'order', action: 'update' },
      { resource: 'order', action: 'export' },
      { resource: 'customer', action: 'read' },
      { resource: 'analytics', action: 'read' },
      { resource: 'report', action: 'read' },
    ],
  },
  {
    name: 'Operator',
    description: 'Order processing only',
    isSystem: true,
    permissions: [
      { resource: 'order', action: 'read' },
      { resource: 'order', action: 'update' },
      { resource: 'product', action: 'read' },
      { resource: 'customer', action: 'read' },
    ],
  },
  {
    name: 'Viewer',
    description: 'Read-only access',
    isSystem: true,
    permissions: [
      { resource: 'product', action: 'read' },
      { resource: 'order', action: 'read' },
      { resource: 'customer', action: 'read' },
      { resource: 'analytics', action: 'read' },
    ],
  },
];

// Permission checker
export class PermissionChecker {
  private userPermissions: Permission[];
  private userId: string;
  private tenantId: string;

  constructor(permissions: Permission[], userId: string, tenantId: string) {
    this.userPermissions = permissions;
    this.userId = userId;
    this.tenantId = tenantId;
  }

  // Check if user can perform action on resource
  can(action: PermissionAction, resource: ResourceType, conditions?: Record<string, unknown>): boolean {
    // Check for 'manage' permission (super permission)
    const hasManage = this.userPermissions.some(
      p => p.resource === resource && p.action === 'manage'
    );
    if (hasManage) return true;

    // Check for specific permission
    const hasPermission = this.userPermissions.some(
      p => p.resource === resource && (p.action === action || p.action === 'manage')
    );

    if (!hasPermission) return false;

    // Check conditions if provided
    if (conditions) {
      const permission = this.userPermissions.find(
        p => p.resource === resource && (p.action === action || p.action === 'manage')
      );
      
      if (permission?.conditions) {
        return this.checkConditions(permission.conditions, conditions);
      }
    }

    return true;
  }

  // Check multiple permissions
  canAny(permissions: Array<{ action: PermissionAction; resource: ResourceType }>): boolean {
    return permissions.some(p => this.can(p.action, p.resource));
  }

  canAll(permissions: Array<{ action: PermissionAction; resource: ResourceType }>): boolean {
    return permissions.every(p => this.can(p.action, p.resource));
  }

  // Check with ownership condition
  canOwn(action: PermissionAction, resource: ResourceType, ownerId: string): boolean {
    return this.can(action, resource, { ownerId, ownData: this.userId === ownerId });
  }

  private checkConditions(permissionConditions: Record<string, unknown>, context: Record<string, unknown>): boolean {
    for (const [key, value] of Object.entries(permissionConditions)) {
      if (context[key] !== value) {
        return false;
      }
    }
    return true;
  }

  // Get all resources user has access to
  getAccessibleResources(action?: PermissionAction): ResourceType[] {
    const resources = new Set<ResourceType>();
    
    this.userPermissions.forEach(p => {
      if (!action || p.action === action || p.action === 'manage') {
        resources.add(p.resource);
      }
    });

    return Array.from(resources);
  }
}

// Role manager
export class RoleManager {
  // Create custom role
  async createRole(
    tenantId: string,
    name: string,
    description: string,
    permissions: Permission[]
  ): Promise<Role> {
    // Implementation would save to database
    return {
      id: crypto.randomUUID(),
      tenantId,
      name,
      description,
      permissions,
      isSystem: false,
    };
  }

  // Assign role to user
  async assignRole(
    userId: string,
    roleId: string,
    tenantId: string
  ): Promise<void> {
    // Implementation would save to database
    console.log(`Assigned role ${roleId} to user ${userId}`);
  }

  // Get permissions for user
  async getUserPermissions(userId: string, tenantId: string): Promise<Permission[]> {
    // Implementation would fetch from database
    return [];
  }

  // Check if role name is available
  isRoleNameAvailable(name: string, tenantId: string, existingRoles: Role[]): boolean {
    return !existingRoles.some(r => 
      r.name.toLowerCase() === name.toLowerCase() && r.tenantId === tenantId
    );
  }
}

// Middleware helper for API routes
export function requirePermission(
  action: PermissionAction,
  resource: ResourceType
) {
  return async (req: Request, userId: string, tenantId: string) => {
    // Implementation would check permissions
    // If no permission, throw 403
  };
}

// React hook for permissions
export function usePermissions(permissions: Permission[], userId: string, tenantId: string) {
  const checker = new PermissionChecker(permissions, userId, tenantId);
  
  return {
    can: checker.can.bind(checker),
    canAny: checker.canAny.bind(checker),
    canAll: checker.canAll.bind(checker),
    canOwn: checker.canOwn.bind(checker),
  };
}

// Permission builder for easy role creation
export class PermissionBuilder {
  private permissions: Permission[] = [];

  allow(resource: ResourceType, action: PermissionAction, conditions?: Record<string, unknown>): this {
    this.permissions.push({ resource, action, conditions });
    return this;
  }

  allowAll(resource: ResourceType): this {
    this.permissions.push({ resource, action: 'manage' });
    return this;
  }

  deny(resource: ResourceType, action: PermissionAction): this {
    // Remove permission if exists
    this.permissions = this.permissions.filter(
      p => !(p.resource === resource && p.action === action)
    );
    return this;
  }

  build(): Permission[] {
    return this.permissions;
  }
}

// Export types
export type { Permission, Role };
