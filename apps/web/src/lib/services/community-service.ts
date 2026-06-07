import { apiClient } from '@/lib/api-client';

export interface CommunityStats {
  totalMembers: number;
  totalTopics: number;
  totalPosts: number;
  solvedTopics: number;
  monthlyPosts: number;
  onlineUsers: number;
  onlineGuests: number;
  newestMember: string;
  growthRate: number;
  activeToday: number;
}

export interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  category: string;
  categoryColor: string;
  author: {
    name: string;
    avatar: string;
    badge?: string;
    badgeColor?: string;
  };
  replies: number;
  views: number;
  likes: number;
  lastActivity: Date;
  createdAt: Date;
  isPinned: boolean;
  isSolved: boolean;
  isHot: boolean;
  type: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color: string;
  topicCount: number;
}

export interface TopContributor {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  points: number;
  reputation: number;
  postCount: number;
  helpfulCount: number;
  level: number;
  xp: number;
  xpProgress?: number;
  badge: string;
  badgeColor: string;
  isOnline?: boolean;
  lastActivity?: Date;
  badges?: Array<{
    name: string;
    icon: string;
    color: string;
    isMarketplace?: boolean;
  }>;
}

export interface GamificationQuest {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  action: string;
  progress: number;
  targetCount: number;
  xpReward: number;
  isCompleted: boolean;
  percent: number;
}

export interface GamificationBadge {
  name: string;
  icon: string;
  color: string;
  description?: string | null;
  earnedAt?: Date;
}

export interface CommunityGamification {
  isAuthenticated: boolean;
  profileId?: string | null;
  level?: number;
  title?: string;
  currentXp?: number;
  totalXp?: number;
  xpToNext?: number;
  progress?: number;
  currentStreak?: number;
  longestStreak?: number;
  badges?: GamificationBadge[];
  marketplaceBadges?: GamificationBadge[];
  quests?: GamificationQuest[];
  completedQuestsToday?: number;
  totalDailyQuests?: number;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description?: string;
  type: string;
  startAt: Date;
  endAt?: Date;
  timezone: string;
  isOnline: boolean;
  location?: string;
  meetingUrl?: string;
  attendeeCount: number;
  maxAttendees?: number;
  status: string;
  isRegistered?: boolean;
  formattedDate: string;
  formattedTime: string;
}

export interface OnboardingStep {
  id: string;
  label: string;
  completed: boolean;
  href: string;
}

export interface CommunityOnboarding {
  isAuthenticated: boolean;
  profileId: string | null;
  steps: OnboardingStep[];
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
}

class CommunityService {
  async getStats(): Promise<CommunityStats> {
    return await apiClient.request('/community/stats');
  }

  async getTopics(options?: {
    limit?: number;
    category?: string;
    sortBy?: 'popular' | 'recent' | 'unanswered';
  }): Promise<ForumTopic[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.category) params.set('category', options.category);
    if (options?.sortBy) params.set('sortBy', options.sortBy);

    const topics = await apiClient.request(`/community/topics?${params}`) as ForumTopic[];
    return topics.map((t) => ({
      ...t,
      lastActivity: new Date(t.lastActivity),
      createdAt: new Date(t.createdAt),
    }));
  }

  async getCategories(): Promise<ForumCategory[]> {
    return await apiClient.request('/community/categories');
  }

  async getContributors(options?: {
    limit?: number;
    period?: 'all' | 'monthly' | 'weekly';
  }): Promise<TopContributor[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.period) params.set('period', options.period);

    const contributors = await apiClient.request(`/community/contributors?${params}`) as TopContributor[];
    return contributors.map((c) => ({
      ...c,
      lastActivity: c.lastActivity ? new Date(c.lastActivity) : undefined,
    }));
  }

  async getEvents(options?: {
    limit?: number;
    type?: string;
  }): Promise<CommunityEvent[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.type) params.set('type', options.type);

    const events = await apiClient.request(`/community/events?${params}`) as CommunityEvent[];
    return events.map((e) => ({
      ...e,
      startAt: new Date(e.startAt),
      endAt: e.endAt ? new Date(e.endAt) : undefined,
    }));
  }

  async getOnboarding(): Promise<CommunityOnboarding> {
    return await apiClient.request('/community/onboarding');
  }

  async getGamification(): Promise<CommunityGamification> {
    const data = await apiClient.request('/community/gamification') as CommunityGamification;
    return {
      ...data,
      badges: data.badges?.map((b) => ({
        ...b,
        earnedAt: b.earnedAt ? new Date(b.earnedAt) : undefined,
      })),
      marketplaceBadges: data.marketplaceBadges?.map((b) => ({
        ...b,
        earnedAt: b.earnedAt ? new Date(b.earnedAt) : undefined,
      })),
    };
  }

  async search(query: string, types = 'forum,blog,help'): Promise<{
    query: string;
    results: Array<{
      type: string;
      id: string;
      title: string;
      excerpt: string;
      url: string;
      updatedAt?: string;
    }>;
    total: number;
  }> {
    const params = new URLSearchParams({ q: query, types });
    return await apiClient.request(`/community/search?${params}`);
  }

  async getNotifications(): Promise<{
    notifications: Array<{
      id: string;
      type: string;
      title: string;
      message: string | null;
      read: boolean;
      actionUrl: string | null;
      createdAt: string;
    }>;
    unreadCount: number;
  }> {
    return await apiClient.request('/community/notifications');
  }

  async submitReport(data: {
    postId?: string;
    topicId?: string;
    userId?: string;
    reason: string;
    description?: string;
  }): Promise<{ id: string }> {
    const res = await fetch('/api/community/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'Rapor gönderilemedi');
    return body;
  }

  async joinEvent(eventId: string): Promise<{ success: boolean; attendeeCount: number; alreadyRegistered?: boolean }> {
    const res = await fetch(`/api/community/events/${eventId}/join`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Katılım başarısız');
    }
    return data;
  }

  // Format relative time for display
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes} dk önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  }

  // Format large numbers
  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}

export const communityService = new CommunityService();
