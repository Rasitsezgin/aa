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

// Simulated WebSocket for demo - replace with actual WebSocket in production
export function useRealtime(tenantId: string = 'tenant-1') {
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate real-time data updates
  const simulateUpdate = useCallback(() => {
    setData(prev => ({
      activeVisitors: Math.max(0, prev.activeVisitors + Math.floor(Math.random() * 10) - 5),
      ordersLastHour: prev.ordersLastHour + (Math.random() > 0.7 ? 1 : 0),
      revenueLastHour: prev.revenueLastHour + (Math.random() > 0.7 ? Math.floor(Math.random() * 500) : 0),
      pendingOrders: Math.max(0, prev.pendingOrders + Math.floor(Math.random() * 3) - 1),
      lowStockAlerts: Math.max(0, prev.lowStockAlerts + (Math.random() > 0.9 ? 1 : 0)),
      conversionRate: (Math.random() * 5 + 8).toFixed(1),
      lastUpdate: new Date()
    }));

    // Random events
    if (Math.random() > 0.8) {
      const eventTypes: RealtimeEvent['type'][] = ['order', 'stock', 'visitor', 'payment', 'alert'];
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      const newEvent: RealtimeEvent = {
        type,
        data: generateEventData(type),
        timestamp: new Date()
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
    }
  }, []);

  const connect = useCallback(() => {
    setIsConnected(true);
    
    // Initial data
    setData({
      activeVisitors: Math.floor(Math.random() * 100) + 50,
      ordersLastHour: Math.floor(Math.random() * 20) + 5,
      revenueLastHour: Math.floor(Math.random() * 5000) + 2000,
      pendingOrders: Math.floor(Math.random() * 30) + 10,
      lowStockAlerts: Math.floor(Math.random() * 10),
      conversionRate: (Math.random() * 5 + 8).toFixed(1),
      lastUpdate: new Date()
    });

    // Start polling (simulating WebSocket)
    intervalRef.current = setInterval(simulateUpdate, 3000);
  }, [simulateUpdate]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
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

function generateEventData(type: RealtimeEvent['type']) {
  switch (type) {
    case 'order':
      return {
        orderId: `ORD-${Date.now()}`,
        customer: ['Ahmet Y.', 'Mehmet D.', 'Fatma K.', 'Ali V.'][Math.floor(Math.random() * 4)],
        amount: Math.floor(Math.random() * 2000) + 100,
        platform: ['Trendyol', 'Hepsiburada', 'Amazon', 'N11'][Math.floor(Math.random() * 4)]
      };
    case 'stock':
      return {
        sku: `SKU-${Math.floor(Math.random() * 1000)}`,
        product: 'Ürün ' + Math.floor(Math.random() * 100),
        remaining: Math.floor(Math.random() * 10),
        threshold: 10
      };
    case 'visitor':
      return {
        count: Math.floor(Math.random() * 50) + 10,
        source: ['organic', 'paid', 'social', 'direct'][Math.floor(Math.random() * 4)]
      };
    case 'payment':
      return {
        transactionId: `TXN-${Date.now()}`,
        amount: Math.floor(Math.random() * 5000) + 500,
        status: 'completed'
      };
    case 'alert':
      return {
        level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
        message: ['Stok uyarısı', 'Fiyat değişikliği', 'Sistem bildirimi'][Math.floor(Math.random() * 3)]
      };
    default:
      return {};
  }
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
