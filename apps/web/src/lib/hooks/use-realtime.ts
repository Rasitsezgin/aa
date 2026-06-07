"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface RealtimeStatus {
  onlineCount: number;
  recentlyActive: Array<{
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    lastActivity: string;
  }>;
  activeTopics: Array<{
    id: string;
    title: string;
    slug: string;
    lastActivity: string;
  }>;
}

interface RealtimeActivity {
  id: string;
  type: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  topic: {
    id: string;
    title: string;
    slug: string;
  } | null;
  createdAt: string;
}

interface UseRealtimeOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

export function useRealtimeStatus(options: UseRealtimeOptions = {}) {
  const { refreshInterval = 30000, enabled = true } = options;
  const [status, setStatus] = useState<RealtimeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/community/realtime?type=status');
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, fetchStatus, refreshInterval]);

  return { status, loading, error, refetch: fetchStatus };
}

export function useRealtimeActivities(options: UseRealtimeOptions = {}) {
  const { refreshInterval = 60000, enabled = true } = options;
  const [activities, setActivities] = useState<RealtimeActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch('/api/community/realtime?type=activities');
      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Activities fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    fetchActivities();
    intervalRef.current = setInterval(fetchActivities, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, fetchActivities, refreshInterval]);

  return { activities, loading, refetch: fetchActivities };
}

// Heartbeat - kullanıcı online durumunu koruma
export function useHeartbeat(interval: number = 60000) {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/community/realtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'heartbeat' }),
        });
      } catch (err) {
        // Silent fail
      }
    };

    // İlk heartbeat
    sendHeartbeat();
    
    // Periyodik heartbeat
    const intervalId = setInterval(sendHeartbeat, interval);

    return () => clearInterval(intervalId);
  }, [interval]);
}

// Typing indicator
export function useTypingIndicator(topicId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendTyping = useCallback(async () => {
    try {
      await fetch('/api/community/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'typing', topicId }),
      });
    } catch (err) {
      // Silent fail
    }
  }, [topicId]);

  const startTyping = useCallback(() => {
    sendTyping();
    
    // Debounce typing notifications
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing after 3 seconds of inactivity
    }, 3000);
  }, [sendTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return { typingUsers, startTyping };
}

export interface ForumNotificationItem {
  id: string;
  title: string;
  message: string | null;
  type: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export function useForumNotifications(options: UseRealtimeOptions = {}) {
  const { refreshInterval = 45000, enabled = true } = options;
  const [notifications, setNotifications] = useState<ForumNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dmUnreadCount, setDmUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/community/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
      setDmUnreadCount(data.dmUnreadCount ?? 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, refreshInterval);
    return () => clearInterval(interval);
  }, [enabled, fetchNotifications, refreshInterval]);

  const markAsRead = useCallback(async (id: string) => {
    await fetch(`/api/community/notifications/${id}`, { method: 'PATCH' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await fetch('/api/community/notifications', { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    dmUnreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}

/** @deprecated Use useForumNotifications for community forum alerts */
export function useNotifications() {
  return useForumNotifications();
}
