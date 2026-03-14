'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardDrive,
  Plus,
  Download,
  RotateCcw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Server,
  Database,
  Shield,
  Calendar,
  Zap,
  TrendingUp,
  Pause,
  Play,
  Settings,
  Archive,
  Eye,
  EyeOff,
} from 'lucide-react';

// Types
interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'failed' | 'in_progress' | 'scheduled';
  size: number;
  compressedSize: number;
  createdAt: Date;
  completedAt?: Date;
  retentionDays: number;
  expiresAt: Date;
  location: string;
  verificationStatus: 'verified' | 'pending' | 'failed';
  databases: string[];
  tables: number;
  estimatedRestoreTime: number;
}

interface BackupSchedule {
  id: string;
  name: string;
  type: 'full' | 'incremental';
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retentionDays: number;
  enabled: boolean;
  lastRun: Date;
  nextRun: Date;
}

interface RestorePoint {
  id: string;
  timestamp: Date;
  type: 'backup' | 'snapshot' | 'transaction_log';
  description: string;
  sizeGB: number;
  rto: number;
  rpo: number;
}

// Demo data
const backups: Backup[] = [
  {
    id: '1',
    name: 'Full Backup - 2025-03-01',
    type: 'full',
    status: 'completed',
    size: 125600,
    compressedSize: 34200,
    createdAt: new Date('2025-03-01T02:00:00'),
    completedAt: new Date('2025-03-01T02:15:00'),
    retentionDays: 30,
    expiresAt: new Date('2025-03-31'),
    location: 'aws-s3://backups/prod/2025-03-01',
    verificationStatus: 'verified',
    databases: ['pazaryonetimi_prod', 'analytics', 'cache'],
    tables: 45,
    estimatedRestoreTime: 8,
  },
  {
    id: '2',
    name: 'Incremental - 2025-03-01 10:00',
    type: 'incremental',
    status: 'in_progress',
    size: 2100,
    compressedSize: 890,
    createdAt: new Date('2025-03-01T10:00:00'),
    retentionDays: 7,
    expiresAt: new Date('2025-03-08'),
    location: 'aws-s3://backups/prod/2025-03-01-incremental',
    verificationStatus: 'pending',
    databases: ['pazaryonetimi_prod'],
    tables: 12,
    estimatedRestoreTime: 2,
  },
  {
    id: '3',
    name: 'Full Backup - 2025-02-28',
    type: 'full',
    status: 'completed',
    size: 124800,
    compressedSize: 33900,
    createdAt: new Date('2025-02-28T02:00:00'),
    completedAt: new Date('2025-02-28T02:12:00'),
    retentionDays: 30,
    expiresAt: new Date('2025-03-30'),
    location: 'aws-s3://backups/prod/2025-02-28',
    verificationStatus: 'verified',
    databases: ['pazaryonetimi_prod', 'analytics', 'cache'],
    tables: 45,
    estimatedRestoreTime: 8,
  },
];

const schedules: BackupSchedule[] = [
  {
    id: '1',
    name: 'Daily Full Backup',
    type: 'full',
    frequency: 'daily',
    time: '02:00 UTC',
    retentionDays: 30,
    enabled: true,
    lastRun: new Date('2025-03-01T02:00:00'),
    nextRun: new Date('2025-03-02T02:00:00'),
  },
  {
    id: '2',
    name: 'Hourly Incremental',
    type: 'incremental',
    frequency: 'daily',
    time: 'Every hour',
    retentionDays: 7,
    enabled: true,
    lastRun: new Date('2025-03-01T11:00:00'),
    nextRun: new Date('2025-03-01T12:00:00'),
  },
];

const restorePoints: RestorePoint[] = [
  {
    id: '1',
    timestamp: new Date('2025-03-01T10:30:00'),
    type: 'backup',
    description: 'Full backup of production database',
    sizeGB: 34.2,
    rto: 8,
    rpo: 24,
  },
  {
    id: '2',
    timestamp: new Date('2025-03-01T02:00:00'),
    type: 'backup',
    description: 'Full backup (before scaling event)',
    sizeGB: 33.9,
    rto: 8,
    rpo: 24,
  },
];

// Backup Card Component
function BackupCard({ backup }: { backup: Backup }) {
  const statusColor = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    'in_progress': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    scheduled: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  };

  return (
    <motion.div
      whileHover={{ translateY: -2 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold">{backup.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${statusColor[backup.status]}`}>
              {backup.status === 'in_progress' ? '⏳ İşlemde' : backup.status === 'completed' ? '✓ Tamamlandı' : backup.status}
            </span>
            {backup.verificationStatus === 'verified' && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Doğrulandı
              </span>
            )}
          </div>
        </div>
        <span className="text-2xl">{backup.type === 'full' ? '📦' : '📝'}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Boyut</p>
          <p className="font-semibold">
            {(backup.compressedSize / 1024).toFixed(1)} GB
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Sıkıştırma</p>
          <p className="font-semibold">
            {((1 - backup.compressedSize / backup.size) * 100).toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Geri Yükleme Süresi</p>
          <p className="font-semibold">{backup.estimatedRestoreTime} dk</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Konumu</p>
          <p className="font-semibold text-xs text-blue-600 dark:text-blue-400">AWS S3</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/30 text-sm font-medium flex items-center justify-center gap-1">
          <RotateCcw className="w-4 h-4" />
          Geri Yükle
        </button>
        <button className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium flex items-center justify-center gap-1">
          <Download className="w-4 h-4" />
          İndir
        </button>
      </div>
    </motion.div>
  );
}

// Schedule Card Component
function ScheduleCard({
  schedule,
  onToggle,
}: {
  schedule: BackupSchedule;
  onToggle: (id: string) => void;
}) {
  return (
    <motion.div
      whileHover={{ translateY: -2 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold">{schedule.name}</h4>
          <p className="text-xs text-gray-500 mt-1">
            {schedule.frequency === 'daily' ? 'Her Gün' : schedule.frequency === 'weekly' ? 'Haftalık' : 'Aylık'}
          </p>
        </div>
        <button
          onClick={() => onToggle(schedule.id)}
          className={`p-2 rounded-lg ${
            schedule.enabled
              ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          {schedule.enabled ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
        </button>
      </div>

      <div className="space-y-2 text-sm mb-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Saat</span>
          <span className="font-semibold">{schedule.time}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Saklama</span>
          <span className="font-semibold">{schedule.retentionDays} gün</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Son Çalışma</span>
          <span className="font-semibold">{schedule.lastRun.toLocaleDateString('tr-TR')}</span>
        </div>
      </div>

      <button className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium">
        Düzenle
      </button>
    </motion.div>
  );
}

// Main Component
export function BackupManagement() {
  const [activeTab, setActiveTab] = useState<'backups' | 'schedules' | 'restore'>('backups');
  const [localBackups, setLocalBackups] = useState(backups);
  const [localSchedules, setLocalSchedules] = useState(schedules);
  const [showNewBackupModal, setShowNewBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const totalBackupSize = localBackups.reduce((sum, b) => sum + b.compressedSize, 0);
  const completedBackups = localBackups.filter(b => b.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <HardDrive className="w-8 h-8 text-blue-600" />
            Yedek & Kurtarma
          </h2>
          <p className="text-gray-500 mt-1">Otomatik yedekleme ve afet kurtarma yönetimi</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowNewBackupModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Manuel Yedek
          </button>
          <button
            onClick={() => setShowRestoreModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <RotateCcw className="w-4 h-4" />
            Geri Yükle
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm">Toplam Yedek Boyutu</p>
          <p className="text-2xl font-bold mt-2">{(totalBackupSize / 1024).toFixed(1)} GB</p>
          <p className="text-xs text-gray-500 mt-1">3 yedekten</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm">Başarılı Yedekler</p>
          <p className="text-2xl font-bold mt-2">{completedBackups}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Son 30 gün</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm">RTO (Kurtarma Süresi)</p>
          <p className="text-2xl font-bold mt-2">4 saat</p>
          <p className="text-xs text-gray-500 mt-1">Maksimum hedef</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm">RPO (Veri Kaybı)</p>
          <p className="text-2xl font-bold mt-2">1 saat</p>
          <p className="text-xs text-gray-500 mt-1">Hedef veri kaybı</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'backups', label: '📦 Yedekler', icon: Archive },
          { id: 'schedules', label: '⏰ Zamanlamalar', icon: Calendar },
          { id: 'restore', label: '↩️ Geri Yükleme', icon: RotateCcw },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'backups' && (
          <motion.div
            key="backups"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {localBackups.map(backup => (
              <BackupCard key={backup.id} backup={backup} />
            ))}
          </motion.div>
        )}

        {activeTab === 'schedules' && (
          <motion.div
            key="schedules"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {localSchedules.map(schedule => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onToggle={(id) =>
                  setLocalSchedules(prev =>
                    prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
                  )
                }
              />
            ))}
          </motion.div>
        )}

        {activeTab === 'restore' && (
          <motion.div
            key="restore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {restorePoints.map(point => (
              <div
                key={point.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{point.description}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {point.timestamp.toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-500/30">
                    Geri Yükle
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Boyut</p>
                    <p className="font-semibold">{point.sizeGB} GB</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">RTO</p>
                    <p className="font-semibold">{point.rto} dk</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">RPO</p>
                    <p className="font-semibold">{point.rpo} dk</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-4 border border-blue-200 dark:border-blue-500/30">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Bilgi:</strong> Sistem otomatik olarak günde 1 tam ve saatte 1 artımsal yedek alıyor. Tüm yedekler coğrafik olarak farklı veri merkezlerinde depolanıyor.
        </p>
      </div>
    </div>
  );
}

export default BackupManagement;
