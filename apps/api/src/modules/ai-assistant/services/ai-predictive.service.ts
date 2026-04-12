/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AILearningService } from './ai-learning.service';
import { AIContextMemoryService } from './ai-context-memory.service';

export interface PredictiveSuggestion {
  id?: string;
  type:
    | 'next_action'
    | 'optimization'
    | 'alert'
    | 'reminder'
    | 'learning_opportunity';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  suggestedAction?: {
    type: string;
    payload: any;
  };
  context?: any;
  validUntil?: Date;
}

export interface UserBehaviorPrediction {
  likelyNextActions: Array<{
    action: string;
    probability: number;
    context: any;
  }>;
  optimalTiming: {
    bestTime: string;
    reason: string;
  };
  potentialIssues: Array<{
    issue: string;
    probability: number;
    prevention: string;
  }>;
}

@Injectable()
export class AIPredictiveService {
  private readonly logger = new Logger(AIPredictiveService.name);

  constructor(
    private prisma: PrismaService,
    private learningService: AILearningService,
    private contextMemory: AIContextMemoryService,
  ) {}

  // ==================== NEXT ACTION PREDICTION ====================

  async predictNextActions(
    tenantId: string,
    userId: string,
    currentContext?: any,
  ): Promise<PredictiveSuggestion[]> {
    const suggestions: PredictiveSuggestion[] = [];

    // Get user patterns
    const patterns = await this.prisma.aIPatternRecognition.findMany({
      where: {
        tenantId,
        userId,
        isActive: true,
        confidence: { gte: 0.6 },
      },
      orderBy: [{ confidence: 'desc' }, { occurrenceCount: 'desc' }],
      take: 10,
    });

    // Get recent context
    const context =
      currentContext ||
      (await this.contextMemory.buildContextSnapshot(tenantId, userId));

    // Get pending workflows
    const pendingWorkflows = await this.contextMemory.getMemoriesByType(
      tenantId,
      userId,
      'workflow_state',
      5,
    );

    // Suggestion 1: Continue pending workflows
    for (const workflow of pendingWorkflows) {
      if (workflow.value?.status === 'active') {
        suggestions.push({
          type: 'next_action',
          title: 'Devam Eden İşlem',
          description: `"${workflow.value.type}" işlemine kaldığınız yerden devam edin`,
          confidence: 0.85,
          priority: 'high',
          suggestedAction: {
            type: 'resume_workflow',
            payload: { workflowId: workflow.key },
          },
          context: workflow.value,
        });
      }
    }

    // Suggestion 2: Pattern-based next actions
    for (const pattern of patterns.slice(0, 3)) {
      // Check if trigger condition is met
      if (this.checkTriggerCondition(pattern.trigger, context)) {
        suggestions.push({
          type: 'next_action',
          title: 'Önerilen Sonraki Adım',
          description: `Sık kullandığınız bir işlem: ${pattern.patternName}`,
          confidence: pattern.confidence,
          priority: this.calculatePriority(pattern.confidence),
          suggestedAction: {
            type: pattern.action,
            payload: pattern.conditions,
          },
          context: { pattern },
        });
      }
    }

    // Suggestion 3: Time-based suggestions
    const timeSuggestion = await this.generateTimeBasedSuggestion(
      tenantId,
      userId,
    );
    if (timeSuggestion) {
      suggestions.push(timeSuggestion);
    }

    // Suggestion 4: Platform sync suggestions
    const syncSuggestion = await this.generateSyncSuggestion(
      tenantId,
      userId,
      context,
    );
    if (syncSuggestion) {
      suggestions.push(syncSuggestion);
    }

    // Suggestion 5: Optimization opportunities
    const optimizationSuggestion = await this.generateOptimizationSuggestion(
      tenantId,
      userId,
      context,
    );
    if (optimizationSuggestion) {
      suggestions.push(optimizationSuggestion);
    }

    // Sort by confidence and priority
    return this.sortSuggestions(suggestions);
  }

  // ==================== PROACTIVE ALERTS ====================

  async generateProactiveAlerts(
    tenantId: string,
    userId: string,
  ): Promise<PredictiveSuggestion[]> {
    const alerts: PredictiveSuggestion[] = [];

    // Check for sync issues
    const recentFailedJobs = await this.prisma.aIAssistantSyncJob.findMany({
      where: {
        tenantId,
        userId,
        status: 'FAILED',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      take: 5,
    });

    if (recentFailedJobs.length > 0) {
      alerts.push({
        type: 'alert',
        title: 'Senkronizasyon Sorunları Tespit Edildi',
        description: `${recentFailedJobs.length} eşitleme işlemi başarısız oldu. Tekrar denemek ister misiniz?`,
        confidence: 0.9,
        priority: 'high',
        suggestedAction: {
          type: 'retry_failed_syncs',
          payload: { jobIds: recentFailedJobs.map((j) => j.id) },
        },
      });
    }

    // Check for stale data
    const stalePlatforms = await this.findStalePlatforms(tenantId, userId);
    for (const platform of stalePlatforms) {
      alerts.push({
        type: 'reminder',
        title: 'Güncellemeler Bekliyor',
        description: `${platform.name} verileri ${platform.daysSinceSync} gündür güncellenmemiş`,
        confidence: 0.8,
        priority: 'medium',
        suggestedAction: {
          type: 'sync_platform',
          payload: { platform: platform.name },
        },
      });
    }

    // Check for incomplete bulk operations
    const incompleteBulks = await this.findIncompleteBulkOperations(
      tenantId,
      userId,
    );
    for (const bulk of incompleteBulks) {
      alerts.push({
        type: 'alert',
        title: 'Tamamlanmamış Toplu İşlem',
        description: `Toplu ${bulk.type} işlemi %${bulk.progress} tamamlandı`,
        confidence: 0.85,
        priority: 'medium',
        suggestedAction: {
          type: 'continue_bulk',
          payload: { bulkId: bulk.id },
        },
      });
    }

    return alerts;
  }

  // ==================== OPTIMIZATION SUGGESTIONS ====================

  async generateOptimizations(
    tenantId: string,
    userId: string,
  ): Promise<PredictiveSuggestion[]> {
    const optimizations: PredictiveSuggestion[] = [];

    // Analyze user behavior for efficiency improvements
    const recentActions = await this.prisma.aILearningLog.findMany({
      where: {
        tenantId,
        userId,
        eventType: 'action_completed',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    // Detect repetitive manual actions
    const actionCounts: Record<string, number> = {};
    for (const action of recentActions) {
      const actionType = (action.eventData as any)?.actionType;
      if (actionType) {
        actionCounts[actionType] = (actionCounts[actionType] || 0) + 1;
      }
    }

    for (const [actionType, count] of Object.entries(actionCounts)) {
      if (count >= 5) {
        // User does this frequently - suggest automation
        optimizations.push({
          type: 'optimization',
          title: 'Otomasyon Fırsatı',
          description: `"${actionType}" işlemini bu hafta ${count} kez yaptınız. Otomatikleştirmek ister misiniz?`,
          confidence: Math.min(count / 10, 0.95),
          priority: 'medium',
          suggestedAction: {
            type: 'setup_automation',
            payload: { actionType },
          },
        });
      }
    }

    // Suggest bulk operations for repetitive single actions
    const singleUploads = actionCounts['PRODUCT_UPLOAD'] || 0;
    if (singleUploads >= 3) {
      optimizations.push({
        type: 'optimization',
        title: 'Toplu Yükleme Önerisi',
        description:
          'Tek tek ürün yükleme yerine toplu yükleme kullanarak zaman kazanabilirsiniz',
        confidence: 0.8,
        priority: 'low',
        suggestedAction: {
          type: 'show_bulk_upload',
          payload: {},
        },
      });
    }

    return optimizations;
  }

  // ==================== LEARNING OPPORTUNITIES ====================

  async identifyLearningOpportunities(
    tenantId: string,
    userId: string,
  ): Promise<PredictiveSuggestion[]> {
    const opportunities: PredictiveSuggestion[] = [];

    // Check for unused features
    const userPreferences = await this.learningService.getPreferencesByCategory(
      tenantId,
      userId,
      'actions',
    );

    const usedFeatures = userPreferences.map((p) => p.key.replace('freq_', ''));

    // Suggest unused but potentially useful features
    const allFeatures = [
      'BRAND_SYNC',
      'CATEGORY_SYNC',
      'ATTRIBUTE_SYNC',
      'BULK_UPLOAD',
      'REPORT',
    ];
    const unusedFeatures = allFeatures.filter((f) => !usedFeatures.includes(f));

    for (const feature of unusedFeatures.slice(0, 2)) {
      opportunities.push({
        type: 'learning_opportunity',
        title: 'Keşfedilmemiş Özellik',
        description: `"${feature}" özelliğini henüz kullanmadınız. İşinizi kolaylaştırabilir!`,
        confidence: 0.6,
        priority: 'low',
        suggestedAction: {
          type: 'show_feature_tutorial',
          payload: { feature },
        },
      });
    }

    return opportunities;
  }

  // ==================== PERSONALIZED RECOMMENDATIONS ====================

  async getPersonalizedRecommendations(
    tenantId: string,
    userId: string,
    context: any,
  ): Promise<PredictiveSuggestion[]> {
    const recommendations: PredictiveSuggestion[] = [];

    // Get user's preferred platform
    const platformPref = await this.learningService.getPreference(
      tenantId,
      userId,
      'platforms',
      'preferred_platform',
    );

    if (platformPref?.value && !context?.platform) {
      recommendations.push({
        type: 'next_action',
        title: 'Tercih Ettiğiniz Platform',
        description: `Genellikle ${platformPref.value} kullanıyorsunuz. İşlem yapmak ister misiniz?`,
        confidence: platformPref.confidence,
        priority: 'low',
        suggestedAction: {
          type: 'quick_action',
          payload: { platform: platformPref.value },
        },
      });
    }

    // Time-based recommendations
    const hour = new Date().getHours();
    const timePref = await this.learningService.getPreference(
      tenantId,
      userId,
      'timing',
      `active_hours_${hour}`,
    );

    if (timePref && timePref.value > 5) {
      recommendations.push({
        type: 'optimization',
        title: 'Verimli Zaman Aralığı',
        description:
          'Şu an en aktif olduğunuz saatlerdesiniz. Önemli işlemleri şimdi yapabilirsiniz',
        confidence: 0.7,
        priority: 'low',
        suggestedAction: {
          type: 'show_priority_tasks',
          payload: {},
        },
      });
    }

    return recommendations;
  }

  // ==================== HELPER METHODS ====================

  private checkTriggerCondition(trigger: string | null, context: any): boolean {
    if (!trigger) return false;

    // Simple string matching for now
    // Can be enhanced with more sophisticated logic
    const contextString = JSON.stringify(context).toLowerCase();
    return contextString.includes(trigger.toLowerCase());
  }

  private calculatePriority(
    confidence: number,
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (confidence >= 0.9) return 'urgent';
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  }

  private async generateTimeBasedSuggestion(
    tenantId: string,
    userId: string,
  ): Promise<PredictiveSuggestion | null> {
    // Get user's activity patterns
    const patterns = await this.prisma.aIPatternRecognition.findMany({
      where: {
        tenantId,
        userId,
        patternType: 'timing',
        confidence: { gte: 0.6 },
      },
      orderBy: { confidence: 'desc' },
      take: 1,
    });

    if (patterns.length === 0) return null;

    const pattern = patterns[0];
    const currentHour = new Date().getHours();
    const patternHour = parseInt(pattern.trigger?.split(':')[0] || '0');

    // If we're close to their usual activity time
    if (Math.abs(currentHour - patternHour) <= 1) {
      return {
        type: 'reminder',
        title: 'Günlük Rutin',
        description: `Genellikle bu saatlerde "${pattern.action}" yapıyorsunuz`,
        confidence: pattern.confidence,
        priority: 'low',
        suggestedAction: {
          type: pattern.action,
          payload: {},
        },
      };
    }

    return null;
  }

  private async generateSyncSuggestion(
    tenantId: string,
    userId: string,
    context: any,
  ): Promise<PredictiveSuggestion | null> {
    // Check if any platforms haven't been synced recently
    const recentSyncs = await this.prisma.aIAssistantSyncJob.findMany({
      where: {
        tenantId,
        userId,
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    const syncedPlatforms = new Set(recentSyncs.map((s) => s.platform));
    const allPlatforms = ['TRENDYOL', 'AMAZON', 'HEPSIBURADA', 'N11'];
    const unsyncedPlatforms = allPlatforms.filter(
      (p) => !syncedPlatforms.has(p),
    );

    if (unsyncedPlatforms.length > 0 && context.activePlatforms?.length > 0) {
      const platform = unsyncedPlatforms.find((p) =>
        context.activePlatforms.includes(p),
      );
      if (platform) {
        return {
          type: 'reminder',
          title: 'Eşitleme Hatırlatması',
          description: `${platform} verileri bugün güncellenmemiş`,
          confidence: 0.7,
          priority: 'medium',
          suggestedAction: {
            type: 'sync_all',
            payload: { platform },
          },
        };
      }
    }

    return null;
  }

  private async generateOptimizationSuggestion(
    tenantId: string,
    userId: string,
    context: any,
  ): Promise<PredictiveSuggestion | null> {
    // Check for unoptimized product uploads
    const recentUploads = await this.prisma.aIAssistantSyncJob.findMany({
      where: {
        tenantId,
        userId,
        type: 'PRODUCT_UPLOAD',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const unoptimizedCount = recentUploads.filter(
      (job) => !(job.payload as any)?.optimize,
    ).length;

    if (unoptimizedCount >= 3) {
      return {
        type: 'optimization',
        title: 'AI Optimizasyonu',
        description:
          'Son ürün yüklemelerinizde AI optimizasyonu kullanılmamış. Daha iyi sonuçlar için açabilirsiniz',
        confidence: 0.75,
        priority: 'low',
        suggestedAction: {
          type: 'enable_ai_optimization',
          payload: {},
        },
      };
    }

    return null;
  }

  private async findStalePlatforms(
    tenantId: string,
    userId: string,
  ): Promise<Array<{ name: string; daysSinceSync: number }>> {
    const platforms = ['TRENDYOL', 'AMAZON', 'HEPSIBURADA', 'N11'];
    const stale: Array<{ name: string; daysSinceSync: number }> = [];

    for (const platform of platforms) {
      const lastSync = await this.prisma.aIAssistantSyncJob.findFirst({
        where: {
          tenantId,
          userId,
          platform,
          status: 'COMPLETED',
        },
        orderBy: { completedAt: 'desc' },
      });

      if (lastSync?.completedAt) {
        const daysSince = Math.floor(
          (Date.now() - new Date(lastSync.completedAt).getTime()) /
            (1000 * 60 * 60 * 24),
        );

        if (daysSince >= 3) {
          stale.push({ name: platform, daysSinceSync: daysSince });
        }
      }
    }

    return stale;
  }

  private async findIncompleteBulkOperations(
    tenantId: string,
    userId: string,
  ): Promise<Array<{ id: string; type: string; progress: number }>> {
    const incompleteJobs = await this.prisma.aIAssistantSyncJob.findMany({
      where: {
        tenantId,
        userId,
        status: 'PROCESSING',
        type: 'BULK_UPLOAD',
      },
    });

    return incompleteJobs.map((job) => ({
      id: job.id,
      type: job.type,
      progress:
        job.totalItems > 0
          ? Math.round((job.processedItems / job.totalItems) * 100)
          : 0,
    }));
  }

  private sortSuggestions(
    suggestions: PredictiveSuggestion[],
  ): PredictiveSuggestion[] {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

    return suggestions.sort((a, b) => {
      // First by priority
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by confidence
      return b.confidence - a.confidence;
    });
  }

  // ==================== STORE AND RETRIEVE ====================

  async storeSuggestion(
    tenantId: string,
    userId: string,
    suggestion: PredictiveSuggestion,
  ): Promise<void> {
    await this.prisma.aIPredictiveSuggestion.create({
      data: {
        tenantId,
        userId,
        suggestionType: suggestion.type,
        title: suggestion.title,
        description: suggestion.description,
        basedOn: suggestion.context || {},
        confidence: suggestion.confidence,
        suggestedAction: (suggestion.suggestedAction || null) as any,
        validUntil:
          suggestion.validUntil || new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }

  async getActiveSuggestions(
    tenantId: string,
    userId: string,
  ): Promise<PredictiveSuggestion[]> {
    const suggestions = await this.prisma.aIPredictiveSuggestion.findMany({
      where: {
        tenantId,
        userId,
        isDismissed: false,
        validUntil: {
          gt: new Date(),
        },
      },
      orderBy: [{ confidence: 'desc' }, { createdAt: 'desc' }],
      take: 10,
    });

    return suggestions.map((s) => ({
      id: s.id,
      type: s.suggestionType as PredictiveSuggestion['type'],
      title: s.title,
      description: s.description,
      confidence: s.confidence,
      priority: this.calculatePriority(s.confidence),
      suggestedAction: s.suggestedAction as any,
      context: s.basedOn,
      validUntil: s.validUntil || undefined,
    }));
  }

  async dismissSuggestion(suggestionId: string): Promise<void> {
    await this.prisma.aIPredictiveSuggestion.update({
      where: { id: suggestionId },
      data: {
        isDismissed: true,
        dismissedAt: new Date(),
      },
    });
  }

  async acceptSuggestion(suggestionId: string): Promise<void> {
    await this.prisma.aIPredictiveSuggestion.update({
      where: { id: suggestionId },
      data: {
        isAccepted: true,
        shownAt: new Date(),
      },
    });
  }

  // ==================== PREDICTIVE ANALYTICS ====================

  async predictUserBehavior(
    tenantId: string,
    userId: string,
  ): Promise<UserBehaviorPrediction> {
    // Get historical patterns
    const patterns = await this.prisma.aIPatternRecognition.findMany({
      where: {
        tenantId,
        userId,
        isActive: true,
      },
      orderBy: { confidence: 'desc' },
    });

    // Get recent actions
    const recentLogs = await this.prisma.aILearningLog.findMany({
      where: {
        tenantId,
        userId,
        eventType: 'action_completed',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Predict next actions
    const likelyNextActions = patterns.slice(0, 5).map((p) => ({
      action: p.action,
      probability: p.confidence * (p.successRate || 1),
      context: { trigger: p.trigger, conditions: p.conditions },
    }));

    // Find optimal timing
    const timingPatterns = patterns.filter((p) => p.patternType === 'timing');
    let optimalTiming = {
      bestTime: '09:00-17:00',
      reason: 'Standart iş saatleri',
    };

    if (timingPatterns.length > 0) {
      const bestTiming = timingPatterns[0];
      optimalTiming = {
        bestTime: bestTiming.trigger || '09:00-17:00',
        reason: 'Geçmiş aktivitelerinize göre en verimli zaman',
      };
    }

    // Predict potential issues
    const potentialIssues: UserBehaviorPrediction['potentialIssues'] = [];

    const errorPatterns = patterns.filter(
      (p) => p.patternType === 'error_pattern',
    );
    for (const error of errorPatterns.slice(0, 2)) {
      potentialIssues.push({
        issue: error.trigger || 'Bilinmeyen hata',
        probability: 1 - (error.successRate || 0.5),
        prevention: error.action || 'Dikkatli olun',
      });
    }

    return {
      likelyNextActions,
      optimalTiming,
      potentialIssues,
    };
  }
}
