/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface TeamMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  permissions: string[];
}

export interface TeamConversation {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  settings: {
    allowGuestAccess: boolean;
    requireApproval: boolean;
    maxMembers: number;
  };
}

export interface TeamMessage {
  id: string;
  conversationId: string;
  userId: string;
  userName?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mentions?: string[];
  replyTo?: string;
  reactions?: Array<{
    emoji: string;
    userId: string;
    timestamp: Date;
  }>;
}

export interface Mention {
  userId: string;
  mentionedBy: string;
  messageId: string;
  conversationId: string;
  read: boolean;
}

@Injectable()
export class AITeamChatService {
  private readonly logger = new Logger(AITeamChatService.name);

  constructor(private prisma: PrismaService) {}

  // ==================== TEAM CONVERSATION CRUD ====================

  async createTeamConversation(
    tenantId: string,
    userId: string,
    data: {
      name: string;
      description?: string;
      members?: string[]; // User IDs
      settings?: Partial<TeamConversation['settings']>;
    },
  ): Promise<TeamConversation> {
    const members: TeamMember[] = [
      {
        userId,
        role: 'owner',
        joinedAt: new Date(),
        permissions: ['read', 'write', 'manage', 'delete'],
      },
      ...(data.members || []).map(memberId => ({
        userId: memberId,
        role: 'member' as const,
        joinedAt: new Date(),
        permissions: ['read', 'write'],
      })),
    ];

    const conversation = await this.prisma.aITeamConversation.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        createdBy: userId,
        members: members as any,
        settings: {
          allowGuestAccess: false,
          requireApproval: true,
          maxMembers: 20,
          ...data.settings,
        },
      },
    });

    return this.mapTeamConversationFromDb(conversation);
  }

  async getTeamConversation(
    conversationId: string,
    tenantId: string,
  ): Promise<TeamConversation | null> {
    const conversation = await this.prisma.aITeamConversation.findFirst({
      where: { id: conversationId, tenantId },
    });

    return conversation ? this.mapTeamConversationFromDb(conversation) : null;
  }

  async getTeamConversations(
    tenantId: string,
    userId: string,
  ): Promise<TeamConversation[]> {
    const conversations = await this.prisma.aITeamConversation.findMany({
      where: {
        tenantId,
        isActive: true,
        members: {
          array_contains: [{ userId }],
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map(c => this.mapTeamConversationFromDb(c));
  }

  async updateTeamConversation(
    conversationId: string,
    tenantId: string,
    userId: string,
    updates: Partial<{
      name: string;
      description: string;
      settings: TeamConversation['settings'];
      isActive: boolean;
    }>,
  ): Promise<TeamConversation> {
    // Check permissions
    const hasPermission = await this.checkPermission(
      conversationId,
      tenantId,
      userId,
      'manage',
    );

    if (!hasPermission) {
      throw new Error('Insufficient permissions');
    }

    const updated = await this.prisma.aITeamConversation.updateMany({
      where: { id: conversationId, tenantId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    const conversation = await this.prisma.aITeamConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return this.mapTeamConversationFromDb(conversation);
  }

  async deleteTeamConversation(
    conversationId: string,
    tenantId: string,
    userId: string,
  ): Promise<void> {
    // Only owner can delete
    const hasPermission = await this.checkPermission(
      conversationId,
      tenantId,
      userId,
      'delete',
    );

    if (!hasPermission) {
      throw new Error('Only owner can delete conversation');
    }

    await this.prisma.aITeamConversation.deleteMany({
      where: { id: conversationId, tenantId },
    });
  }

  // ==================== MEMBER MANAGEMENT ====================

  async addMember(
    conversationId: string,
    tenantId: string,
    invitedBy: string,
    newMemberId: string,
    role: 'admin' | 'member' | 'viewer' = 'member',
  ): Promise<TeamConversation> {
    // Check if inviter has permission
    const hasPermission = await this.checkPermission(
      conversationId,
      tenantId,
      invitedBy,
      'manage',
    );

    if (!hasPermission) {
      throw new Error('Insufficient permissions to add members');
    }

    const conversation = await this.getTeamConversation(conversationId, tenantId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Check if already a member
    if (conversation.members.some(m => m.userId === newMemberId)) {
      throw new Error('User is already a member');
    }

    // Check max members limit
    if (conversation.members.length >= conversation.settings.maxMembers) {
      throw new Error('Maximum member limit reached');
    }

    const newMember: TeamMember = {
      userId: newMemberId,
      role,
      joinedAt: new Date(),
      permissions: this.getDefaultPermissions(role),
    };

    const updatedMembers = [...conversation.members, newMember];

    await this.prisma.aITeamConversation.update({
      where: { id: conversationId },
      data: {
        members: updatedMembers as any,
        updatedAt: new Date(),
      },
    });

    // Notify new member
    await this.createMention(conversationId, newMemberId, invitedBy, 'system');

    return this.getTeamConversation(conversationId, tenantId) as Promise<TeamConversation>;
  }

  async removeMember(
    conversationId: string,
    tenantId: string,
    removedBy: string,
    memberId: string,
  ): Promise<TeamConversation> {
    const conversation = await this.getTeamConversation(conversationId, tenantId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Can't remove owner
    const member = conversation.members.find(m => m.userId === memberId);
    if (member?.role === 'owner') {
      throw new Error('Cannot remove owner');
    }

    // Check permissions
    const hasPermission = await this.checkPermission(
      conversationId,
      tenantId,
      removedBy,
      'manage',
    );

    if (!hasPermission && removedBy !== memberId) {
      throw new Error('Insufficient permissions');
    }

    const updatedMembers = conversation.members.filter(m => m.userId !== memberId);

    await this.prisma.aITeamConversation.update({
      where: { id: conversationId },
      data: {
        members: updatedMembers as any,
        updatedAt: new Date(),
      },
    });

    return this.getTeamConversation(conversationId, tenantId) as Promise<TeamConversation>;
  }

  async updateMemberRole(
    conversationId: string,
    tenantId: string,
    updatedBy: string,
    memberId: string,
    newRole: 'admin' | 'member' | 'viewer',
  ): Promise<TeamConversation> {
    // Only owner can change roles
    const hasPermission = await this.checkPermission(
      conversationId,
      tenantId,
      updatedBy,
      'delete',
    );

    if (!hasPermission) {
      throw new Error('Only owner can change roles');
    }

    const conversation = await this.getTeamConversation(conversationId, tenantId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const updatedMembers = conversation.members.map(m => {
      if (m.userId === memberId) {
        return {
          ...m,
          role: newRole,
          permissions: this.getDefaultPermissions(newRole),
        };
      }
      return m;
    });

    await this.prisma.aITeamConversation.update({
      where: { id: conversationId },
      data: {
        members: updatedMembers as any,
        updatedAt: new Date(),
      },
    });

    return this.getTeamConversation(conversationId, tenantId) as Promise<TeamConversation>;
  }

  // ==================== MESSAGE HANDLING ====================

  async sendTeamMessage(
    conversationId: string,
    tenantId: string,
    userId: string,
    content: string,
    options?: {
      replyTo?: string;
      mentions?: string[];
    },
  ): Promise<TeamMessage> {
    // Check if user is member
    const hasPermission = await this.checkPermission(
      conversationId,
      tenantId,
      userId,
      'write',
    );

    if (!hasPermission) {
      throw new Error('Not a member of this conversation');
    }

    const message = await this.prisma.aITeamMessage.create({
      data: {
        conversationId,
        userId,
        role: 'user',
        content,
        replyTo: options?.replyTo,
        mentions: options?.mentions,
      },
    });

    // Update conversation timestamp
    await this.prisma.aITeamConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Create mentions
    if (options?.mentions) {
      for (const mentionedUserId of options.mentions) {
        await this.createMention(conversationId, mentionedUserId, userId, message.id);
      }
    }

    return this.mapTeamMessageFromDb(message);
  }

  async getTeamMessages(
    conversationId: string,
    tenantId: string,
    userId: string,
    options?: {
      limit?: number;
      before?: string;
      after?: string;
    },
  ): Promise<TeamMessage[]> {
    // Check if user is member
    const hasPermission = await this.checkPermission(
      conversationId,
      tenantId,
      userId,
      'read',
    );

    if (!hasPermission) {
      throw new Error('Not a member of this conversation');
    }

    const messages = await this.prisma.aITeamMessage.findMany({
      where: {
        conversationId,
        ...(options?.before && { id: { lt: options.before } }),
        ...(options?.after && { id: { gt: options.after } }),
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
    });

    return messages.map(m => this.mapTeamMessageFromDb(m)).reverse();
  }

  async addReaction(
    messageId: string,
    tenantId: string,
    userId: string,
    emoji: string,
  ): Promise<void> {
    const message = await this.prisma.aITeamMessage.findFirst({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message || message.conversation.tenantId !== tenantId) {
      throw new Error('Message not found');
    }

    // Check if user is member
    const hasPermission = await this.checkPermission(
      message.conversationId,
      tenantId,
      userId,
      'read',
    );

    if (!hasPermission) {
      throw new Error('Not a member');
    }

    const reactions = (message.reactions as any[]) || [];
    const existingIndex = reactions.findIndex(
      r => r.userId === userId && r.emoji === emoji,
    );

    if (existingIndex >= 0) {
      // Remove reaction (toggle)
      reactions.splice(existingIndex, 1);
    } else {
      // Add reaction
      reactions.push({
        emoji,
        userId,
        timestamp: new Date(),
      });
    }

    await this.prisma.aITeamMessage.update({
      where: { id: messageId },
      data: { reactions: reactions as any },
    });
  }

  // ==================== AI IN TEAM CHAT ====================

  async sendAIResponse(
    conversationId: string,
    content: string,
    options?: {
      replyTo?: string;
      mentions?: string[];
    },
  ): Promise<TeamMessage> {
    const message = await this.prisma.aITeamMessage.create({
      data: {
        conversationId,
        userId: 'ai-assistant',
        role: 'assistant',
        content,
        replyTo: options?.replyTo,
        mentions: options?.mentions,
      },
    });

    // Update conversation timestamp
    await this.prisma.aITeamConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return this.mapTeamMessageFromDb(message);
  }

  async processAITeamCommand(
    conversationId: string,
    tenantId: string,
    command: string,
    context: {
      mentionedBy: string;
      conversationHistory: TeamMessage[];
    },
  ): Promise<string> {
    // AI processes the command in team context
    // Can use conversation history for better context

    this.logger.log(`Processing AI team command: ${command}`);

    // Generate team-aware response
    const response = `Ekibe özel yanıt: ${command}`;

    await this.sendAIResponse(conversationId, response, {
      replyTo: context.conversationHistory[context.conversationHistory.length - 1]?.id,
    });

    return response;
  }

  // ==================== MENTIONS & NOTIFICATIONS ====================

  private async createMention(
    conversationId: string,
    userId: string,
    mentionedBy: string,
    messageId: string,
  ): Promise<void> {
    // In a real implementation, this would create a notification
    // and potentially send real-time notification via WebSocket
    this.logger.debug(`Mention created: ${userId} mentioned by ${mentionedBy}`);
  }

  async getUnreadMentions(
    userId: string,
    tenantId: string,
  ): Promise<Array<{
    conversationId: string;
    messageId: string;
    mentionedBy: string;
    content: string;
    timestamp: Date;
  }>> {
    // Get messages where user is mentioned and hasn't read
    const messages = await this.prisma.aITeamMessage.findMany({
      where: {
        conversation: { tenantId },
        mentions: {
          has: userId,
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      include: { conversation: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return messages.map(m => ({
      conversationId: m.conversationId,
      messageId: m.id,
      mentionedBy: m.userId,
      content: m.content.substring(0, 100),
      timestamp: m.createdAt,
    }));
  }

  // ==================== HELPER METHODS ====================

  private async checkPermission(
    conversationId: string,
    tenantId: string,
    userId: string,
    permission: string,
  ): Promise<boolean> {
    const conversation = await this.prisma.aITeamConversation.findFirst({
      where: { id: conversationId, tenantId },
    });

    if (!conversation) return false;

    const members = conversation.members as any[];
    const member = members.find(m => m.userId === userId);

    if (!member) return false;

    return member.permissions.includes(permission) || member.role === 'owner';
  }

  private getDefaultPermissions(role: string): string[] {
    switch (role) {
      case 'owner':
        return ['read', 'write', 'manage', 'delete'];
      case 'admin':
        return ['read', 'write', 'manage'];
      case 'member':
        return ['read', 'write'];
      case 'viewer':
        return ['read'];
      default:
        return ['read'];
    }
  }

  private mapTeamConversationFromDb(conversation: any): TeamConversation {
    return {
      id: conversation.id,
      tenantId: conversation.tenantId,
      name: conversation.name,
      description: conversation.description || undefined,
      members: conversation.members as TeamMember[],
      createdBy: conversation.createdBy,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      isActive: conversation.isActive,
      settings: conversation.settings as TeamConversation['settings'],
    };
  }

  private mapTeamMessageFromDb(message: any): TeamMessage {
    return {
      id: message.id,
      conversationId: message.conversationId,
      userId: message.userId,
      role: message.role as 'user' | 'assistant',
      content: message.content,
      timestamp: message.createdAt,
      mentions: message.mentions,
      replyTo: message.replyTo || undefined,
      reactions: message.reactions as any[] || [],
    };
  }
}
