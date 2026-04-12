/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface LearningEvent {
  type:
    | 'action_completed'
    | 'action_rejected'
    | 'preference_explicit'
    | 'pattern_detected'
    | 'error_occurred'
    | 'success_achieved';
  data: any;
  context?: any;
}

export interface UserPreference {
  category: string;
  key: string;
  value: any;
  confidence: number;
  learnedFrom: 'explicit' | 'implicit' | 'inferred';
}

export interface DetectedPattern {
  patternType: 'workflow' | 'timing' | 'sequence' | 'error_pattern';
  patternName: string;
  trigger: string;
  action: string;
  occurrenceCount: number;
  successRate: number;
}

@Injectable()
export class AILearningService {
  private readonly logger = new Logger(AILearningService.name);

  constructor(private prisma: PrismaService) {}

  // ==================== PREFERENCE LEARNING ====================

  async learnPreference(
    tenantId: string,
    userId: string,
    preference: UserPreference,
  ): Promise<void> {
    const existing = await this.prisma.aIUserPreference.findUnique({
      where: {
        tenantId_userId_category_key: {
          tenantId,
          userId,
          category: preference.category,
          key: preference.key,
        },
      },
    });

    if (existing) {
      // Reinforce existing preference
      const newConfidence = Math.min(
        (existing.confidence * existing.learnCount + preference.confidence) /
          (existing.learnCount + 1),
        1.0,
      );

      await this.prisma.aIUserPreference.update({
        where: { id: existing.id },
        data: {
          value: preference.value,
          confidence: newConfidence,
          learnCount: existing.learnCount + 1,
          lastUsedAt: new Date(),
          learnedFrom: preference.learnedFrom,
        },
      });
    } else {
      // Create new preference
      await this.prisma.aIUserPreference.create({
        data: {
          tenantId,
          userId,
          category: preference.category,
          key: preference.key,
          value: preference.value,
          confidence: preference.confidence,
          learnedFrom: preference.learnedFrom,
        },
      });
    }

    this.logger.debug(
      `Learned preference: ${preference.category}.${preference.key} for user ${userId}`,
    );
  }

  async getPreference(
    tenantId: string,
    userId: string,
    category: string,
    key: string,
  ): Promise<UserPreference | null> {
    const pref = await this.prisma.aIUserPreference.findUnique({
      where: {
        tenantId_userId_category_key: {
          tenantId,
          userId,
          category,
          key,
        },
      },
    });

    if (!pref) return null;

    return {
      category: pref.category,
      key: pref.key,
      value: pref.value,
      confidence: pref.confidence,
      learnedFrom: pref.learnedFrom as 'explicit' | 'implicit' | 'inferred',
    };
  }

  async getPreferencesByCategory(
    tenantId: string,
    userId: string,
    category: string,
  ): Promise<UserPreference[]> {
    const prefs = await this.prisma.aIUserPreference.findMany({
      where: {
        tenantId,
        userId,
        category,
      },
      orderBy: { confidence: 'desc' },
    });

    return prefs.map((p) => ({
      category: p.category,
      key: p.key,
      value: p.value,
      confidence: p.confidence,
      learnedFrom: p.learnedFrom as 'explicit' | 'implicit' | 'inferred',
    }));
  }

  // ==================== EVENT PROCESSING ====================

  async processEvent(
    tenantId: string,
    userId: string,
    event: LearningEvent,
  ): Promise<void> {
    // Log the event
    await this.prisma.aILearningLog.create({
      data: {
        tenantId,
        userId,
        eventType: event.type,
        eventData: event.data,
        insight: this.generateInsight(event),
        impactScore: this.calculateImpactScore(event),
      },
    });

    // Process based on event type
    switch (event.type) {
      case 'action_completed':
        await this.handleActionCompleted(tenantId, userId, event);
        break;
      case 'action_rejected':
        await this.handleActionRejected(tenantId, userId, event);
        break;
      case 'preference_explicit':
        await this.handleExplicitPreference(tenantId, userId, event);
        break;
      case 'pattern_detected':
        await this.handlePatternDetected(tenantId, userId, event);
        break;
      case 'error_occurred':
        await this.handleErrorOccurred(tenantId, userId, event);
        break;
      case 'success_achieved':
        await this.handleSuccessAchieved(tenantId, userId, event);
        break;
    }
  }

  private async handleActionCompleted(
    tenantId: string,
    userId: string,
    event: LearningEvent,
  ): Promise<void> {
    const { actionType, platform, success = true } = event.data;

    // Learn platform preference
    if (platform && success) {
      await this.learnPreference(tenantId, userId, {
        category: 'platforms',
        key: 'preferred_platform',
        value: platform,
        confidence: 0.3,
        learnedFrom: 'implicit',
      });
    }

    // Learn action preference
    if (actionType) {
      await this.learnPreference(tenantId, userId, {
        category: 'actions',
        key: `freq_${actionType}`,
        value: (event.data.previousCount || 0) + 1,
        confidence: 0.4,
        learnedFrom: 'implicit',
      });
    }
  }

  private async handleActionRejected(
    tenantId: string,
    userId: string,
    event: LearningEvent,
  ): Promise<void> {
    // Learn what the user doesn't like
    const { suggestedAction, userCorrection } = event.data;

    if (userCorrection) {
      await this.learnPreference(tenantId, userId, {
        category: 'corrections',
        key: suggestedAction,
        value: userCorrection,
        confidence: 0.8,
        learnedFrom: 'explicit',
      });
    }

    // Decrease confidence for the rejected action
    const existingPref = await this.getPreference(
      tenantId,
      userId,
      'actions',
      `freq_${suggestedAction}`,
    );
    if (existingPref) {
      await this.learnPreference(tenantId, userId, {
        category: 'actions',
        key: `freq_${suggestedAction}`,
        value: existingPref.value,
        confidence: existingPref.confidence * 0.8,
        learnedFrom: 'implicit',
      });
    }
  }

  private async handleExplicitPreference(
    tenantId: string,
    userId: string,
    event: LearningEvent,
  ): Promise<void> {
    const { category, key, value } = event.data;

    await this.learnPreference(tenantId, userId, {
      category,
      key,
      value,
      confidence: 0.95,
      learnedFrom: 'explicit',
    });
  }

  private async handlePatternDetected(
    tenantId: string,
    userId: string,
    event: LearningEvent,
  ): Promise<void> {
    const { patternType, trigger, action, conditions } = event.data;

    // Check if pattern already exists
    const existing = await this.prisma.aIPatternRecognition.findFirst({
      where: {
        tenantId,
        userId,
        patternType,
        trigger,
        action,
      },
    });

    if (existing) {
      // Reinforce pattern
      await this.prisma.aIPatternRecognition.update({
        where: { id: existing.id },
        data: {
          occurrenceCount: existing.occurrenceCount + 1,
          confidence: Math.min(existing.confidence + 0.05, 1.0),
          lastTriggeredAt: new Date(),
        },
      });
    } else {
      // Create new pattern
      await this.prisma.aIPatternRecognition.create({
        data: {
          tenantId,
          userId,
          patternType,
          patternName: `${patternType}: ${trigger} → ${action}`,
          trigger,
          action,
          conditions,
          occurrenceCount: 1,
          confidence: 0.5,
        },
      });
    }
  }

  private async handleErrorOccurred(
    tenantId: string,
    userId: string,
    event: LearningEvent,
  ): Promise<void> {
    const { errorType, errorMessage, actionBeingPerformed } = event.data;

    // Learn error patterns
    await this.learnPreference(tenantId, userId, {
      category: 'error_patterns',
      key: errorType,
      value: {
        message: errorMessage,
        action: actionBeingPerformed,
        count: (event.data.previousCount || 0) + 1,
      },
      confidence: 0.6,
      learnedFrom: 'inferred',
    });
  }

  private async handleSuccessAchieved(
    tenantId: string,
    userId: string,
    event: LearningEvent,
  ): Promise<void> {
    const { goalType, methodUsed, timeTaken } = event.data;

    // Learn successful methods
    await this.learnPreference(tenantId, userId, {
      category: 'success_methods',
      key: goalType,
      value: {
        method: methodUsed,
        time: timeTaken,
        timestamp: new Date(),
      },
      confidence: 0.7,
      learnedFrom: 'implicit',
    });
  }

  // ==================== PATTERN RECOGNITION ====================

  async detectPatterns(
    tenantId: string,
    userId: string,
  ): Promise<DetectedPattern[]> {
    // Get recent learning logs
    const logs = await this.prisma.aILearningLog.findMany({
      where: {
        tenantId,
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const patterns: DetectedPattern[] = [];

    // Detect sequence patterns (Action A usually followed by Action B)
    const actionSequences = this.findSequences(logs, 'action_completed');
    for (const seq of actionSequences) {
      if (seq.count >= 3) {
        // Minimum 3 occurrences
        patterns.push({
          patternType: 'sequence',
          patternName: `Sequence: ${seq.from} → ${seq.to}`,
          trigger: seq.from,
          action: seq.to,
          occurrenceCount: seq.count,
          successRate: seq.successRate,
        });
      }
    }

    // Detect timing patterns (User usually does X at Y time)
    const timingPatterns = this.findTimingPatterns(logs);
    for (const timing of timingPatterns) {
      if (timing.count >= 3) {
        patterns.push({
          patternType: 'timing',
          patternName: `Timing: ${timing.action} at ${timing.timeWindow}`,
          trigger: timing.timeWindow,
          action: timing.action,
          occurrenceCount: timing.count,
          successRate: 1.0,
        });
      }
    }

    return patterns;
  }

  private findSequences(
    logs: any[],
    eventType: string,
  ): Array<{ from: string; to: string; count: number; successRate: number }> {
    const sequences: Record<string, { count: number; successes: number }> = {};

    for (let i = 0; i < logs.length - 1; i++) {
      if (
        logs[i].eventType === eventType &&
        logs[i + 1].eventType === eventType
      ) {
        const from = logs[i].eventData?.actionType;
        const to = logs[i + 1].eventData?.actionType;

        if (from && to) {
          const key = `${from}→${to}`;
          if (!sequences[key]) {
            sequences[key] = { count: 0, successes: 0 };
          }
          sequences[key].count++;
          if (logs[i + 1].eventData?.success) {
            sequences[key].successes++;
          }
        }
      }
    }

    return Object.entries(sequences).map(([key, data]) => {
      const [from, to] = key.split('→');
      return {
        from,
        to,
        count: data.count,
        successRate: data.count > 0 ? data.successes / data.count : 0,
      };
    });
  }

  private findTimingPatterns(
    logs: any[],
  ): Array<{ action: string; timeWindow: string; count: number }> {
    const patterns: Record<string, number> = {};

    for (const log of logs) {
      if (log.eventType === 'action_completed') {
        const action = log.eventData?.actionType;
        const hour = new Date(log.createdAt).getHours();
        const timeWindow = `${hour}:00-${hour + 1}:00`;
        const key = `${action}@${timeWindow}`;

        patterns[key] = (patterns[key] || 0) + 1;
      }
    }

    return Object.entries(patterns).map(([key, count]) => {
      const [action, timeWindow] = key.split('@');
      return { action, timeWindow, count };
    });
  }

  // ==================== INSIGHT GENERATION ====================

  private generateInsight(event: LearningEvent): string {
    switch (event.type) {
      case 'action_completed':
        return `User completed ${event.data.actionType} successfully`;
      case 'action_rejected':
        return `User rejected ${event.data.suggestedAction}`;
      case 'preference_explicit':
        return `User explicitly set ${event.data.category}.${event.data.key} = ${JSON.stringify(event.data.value)}`;
      case 'pattern_detected':
        return `Pattern detected: ${event.data.patternType}`;
      case 'error_occurred':
        return `Error occurred during ${event.data.actionBeingPerformed}: ${event.data.errorType}`;
      case 'success_achieved':
        return `Success achieved: ${event.data.goalType}`;
      default:
        return 'Event processed';
    }
  }

  private calculateImpactScore(event: LearningEvent): number {
    switch (event.type) {
      case 'preference_explicit':
        return 1.0;
      case 'action_rejected':
        return 0.8;
      case 'error_occurred':
        return 0.7;
      case 'pattern_detected':
        return 0.6;
      case 'success_achieved':
        return 0.5;
      case 'action_completed':
        return 0.3;
      default:
        return 0.3;
    }
  }

  // ==================== FEEDBACK PROCESSING ====================

  async recordFeedback(
    tenantId: string,
    userId: string,
    feedback: {
      actionType: string;
      actionData: any;
      feedbackType: 'positive' | 'negative' | 'correction' | 'ignore';
      feedbackText?: string;
      correction?: any;
    },
  ): Promise<void> {
    await this.prisma.aIFeedbackLoop.create({
      data: {
        tenantId,
        userId,
        actionType: feedback.actionType,
        actionData: feedback.actionData,
        feedbackType: feedback.feedbackType,
        feedbackText: feedback.feedbackText,
        correction: feedback.correction,
        wasHelpful: feedback.feedbackType === 'positive',
      },
    });

    // Process negative feedback
    if (
      feedback.feedbackType === 'negative' ||
      feedback.feedbackType === 'correction'
    ) {
      await this.processEvent(tenantId, userId, {
        type: 'action_rejected',
        data: {
          suggestedAction: feedback.actionType,
          userCorrection: feedback.correction,
        },
      });
    }
  }

  async getRecentFeedback(
    tenantId: string,
    userId: string,
    limit = 10,
  ): Promise<any[]> {
    return this.prisma.aIFeedbackLoop.findMany({
      where: {
        tenantId,
        userId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async processUnprocessedFeedback(): Promise<number> {
    const unprocessed = await this.prisma.aIFeedbackLoop.findMany({
      where: {
        isProcessed: false,
      },
      take: 100,
    });

    for (const feedback of unprocessed) {
      // Learn from feedback
      await this.processEvent(feedback.tenantId, feedback.userId, {
        type:
          feedback.feedbackType === 'positive'
            ? 'action_completed'
            : 'action_rejected',
        data: {
          actionType: feedback.actionType,
          success: feedback.feedbackType === 'positive',
        },
      });

      // Mark as processed
      await this.prisma.aIFeedbackLoop.update({
        where: { id: feedback.id },
        data: {
          isProcessed: true,
          processedAt: new Date(),
        },
      });
    }

    return unprocessed.length;
  }
}
