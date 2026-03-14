"use client";

import React, { useState, useEffect } from 'react';
import {
  ToggleLeft, ToggleRight, Search, Filter, Plus, Users, Save, X,
  AlertCircle, CheckCircle, Settings, Sparkles, Layers
} from 'lucide-react';

interface FeatureFlag {
  key: string;
  name: string;
  enabled: boolean;
  tenantOverrides: string[];
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingFlag, setEditingFlag] = useState<string | null>(null);
  const [tenantInput, setTenantInput] = useState('');

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      const res = await fetch('/api/admin/feature-flags');
      const data = await res.json();
      setFlags(data);
    } catch (error) {
      // Mock data
      setFlags([
        { key: 'ai_pricing', name: 'AI Fiyatlandırma', enabled: true, tenantOverrides: [] },
        { key: 'bulk_edit', name: 'Toplu Düzenleme', enabled: true, tenantOverrides: [] },
        { key: 'multi_warehouse', name: 'Çoklu Depo', enabled: false, tenantOverrides: ['tenant_1', 'tenant_2'] },
        { key: 'advanced_analytics', name: 'Gelişmiş Analitik', enabled: true, tenantOverrides: [] },
        { key: 'api_v2', name: 'API v2', enabled: false, tenantOverrides: [] },
        { key: 'new_dashboard', name: 'Yeni Dashboard', enabled: false, tenantOverrides: ['tenant_3'] },
        { key: 'mobile_app', name: 'Mobil Uygulama', enabled: true, tenantOverrides: [] },
        { key: 'webhooks', name: 'Webhook Desteği', enabled: true, tenantOverrides: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (key: string) => {
    const flag = flags.find(f => f.key === key);
    if (!flag) return;

    setFlags(prev => prev.map(f =>
      f.key === key ? { ...f, enabled: !f.enabled } : f
    ));

    // API call
    try {
      await fetch(`/api/admin/feature-flags/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !flag.enabled, tenantOverrides: flag.tenantOverrides }),
      });
    } catch (error) {
      console.error('Flag güncelleme hatası:', error);
    }
  };

  const addOverride = (key: string, tenantId: string) => {
    if (!tenantId.trim()) return;
    setFlags(prev => prev.map(f =>
      f.key === key
        ? { ...f, tenantOverrides: [...f.tenantOverrides, tenantId.trim()] }
        : f
    ));
    setTenantInput('');
  };

  const removeOverride = (key: string, tenantId: string) => {
    setFlags(prev => prev.map(f =>
      f.key === key
        ? { ...f, tenantOverrides: f.tenantOverrides.filter(id => id !== tenantId) }
        : f
    ));
  };

  const filteredFlags = flags.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.key.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            Feature Flags
          </h1>
          <p className="text-slate-500 mt-1">Özellikleri platform genelinde veya tenant bazında yönetin</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors">
          <Plus size={16} />
          Yeni Flag
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Feature flag ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFlags.map((flag) => (
          <div
            key={flag.key}
            className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground">{flag.name}</h3>
                  {flag.enabled ? (
                    <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                      Aktif
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded-full">
                      Pasif
                    </span>
                  )}
                </div>
                <code className="text-xs text-slate-500 font-mono">{flag.key}</code>
              </div>
              <button
                onClick={() => toggleFlag(flag.key)}
                className={`p-2 rounded-lg transition-colors ${flag.enabled
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
              >
                {flag.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              </button>
            </div>

            {/* Tenant Overrides */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tenant Override&apos;ları ({flag.tenantOverrides.length})
                </span>
                <button
                  onClick={() => setEditingFlag(editingFlag === flag.key ? null : flag.key)}
                  className="text-xs text-purple-500 hover:text-purple-600 font-bold"
                >
                  {editingFlag === flag.key ? 'Kapat' : 'Düzenle'}
                </button>
              </div>

              {flag.tenantOverrides.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {flag.tenantOverrides.map((tenantId) => (
                    <span
                      key={tenantId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-medium"
                    >
                      <Users size={12} />
                      {tenantId}
                      {editingFlag === flag.key && (
                        <button
                          onClick={() => removeOverride(flag.key, tenantId)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {editingFlag === flag.key && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tenant ID ekle..."
                    value={tenantInput}
                    onChange={(e) => setTenantInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addOverride(flag.key, tenantInput)}
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => addOverride(flag.key, tenantInput)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}

              {flag.tenantOverrides.length === 0 && editingFlag !== flag.key && (
                <p className="text-xs text-slate-400">
                  {flag.enabled
                    ? 'Tüm tenant&apos;larda aktif'
                    : 'Tüm tenant&apos;larda pasif'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
            Override Mantığı
          </p>
          <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
            Override listesindeki tenant&apos;lar için flag durumu tersine çevrilir.
            Örnek: Flag genel olarak kapalıysa, override listesindeki tenant&apos;lar için açık olur.
          </p>
        </div>
      </div>
    </div>
  );
}
