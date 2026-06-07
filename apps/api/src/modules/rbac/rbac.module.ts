import { Global, Module } from '@nestjs/common';
import { RBACService } from './rbac.service';
import { DatabaseModule } from '../../database/database.module';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [RBACService, PermissionsGuard],
  exports: [RBACService, PermissionsGuard],
})
export class RbacModule {}
