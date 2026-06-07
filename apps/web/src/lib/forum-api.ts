export interface ForumTopicItem {
  id: string;
  title: string;
  slug: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level?: string;
    isStaff?: boolean;
  };
  board: {
    id: string;
    name: string;
    slug: string;
  };
  replies: number;
  views: number;
  lastPost: {
    author: string;
    date: string;
  };
  createdAt: string;
  isPinned?: boolean;
  isLocked?: boolean;
  isSolved?: boolean;
  isHot?: boolean;
  hasPoll?: boolean;
  tags?: string[];
}

export interface ForumBoardItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  topicCount: number;
  postCount: number;
  lastTopic?: {
    id: string;
    title: string;
    slug: string;
    author: string;
    postedAt: string;
  } | null;
}

export interface ForumCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  boards: ForumBoardItem[];
  isExpanded?: boolean;
}

export interface ForumStats {
  totalTopics: number;
  totalPosts: number;
  totalMembers: number;
  newestMember: string;
  onlineUsers: number;
  onlineGuests: number;
}

export interface OnlineUserItem {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy';
  isStaff?: boolean;
  isModerator?: boolean;
}

export interface TopicsResponse {
  topics: ForumTopicItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'az önce';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dk önce`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;

  return then.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export async function fetchForumBoards(): Promise<ForumCategoryItem[]> {
  const res = await fetch('/api/forum/boards', { cache: 'no-store' });
  if (!res.ok) throw new Error('Boardlar yüklenemedi');
  return res.json();
}

export async function fetchForumTopics(
  page = 1,
  limit = 25,
  sortBy = 'lastPost',
): Promise<TopicsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
  });
  const res = await fetch(`/api/forum/topics?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Konular yüklenemedi');
  return res.json();
}

export async function fetchForumStats(): Promise<ForumStats> {
  const res = await fetch('/api/community/stats', { cache: 'no-store' });
  if (!res.ok) throw new Error('İstatistikler yüklenemedi');
  const data = await res.json();
  return {
    totalTopics: data.totalTopics ?? 0,
    totalPosts: data.totalPosts ?? 0,
    totalMembers: data.totalMembers ?? 0,
    newestMember: data.newestMember ?? '—',
    onlineUsers: data.onlineUsers ?? 0,
    onlineGuests: data.onlineGuests ?? 0,
  };
}

export async function createForumTopic(input: {
  title: string;
  content: string;
  boardId: string;
  type?: string;
  tags?: string[];
}): Promise<{ id: string; slug: string; title: string }> {
  const res = await fetch('/api/forum/topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Konu oluşturulamadı');
  }
  return data;
}

export async function createForumReply(slug: string, content: string) {
  const res = await fetch(`/api/forum/topic/${slug}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Cevap gönderilemedi');
  }
  return data;
}

export interface ForumUserProfileItem {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  coverImage?: string;
  title?: string;
  isStaff: boolean;
  isOnline: boolean;
  joinedAt: string;
  lastSeenAt: string;
  location?: string;
  website?: string;
  about?: string;
  signature?: string;
  postCount: number;
  topicCount: number;
  reputation: number;
  thanksReceived: number;
  thanksGiven: number;
  helpfulCount: number;
  level: number;
  totalXp: number;
  primaryGroup: { name: string; color: string; icon?: string };
  badges: Array<{ id: string; name: string; icon: string; color: string; earnedAt: string }>;
  recentTopics: Array<{
    id: string;
    title: string;
    slug: string;
    boardName: string;
    createdAt: string;
    replyCount: number;
    viewCount: number;
  }>;
  recentPosts: Array<{
    id: string;
    topicTitle: string;
    topicSlug: string;
    boardName: string;
    excerpt: string;
    createdAt: string;
    reactionCount: number;
  }>;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isBlocked: boolean;
  isOwnProfile: boolean;
}

export async function followForumUser(id: string): Promise<{ isFollowing: boolean }> {
  const res = await fetch(`/api/forum/user/${id}/follow`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Takip başarısız');
  return data;
}

export async function unfollowForumUser(id: string): Promise<{ isFollowing: boolean }> {
  const res = await fetch(`/api/forum/user/${id}/follow`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Takibi bırakma başarısız');
  return data;
}

export async function blockForumUser(id: string, reason?: string): Promise<{ isBlocked: boolean }> {
  const res = await fetch(`/api/forum/user/${id}/block`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Engelleme başarısız');
  return data;
}

export async function unblockForumUser(id: string): Promise<{ isBlocked: boolean }> {
  const res = await fetch(`/api/forum/user/${id}/block`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Engel kaldırma başarısız');
  return data;
}

export async function updateForumProfile(data: {
  about?: string;
  location?: string;
  website?: string;
  signature?: string;
}): Promise<ForumUserProfileItem> {
  const res = await fetch('/api/forum/user/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Profil güncellenemedi');
  return body.profile;
}

export interface ForumConversationItem {
  id: string;
  isGroup: boolean;
  title: string;
  peer: { id: string; name: string; avatar?: string; isOnline: boolean } | null;
  lastMessage: { content: string; createdAt: string; isMine: boolean } | null;
  unreadCount: number;
  lastMessageAt: string;
}

export interface ForumPrivateMessageItem {
  id: string;
  content: string;
  contentHtml: string;
  createdAt: string;
  isMine: boolean;
  author: { id: string; name: string; avatar?: string };
}

export async function fetchForumConversations(): Promise<{ conversations: ForumConversationItem[]; unreadCount: number }> {
  const res = await fetch('/api/forum/messages', { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Mesajlar yüklenemedi');
  return data;
}

export async function startForumConversation(recipientId: string): Promise<{ conversationId: string }> {
  const res = await fetch('/api/forum/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipientId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Sohbet başlatılamadı');
  return data;
}

export async function fetchForumConversation(id: string): Promise<{
  conversation: ForumConversationItem;
  messages: ForumPrivateMessageItem[];
  pagination: { page: number; totalPages: number; hasMore: boolean };
}> {
  const res = await fetch(`/api/forum/messages/${id}`, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Sohbet yüklenemedi');
  return data;
}

export async function sendForumMessage(conversationId: string, content: string): Promise<ForumPrivateMessageItem> {
  const res = await fetch(`/api/forum/messages/${conversationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Mesaj gönderilemedi');
  return data.message;
}

export async function reportForumUser(id: string, reason: string, description?: string): Promise<{ id: string }> {
  const res = await fetch('/api/community/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: id, reason, description }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Rapor gönderilemedi');
  return data;
}

export async function fetchForumUserProfile(id: string): Promise<ForumUserProfileItem> {
  const res = await fetch(`/api/forum/user/${id}`, { cache: 'no-store' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Profil yüklenemedi');
  }
  return data.profile;
}

export async function fetchOnlineUsers(): Promise<OnlineUserItem[]> {
  const res = await fetch('/api/community/realtime?type=status', { cache: 'no-store' });
  if (!res.ok) throw new Error('Çevrimiçi kullanıcılar yüklenemedi');
  const data = await res.json();
  return (data.recentlyActive ?? []).map((user: {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
    isStaff?: boolean;
    isModerator?: boolean;
  }) => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar || user.name.slice(0, 2).toUpperCase(),
    status: user.isOnline ? 'online' as const : 'away' as const,
    isStaff: user.isStaff,
    isModerator: user.isModerator,
  }));
}
