import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Platform } from '@prisma/client';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(private prisma: PrismaService) {}

  async getTickets(tenantId: string) {
    return this.prisma.supportTicket.findMany({
      where: { tenantId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getTicketDetails(tenantId: string, ticketId: string) {
    return this.prisma.supportTicket.findUnique({
      where: { id: ticketId, tenantId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        order: true,
      },
    });
  }

  async createMessage(
    tenantId: string,
    ticketId: string,
    content: string,
    senderType: 'CUSTOMER' | 'AGENT' | 'SYSTEM',
  ) {
    const message = await this.prisma.omnichannelMessage.create({
      data: {
        tenantId,
        ticketId,
        content,
        senderType,
      },
    });

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async syncMarketplaceMessages(tenantId: string, platform: Platform) {
    this.logger.log(`Syncing messages for ${platform} on tenant ${tenantId}`);
    // Mock sync logic - in real world would call Marketplace API
    return { success: true, translatedCount: 0 };
  }

  async updateAIsuggestion(messageId: string, suggestion: string) {
    return this.prisma.omnichannelMessage.update({
      where: { id: messageId },
      data: { aiSuggestion: suggestion },
    });
  }
}
