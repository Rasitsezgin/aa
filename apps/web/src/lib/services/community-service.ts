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
  badge: string;
  badgeColor: string;
  isOnline?: boolean;
  lastActivity?: Date;
  badges?: Array<{
    name: string;
    icon: string;
    color: string;
  }>;
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
  formattedDate: string;
  formattedTime: string;
}

class CommunityService {
  async getStats(): Promise<CommunityStats> {
    try {
      return await apiClient.request('/community/stats');
    } catch (error) {
      console.error('Failed to fetch community stats:', error);
      // Return fallback data
      return {
        totalMembers: 25000,
        totalTopics: 50000,
        totalPosts: 125000,
        solvedTopics: 5000,
        monthlyPosts: 8500,
        onlineUsers: 42,
        onlineGuests: 128,
        newestMember: 'Yeni Üye',
        growthRate: 12.5,
        activeToday: 198,
      };
    }
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

    try {
      const topics = await apiClient.request(`/community/topics?${params}`) as ForumTopic[];
      // Convert date strings to Date objects
      return topics.map((t) => ({
        ...t,
        lastActivity: new Date(t.lastActivity),
        createdAt: new Date(t.createdAt),
      }));
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      return [];
    }
  }

  async getCategories(): Promise<ForumCategory[]> {
    try {
      return await apiClient.request('/community/categories');
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  }

  async getContributors(options?: {
    limit?: number;
    period?: 'all' | 'monthly' | 'weekly';
  }): Promise<TopContributor[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.period) params.set('period', options.period);

    try {
      const contributors = await apiClient.request(`/community/contributors?${params}`) as TopContributor[];
      // Convert date strings to Date objects
      return contributors.map((c) => ({
        ...c,
        lastActivity: c.lastActivity ? new Date(c.lastActivity) : undefined,
      }));
    } catch (error) {
      console.error('Failed to fetch contributors:', error);
      return [];
    }
  }

  async getEvents(options?: {
    limit?: number;
    type?: string;
  }): Promise<CommunityEvent[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.type) params.set('type', options.type);

    try {
      const events = await apiClient.request(`/community/events?${params}`) as CommunityEvent[];
      // Convert date strings to Date objects
      return events.map((e) => ({
        ...e,
        startAt: new Date(e.startAt),
        endAt: e.endAt ? new Date(e.endAt) : undefined,
      }));
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return [];
    }
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
