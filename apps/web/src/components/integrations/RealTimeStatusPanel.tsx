"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Loader2,
  Zap,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  DollarSign,
  ChevronRight,
  Bell,
  BellOff,
  Eye,
  BarChart3,
} from 'lucide-react';

interface IntegrationStatusData {
  id: string;
  name: string;
  logo: string;
  brandColor: string;
  status: 'healthy' | 'warning' | 'error' | 'syncing' | 'offline';
  lastSync: string;
  nextSync: string;
  metrics: {
    productsTotal: number;
    productsSynced: number;
    ordersToday: number;
    ordersYesterday: number;
    revenueToday: number;
    revenueYesterday: number;
    errorCount: number;
    warningCount: number;
  };
  recentActivity: {
    type: 'order' | 'product' | 'inventory' | 'error' | 'sync';
    message: string;
    time: string;
  }[];
  syncProgress?: number;
}

interface RealTimeStatusPanelProps {
  integrations: IntegrationStatusData[];
  onRefresh: () => void;
  onViewDetails: (id: string) => void;
  onToggleNotifications: (id: string, enabled: boolean) => void;
}

// Status Badge
const StatusIndicator: React.FC<{ status: IntegrationStatusData['status']; size?: 'sm' | 'md' | 'lg' }> = ({
  status,
  size = 'md',
}) => {
  const configs = {
    healthy: {
      bg: 'bg-green-500',
      ring: 'ring-green-500/20',
      pulse: false,
      icon: CheckCircle2,
      label: 'Sağlıklı',
    },
    warning: {
      bg: 'bg-amber-500',
      ring: 'ring-amber-500/20',
      pulse: true,
      icon: AlertTriangle,
      label: 'Uyarı',
    },
    error: {
      bg: 'bg-red-500',
      ring: 'ring-red-500/20',
      pulse: true,
      icon: XCircle,
      label: 'Hata',
    },
    syncing: {
      bg: 'bg-orange-500',
      ring: 'ring-orange-500/20',
      pulse: true,
      icon: RefreshCw,
      label: 'Senkronize Ediliyor',
    },
    offline: {
      bg: 'bg-gray-400',
      ring: 'ring-gray-400/20',
      pulse: false,
      icon: Clock,
      label: 'Çevrimdışı',
    },
  };

  const config = configs[status];
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className={`relative flex items-center gap-2`}>
      <span className={`${sizes[size]} ${config.bg} rounded-full ring-4 ${config.ring}`}>
        {config.pulse && (
          <span className={`absolute inset-0 ${config.bg} rounded-full animate-ping opacity-75`} />
        )}
      </span>
      {size === 'lg' && (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {config.label}
        </span>
      )}
    </span>
  );
};

// Single Integration Status Card
const IntegrationStatusCard: React.FC<{
  integration: IntegrationStatusData;
  onViewDetails: () => void;
  onToggleNotifications: (enabled: boolean) => void;
}> = ({ integration, onViewDetails, onToggleNotifications }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showActivity, setShowActivity] = useState(false);

  const orderChange =
    integration.metrics.ordersYesterday > 0
      ? ((integration.metrics.ordersToday - integration.metrics.ordersYesterday) /
          integration.metrics.ordersYesterday) *
        100
      : 0;

  const revenueChange =
    integration.metrics.revenueYesterday > 0
      ? ((integration.metrics.revenueToday - integration.metrics.revenueYesterday) /
          integration.metrics.revenueYesterday) *
        100
      : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800"
        style={{ background: `linear-gradient(135deg, ${integration.brandColor}08, transparent)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${integration.brandColor}15` }}
          >
            <img
              src={integration.logo}
              alt={integration.name}
              className="w-6 h-6 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${integration.name}&background=${integration.brandColor.replace('#', '')}&color=fff&size=40`;
              }}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {integration.name}
              <StatusIndicator status={integration.status} size="sm" />
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Son senkronizasyon: {new Date(integration.lastSync).toLocaleString('tr-TR')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNotificationsEnabled(!notificationsEnabled);
              onToggleNotifications(!notificationsEnabled);
            }}
            className={`p-2 rounded-lg transition-colors ${
              notificationsEnabled
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}
            title={notificationsEnabled ? 'Bildirimleri Kapat' : 'Bildirimleri Aç'}
          >
            {notificationsEnabled ? (
              <Bell className="w-4 h-4" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onViewDetails}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Detayları Görüntüle"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sync Progress (if syncing) */}
      {integration.status === 'syncing' && integration.syncProgress !== undefined && (
        <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-orange-700 dark:text-orange-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Senkronize ediliyor...
            </span>
            <span className="text-xs font-bold text-orange-700 dark:text-orange-400">
              %{integration.syncProgress}
            </span>
          </div>
          <div className="w-full h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${integration.syncProgress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-orange-600 dark:bg-orange-400 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Package className="w-3 h-3" />
              <span>Ürünler</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {integration.metrics.productsSynced.toLocaleString('tr-TR')}
              <span className="text-xs font-normal text-gray-400">
                /{integration.metrics.productsTotal.toLocaleString('tr-TR')}
              </span>
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <ShoppingCart className="w-3 h-3" />
              <span>Bugünkü Sipariş</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
              {integration.metrics.ordersToday}
              {orderChange !== 0 && (
                <span
                  className={`text-xs flex items-center ${
                    orderChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {orderChange > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(Math.round(orderChange))}%
                </span>
              )}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <DollarSign className="w-3 h-3" />
              <span>Bugünkü Ciro</span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
              ₺{(integration.metrics.revenueToday / 1000).toFixed(1)}K
              {revenueChange !== 0 && (
                <span
                  className={`text-xs flex items-center ${
                    revenueChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {revenueChange > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(Math.round(revenueChange))}%
                </span>
              )}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Hatalar</span>
            </div>
            <p className="font-semibold flex items-center gap-2">
              <span className={integration.metrics.errorCount > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}>
                {integration.metrics.errorCount}
              </span>
              {integration.metrics.warningCount > 0 && (
                <span className="text-amber-500 text-xs">
                  +{integration.metrics.warningCount} uyarı
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Toggle */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setShowActivity(!showActivity)}
          className="w-full px-4 py-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Son Aktiviteler
            {integration.recentActivity.length > 0 && (
              <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium">
                {integration.recentActivity.length}
              </span>
            )}
          </span>
          <motion.div animate={{ rotate: showActivity ? 90 : 0 }}>
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showActivity && integration.recentActivity.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 space-y-2">
                {integration.recentActivity.slice(0, 5).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-sm p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div
                      className={`p-1 rounded ${
                        activity.type === 'error'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : activity.type === 'order'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : activity.type === 'product'
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {activity.type === 'error' && <XCircle className="w-3 h-3" />}
                      {activity.type === 'order' && <ShoppingCart className="w-3 h-3" />}
                      {activity.type === 'product' && <Package className="w-3 h-3" />}
                      {activity.type === 'inventory' && <BarChart3 className="w-3 h-3" />}
                      {activity.type === 'sync' && <RefreshCw className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 dark:text-gray-300 truncate">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(activity.time).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Main Panel Component
export const RealTimeStatusPanel: React.FC<RealTimeStatusPanelProps> = ({
  integrations,
  onRefresh,
  onViewDetails,
  onToggleNotifications,
}) => {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await onRefresh();
    setLastRefresh(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [onRefresh]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  // Calculate summary stats
  const stats = {
    total: integrations.length,
    healthy: integrations.filter((i) => i.status === 'healthy').length,
    warning: integrations.filter((i) => i.status === 'warning').length,
    error: integrations.filter((i) => i.status === 'error').length,
    syncing: integrations.filter((i) => i.status === 'syncing').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            Gerçek Zamanlı Durum
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Son güncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${
            isRefreshing
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Yenileniyor...' : 'Yenile'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Toplam</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-3 text-center">
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.healthy}</p>
          <p className="text-xs text-green-600 dark:text-green-500">Sağlıklı</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-3 text-center">
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.warning}</p>
          <p className="text-xs text-amber-600 dark:text-amber-500">Uyarı</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-3 text-center">
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.error}</p>
          <p className="text-xs text-red-600 dark:text-red-500">Hata</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-3 text-center">
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{stats.syncing}</p>
          <p className="text-xs text-orange-600 dark:text-orange-500">Senkronize</p>
        </div>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <IntegrationStatusCard
            key={integration.id}
            integration={integration}
            onViewDetails={() => onViewDetails(integration.id)}
            onToggleNotifications={(enabled) => onToggleNotifications(integration.id, enabled)}
          />
        ))}
      </div>

      {/* Empty State */}
      {integrations.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
          <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Henüz aktif entegrasyon yok
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Pazaryerlerine bağlanarak gerçek zamanlı verileri görüntüleyin
          </p>
          <button className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 mx-auto">
            <Zap className="w-4 h-4" />
            Entegrasyon Ekle
          </button>
        </div>
      )}
    </div>
  );
};

export default RealTimeStatusPanel;
