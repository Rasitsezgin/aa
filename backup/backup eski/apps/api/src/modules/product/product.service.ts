import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, data: any) {
        return this.prisma.product.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.product.findMany({
            where: { tenantId },
            include: { images: true, marketplaceLinks: true },
        });
    }

    async findOne(tenantId: string, id: string) {
        return this.prisma.product.findFirst({
            where: { id, tenantId },
            include: { images: true, marketplaceLinks: true },
        });
    }

    async update(tenantId: string, id: string, data: any) {
        return this.prisma.product.update({
            where: { id, tenantId },
            data,
        });
    }

    async remove(tenantId: string, id: string) {
        return this.prisma.product.delete({
            where: { id, tenantId },
        });
    }
}
