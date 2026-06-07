import { SetMetadata } from '@nestjs/common';
import { Permission } from '../../modules/rbac/rbac.service';

export const PERMISSION_KEY = 'permission';

export const RequirePermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSION_KEY, permissions);
