"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Globe,
  Package,
  ShoppingCart,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Shield,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color,
  gradient,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    {/* Background Gradient */}
    <div className={`absolute inset-0 opacity-5 ${gradient}`} />
    
    {/* Glow Effect */}
    <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${color}`} />
    
    <div className="relative">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
            className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
          >
            {value}
          </motion.p>
          
          {change !== undefined && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + 0.4 }}
              className="flex items-center mt-2 gap-1"
            >
              {change >= 0 ? (
                <span className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                  <ArrowUpRight className="w-4 h-4" />
                  +{change}%
                </span>
              ) : (
                <span className="flex items-center text-red-600 dark:text-red-400 text-sm font-medium">
                  <ArrowDownRight className="w-4 h-4" />
                  {change}%
                </span>
              )}
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {changeLabel || 'son 30 gün'}
              </span>
            </motion.div>
          )}
        </div>
        
        <motion.div
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: delay + 0.1 }}
          className={`p-3 rounded-xl ${gradient} shadow-lg`}
        >
          {icon}
        </motion.div>
      </div>
    </div>
  </motion.div>
);

interface IntegrationStatsProps {
  totalIntegrations: number;
  activeIntegrations: number;
  pendingIntegrations: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  syncHealth: number;
}

export const IntegrationStats: React.FC<IntegrationStatsProps> = ({
  totalIntegrations = 0,
  activeIntegrations = 0,
  pendingIntegrations = 0,
  totalProducts = 0,
  totalOrders = 0,
  totalRevenue = 0,
  syncHealth = 0,
}) => {
  const revenueDisplay = totalRevenue > 0
    ? `₺${(totalRevenue / 1000).toFixed(0)}K`
    : '₺0';
  const syncHealthDisplay = syncHealth > 0 ? `%${syncHealth}` : '-';

  const stats = [
    {
      title: 'Aktif Entegrasyonlar',
      value: `${activeIntegrations}/${totalIntegrations}`,
      icon: <Zap className="w-6 h-6 text-white" />,
      color: 'bg-emerald-500',
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    },
    {
      title: 'Toplam Ürün',
      value: totalProducts.toLocaleString('tr-TR'),
      icon: <Package className="w-6 h-6 text-white" />,
      color: 'bg-orange-500',
      gradient: 'bg-gradient-to-br from-orange-500 to-amber-600',
    },
    {
      title: 'Toplam Sipariş',
      value: totalOrders.toLocaleString('tr-TR'),
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
      color: 'bg-purple-500',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
    {
      title: 'Toplam Ciro',
      value: revenueDisplay,
      icon: <DollarSign className="w-6 h-6 text-white" />,
      color: 'bg-amber-500',
      gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
    },
    {
      title: 'Senkronizasyon Sağlığı',
      value: syncHealthDisplay,
      icon: <Activity className="w-6 h-6 text-white" />,
      color: 'bg-cyan-500',
      gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    },
    {
      title: 'Bekleyen Kurulum',
      value: pendingIntegrations,
      icon: <Clock className="w-6 h-6 text-white" />,
      color: 'bg-orange-500',
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
};

// Mini Stats Row for compact display
interface MiniStatsRowProps {
  activeCount: number;
  platformCount: number;
  syncedProductCount?: number;
  uptimeLabel?: string;
}

export const MiniStatsRow: React.FC<MiniStatsRowProps> = ({
  activeCount,
  platformCount,
  syncedProductCount,
  uptimeLabel,
}) => {
  const syncedDisplay = typeof syncedProductCount === 'number'
    ? syncedProductCount.toLocaleString('tr-TR')
    : '-';
  const uptimeDisplay = uptimeLabel ?? '-';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-4 px-4 py-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-100 dark:border-gray-800"
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <span className="text-sm">
          <span className="font-semibold text-gray-900 dark:text-white">{activeCount}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">Aktif</span>
        </span>
      </div>
      
      <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
      
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
          <Globe className="w-4 h-4 text-orange-600 dark:text-orange-400" />
        </div>
        <span className="text-sm">
          <span className="font-semibold text-gray-900 dark:text-white">{platformCount}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">Mevcut Platform</span>
        </span>
      </div>
      
      <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
      
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <span className="text-sm">
          <span className="font-semibold text-gray-900 dark:text-white">{syncedDisplay}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">Senkronize Ürün</span>
        </span>
      </div>
      
      <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
      
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <span className="text-sm">
          <span className="font-semibold text-gray-900 dark:text-white">{uptimeDisplay}</span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">Uptime</span>
        </span>
      </div>
    </motion.div>
  );
};

export default IntegrationStats;
