"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  Database,
  RefreshCw,
  Play,
  Square,
  Terminal,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Zap,
  Shield,
  Eye,
  FileText,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Loader2,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface SystemService {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'maintenance';
  type: 'api' | 'web' | 'database' | 'worker' | 'cache' | 'queue';
  port?: number;
  uptime?: number;
  memory?: number;
  cpu?: number;
  lastRestart?: Date;
  version?: string;
  logs?: string[];
}

interface DatabaseInfo {
  name: string;
  size: number;
  connections: number;
  lastBackup?: Date;
  status: 'healthy' | 'warning' | 'error';
}

interface DeploymentInfo {
  version: string;
  deployedAt: Date;
  deployedBy: string;
  status: 'success' | 'failed' | 'in_progress';
  commitHash?: string;
  branch?: string;
}

export default function SystemManagementPage() {
  const [activeTab, setActiveTab] = useState<'services' | 'database' | 'deployment' | 'scripts'>('services');
  const [services, setServices] = useState<SystemService[]>([]);
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null);
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState<string | null>(null);
  const [scriptOutput, setScriptOutput] = useState<string>('');

  const tabs = [
    { id: 'services', label: 'Servisler', icon: Server },
    { id: 'database', label: 'Veritabanı', icon: Database },
    { id: 'deployment', label: 'Deployment', icon: Upload },
    { id: 'scripts', label: 'Scripts', icon: Terminal },
  ];

  useEffect(() => {
    fetchSystemData();
  }, [activeTab]);

  const fetchSystemData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'services':
          const servicesRes = await fetch('/api/system/services');
          if (servicesRes.ok) {
            const servicesData = await servicesRes.json();
            setServices(Array.isArray(servicesData) ? servicesData : []);
          }
          break;
        case 'database':
          const dbRes = await fetch('/api/system/database');
          if (dbRes.ok) {
            setDatabaseInfo(await dbRes.json());
          }
          break;
        case 'deployment':
          const deployRes = await fetch('/api/system/deployment');
          if (deployRes.ok) {
            setDeploymentInfo(await deployRes.json());
          }
          break;
      }
    } catch (error) {
      console.error('Sistem verisi alınamadı:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceAction = async (serviceId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const res = await fetch(`/api/system/services/${serviceId}/${action}`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchSystemData();
      }
    } catch (error) {
      console.error('Servis işlemi başarısız:', error);
    }
  };

  const handleDatabaseAction = async (action: 'backup' | 'migrate' | 'optimize') => {
    try {
      const res = await fetch(`/api/system/database/${action}`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchSystemData();
      }
    } catch (error) {
      console.error('Veritabanı işlemi başarısız:', error);
    }
  };

  const handleScriptRun = async (scriptName: string) => {
    try {
      const res = await fetch(`/api/system/scripts/${scriptName}/run`, {
        method: 'POST',
      });
      if (res.ok) {
        const result = await res.json();
        setScriptOutput(result.output || 'Script başarıyla çalıştırıldı');
      }
    } catch (error) {
      setScriptOutput('Script çalıştırılırken hata oluştu');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-500 bg-green-500/10';
      case 'stopped': return 'text-red-500 bg-red-500/10';
      case 'error': return 'text-red-500 bg-red-500/10';
      case 'maintenance': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="w-4 h-4" />;
      case 'stopped': return <Square className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance': return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}g ${hours}s`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Sistem Yönetimi</h1>
          <p className="text-slate-500 font-medium">Tüm proje servislerini ve sistem kaynaklarını merkezi olarak yönetin.</p>
        </div>
        <button
          onClick={fetchSystemData}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Yenile
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-foreground shadow-sm'
                : 'text-slate-500 hover:text-foreground'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-200 dark:border-white/5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{service.name}</h3>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">{service.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {service.status === 'running' ? (
                        <>
                          <button
                            onClick={() => handleServiceAction(service.id, 'restart')}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                            title="Yeniden Başlat"
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            onClick={() => handleServiceAction(service.id, 'stop')}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                            title="Durdur"
                          >
                            <Square size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleServiceAction(service.id, 'start')}
                          className="p-2 hover:bg-green-100 dark:hover:bg-green-500/10 rounded-lg transition-colors text-green-500"
                          title="Başlat"
                        >
                          <Play size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => setShowLogs(showLogs === service.id ? null : service.id)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                        title="Logları Görüntüle"
                      >
                        <FileText size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {service.port && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Port:</span>
                        <span className="font-medium">{service.port}</span>
                      </div>
                    )}
                    {service.uptime && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Çalışma Süresi:</span>
                        <span className="font-medium">{formatUptime(service.uptime)}</span>
                      </div>
                    )}
                    {service.memory && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bellek:</span>
                        <span className="font-medium">{formatBytes(service.memory)}</span>
                      </div>
                    )}
                    {service.cpu && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">CPU:</span>
                        <span className="font-medium">%{service.cpu.toFixed(1)}</span>
                      </div>
                    )}
                    {service.version && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Versiyon:</span>
                        <span className="font-medium">{service.version}</span>
                      </div>
                    )}
                  </div>

                  {showLogs === service.id && service.logs && (
                    <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg max-h-40 overflow-y-auto">
                      <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                        {service.logs.slice(-10).join('\n')}
                      </pre>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'database' && databaseInfo && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-8 h-8 text-blue-500" />
                  <div>
                    <h3 className="font-bold text-foreground">Veritabanı</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{databaseInfo.name}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Boyut:</span>
                    <span className="font-medium">{formatBytes(databaseInfo.size)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Bağlantılar:</span>
                    <span className="font-medium">{databaseInfo.connections}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Durum:</span>
                    <span className={`font-medium ${databaseInfo.status === 'healthy' ? 'text-green-500' : databaseInfo.status === 'warning' ? 'text-amber-500' : 'text-red-500'}`}>
                      {databaseInfo.status === 'healthy' ? 'Sağlıklı' : databaseInfo.status === 'warning' ? 'Uyarı' : 'Hata'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-200 dark:border-white/5">
                <h3 className="font-bold text-foreground mb-4">Son Yedekleme</h3>
                <div className="text-center">
                  {databaseInfo.lastBackup ? (
                    <>
                      <div className="text-2xl font-black text-foreground mb-1">
                        {databaseInfo.lastBackup.toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-sm text-slate-500">
                        {databaseInfo.lastBackup.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500">Yedekleme bulunamadı</div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5">
              <h3 className="text-lg font-bold text-foreground mb-6">Veritabanı İşlemleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleDatabaseAction('backup')}
                  className="flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
                >
                  <Download size={18} />
                  Yedek Al
                </button>
                <button
                  onClick={() => handleDatabaseAction('migrate')}
                  className="flex items-center justify-center gap-2 p-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-colors"
                >
                  <RotateCcw size={18} />
                  Migrate
                </button>
                <button
                  onClick={() => handleDatabaseAction('optimize')}
                  className="flex items-center justify-center gap-2 p-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-colors"
                >
                  <Zap size={18} />
                  Optimize Et
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deployment' && deploymentInfo && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl ${deploymentInfo.status === 'success' ? 'bg-green-500/10 text-green-500' : deploymentInfo.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {deploymentInfo.status === 'success' ? <CheckCircle size={24} /> : deploymentInfo.status === 'failed' ? <AlertTriangle size={24} /> : <Loader2 size={24} className="animate-spin" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Son Deployment</h3>
                  <p className="text-slate-500">Versiyon {deploymentInfo.version}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Deploy Tarihi</label>
                  <div className="text-lg font-bold text-foreground">
                    {deploymentInfo.deployedAt.toLocaleDateString('tr-TR')}
                  </div>
                  <div className="text-sm text-slate-500">
                    {deploymentInfo.deployedAt.toLocaleTimeString('tr-TR')}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Deploy Eden</label>
                  <div className="text-lg font-bold text-foreground">{deploymentInfo.deployedBy}</div>
                </div>
                {deploymentInfo.commitHash && (
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Commit Hash</label>
                    <div className="font-mono text-sm text-foreground">{deploymentInfo.commitHash}</div>
                  </div>
                )}
                {deploymentInfo.branch && (
                  <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Branch</label>
                    <div className="text-lg font-bold text-foreground">{deploymentInfo.branch}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scripts' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5">
              <h3 className="text-lg font-bold text-foreground mb-6">Script Çalıştırma</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleScriptRun('seed-demo')}
                    className="flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
                  >
                    <Play size={18} />
                    Demo Verilerini Yükle
                  </button>
                  <button
                    onClick={() => handleScriptRun('clear-cache')}
                    className="flex items-center justify-center gap-2 p-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors"
                  >
                    <Trash2 size={18} />
                    Cache Temizle
                  </button>
                  <button
                    onClick={() => handleScriptRun('update-indexes')}
                    className="flex items-center justify-center gap-2 p-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-colors"
                  >
                    <RefreshCw size={18} />
                    İndeksleri Güncelle
                  </button>
                  <button
                    onClick={() => handleScriptRun('health-check')}
                    className="flex items-center justify-center gap-2 p-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-colors"
                  >
                    <Activity size={18} />
                    Sağlık Kontrolü
                  </button>
                </div>

                {scriptOutput && (
                  <div className="mt-6">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1 block mb-2">Script Çıktısı</label>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl font-mono text-sm max-h-60 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{scriptOutput}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}