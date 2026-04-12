import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    return this.prisma.return.create({
      data: {
        tenantId,
        orderId: data.orderId,
        platform: data.platform,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        reason: data.reason,
        reasonDetail: data.reasonDetail,
        refundAmount: data.refundAmount || 0,
        items: {
          create: (data.items || []).map((item: any) => ({
            sku: item.sku,
            title: item.title,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            condition: item.condition,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findAll(
    tenantId: string,
    opts: { status?: string; page: number; limit: number },
  ) {
    const where: any = { tenantId };
    if (opts.status && opts.status !== 'all') where.status = opts.status;

    const [data, total] = await Promise.all([
      this.prisma.return.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (opts.page - 1) * opts.limit,
        take: opts.limit,
      }),
      this.prisma.return.count({ where }),
    ]);

    return {
      data,
      total,
      page: opts.page,
      totalPages: Math.ceil(total / opts.limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.return.findFirst({
      where: { id, tenantId },
      include: { items: true },
    });
  }

  async getStats(tenantId: string) {
    const [total, pending, approved, refunded, totalRefundAmount] =
      await Promise.all([
        this.prisma.return.count({ where: { tenantId } }),
        this.prisma.return.count({ where: { tenantId, status: 'PENDING' } }),
        this.prisma.return.count({ where: { tenantId, status: 'APPROVED' } }),
        this.prisma.return.count({ where: { tenantId, status: 'REFUNDED' } }),
        this.prisma.return.aggregate({
          where: { tenantId },
          _sum: { refundAmount: true },
        }),
      ]);

    return {
      total,
      pending,
      approved,
      refunded,
      totalRefundAmount: totalRefundAmount._sum.refundAmount || 0,
    };
  }

  async updateStatus(
    tenantId: string,
    id: string,
    data: { status: string; notes?: string; resolution?: string },
  ) {
    const updateData: any = { status: data.status };
    if (data.notes) updateData.notes = data.notes;
    if (data.resolution) updateData.resolution = data.resolution;
    if (['REFUNDED', 'COMPLETED', 'REJECTED'].includes(data.status)) {
      updateData.resolvedDate = new Date();
    }

    return this.prisma.return.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });
  }

  async processRefund(
    tenantId: string,
    id: string,
    data: { refundAmount: number; refundMethod: string },
  ) {
    return this.prisma.return.update({
      where: { id },
      data: {
        refundAmount: data.refundAmount,
        refundMethod: data.refundMethod,
        status: 'REFUNDED',
        resolvedDate: new Date(),
      },
      include: { items: true },
    });
  }
}
