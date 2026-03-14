"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Search,
  Filter,
  Settings,
  Shield,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Edit3,
  Save,
  Eye,
  Package,
  Users,
  TrendingUp,
  Building2,
  Lock,
  Unlock,
  ToggleLeft,
  ToggleRight,
  Zap,
  AlertTriangle,
  Info,
  RefreshCw,
  Download,
  Upload,
  Star,
  Crown,
  Sparkles,
} from 'lucide-react';

// Types
interface MarketplaceConfig {
  id: string;
  name: string;
  region: string;
  country: string;
  countryCode: string;
  minimumPlan: string;
  isActive: boolean;
  isEnabled: boolean;
  totalConnections: number;
  activeConnections: number;
  brandColor: string;
  planOverrides: Record<string, boolean>;
}

// Plan hierarchy
const PLANS = [
  { id: 'FREE', name: 'Ücretsiz', icon: Star, color: 'slate' },
  { id: 'STARTER', name: 'Başlangıç', icon: Zap, color: 'blue' },
  { id: 'PROFESSIONAL', name: 'Profesyonel', icon: Sparkles, color: 'purple' },
  { id: 'ENTERPRISE', name: 'Kurumsal', icon: Crown, color: 'amber' },
];

const REGIONS = [
  { id: 'ALL', name: 'Tüm Bölgeler' },
  { id: 'TURKEY', name: 'Türkiye' },
  { id: 'NORTH_AMERICA', name: 'Kuzey Amerika' },
  { id: 'EUROPE', name: 'Avrupa' },
  { id: 'ASIA_PACIFIC', name: 'Asya Pasifik' },
  { id: 'LATIN_AMERICA', name: 'Latin Amerika' },
  { id: 'GLOBAL', name: 'Global' },
];

// Mock marketplaces for admin
const MOCK_ADMIN_MARKETPLACES: MarketplaceConfig[] = [
  { id: 'trendyol', name: 'Trendyol', region: 'TURKEY', country: 'Türkiye', countryCode: 'TR', minimumPlan: 'FREE', isActive: true, isEnabled: true, totalConnections: 2450, activeConnections: 2180, brandColor: '#F27A1A', planOverrides: {} },
  { id: 'hepsiburada', name: 'Hepsiburada', region: 'TURKEY', country: 'Türkiye', countryCode: 'TR', minimumPlan: 'FREE', isActive: true, isEnabled: true, totalConnections: 1980, activeConnections: 1750, brandColor: '#FF6000', planOverrides: {} },
  { id: 'n11', name: 'N11', region: 'TURKEY', country: 'Türkiye', countryCode: 'TR', minimumPlan: 'FREE', isActive: true, isEnabled: true, totalConnections: 1420, activeConnections: 1280, brandColor: '#7B28C4', planOverrides: {} },
  { id: 'amazon-tr', name: 'Amazon Türkiye', region: 'TURKEY', country: 'Türkiye', countryCode: 'TR', minimumPlan: 'STARTER', isActive: true, isEnabled: true, totalConnections: 890, activeConnections: 820, brandColor: '#FF9900', planOverrides: {} },
  { id: 'ciceksepeti', name: 'Çiçeksepeti', region: 'TURKEY', country: 'Türkiye', countryCode: 'TR', minimumPlan: 'STARTER', isActive: true, isEnabled: true, totalConnections: 650, activeConnections: 580, brandColor: '#E91E63', planOverrides: {} },
  { id: 'amazon-us', name: 'Amazon US', region: 'NORTH_AMERICA', country: 'ABD', countryCode: 'US', minimumPlan: 'PROFESSIONAL', isActive: true, isEnabled: true, totalConnections: 420, activeConnections: 380, brandColor: '#FF9900', planOverrides: {} },
  { id: 'ebay-us', name: 'eBay US', region: 'NORTH_AMERICA', country: 'ABD', countryCode: 'US', minimumPlan: 'STARTER', isActive: true, isEnabled: true, totalConnections: 320, activeConnections: 290, brandColor: '#E53238', planOverrides: {} },
  { id: 'etsy', name: 'Etsy', region: 'GLOBAL', country: 'Global', countryCode: 'US', minimumPlan: 'STARTER', isActive: true, isEnabled: true, totalConnections: 580, activeConnections: 510, brandColor: '#F1641E', planOverrides: {} },
  { id: 'shopee-sg', name: 'Shopee', region: 'ASIA_PACIFIC', country: 'Singapur', countryCode: 'SG', minimumPlan: 'PROFESSIONAL', isActive: true, isEnabled: true, totalConnections: 280, activeConnections: 250, brandColor: '#EE4D2D', planOverrides: {} },
  { id: 'zalando', name: 'Zalando', region: 'EUROPE', country: 'Almanya', countryCode: 'DE', minimumPlan: 'ENTERPRISE', isActive: true, isEnabled: true, totalConnections: 180, activeConnections: 160, brandColor: '#FF6900', planOverrides: {} },
  { id: 'mercadolibre-mx', name: 'Mercado Libre', region: 'LATIN_AMERICA', country: 'Meksika', countryCode: 'MX', minimumPlan: 'PROFESSIONAL', isActive: true, isEnabled: true, totalConnections: 120, activeConnections: 100, brandColor: '#FFE600', planOverrides: {} },
  { id: 'shopify', name: 'Shopify', region: 'GLOBAL', country: 'Global', countryCode: 'CA', minimumPlan: 'STARTER', isActive: true, isEnabled: true, totalConnections: 780, activeConnections: 720, brandColor: '#96BF48', planOverrides: {} },
  { id: 'woocommerce', name: 'WooCommerce', region: 'GLOBAL', country: 'Global', countryCode: 'US', minimumPlan: 'FREE', isActive: true, isEnabled: true, totalConnections: 1100, activeConnections: 980, brandColor: '#7F54B3', planOverrides: {} },
];

export default function AdminIntegrationsPage() {
  const [marketplaces, setMarketplaces] = useState<MarketplaceConfig[]>(MOCK_ADMIN_MARKETPLACES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedPlan, setSelectedPlan] = useState('ALL');
  const [editingMarketplace, setEditingMarketplace] = useState<MarketplaceConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // Filter with useMemo to avoid setState in effect
  const filteredMarketplaces = React.useMemo(() => {
    let filtered = [...marketplaces];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.country.toLowerCase().includes(query)
      );
    }

    if (selectedRegion !== 'ALL') {
      filtered = filtered.filter(m => m.region === selectedRegion);
    }

    if (selectedPlan !== 'ALL') {
      filtered = filtered.filter(m => m.minimumPlan === selectedPlan);
    }

    return filtered;
  }, [marketplaces, searchQuery, selectedRegion, selectedPlan]);

  const toggleEnabled = (id: string) => {
    setMarketplaces(prev =>
      prev.map(m => m.id === id ? { ...m, isEnabled: !m.isEnabled } : m)
    );
  };

  const updateMinimumPlan = (id: string, plan: string) => {
    setMarketplaces(prev =>
      prev.map(m => m.id === id ? { ...m, minimumPlan: plan } : m)
    );
  };

  const togglePlanOverride = (marketplaceId: string, planId: string) => {
    setMarketplaces(prev =>
      prev.map(m => {
        if (m.id === marketplaceId) {
          const newOverrides = { ...m.planOverrides };
          if (newOverrides[planId] === undefined) {
            newOverrides[planId] = false; // Explicitly deny
          } else if (newOverrides[planId] === false) {
            newOverrides[planId] = true; // Explicitly allow
          } else {
            delete newOverrides[planId]; // Use default
          }
          return { ...m, planOverrides: newOverrides };
        }
        return m;
      })
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  // Stats
  const totalMarketplaces = marketplaces.length;
  const enabledMarketplaces = marketplaces.filter(m => m.isEnabled).length;
  const totalConnections = marketplaces.reduce((sum, m) => sum + m.totalConnections, 0);
  const activeConnections = marketplaces.reduce((sum, m) => sum + m.activeConnections, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Shield className="text-primary" size={24} />
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Entegrasyon Yönetimi</h1>
          </div>
          <p className="text-slate-500 font-medium">Pazaryeri erişimlerini ve plan bazlı kısıtlamaları yönetin</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-surface rounded-2xl border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Globe size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">{totalMarketplaces}</div>
              <div className="text-xs text-slate-500">Toplam Platform</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 bg-surface rounded-2xl border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500">
              <Check size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">{enabledMarketplaces}</div>
              <div className="text-xs text-slate-500">Aktif Platform</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 bg-surface rounded-2xl border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <Users size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">{totalConnections.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Toplam Bağlantı</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 bg-surface rounded-2xl border border-border"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-2xl font-black text-foreground">{activeConnections.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Aktif Bağlantı</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Platform ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <select
          value={selectedRegion}
          onChange={e => setSelectedRegion(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {REGIONS.map(region => (
            <option key={region.id} value={region.id}>{region.name}</option>
          ))}
        </select>

        <select
          value={selectedPlan}
          onChange={e => setSelectedPlan(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="ALL">Tüm Planlar</option>
          {PLANS.map(plan => (
            <option key={plan.id} value={plan.id}>{plan.name}</option>
          ))}
        </select>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <Info className="text-blue-500 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-medium text-foreground">Plan Bazlı Erişim Yönetimi</p>
            <p className="text-xs text-slate-500 mt-1">
              Her platform için minimum plan seviyesi belirleyebilirsiniz. Ayrıca belirli planlar için özel izinler veya kısıtlamalar ekleyebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Marketplaces Table */}
      <div className="bg-surface rounded-[24px] border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background/50 border-b border-border">
              <tr>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Platform</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Bölge</th>
                <th className="text-center p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Minimum Plan</th>
                <th className="text-center p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Bağlantılar</th>
                <th className="text-center p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Durum</th>
                <th className="text-center p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredMarketplaces.map((marketplace, idx) => (
                <React.Fragment key={marketplace.id}>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`border-b border-border hover:bg-background/50 transition-colors ${!marketplace.isEnabled ? 'opacity-60' : ''
                      }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: marketplace.brandColor }}
                        >
                          {marketplace.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{marketplace.name}</div>
                          <div className="text-xs text-slate-500">{marketplace.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-xs font-medium bg-slate-500/10 text-slate-500 rounded-lg">
                        {REGIONS.find(r => r.id === marketplace.region)?.name || marketplace.region}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <select
                          value={marketplace.minimumPlan}
                          onChange={e => updateMinimumPlan(marketplace.id, e.target.value)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 ${marketplace.minimumPlan === 'FREE' ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' :
                              marketplace.minimumPlan === 'STARTER' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                marketplace.minimumPlan === 'PROFESSIONAL' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                  'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}
                        >
                          {PLANS.map(plan => (
                            <option key={plan.id} value={plan.id}>{plan.name}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-sm font-bold text-foreground">{marketplace.activeConnections.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">/ {marketplace.totalConnections.toLocaleString()} toplam</div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleEnabled(marketplace.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${marketplace.isEnabled
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-red-500/10 text-red-500'
                            }`}
                        >
                          {marketplace.isEnabled ? (
                            <>
                              <ToggleRight size={16} />
                              Aktif
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={16} />
                              Pasif
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => toggleExpand(marketplace.id)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Plan detayları"
                        >
                          <ChevronDown
                            size={18}
                            className={`transition-transform ${expandedRows.includes(marketplace.id) ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </div>
                    </td>
                  </motion.tr>

                  {/* Expanded Row */}
                  <AnimatePresence>
                    {expandedRows.includes(marketplace.id) && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-background/30"
                      >
                        <td colSpan={6} className="p-4">
                          <div className="p-4 bg-surface rounded-xl border border-border">
                            <h4 className="text-sm font-bold text-foreground mb-4">Plan Bazlı Erişim Ayarları</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {PLANS.map(plan => {
                                const planIndex = PLANS.findIndex(p => p.id === plan.id);
                                const minPlanIndex = PLANS.findIndex(p => p.id === marketplace.minimumPlan);
                                const hasAccess = planIndex >= minPlanIndex;
                                const override = marketplace.planOverrides[plan.id];

                                const isAllowed = override === true ? true : override === false ? false : hasAccess;

                                return (
                                  <div
                                    key={plan.id}
                                    className={`p-4 rounded-xl border transition-all ${isAllowed
                                        ? 'bg-green-500/5 border-green-500/20'
                                        : 'bg-red-500/5 border-red-500/20'
                                      }`}
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        <plan.icon size={16} className={`text-${plan.color}-500`} />
                                        <span className="text-sm font-bold text-foreground">{plan.name}</span>
                                      </div>
                                      <button
                                        onClick={() => togglePlanOverride(marketplace.id, plan.id)}
                                        className={`p-1.5 rounded-lg transition-all ${isAllowed
                                            ? 'bg-green-500/20 text-green-500'
                                            : 'bg-red-500/20 text-red-500'
                                          }`}
                                      >
                                        {isAllowed ? <Unlock size={14} /> : <Lock size={14} />}
                                      </button>
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      {override === true && (
                                        <span className="text-green-500">✓ Manuel olarak açıldı</span>
                                      )}
                                      {override === false && (
                                        <span className="text-red-500">✕ Manuel olarak kapatıldı</span>
                                      )}
                                      {override === undefined && hasAccess && (
                                        <span className="text-green-500">✓ Varsayılan: Erişebilir</span>
                                      )}
                                      {override === undefined && !hasAccess && (
                                        <span className="text-red-500">✕ Varsayılan: Erişemez</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="p-6 bg-surface rounded-[24px] border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Toplu İşlemler</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-background rounded-xl border border-border hover:border-blue-500/30 transition-all text-left group">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Download className="text-blue-500" size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Ayarları Dışa Aktar</div>
              <div className="text-xs text-slate-500">JSON olarak indir</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-background rounded-xl border border-border hover:border-green-500/30 transition-all text-left group">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Upload className="text-green-500" size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Ayarları İçe Aktar</div>
              <div className="text-xs text-slate-500">JSON dosyası yükle</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-background rounded-xl border border-border hover:border-orange-500/30 transition-all text-left group">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <RefreshCw className="text-orange-500" size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Varsayılana Sıfırla</div>
              <div className="text-xs text-slate-500">Tüm özel ayarları kaldır</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 bg-background rounded-xl border border-border hover:border-red-500/30 transition-all text-left group">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="text-red-500" size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Tümünü Devre Dışı</div>
              <div className="text-xs text-slate-500">Bakım modu</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
