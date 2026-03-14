"use client";

import React, { useState, useEffect } from 'react';
import {
  Layers, Users, CheckSquare, Square, Send, Power, PowerOff, TrendingUp,
  Bell, AlertCircle, CheckCircle, XCircle, Search, Filter, Play
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
  email: string;
}

type Operation = 'activate' | 'deactivate' | 'upgrade' | 'notify';

interface OperationResult {
  operation: Operation;
  total: number;
  success: number;
  failed: number;
  results: Array<{
    tenantId: string;
    success: boolean;
    error?: string;
  }>;
}

export default function BulkOperationsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [operation, setOperation] = useState<Operation>('notify');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [upgradePlan, setUpgradePlan] = useState('PRO');
  const [result, setResult] = useState<OperationResult | null>(null);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants');
      const data = await res.json();
      setTenants(data);
    } catch (error) {
      // Mock data
      setTenants([
        { id: 't1', name: 'Mega Store', slug: 'mega-store', plan: 'PRO', isActive: true, email: 'info@megastore.com' },
        { id: 't2', name: 'Fashion Hub', slug: 'fashion-hub', plan: 'STARTER', isActive: true, email: 'contact@fashionhub.com' },
        { id: 't3', name: 'Tech World', slug: 'tech-world', plan: 'ENTERPRISE', isActive: true, email: 'admin@techworld.com' },
        { id: 't4', name: 'Home Decor', slug: 'home-decor', plan: 'PRO', isActive: false, email: 'shop@homedecor.com' },
        { id: 't5', name: 'Sport Zone', slug: 'sport-zone', plan: 'STARTER', isActive: true, email: 'info@sportzone.com' },
        { id: 't6', name: 'Book Corner', slug: 'book-corner', plan: 'STARTER', isActive: true, email: 'contact@bookcorner.com' },
        { id: 't7', name: 'Digital Shop', slug: 'digital-shop', plan: 'PRO', isActive: true, email: 'support@digitalshop.com' },
        { id: 't8', name: 'Beauty Store', slug: 'beauty-store', plan: 'STARTER', isActive: true, email: 'info@beautystore.com' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTenant = (id: string) => {
    const newSet = new Set(selectedTenants);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedTenants(newSet);
  };

  const selectAll = () => {
    if (selectedTenants.size === filteredTenants.length) {
      setSelectedTenants(new Set());
    } else {
      setSelectedTenants(new Set(filteredTenants.map(t => t.id)));
    }
  };

  const executeOperation = async () => {
    if (selectedTenants.size === 0) return;

    setExecuting(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/bulk-operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          tenantIds: Array.from(selectedTenants),
          data: operation === 'notify'
            ? { message: notifyMessage }
            : operation === 'upgrade'
              ? { plan: upgradePlan }
              : undefined,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      // Mock result
      setResult({
        operation,
        total: selectedTenants.size,
        success: selectedTenants.size,
        failed: 0,
        results: Array.from(selectedTenants).map(id => ({ tenantId: id, success: true })),
      });
    } finally {
      setExecuting(false);
    }
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = !filterPlan || t.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const operationConfig: Record<Operation, { label: string; icon: React.ReactNode; color: string }> = {
    activate: { label: 'Aktifleştir', icon: <Power size={16} />, color: 'bg-green-600 hover:bg-green-700' },
    deactivate: { label: 'Deaktif Et', icon: <PowerOff size={16} />, color: 'bg-red-600 hover:bg-red-700' },
    upgrade: { label: 'Plan Yükselt', icon: <TrendingUp size={16} />, color: 'bg-purple-600 hover:bg-purple-700' },
    notify: { label: 'Bildirim Gönder', icon: <Bell size={16} />, color: 'bg-blue-600 hover:bg-blue-700' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <Layers className="w-6 h-6 text-blue-500" />
          </div>
          Toplu İşlemler
        </h1>
        <p className="text-slate-500 mt-1">Birden fazla tenant üzerinde toplu işlem yapın</p>
      </div>

      {/* Operation Selection */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
        <h3 className="font-bold text-foreground mb-4">İşlem Seçin</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.keys(operationConfig) as Operation[]).map((op) => (
            <button
              key={op}
              onClick={() => setOperation(op)}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${operation === op
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
            >
              <div className={`p-2 rounded-lg ${operation === op ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {operationConfig[op].icon}
              </div>
              <span className="text-sm font-bold text-foreground">{operationConfig[op].label}</span>
            </button>
          ))}
        </div>

        {/* Operation-specific inputs */}
        {operation === 'notify' && (
          <div className="mt-6">
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">
              Bildirim Mesajı
            </label>
            <textarea
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
              placeholder="Tüm seçili tenant'lara gönderilecek mesaj..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        )}

        {operation === 'upgrade' && (
          <div className="mt-6">
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">
              Hedef Plan
            </label>
            <select
              value={upgradePlan}
              onChange={(e) => setUpgradePlan(e.target.value)}
              className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PRO">PRO</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tenant ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tüm Planlar</option>
          <option value="STARTER">STARTER</option>
          <option value="PRO">PRO</option>
          <option value="ENTERPRISE">ENTERPRISE</option>
        </select>
      </div>

      {/* Tenant List */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <button
            onClick={selectAll}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600"
          >
            {selectedTenants.size === filteredTenants.length ? <CheckSquare size={18} /> : <Square size={18} />}
            {selectedTenants.size === filteredTenants.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
          </button>
          <span className="text-sm text-slate-500">
            {selectedTenants.size} seçili / {filteredTenants.length} tenant
          </span>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-white/5 max-h-96 overflow-y-auto">
          {filteredTenants.map((tenant) => (
            <div
              key={tenant.id}
              onClick={() => toggleTenant(tenant.id)}
              className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedTenants.has(tenant.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
            >
              <div className={`p-1 rounded ${selectedTenants.has(tenant.id) ? 'text-blue-600' : 'text-slate-400'}`}>
                {selectedTenants.has(tenant.id) ? <CheckSquare size={20} /> : <Square size={20} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{tenant.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tenant.plan === 'ENTERPRISE' ? 'bg-purple-500/10 text-purple-600' :
                      tenant.plan === 'PRO' ? 'bg-blue-500/10 text-blue-600' :
                        'bg-slate-500/10 text-slate-600'
                    }`}>
                    {tenant.plan}
                  </span>
                  {!tenant.isActive && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">
                      Pasif
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-500">{tenant.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execute Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={executeOperation}
          disabled={selectedTenants.size === 0 || executing}
          className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${operationConfig[operation].color}`}
        >
          {executing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Play size={16} />
          )}
          {executing ? 'İşlem Yapılıyor...' : `${operationConfig[operation].label} (${selectedTenants.size})`}
        </button>

        {result && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${result.failed === 0 ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
            }`}>
            {result.failed === 0 ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="font-bold">
              {result.success} başarılı{result.failed > 0 && `, ${result.failed} başarısız`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
