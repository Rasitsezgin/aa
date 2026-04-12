import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TenantService {
    constructor(private prisma: PrismaService) { }

    async createTenant(name: string, domain: string, adminEmail: string) {
        return this.prisma.tenant.create({
            data: {
                name,
                domain,
                users: {
                    create: {
                        email: adminEmail,
                        role: 'ADMIN',
                        password: 'temporary-password', // Should be hashed in real implementation
                    },
                },
            },
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
