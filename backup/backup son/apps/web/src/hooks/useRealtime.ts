'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface RealtimeData {
  activeVisitors: number;
  ordersLastHour: number;
  revenueLastHour: number;
  pendingOrders: number;
  lowStockAlerts: number;
  conversionRate: string;
  lastUpdate: Date;
}

export interface RealtimeEvent {
  type: 'order' | 'stock' | 'visitor' | 'payment' | 'alert';
  data: any;
  timestamp: Date;
}

function getWsBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_WS_URL || '';
  if (!raw) return '';
  const value = raw.trim();
  if (!value) return '';

  if (value.startsWith('ws://') || value.startsWith('wss://')) return value.replace(/\/$/, '');
  if (value.startsWith('http://')) return value.replace(/^http:\/\//, 'ws://').replace(/\/$/, '');
  if (value.startsWith('https://')) return value.replace(/^https:\/\//, 'wss://').replace(/\/$/, '');
  return `wss://${value}`.replace(/\/$/, '');
}

function normalizeRealtimeData(payload: any): RealtimeData {
  return {
    activeVisitors: Number(payload?.activeVisitors || 0),
    ordersLastHour: Number(payload?.ordersLastHour || 0),
    revenueLastHour: Number(payload?.revenueLastHour || 0),
    pendingOrders: Number(payload?.pendingOrders || 0),
    lowStockAlerts: Number(payload?.lowStockAlerts || 0),
    conversionRate: String(payload?.conversionRate ?? '0'),
    lastUpdate: payload?.lastUpdate ? new Date(payload.lastUpdate) : new Date(),
  };
}

export function useRealtime(tenantId: string = '') {
  const [data, setData] = useState<RealtimeData>({
    activeVisitors: 0,
    ordersLastHour: 0,
    revenueLastHour: 0,
    pendingOrders: 0,
    lowStockAlerts: 0,
    conversionRate: '0',
    lastUpdate: new Date()
  });
  
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const wsBase = getWsBaseUrl();
    if (!wsBase || !tenantId) {
      setIsConnected(false);
      return;
    }

    const wsUrl = `${wsBase}/realtime?tenantId=${encodeURIComponent(tenantId)}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    socket.onerror = () => {
      setIsConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload?.type === 'snapshot' || payload?.type === 'stats') {
          setData(normalizeRealtimeData(payload.data || payload));
          return;
        }

        if (payload?.type === 'event') {
          const realtimeEvent: RealtimeEvent = {
            type: (payload.eventType || payload.data?.type || 'alert') as RealtimeEvent['type'],
            data: payload.data || {},
            timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
          };

          setEvents((prev) => [realtimeEvent, ...prev.slice(0, 49)]);
          setData((prev) => ({ ...prev, lastUpdate: new Date() }));
        }
      } catch {
        // Ignore malformed message.
      }
    };
  }, [tenantId]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    data,
    events,
    isConnected,
    connect,
    disconnect
  };
}

// Real-time Stats Component Hook
export function useRealtimeStats() {
  const { data, isConnected } = useRealtime();
  
  return {
    stats: [
      { label: 'Aktif Ziyaretçi', value: data.activeVisitors, trend: 'up' },
      { label: 'Son 1 Saat Sipariş', value: data.ordersLastHour, trend: 'up' },
      { label: 'Son 1 Saat Gelir', value: `₺${data.revenueLastHour.toLocaleString()}`, trend: 'up' },
      { label: 'Bekleyen Sipariş', value: data.pendingOrders, trend: 'stable' },
      { label: 'Düşük Stok Uyarısı', value: data.lowStockAlerts, trend: 'warning' },
      { label: 'Dönüşüm Oranı', value: `%${data.conversionRate}`, trend: 'up' }
    ],
    isConnected,
    lastUpdate: data.lastUpdate
  };
}
