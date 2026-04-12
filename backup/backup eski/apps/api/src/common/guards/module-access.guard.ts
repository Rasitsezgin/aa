import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CanAccessModuleGuard implements CanActivate {
    constructor(private reflector: Reflector, private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const moduleKey = this.reflector.get<string>('moduleKey', context.getHandler());
        if (!moduleKey) return true;

        const request = context.switchToHttp().getRequest();
        const tenantId = request.headers['x-tenant-id']; // This would normally come from auth middleware

        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const purchased = await this.prisma.purchasedModule.findFirst({
            where: {
                tenantId,
                moduleKey,
                isActive: true,
            },
        });

        if (!purchased) {
            throw new ForbiddenException(`Bu modüle (${moduleKey}) erişim yetkiniz yok. Lütfen satın alın.`);
        }

        return true;
    }
}
