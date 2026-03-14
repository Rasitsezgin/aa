'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivityLog, ActivityLog } from '@/lib/hooks';
import {
  Activity,
  User,
  Package,
  ShoppingCart,
  Settings,
  Database,
  Download,
  Filter,
  Search,
  Calendar,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  FileText,
  Zap,
  Shield,
  Globe,
  CreditCard
} from 'lucide-react';



export default function ActivityLogPage() {
  const { activities: apiActivities, loading } = useActivityLog();

  const [fallbackActivities] = useState<ActivityLog[]>([
    {
      id: '1',
      type: 'create',
      module: 'orders',
      status: 'success',
      title: 'Yeni sipariş oluşturuldu',
      description: 'Trendyol\'dan #TRY-2024-1234 numaralı sipariş alındı',
      user: { name: 'Sistem', email: 'system@pazaryonetimi.com' },
      metadata: { orderId: 'TRY-2024-1234', platform: 'Trendyol', amount: 2450 },
      timestamp: new Date(2024, 0, 1, 12, 0, 0)
    },
    {
      id: '2',
      type: 'update',
      module: 'products',
      status: 'success',
      title: 'Ürün fiyatı güncellendi',
      description: 'Samsung Galaxy S24 Ultra fiyatı ₺45.999 → ₺42.999 olarak değiştirildi',
      user: { name: 'Ahmet Yılmaz', email: 'ahmet@firma.com' },
      metadata: { productId: 'PRD-001', oldPrice: 45999, newPrice: 42999 },
      ip: '192.168.1.105',
      timestamp: new Date(2024, 0, 1, 11, 58, 0)
    },
    {
      id: '3',
      type: 'login',
      module: 'auth',
      status: 'success',
      title: 'Kullanıcı girişi',
      description: 'Başarılı giriş yapıldı',
      user: { name: 'Mehmet Demir', email: 'mehmet@firma.com' },
      ip: '88.234.12.45',
      userAgent: 'Chrome 120 / Windows 11',
      timestamp: new Date(2024, 0, 1, 11, 55, 0)
    },
    {
      id: '4',
      type: 'sync',
      module: 'integrations',
      status: 'success',
      title: 'Amazon senkronizasyonu',
      description: '125 ürün ve 18 sipariş senkronize edildi',
      user: { name: 'Sistem', email: 'system@pazaryonetimi.com' },
      metadata: { products: 125, orders: 18, duration: '45s' },
      timestamp: new Date(2024, 0, 1, 11, 30, 0)
    },
    {
      id: '5',
      type: 'delete',
      module: 'products',
      status: 'warning',
      title: 'Ürün silindi',
      description: 'SKU: OLD-PRODUCT-001 kalıcı olarak silindi',
      user: { name: 'Ahmet Yılmaz', email: 'ahmet@firma.com' },
      metadata: { sku: 'OLD-PRODUCT-001' },
      ip: '192.168.1.105',
      timestamp: new Date(2024, 0, 1, 11, 0, 0)
    },
    {
      id: '6',
      type: 'export',
      module: 'products',
      status: 'success',
      title: 'Ürün listesi dışa aktarıldı',
      description: '1,234 ürün Excel formatında dışa aktarıldı',
      user: { name: 'Fatma Kaya', email: 'fatma@firma.com' },
      metadata: { format: 'xlsx', count: 1234 },
      ip: '192.168.1.110',
      timestamp: new Date(2024, 0, 1, 10, 0, 0)
    },
    {
      id: '7',
      type: 'update',
      module: 'settings',
      status: 'success',
      title: 'API anahtarı yenilendi',
      description: 'Trendyol API anahtarı güncellendi',
      user: { name: 'Admin', email: 'admin@pazaryonetimi.com' },
      ip: '192.168.1.1',
      timestamp: new Date(2024, 0, 0, 12, 0, 0)
    },
    {
      id: '8',
      type: 'create',
      module: 'ai',
      status: 'success',
      title: 'AI analizi başlatıldı',
      description: 'Fiyat optimizasyonu analizi 234 ürün için çalıştırıldı',
      user: { name: 'Sistem', email: 'system@pazaryonetimi.com' },
      metadata: { products: 234, type: 'price-optimization' },
      timestamp: new Date(2024, 0, -1, 12, 0, 0)
    }
  ]);

  const activities: ActivityLog[] = (Array.isArray(apiActivities) && apiActivities.length > 0) ? apiActivities : fallbackActivities;

  const [typeFilter, setTypeFilter] = useState<ActivityLog['type'] | 'all'>('all');
  const [moduleFilter, setModuleFilter] = useState<ActivityLog['module'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const typeConfig: Record<string, { icon: React.ComponentType<any>; color: string; label: string }> = {
    create: { icon: Plus, color: 'text-green-500 bg-green-500/10', label: 'Oluşturma' },
    update: { icon: Edit, color: 'text-blue-500 bg-blue-500/10', label: 'Güncelleme' },
    delete: { icon: Trash2, color: 'text-red-500 bg-red-500/10', label: 'Silme' },
    view: { icon: Eye, color: 'text-slate-400 bg-slate-400/10', label: 'Görüntüleme' },
    login: { icon: User, color: 'text-purple-500 bg-purple-500/10', label: 'Giriş' },
    export: { icon: Download, color: 'text-cyan-500 bg-cyan-500/10', label: 'Dışa Aktarım' },
    import: { icon: ArrowDownRight, color: 'text-amber-500 bg-amber-500/10', label: 'İçe Aktarım' },
    sync: { icon: RefreshCw, color: 'text-indigo-500 bg-indigo-500/10', label: 'Senkronizasyon' }
  };

  const moduleConfig: Record<string, { icon: React.ComponentType<any>; label: string }> = {
    products: { icon: Package, label: 'Ürünler' },
    orders: { icon: ShoppingCart, label: 'Siparişler' },
    customers: { icon: User, label: 'Müşteriler' },
    settings: { icon: Settings, label: 'Ayarlar' },
    integrations: { icon: Globe, label: 'Entegrasyonlar' },
    ai: { icon: Zap, label: 'AI' },
    auth: { icon: Shield, label: 'Güvenlik' },
    finance: { icon: CreditCard, label: 'Finans' }
  };

  const filteredLogs = activities.filter(log => {
    if (typeFilter !== 'all' && log.type !== typeFilter) return false;
    if (moduleFilter !== 'all' && log.module !== moduleFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return log.title.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query) ||
        log.user.name.toLowerCase().includes(query);
    }
    return true;
  });

  const formatTime = (date: Date) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const minutes = Math.floor((1704110400000 - date.getTime()) / 60000); // 2024-01-01 12:00:00 as base
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  // Stats
  const stats = [
    { label: 'Bugün', value: activities.filter(l => l.timestamp.getTime() > 1704060000000).length },
    { label: 'Bu Hafta', value: activities.filter(l => l.timestamp.getTime() > 1703450000000).length },
    { label: 'Kullanıcı İşlemi', value: activities.filter(l => l.user.name !== 'Sistem').length },
    { label: 'Sistem İşlemi', value: activities.filter(l => l.user.name === 'Sistem').length }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Aktivite Günlüğü</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Tüm sistem ve kullanıcı işlemlerini takip edin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Dışa Aktar</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Yenile</span>
            </motion.button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center gap-2 mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
            <span className="text-sm text-indigo-400">Aktiviteler yükleniyor...</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-100 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-4"
            >
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Aktivitelerde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-xl text-foreground placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ActivityLog['type'] | 'all')}
              className="appearance-none px-4 py-3 pr-10 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
            >
              <option value="all">Tüm İşlemler</option>
              {Object.entries(typeConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Module Filter */}
          <div className="relative">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value as ActivityLog['module'] | 'all')}
              className="appearance-none px-4 py-3 pr-10 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
            >
              <option value="all">Tüm Modüller</option>
              {Object.entries(moduleConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Date Range */}
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              className="appearance-none pl-10 pr-10 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
            >
              <option value="today">Bugün</option>
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
              <option value="all">Tümü</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {filteredLogs.map((log, index) => {
                const TypeIcon = typeConfig[log.type as keyof typeof typeConfig]?.icon ?? Activity;
                const ModuleIcon = moduleConfig[log.module as keyof typeof moduleConfig]?.icon ?? Activity;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedLog(log)}
                    className={`group cursor-pointer bg-white dark:bg-slate-900/50 backdrop-blur-sm border rounded-2xl p-4 transition-all hover:border-purple-500/30 ${selectedLog?.id === log.id ? 'border-purple-500' : 'border-slate-300 dark:border-slate-800'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig[log.type as keyof typeof typeConfig]?.color ?? 'bg-slate-500'}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground">{log.title}</h3>
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                            <ModuleIcon className="w-3 h-3" />
                            {moduleConfig[log.module as keyof typeof moduleConfig]?.label ?? log.module}
                          </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">{log.description}</p>

                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <User className="w-3 h-3" />
                            {log.user.name}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {formatTime(log.timestamp)}
                          </span>
                          {log.ip && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Globe className="w-3 h-3" />
                              {log.ip}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedLog ? (
                <motion.div
                  key={selectedLog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="sticky top-6 bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-300 dark:border-slate-800 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">Detaylar</h3>

                  <div className="space-y-4">
                    {/* Activity Info */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-600 dark:text-slate-500 uppercase tracking-wide">İşlem</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${typeConfig[selectedLog.type].color}`}>
                            {(() => {
                              const Icon = typeConfig[selectedLog.type].icon;
                              return <Icon className="w-3 h-3" />;
                            })()}
                          </div>
                          <span className="text-foreground">{typeConfig[selectedLog.type].label}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wide">Modül</label>
                        <div className="flex items-center gap-2 mt-1">
                          {(() => {
                            const Icon = moduleConfig[selectedLog.module].icon;
                            return <Icon className="w-4 h-4 text-slate-400" />;
                          })()}
                          <span className="text-white">{moduleConfig[selectedLog.module].label}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wide">Kullanıcı</label>
                        <div className="mt-1">
                          <div className="text-white">{selectedLog.user.name}</div>
                          <div className="text-sm text-slate-400">{selectedLog.user.email}</div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wide">Zaman</label>
                        <div className="text-white mt-1">
                          {selectedLog.timestamp.toLocaleString('tr-TR')}
                        </div>
                      </div>

                      {selectedLog.ip && (
                        <div>
                          <label className="text-xs text-slate-500 uppercase tracking-wide">IP Adresi</label>
                          <div className="text-white mt-1">{selectedLog.ip}</div>
                        </div>
                      )}

                      {selectedLog.userAgent && (
                        <div>
                          <label className="text-xs text-slate-500 uppercase tracking-wide">Tarayıcı</label>
                          <div className="text-white mt-1">{selectedLog.userAgent}</div>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    {selectedLog.metadata && (
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wide">Ek Bilgiler</label>
                        <div className="mt-2 bg-slate-800/50 rounded-xl p-3">
                          <pre className="text-xs text-slate-300 overflow-x-auto">
                            {JSON.stringify(selectedLog.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="sticky top-6 bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-300 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center"
                  style={{ minHeight: '300px' }}
                >
                  <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-3" />
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">Detay Seçilmedi</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                    Detayları görmek için bir aktivite seçin
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
