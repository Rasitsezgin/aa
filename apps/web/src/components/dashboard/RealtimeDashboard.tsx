'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Users,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  Package,
  CreditCard,
  Bell
} from 'lucide-react';
import { useRealtime, RealtimeEvent } from '@/hooks/useRealtime';

export function RealtimeDashboard() {
  const { data, events, isConnected, connect, disconnect } = useRealtime();
  const [showEvents, setShowEvents] = useState(true);

  const stats = [
    {
      label: 'Aktif Ziyaretçi',
      value: data.activeVisitors,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      suffix: ''
    },
    {
      label: 'Son 1 Saat Sipariş',
      value: data.ordersLastHour,
      icon: ShoppingCart,
      color: 'from-green-500 to-emerald-500',
      suffix: ''
    },
    {
      label: 'Son 1 Saat Gelir',
      value: data.revenueLastHour,
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500',
      suffix: '₺',
      prefix: true
    },
    {
      label: 'Bekleyen Sipariş',
      value: data.pendingOrders,
      icon: Package,
      color: 'from-orange-500 to-red-500',
      suffix: ''
    },
    {
      label: 'Düşük Stok',
      value: data.lowStockAlerts,
      icon: AlertTriangle,
      color: 'from-yellow-500 to-amber-500',
      suffix: ''
    },
    {
      label: 'Dönüşüm',
      value: data.conversionRate,
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-500',
      suffix: '%'
    }
  ];

  const getEventIcon = (type: RealtimeEvent['type']) => {
    switch (type) {
      case 'order': return ShoppingCart;
      case 'stock': return Package;
      case 'visitor': return Users;
      case 'payment': return CreditCard;
      case 'alert': return Bell;
      default: return Activity;
    }
  };

  const getEventColor = (type: RealtimeEvent['type']) => {
    switch (type) {
      case 'order': return 'text-green-400 bg-green-500/10';
      case 'stock': return 'text-yellow-400 bg-yellow-500/10';
      case 'visitor': return 'text-blue-400 bg-blue-500/10';
      case 'payment': return 'text-purple-400 bg-purple-500/10';
      case 'alert': return 'text-red-400 bg-red-500/10';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  const formatEventMessage = (event: RealtimeEvent) => {
    switch (event.type) {
      case 'order':
        return `Yeni sipariş: ${event.data.orderId} - ₺${event.data.amount} (${event.data.platform})`;
      case 'stock':
        return `Stok uyarısı: ${event.data.product} - ${event.data.remaining} adet kaldı`;
      case 'visitor':
        return `${event.data.count} yeni ziyaretçi (${event.data.source})`;
      case 'payment':
        return `Ödeme alındı: ₺${event.data.amount}`;
      case 'alert':
        return event.data.message;
      default:
        return 'Yeni olay';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Gerçek Zamanlı Dashboard</h2>
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <>
                  <span className="flex items-center gap-1 text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Bağlı
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">
                    Son güncelleme: {formatTime(data.lastUpdate)}
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1 text-red-400">
                  <WifiOff className="w-3 h-3" />
                  Bağlantı kesildi
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEvents(!showEvents)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showEvents ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            Olaylar
          </button>
          <button
            onClick={isConnected ? disconnect : connect}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isConnected
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
            }`}
          >
            {isConnected ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            {isConnected ? 'Durdur' : 'Bağlan'}
          </button>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <motion.div
              key={String(stat.value)}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-white"
            >
              {stat.prefix ? stat.suffix : ''}{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}{!stat.prefix ? stat.suffix : ''}
            </motion.div>
            <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Live Events Feed */}
      <AnimatePresence>
        {showEvents && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${isConnected ? 'animate-spin' : ''}`} />
                  Canlı Olaylar
                </h3>
                <span className="text-xs text-slate-500">{events.length} olay</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {events.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      Henüz olay yok...
                    </div>
                  ) : (
                    events.slice(0, 10).map((event, i) => {
                      const Icon = getEventIcon(event.type);
                      return (
                        <motion.div
                          key={`${event.type}-${event.timestamp.getTime()}-${i}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getEventColor(event.type)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-300 truncate">
                              {formatEventMessage(event)}
                            </p>
                          </div>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(event.timestamp)}
                          </span>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
