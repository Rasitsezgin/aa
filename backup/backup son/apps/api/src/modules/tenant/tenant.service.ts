import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantService {
    constructor(private prisma: PrismaService) { }

    async createTenant(name: string, domain: string, adminEmail: string) {
        return this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name,
                    domain,
                    plan: 'FREE',
                },
            });

            const role = await tx.role.create({
                data: {
                    name: 'ADMIN',
                    description: 'Tenant Administrator',
                    tenantId: tenant.id,
                    isSystem: false,
                },
            });

            await tx.user.create({
                data: {
                    email: adminEmail,
                    password: 'temporary-password',
                    firstName: 'Admin',
                    lastName: 'User',
                    tenantId: tenant.id,
                    roleId: role.id,
                    type: 'ADMIN',
                },
            });

            return tenant;
        });
    }

    async purchaseModule(tenantId: string, moduleKey: string) {
        return this.prisma.purchasedModule.create({
            data: {
                tenantId,
                moduleKey,
                isActive: true,
            },
        });
    }

    async getSeoSettings(tenantId: string) {
        return this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                googleVerificationCode: true,
                bingVerificationCode: true,
                yandexVerificationCode: true,
                metaExtra: true,
            },
        });
    }

    async updateSeoSettings(tenantId: string, data: any) {
        return this.prisma.tenant.update({
            where: { id: tenantId },
            data,
        });
    }
}
