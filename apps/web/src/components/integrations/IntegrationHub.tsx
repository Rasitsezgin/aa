'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug,
  Store,
  Truck,
  FileText,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  Shield,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useToast } from '@/providers/toast-provider';
import {
  connectProvider,
  fetchIntegrationCatalog,
  fetchTenantConnections,
  testProviderConnection,
  triggerProviderSync,
  type IntegrationCategory,
  type ProviderCatalogEntry,
  type TenantConnection,
} from '@/lib/integrations-hub-api';

const CATEGORY_TABS: Array<{
  id: IntegrationCategory | 'ALL';
  label: string;
  icon: React.ElementType;
}> = [
  { id: 'ALL', label: 'Tümü', icon: Plug },
  { id: 'MARKETPLACE', label: 'Pazaryerleri', icon: Store },
  { id: 'ECOMMERCE', label: 'E-Ticaret', icon: Store },
  { id: 'SHIPPING', label: 'Kargo', icon: Truck },
  { id: 'ACCOUNTING', label: 'E-Fatura', icon: FileText },
];

const PROVIDER_LOGOS: Record<string, string> = {
  trendyol: '/images/pazaryeri/Trendyol.png',
  hepsiburada: '/images/pazaryeri/Hepsiburada.png',
  'amazon-tr': '/images/pazaryeri/Amazon.png',
  n11: '/images/pazaryeri/N11.png',
  ciceksepeti: '/images/pazaryeri/ciceksepeti.png',
  pttavm: '/images/pazaryeri/pttavm.png',
  shopify: '/images/pazaryeri/Shopify.png',
  woocommerce: '/images/pazaryeri/WooCommerce.png',
  ticimax: '/images/pazaryeri/ticimax.webp',
  ideasoft: '/images/pazaryeri/ideasoft-logo.webp',
};

/** Glassmorphism entegrasyon yönetim paneli — 4 kategori */
export function IntegrationHub() {
  const toast = useToast();
  const [catalog, setCatalog] = useState<ProviderCatalogEntry[]>([]);
  const [connections, setConnections] = useState<TenantConnection[]>([]);
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<ProviderCatalogEntry | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  /** Katalog ve bağlantıları yükler */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [catalogData, connectionData] = await Promise.all([
        fetchIntegrationCatalog(),
        fetchTenantConnections(),
      ]);
      setCatalog(catalogData);
      setConnections(connectionData);
    } catch (err) {
      toast.error('Yükleme hatası', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const connectionMap = useMemo(() => {
    const map = new Map<string, TenantConnection>();
    connections.forEach((c) => map.set(c.providerId, c));
    return map;
  }, [connections]);

  const filteredProviders = useMemo(() => {
    return catalog.filter((p) => {
      const matchesCategory =
        activeCategory === 'ALL' || p.category === activeCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [catalog, activeCategory, search]);

  const stats = useMemo(() => ({
    total: catalog.length,
    connected: connections.filter((c) => c.isActive).length,
    adapters: connections.filter((c) => c.hasAdapter).length,
  }), [catalog, connections]);

  /** Bağlantı modalını açar */
  const openConnectModal = (provider: ProviderCatalogEntry) => {
    const initial: Record<string, string> = {};
    provider.requiredFields.forEach((f) => {
      initial[f.key] = '';
    });
    setCredentials(initial);
    setSelectedProvider(provider);
  };

  /** Sağlayıcı bağlantısı kurar */
  const handleConnect = async () => {
    if (!selectedProvider) return;
    setConnecting(true);
    try {
      const result = await connectProvider(selectedProvider.id, credentials);
      toast.success('Bağlantı kuruldu', result.message);
      if (result.initialSync?.queued) {
        toast.info('Senkronizasyon', result.initialSync.message);
      }
      setSelectedProvider(null);
      await loadData();
    } catch (err) {
      toast.error('Bağlantı hatası', (err as Error).message);
    } finally {
      setConnecting(false);
    }
  };

  /** Bağlantı testi */
  const handleTest = async (connection: TenantConnection) => {
    try {
      const result = await testProviderConnection(connection.id, connection.providerId);
      if (result.success) {
        toast.success('Test başarılı', result.message);
      } else {
        toast.error('Test başarısız', result.message);
      }
    } catch (err) {
      toast.error('Test hatası', (err as Error).message);
    }
  };

  /** Manuel sync */
  const handleSync = async (connection: TenantConnection) => {
    setSyncingId(connection.id);
    try {
      const result = await triggerProviderSync(connection.id);
      toast.success(
        result.queued ? 'Kuyruğa eklendi' : 'Senkronizasyon',
        result.message,
      );
    } catch (err) {
      toast.error('Sync hatası', (err as Error).message);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="p-2 rounded-xl bg-white/10 backdrop-blur border border-white/20">
                  <Plug className="w-7 h-7 text-indigo-300" />
                </span>
                Entegrasyon Merkezi
              </h1>
              <p className="mt-2 text-slate-400">
                Pazaryeri, e-ticaret, kargo ve e-fatura bağlantılarını tek panelden yönetin
              </p>
            </div>
            <button
              onClick={() => void loadData()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/15 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Toplam Sağlayıcı', value: stats.total, color: 'from-indigo-500/20' },
            { label: 'Aktif Bağlantı', value: stats.connected, color: 'from-emerald-500/20' },
            { label: 'Adapter Hazır', value: stats.adapters, color: 'from-violet-500/20' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-5 rounded-2xl bg-gradient-to-br ${stat.color} to-white/5 backdrop-blur-xl border border-white/10`}
            >
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Category tabs + search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sağlayıcı ara..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 backdrop-blur border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/50"
            />
          </div>
        </div>

        {/* Provider grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map((provider, index) => {
              const connection = connectionMap.get(provider.id);
              const isConnected = connection?.isActive;
              const logo = PROVIDER_LOGOS[provider.id];

              return (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {logo ? (
                        <img
                          src={logo}
                          alt={provider.name}
                          className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                          <Store className="w-5 h-5 text-indigo-300" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-white">{provider.name}</h3>
                        <p className="text-xs text-slate-500">{provider.country}</p>
                      </div>
                    </div>
                    {isConnected ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Bağlı
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">
                        {provider.status}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {provider.features.productSync && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        Ürün
                      </span>
                    )}
                    {provider.features.orderSync && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        Sipariş
                      </span>
                    )}
                    {provider.features.shipmentCreate && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Kargo
                      </span>
                    )}
                    {provider.features.invoiceSync && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        Fatura
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isConnected && connection ? (
                      <>
                        <button
                          onClick={() => void handleTest(connection)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Test
                        </button>
                        <button
                          onClick={() => void handleSync(connection)}
                          disabled={syncingId === connection.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 hover:bg-indigo-500/30 disabled:opacity-50"
                        >
                          {syncingId === connection.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                          Sync
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => openConnectModal(provider)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium bg-indigo-500/30 text-indigo-100 border border-indigo-400/40 hover:bg-indigo-500/40 transition-all"
                      >
                        <Plug className="w-4 h-4" />
                        Bağlan
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && filteredProviders.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Sonuç bulunamadı</p>
          </div>
        )}
      </div>

      {/* Connect modal */}
      <AnimatePresence>
        {selectedProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedProvider(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/15 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedProvider.name} Bağlantısı
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    API bilgileriniz AES-256 ile şifrelenerek saklanır
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {selectedProvider.requiredFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      {field.label}
                      {field.required && <span className="text-rose-400 ml-1">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={
                          field.type === 'password' && !showSecrets[field.key]
                            ? 'password'
                            : 'text'
                        }
                        value={credentials[field.key] ?? ''}
                        onChange={(e) =>
                          setCredentials((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400/50"
                        placeholder={field.label}
                      />
                      {field.type === 'password' && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowSecrets((prev) => ({
                              ...prev,
                              [field.key]: !prev[field.key],
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showSecrets[field.key] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => void handleConnect()}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 disabled:opacity-50 transition-all"
              >
                {connecting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plug className="w-5 h-5" />
                )}
                Bağlantıyı Kur
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
