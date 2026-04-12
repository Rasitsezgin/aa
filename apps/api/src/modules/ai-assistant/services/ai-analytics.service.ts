/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface AIAnalyticsDashboard {
  usage: UsageStats;
  performance: PerformanceStats;
  insights: UserInsights;
  trends: TrendData;
  platforms: PlatformStats;
}

export interface UsageStats {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  activeUsers: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  sessionDuration: {
    avg: number;
    min: number;
    max: number;
  };
}

export interface PerformanceStats {
  intentAccuracy: number;
  actionSuccessRate: number;
  avgResponseTime: number;
  userSatisfaction: number;
  errorRate: number;
  aiConfidence: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface UserInsights {
  topCommands: Array<{
    command: string;
    count: number;
    percentage: number;
  }>;
  preferredPlatforms: Array<{
    platform: string;
    usage: number;
    percentage: number;
  }>;
  peakHours: Array<{
    hour: number;
    activity: number;
  }>;
  commonPatterns: Array<{
    pattern: string;
    occurrences: number;
    confidence: number;
  }>;
}

export interface TrendData {
  daily: Array<{
    date: string;
    conversations: number;
    messages: number;
    actions: number;
  }>;
  hourly: Array<{
    hour: number;
    activity: number;
  }>;
  weekly: Array<{
    week: string;
    usage: number;
  }>;
}

export interface PlatformStats {
  syncStats: Array<{
    platform: string;
    totalJobs: number;
    successRate: number;
    avgDuration: number;
    lastSync: Date;
  }>;
  uploadStats: Array<{
    platform: string;
    totalUploads: number;
    avgProcessingTime: number;
    successRate: number;
  }>;
}

@Injectable()
export class AIAnalyticsService {
  private readonly logger = new Logger(AIAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  // ==================== MAIN DASHBOARD ====================

  async getDashboard(
    tenantId: string,
    period: 'day' | 'week' | 'month' = 'week',
  ): Promise<AIAnalyticsDashboard> {
    const [usage, performance, insights, trends, platforms] = await Promise.all(
      [
        this.getUsageStats(tenantId, period),
        this.getPerformanceStats(tenantId, period),
        this.getUserInsights(tenantId, period),
        this.getTrendData(tenantId, period),
        this.getPlatformStats(tenantId, period),
      ],
    );

    return {
      usage,
      performance,
      insights,
      trends,
      platforms,
    };
  }

  // ==================== USAGE STATISTICS ====================

  async getUsageStats(tenantId: string, period: string): Promise<UsageStats> {
    const periodDays = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const [
      totalConversations,
      totalMessages,
      activeUsers,
      dailyUsers,
      weeklyUsers,
      monthlyUsers,
    ] = await Promise.all([
      this.prisma.aIAssistantConversation.count({
        where: { tenantId, createdAt: { gte: startDate } },
      }),
      this.prisma.aIAssistantMessage.count({
        where: { tenantId, createdAt: { gte: startDate } },
      }),
      this.getUniqueUserCount(tenantId, startDate),
      this.getUniqueUserCount(
        tenantId,
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      ),
      this.getUniqueUserCount(
        tenantId,
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      ),
      this.getUniqueUserCount(
        tenantId,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      ),
    ]);

    // Calculate session duration
    const sessions = await this.prisma.aIAssistantConversation.findMany({
      where: { tenantId, createdAt: { gte: startDate } },
      select: { createdAt: true, updatedAt: true },
    });

    const sessionDurations = sessions.map(
      (s) => new Date(s.updatedAt).getTime() - new Date(s.createdAt).getTime(),
    );

    const avgDuration =
      sessionDurations.length > 0
        ? sessionDurations.reduce((a, b) => a + b, 0) /
          sessionDurations.length /
          1000 /
          60 // minutes
        : 0;

    return {
      totalConversations,
      totalMessages,
      avgMessagesPerConversation:
        totalConversations > 0 ? totalMessages / totalConversations : 0,
      activeUsers,
      dailyActiveUsers: dailyUsers,
      weeklyActiveUsers: weeklyUsers,
      monthlyActiveUsers: monthlyUsers,
      sessionDuration: {
        avg: avgDuration,
        min:
          sessionDurations.length > 0
            ? Math.min(...sessionDurations) / 1000 / 60
            : 0,
        max:
          sessionDurations.length > 0
            ? Math.max(...sessionDurations) / 1000 / 60
            : 0,
      },
    };
  }

  private async getUniqueUserCount(
    tenantId: string,
    since: Date,
  ): Promise<number> {
    const result = await this.prisma.aIAssistantConversation.groupBy({
      by: ['userId'],
      where: {
        tenantId,
        createdAt: { gte: since },
      },
      _count: true,
    });
    return result.length;
  }

  // ==================== PERFORMANCE STATISTICS ====================

  async getPerformanceStats(
    tenantId: string,
    period: string,
  ): Promise<PerformanceStats> {
    const periodDays = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Get sync jobs stats
    const syncJobs = await this.prisma.aIAssistantSyncJob.findMany({
      where: { tenantId, createdAt: { gte: startDate } },
    });

    const successJobs = syncJobs.filter((j) => j.status === 'COMPLETED');
    const failedJobs = syncJobs.filter((j) => j.status === 'FAILED');

    // Get intent accuracy from learning logs
    const intentLogs = await this.prisma.aILearningLog.findMany({
      where: {
        tenantId,
        eventType: 'intent_detected',
        createdAt: { gte: startDate },
      },
    });

    const highConfidenceIntents = intentLogs.filter(
      (l) => (l.eventData as any)?.confidence > 0.7,
    );

    // Get feedback for satisfaction
    const feedback = await this.prisma.aIFeedbackLoop.findMany({
      where: {
        tenantId,
        createdAt: { gte: startDate },
      },
    });

    const positiveFeedback = feedback.filter((f) => f.wasHelpful === true);

    return {
      intentAccuracy:
        intentLogs.length > 0
          ? highConfidenceIntents.length / intentLogs.length
          : 0,
      actionSuccessRate:
        syncJobs.length > 0 ? successJobs.length / syncJobs.length : 0,
      avgResponseTime: await this.calculateAvgResponseTime(tenantId, startDate),
      userSatisfaction:
        feedback.length > 0 ? positiveFeedback.length / feedback.length : 0,
      errorRate: syncJobs.length > 0 ? failedJobs.length / syncJobs.length : 0,
      aiConfidence: {
        high: intentLogs.filter((l) => (l.eventData as any)?.confidence > 0.8)
          .length,
        medium: intentLogs.filter((l) => {
          const c = (l.eventData as any)?.confidence;
          return c > 0.5 && c <= 0.8;
        }).length,
        low: intentLogs.filter((l) => (l.eventData as any)?.confidence <= 0.5)
          .length,
      },
    };
  }

  private async calculateAvgResponseTime(
    tenantId: string,
    since: Date,
  ): Promise<number> {
    const conversations = await this.prisma.aIAssistantConversation.findMany({
      where: { tenantId, createdAt: { gte: since } },
      include: { messages: true },
    });

    let totalResponseTime = 0;
    let responseCount = 0;

    for (const conv of conversations) {
      for (let i = 1; i < conv.messages.length; i++) {
        const prev = conv.messages[i - 1];
        const curr = conv.messages[i];

        if (prev.role === 'user' && curr.role === 'assistant') {
          const responseTime =
            new Date(curr.createdAt).getTime() -
            new Date(prev.createdAt).getTime();
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    }

    return responseCount > 0 ? totalResponseTime / responseCount / 1000 : 0; // seconds
  }

  // ==================== USER INSIGHTS ====================

  async getUserInsights(
    tenantId: string,
    period: string,
  ): Promise<UserInsights> {
    const periodDays = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const [topCommands, preferredPlatforms, peakHours, commonPatterns] =
      await Promise.all([
        this.getTopCommands(tenantId, startDate),
        this.getPreferredPlatforms(tenantId, startDate),
        this.getPeakHours(tenantId, startDate),
        this.getCommonPatterns(tenantId, startDate),
      ]);

    return {
      topCommands,
      preferredPlatforms,
      peakHours,
      commonPatterns,
    };
  }

  private async getTopCommands(tenantId: string, since: Date) {
    const logs = await this.prisma.aILearningLog.findMany({
      where: {
        tenantId,
        eventType: 'action_completed',
        createdAt: { gte: since },
      },
    });

    const commandCounts: Record<string, number> = {};
    for (const log of logs) {
      const actionType = (log.eventData as any)?.actionType || 'unknown';
      commandCounts[actionType] = (commandCounts[actionType] || 0) + 1;
    }

    const total = Object.values(commandCounts).reduce((a, b) => a + b, 0);

    return Object.entries(commandCounts)
      .map(([command, count]) => ({
        command,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private async getPreferredPlatforms(tenantId: string, since: Date) {
    const jobs = await this.prisma.aIAssistantSyncJob.findMany({
      where: {
        tenantId,
        createdAt: { gte: since },
      },
    });

    const platformCounts: Record<string, number> = {};
    for (const job of jobs) {
      platformCounts[job.platform] = (platformCounts[job.platform] || 0) + 1;
    }

    const total = Object.values(platformCounts).reduce((a, b) => a + b, 0);

    return Object.entries(platformCounts)
      .map(([platform, usage]) => ({
        platform,
        usage,
        percentage: total > 0 ? (usage / total) * 100 : 0,
      }))
      .sort((a, b) => b.usage - a.usage);
  }

  private async getPeakHours(tenantId: string, since: Date) {
    const messages = await this.prisma.aIAssistantMessage.findMany({
      where: {
        tenantId,
        createdAt: { gte: since },
      },
      select: { createdAt: true },
    });

    const hourlyActivity: Record<number, number> = {};
    for (const msg of messages) {
      const hour = new Date(msg.createdAt).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    }

    return Object.entries(hourlyActivity)
      .map(([hour, activity]) => ({
        hour: parseInt(hour),
        activity,
      }))
      .sort((a, b) => a.hour - b.hour);
  }

  private async getCommonPatterns(tenantId: string, since: Date) {
    const patterns = await this.prisma.aIPatternRecognition.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: [{ occurrenceCount: 'desc' }, { confidence: 'desc' }],
      take: 10,
    });

    return patterns.map((p) => ({
      pattern: p.patternName,
      occurrences: p.occurrenceCount,
      confidence: p.confidence,
    }));
  }

  // ==================== TREND DATA ====================

  async getTrendData(tenantId: string, period: string): Promise<TrendData> {
    const [daily, hourly, weekly] = await Promise.all([
      this.getDailyTrends(tenantId, period),
      this.getHourlyTrends(tenantId),
      this.getWeeklyTrends(tenantId),
    ]);

    return {
      daily,
      hourly,
      weekly,
    };
  }

  private async getDailyTrends(tenantId: string, period: string) {
    const days = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const conversations = await this.prisma.aIAssistantConversation.findMany({
      where: { tenantId, createdAt: { gte: startDate } },
      include: { messages: true },
    });

    const dailyStats: Record<
      string,
      { conversations: number; messages: number; actions: number }
    > = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats[dateStr] = { conversations: 0, messages: 0, actions: 0 };
    }

    for (const conv of conversations) {
      const dateStr = new Date(conv.createdAt).toISOString().split('T')[0];
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].conversations++;
        dailyStats[dateStr].messages += conv.messages.length;
      }
    }

    return Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getHourlyTrends(tenantId: string) {
    const messages = await this.prisma.aIAssistantMessage.findMany({
      where: {
        tenantId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
    });

    const hourlyStats: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourlyStats[i] = 0;
    }

    for (const msg of messages) {
      const hour = new Date(msg.createdAt).getHours();
      hourlyStats[hour]++;
    }

    return Object.entries(hourlyStats).map(([hour, activity]) => ({
      hour: parseInt(hour),
      activity,
    }));
  }

  private async getWeeklyTrends(tenantId: string) {
    const startDate = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000); // 12 weeks

    const conversations = await this.prisma.aIAssistantConversation.findMany({
      where: { tenantId, createdAt: { gte: startDate } },
    });

    const weeklyStats: Record<string, number> = {};

    for (const conv of conversations) {
      const date = new Date(conv.createdAt);
      const weekKey = `${date.getFullYear()}-W${this.getWeekNumber(date)}`;
      weeklyStats[weekKey] = (weeklyStats[weekKey] || 0) + 1;
    }

    return Object.entries(weeklyStats)
      .map(([week, usage]) => ({ week, usage }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  // ==================== PLATFORM STATISTICS ====================

  async getPlatformStats(
    tenantId: string,
    period: string,
  ): Promise<PlatformStats> {
    const periodDays = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const [syncStats, uploadStats] = await Promise.all([
      this.getSyncStats(tenantId, startDate),
      this.getUploadStats(tenantId, startDate),
    ]);

    return {
      syncStats,
      uploadStats,
    };
  }

  private async getSyncStats(tenantId: string, since: Date) {
    const jobs = await this.prisma.aIAssistantSyncJob.findMany({
      where: {
        tenantId,
        createdAt: { gte: since },
      },
    });

    const platformGroups: Record<string, typeof jobs> = {};
    for (const job of jobs) {
      if (!platformGroups[job.platform]) {
        platformGroups[job.platform] = [];
      }
      platformGroups[job.platform].push(job);
    }

    return Object.entries(platformGroups).map(([platform, platformJobs]) => {
      const successJobs = platformJobs.filter((j) => j.status === 'COMPLETED');
      const avgDuration =
        platformJobs.length > 0
          ? platformJobs.reduce((sum, j) => {
              if (j.completedAt && j.startedAt) {
                return (
                  sum +
                  (new Date(j.completedAt).getTime() -
                    new Date(j.startedAt).getTime())
                );
              }
              return sum;
            }, 0) /
            platformJobs.length /
            1000 /
            60 // minutes
          : 0;

      return {
        platform,
        totalJobs: platformJobs.length,
        successRate:
          platformJobs.length > 0
            ? successJobs.length / platformJobs.length
            : 0,
        avgDuration,
        lastSync:
          platformJobs.length > 0
            ? new Date(
                Math.max(
                  ...platformJobs.map((j) => new Date(j.createdAt).getTime()),
                ),
              )
            : new Date(),
      };
    });
  }

  private async getUploadStats(tenantId: string, since: Date) {
    const jobs = await this.prisma.aIAssistantSyncJob.findMany({
      where: {
        tenantId,
        type: 'PRODUCT_UPLOAD',
        createdAt: { gte: since },
      },
    });

    const platformGroups: Record<string, typeof jobs> = {};
    for (const job of jobs) {
      if (!platformGroups[job.platform]) {
        platformGroups[job.platform] = [];
      }
      platformGroups[job.platform].push(job);
    }

    return Object.entries(platformGroups).map(([platform, platformJobs]) => {
      const successJobs = platformJobs.filter((j) => j.status === 'COMPLETED');
      const avgProcessingTime =
        platformJobs.length > 0
          ? platformJobs.reduce((sum, j) => {
              if (j.completedAt && j.startedAt) {
                return (
                  sum +
                  (new Date(j.completedAt).getTime() -
                    new Date(j.startedAt).getTime())
                );
              }
              return sum;
            }, 0) /
            platformJobs.length /
            1000
          : 0;

      return {
        platform,
        totalUploads: platformJobs.length,
        avgProcessingTime,
        successRate:
          platformJobs.length > 0
            ? successJobs.length / platformJobs.length
            : 0,
      };
    });
  }

  // ==================== USER-SPECIFIC ANALYTICS ====================

  async getUserAnalytics(tenantId: string, userId: string): Promise<any> {
    const [conversations, messages, actions, patterns] = await Promise.all([
      this.prisma.aIAssistantConversation.count({
        where: { tenantId, userId },
      }),
      this.prisma.aIAssistantMessage.count({
        where: {
          conversation: { tenantId, userId },
        },
      }),
      this.prisma.aIAssistantSyncJob.count({
        where: { tenantId, userId },
      }),
      this.prisma.aIPatternRecognition.findMany({
        where: { tenantId, userId, isActive: true },
        orderBy: { confidence: 'desc' },
        take: 5,
      }),
    ]);

    const recentConversations =
      await this.prisma.aIAssistantConversation.findMany({
        where: { tenantId, userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
      });

    return {
      overview: {
        totalConversations: conversations,
        totalMessages: messages,
        totalActions: actions,
        avgMessagesPerConversation:
          conversations > 0 ? messages / conversations : 0,
      },
      recentActivity: recentConversations,
      patterns: patterns.map((p) => ({
        name: p.patternName,
        confidence: p.confidence,
        occurrences: p.occurrenceCount,
      })),
    };
  }

  // ==================== EXPORT DATA ====================

  async exportAnalytics(
    tenantId: string,
    format: 'json' | 'csv' = 'json',
  ): Promise<any> {
    const dashboard = await this.getDashboard(tenantId, 'month');

    if (format === 'csv') {
      // Convert to CSV format
      return this.convertToCSV(dashboard);
    }

    return dashboard;
  }

  private convertToCSV(dashboard: AIAnalyticsDashboard): string {
    // Simple CSV conversion for usage stats
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Conversations', dashboard.usage.totalConversations.toString()],
      ['Total Messages', dashboard.usage.totalMessages.toString()],
      ['Active Users', dashboard.usage.activeUsers.toString()],
      [
        'Intent Accuracy',
        `${(dashboard.performance.intentAccuracy * 100).toFixed(2)}%`,
      ],
      [
        'Success Rate',
        `${(dashboard.performance.actionSuccessRate * 100).toFixed(2)}%`,
      ],
    ];

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
