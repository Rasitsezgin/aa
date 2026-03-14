'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  CheckCircle,
  Clock,
  Globe,
  Monitor,
  FileText,
  Settings,
  Package,
  ShoppingCart,
  Zap,
  Key,
  Database,
  Bot,
  Webhook,
  X
} from 'lucide-react';

// Types
interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  metadata?: Record<string, any>;
  duration?: number;
  success: boolean;
  errorMessage?: string;
}

interface AuditStats {
  totalLogs: number;
  byAction: Record<string, number>;
  bySeverity: Record<string, number>;
  byUser: { userId: string; email: string; count: number }[];
  successRate: number;
  recentActivity: AuditLog[];
}

// Demo data generator
function generateDemoLogs(count: number = 100): AuditLog[] {
  const actions = [
    'auth.login', 'auth.logout', 'auth.login_failed',
    'product.create', 'product.update', 'product.delete',
    'order.create', 'order.update', 'order.ship',
    'settings.update', 'webhook.create', 'api_key.create',
    'ai.analyze', 'automation.trigger', 'data.export'
  ];

  const users = [
    { id: 'user1', email: 'admin@example.com' },
    { id: 'user2', email: 'manager@example.com' },
    { id: 'user3', email: 'staff@example.com' },
  ];

  const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '::1'];

  const logs: AuditLog[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const success = Math.random() > 0.1;

    let severity: 'info' | 'warning' | 'error' | 'critical' = 'info';
    if (!success) severity = 'error';
    else if (action.includes('delete') || action.includes('api_key')) severity = 'critical';
    else if (action.includes('failed') || action.includes('settings')) severity = 'warning';

    logs.push({
      id: `audit_${i}`,
      timestamp: new Date(now.getTime() - i * 1000 * 60 * (Math.random() * 60)),
      action,
      severity,
      userId: user.id,
      userEmail: user.email,
      ipAddress: ips[Math.floor(Math.random() * ips.length)],
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      resourceType: action.split('.')[0],
      resourceId: `${action.split('.')[0]}_${Math.floor(Math.random() * 1000)}`,
      duration: Math.floor(Math.random() * 500),
      success,
      errorMessage: !success ? 'Operation failed' : undefined,
    });
  }

  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Hooks
export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<{
    action?: string;
    severity?: string;
    userId?: string;
    success?: boolean;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }>({});

  useEffect(() => {
    const fetchLogs = () => {
      setLoading(true);
      setTimeout(() => {
        let allLogs = generateDemoLogs(200);

        // Apply filters
        if (filters.action) {
          allLogs = allLogs.filter(log => log.action.includes(filters.action!));
        }
        if (filters.severity) {
          allLogs = allLogs.filter(log => log.severity === filters.severity);
        }
        if (filters.userId) {
          allLogs = allLogs.filter(log => log.userId === filters.userId);
        }
        if (filters.success !== undefined) {
          allLogs = allLogs.filter(log => log.success === filters.success);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          allLogs = allLogs.filter(log =>
            log.action.includes(search) ||
            log.userEmail?.toLowerCase().includes(search) ||
            log.resourceType?.includes(search)
          );
        }

        const perPage = 20;
        setTotalPages(Math.ceil(allLogs.length / perPage));
        setLogs(allLogs.slice((page - 1) * perPage, page * perPage));
        setLoading(false);
      }, 500);
    };

    fetchLogs();
  }, [page, filters]);

  return { logs, loading, page, setPage, totalPages, filters, setFilters };
}

export function useAuditStats() {
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const logs = generateDemoLogs(200);

      const byAction: Record<string, number> = {};
      const bySeverity: Record<string, number> = {};
      const userCounts: Record<string, { email: string; count: number }> = {};
      let successCount = 0;

      logs.forEach(log => {
        byAction[log.action] = (byAction[log.action] || 0) + 1;
        bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
        if (log.userId) {
          if (!userCounts[log.userId]) {
            userCounts[log.userId] = { email: log.userEmail || '', count: 0 };
          }
          userCounts[log.userId].count++;
        }
        if (log.success) successCount++;
      });

      setStats({
        totalLogs: logs.length,
        byAction,
        bySeverity,
        byUser: Object.entries(userCounts)
          .map(([userId, data]) => ({ userId, ...data }))
          .sort((a, b) => b.count - a.count),
        successRate: (successCount / logs.length) * 100,
        recentActivity: logs.slice(0, 10),
      });
      setLoading(false);
    }, 300);
  }, []);

  return { stats, loading };
}

// Components
const severityConfig = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Bilgi' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Uyarı' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Hata' },
  critical: { icon: AlertCircle, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Kritik' },
};

const actionIcons: Record<string, any> = {
  auth: Key,
  user: User,
  product: Package,
  order: ShoppingCart,
  settings: Settings,
  webhook: Webhook,
  api_key: Key,
  ai: Bot,
  automation: Zap,
  data: Database,
  inventory: Package,
  marketplace: Globe,
};

function getActionIcon(action: string) {
  const category = action.split('.')[0];
  return actionIcons[category] || Activity;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'Az önce';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} dk önce`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} saat önce`;

  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatAction(action: string): string {
  const translations: Record<string, string> = {
    'auth.login': 'Giriş yapıldı',
    'auth.logout': 'Çıkış yapıldı',
    'auth.login_failed': 'Giriş başarısız',
    'auth.password_change': 'Şifre değiştirildi',
    'product.create': 'Ürün oluşturuldu',
    'product.update': 'Ürün güncellendi',
    'product.delete': 'Ürün silindi',
    'order.create': 'Sipariş oluşturuldu',
    'order.update': 'Sipariş güncellendi',
    'order.ship': 'Sipariş kargolandı',
    'settings.update': 'Ayarlar güncellendi',
    'webhook.create': 'Webhook oluşturuldu',
    'api_key.create': 'API anahtarı oluşturuldu',
    'ai.analyze': 'AI analizi yapıldı',
    'automation.trigger': 'Otomasyon tetiklendi',
    'data.export': 'Veri dışa aktarıldı',
  };

  return translations[action] || action.replace('.', ' - ').replace(/_/g, ' ');
}

// Log Details Modal
function LogDetailsModal({
  log,
  onClose
}: {
  log: AuditLog;
  onClose: () => void;
}) {
  const severity = severityConfig[log.severity];
  const SeverityIcon = severity.icon;
  const ActionIcon = getActionIcon(log.action);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${severity.bg}`}>
                <ActionIcon className={`w-5 h-5 ${severity.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{formatAction(log.action)}</h3>
                <p className="text-sm text-gray-500">{log.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${log.success
                ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
              }`}>
              {log.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {log.success ? 'Başarılı' : 'Başarısız'}
              </span>
            </div>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${severity.bg}`}>
              <SeverityIcon className={`w-4 h-4 ${severity.color}`} />
              <span className={`text-sm font-medium ${severity.color}`}>
                {severity.label}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Zaman</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="font-medium">{formatTimestamp(log.timestamp)}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500">Kullanıcı</p>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <p className="font-medium">{log.userEmail || 'Sistem'}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500">IP Adresi</p>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <p className="font-medium">{log.ipAddress || 'Bilinmiyor'}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500">Süre</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="font-medium">{log.duration ? `${log.duration}ms` : '-'}</p>
              </div>
            </div>

            {log.resourceType && (
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Kaynak Tipi</p>
                <p className="font-medium capitalize">{log.resourceType}</p>
              </div>
            )}

            {log.resourceId && (
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Kaynak ID</p>
                <p className="font-medium font-mono text-sm">{log.resourceId}</p>
              </div>
            )}
          </div>

          {/* User Agent */}
          {log.userAgent && (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Tarayıcı</p>
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {log.userAgent}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {log.errorMessage && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {log.errorMessage}
              </p>
            </div>
          )}

          {/* Changes */}
          {(log.oldValue || log.newValue) && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 font-medium">Değişiklikler</p>
              <div className="grid grid-cols-2 gap-4">
                {log.oldValue && (
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
                    <p className="text-xs text-red-600 dark:text-red-400 mb-1">Önceki</p>
                    <pre className="text-xs overflow-auto max-h-32">
                      {JSON.stringify(log.oldValue, null, 2)}
                    </pre>
                  </div>
                )}
                {log.newValue && (
                  <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">Sonraki</p>
                    <pre className="text-xs overflow-auto max-h-32">
                      {JSON.stringify(log.newValue, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Stats Card
function StatsCard({
  title,
  value,
  icon: Icon,
  color
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function AuditLogViewer() {
  const { logs, loading, page, setPage, totalPages, filters, setFilters } = useAuditLogs();
  const { stats, loading: statsLoading } = useAuditStats();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600" />
            Denetim Kayıtları
          </h2>
          <p className="text-gray-500 mt-1">
            Tüm sistem aktivitelerini izleyin ve denetleyin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilters({})}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Yenile"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => { }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Dışa Aktar"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-4 gap-4">
          <StatsCard
            title="Toplam Kayıt"
            value={stats.totalLogs}
            icon={FileText}
            color="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
          />
          <StatsCard
            title="Başarı Oranı"
            value={`${stats.successRate.toFixed(1)}%`}
            icon={CheckCircle}
            color="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
          />
          <StatsCard
            title="Uyarı"
            value={stats.bySeverity['warning'] || 0}
            icon={AlertTriangle}
            color="bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
          />
          <StatsCard
            title="Hata"
            value={(stats.bySeverity['error'] || 0) + (stats.bySeverity['critical'] || 0)}
            icon={XCircle}
            color="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
          />
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Kayıtlarda ara..."
              value={filters.search || ''}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${showFilters
                ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/20 dark:border-blue-500/50'
                : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <Filter className="w-4 h-4" />
            Filtreler
          </button>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-4 grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Aksiyon
                  </label>
                  <select
                    value={filters.action || ''}
                    onChange={e => setFilters({ ...filters, action: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-transparent"
                  >
                    <option value="">Tümü</option>
                    <option value="auth">Kimlik Doğrulama</option>
                    <option value="product">Ürün</option>
                    <option value="order">Sipariş</option>
                    <option value="settings">Ayarlar</option>
                    <option value="ai">AI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Önem Seviyesi
                  </label>
                  <select
                    value={filters.severity || ''}
                    onChange={e => setFilters({ ...filters, severity: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-transparent"
                  >
                    <option value="">Tümü</option>
                    <option value="info">Bilgi</option>
                    <option value="warning">Uyarı</option>
                    <option value="error">Hata</option>
                    <option value="critical">Kritik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Durum
                  </label>
                  <select
                    value={filters.success === undefined ? '' : filters.success ? 'true' : 'false'}
                    onChange={e => setFilters({
                      ...filters,
                      success: e.target.value === '' ? undefined : e.target.value === 'true'
                    })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-transparent"
                  >
                    <option value="">Tümü</option>
                    <option value="true">Başarılı</option>
                    <option value="false">Başarısız</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tarih Aralığı
                  </label>
                  <button className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span>Son 7 gün</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">Kayıtlar yükleniyor...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="mt-4 text-gray-500">Kayıt bulunamadı</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Zaman
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aksiyon
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kullanıcı
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    IP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Seviye
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map(log => {
                  const severity = severityConfig[log.severity];
                  const SeverityIcon = severity.icon;
                  const ActionIcon = getActionIcon(log.action);

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ActionIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {formatAction(log.action)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.userEmail || 'Sistem'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                        {log.ipAddress}
                      </td>
                      <td className="px-4 py-3">
                        {log.success ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Başarılı
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                            <XCircle className="w-4 h-4" />
                            Başarısız
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${severity.bg} ${severity.color}`}>
                          <SeverityIcon className="w-3 h-3" />
                          {severity.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Sayfa {page} / {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Log Details Modal */}
      <AnimatePresence>
        {selectedLog && (
          <LogDetailsModal
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default AuditLogViewer;
