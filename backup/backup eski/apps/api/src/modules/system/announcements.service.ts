import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  summary?: string;
  type: string;
  target: string;
  icon?: string;
  color?: string;
  actionUrl?: string;
  actionText?: string;
  startsAt?: Date;
  endsAt?: Date;
  isPinned?: boolean;
  priority?: number;
}

export interface UpdateAnnouncementDto extends Partial<CreateAnnouncementDto> {
  isActive?: boolean;
}

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  // Find all announcements (admin)
  async findAll() {
    return this.prisma.announcement.findMany({
      orderBy: [{ isPinned: 'desc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  // Find active announcements
  async findActive() {
    const now = new Date();
    return this.prisma.announcement.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        OR: [
          { endsAt: null },
          { endsAt: { gt: now } },
        ],
      },
      orderBy: [{ isPinned: 'desc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  // Find announcements for a specific tenant/plan
  async findForTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) return [];

    const now = new Date();
    const targetAudiences = ['ALL'];
    
    // Map plan to target audience
    if (tenant.plan === 'FREE') targetAudiences.push('FREE_USERS');
    if (tenant.plan === 'PRO') targetAudiences.push('PRO_USERS');
    if (tenant.plan === 'ENTERPRISE') targetAudiences.push('ENTERPRISE_USERS');

    const announcements = await this.prisma.announcement.findMany({
      where: {
        isActive: true,
        target: { in: targetAudiences as any },
        startsAt: { lte: now },
        OR: [
          { endsAt: null },
          { endsAt: { gt: now } },
        ],
      },
      orderBy: [{ isPinned: 'desc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });

    // Get read status
    const reads = await this.prisma.announcementRead.findMany({
      where: {
        tenantId,
        announcementId: { in: announcements.map(a => a.id) },
      },
    });

    const readMap = new Map(reads.map(r => [r.announcementId, r]));

    return announcements.map(a => ({
      ...a,
      isRead: readMap.has(a.id),
      isDismissed: readMap.get(a.id)?.dismissedAt !== null,
    }));
  }

  // Find single announcement
  async findOne(id: string) {
    return this.prisma.announcement.findUnique({
      where: { id },
    });
  }

  // Create announcement
  async create(dto: CreateAnnouncementDto) {
    return this.prisma.announcement.create({
      data: {
        title: dto.title,
        content: dto.content,
        summary: dto.summary,
        type: dto.type as any,
        target: dto.target as any,
        icon: dto.icon,
        color: dto.color,
        actionUrl: dto.actionUrl,
        actionText: dto.actionText,
        startsAt: dto.startsAt || new Date(),
        endsAt: dto.endsAt,
        isPinned: dto.isPinned ?? false,
        priority: dto.priority ?? 0,
        isActive: true,
      },
    });
  }

  // Update announcement
  async update(id: string, dto: UpdateAnnouncementDto) {
    return this.prisma.announcement.update({
      where: { id },
      data: dto as any,
    });
  }

  // Toggle announcement status
  async toggle(id: string, isActive: boolean) {
    return this.prisma.announcement.update({
      where: { id },
      data: { isActive },
    });
  }

  // Pin/unpin announcement
  async pin(id: string, isPinned: boolean) {
    return this.prisma.announcement.update({
      where: { id },
      data: { isPinned },
    });
  }

  // Delete announcement
  async delete(id: string) {
    // Delete related reads first
    await this.prisma.announcementRead.deleteMany({
      where: { announcementId: id },
    });
    
    return this.prisma.announcement.delete({
      where: { id },
    });
  }

  // Mark as read
  async markAsRead(announcementId: string, tenantId: string) {
    // Increment view count
    await this.prisma.announcement.update({
      where: { id: announcementId },
      data: { viewCount: { increment: 1 } },
    });

    return this.prisma.announcementRead.upsert({
      where: {
        announcementId_tenantId: { announcementId, tenantId },
      },
      create: {
        announcementId,
        tenantId,
        readAt: new Date(),
      },
      update: {
        readAt: new Date(),
      },
    });
  }

  // Dismiss announcement
  async dismiss(announcementId: string, tenantId: string) {
    // Increment dismiss count
    await this.prisma.announcement.update({
      where: { id: announcementId },
      data: { dismissCount: { increment: 1 } },
    });

    return this.prisma.announcementRead.upsert({
      where: {
        announcementId_tenantId: { announcementId, tenantId },
      },
      create: {
        announcementId,
        tenantId,
        readAt: new Date(),
        dismissedAt: new Date(),
      },
      update: {
        dismissedAt: new Date(),
      },
    });
  }

  // Get announcement stats
  async getStats() {
    const now = new Date();
    
    const [total, active, pinned, byType] = await Promise.all([
      this.prisma.announcement.count(),
      this.prisma.announcement.count({
        where: {
          isActive: true,
          startsAt: { lte: now },
          OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        },
      }),
      this.prisma.announcement.count({ where: { isPinned: true, isActive: true } }),
      this.prisma.announcement.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
    ]);

    const totalViews = await this.prisma.announcement.aggregate({
      _sum: { viewCount: true },
    });

    const totalDismisses = await this.prisma.announcement.aggregate({
      _sum: { dismissCount: true },
    });

    return {
      total,
      active,
      pinned,
      totalViews: totalViews._sum.viewCount || 0,
      totalDismisses: totalDismisses._sum.dismissCount || 0,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
