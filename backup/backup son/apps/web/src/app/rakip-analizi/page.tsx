"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertTriangle, Activity, Users, DollarSign,
  Target, BarChart3, Shield, Zap, ArrowUpRight, ArrowDownRight,
  Search, Plus, Trash2, RefreshCw, Play, Square, Eye, Loader2,
  CheckCircle, XCircle, ChevronDown,
} from 'lucide-react';
import {
  useCompetitors,
  useCompetitorAlerts,
  usePricingAnalysis,
  usePricingRules,
  useExperiments,
  type CompetitorAlert,
  type PricingRuleData,
  type ExperimentData,
  type PricingItem,
} from '@/lib/hooks';
import apiClient from '@/lib/api-client';

// ==================== TYPES ====================
type Tab = 'overview' | 'alerts' | 'pricing' | 'rules' | 'experiments';

// ==================== PAGE ====================
export default function RakipAnaliziPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: Array<{ key: Tab; label: string; icon: React.ElementType }> = [
    { key: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { key: 'alerts', label: 'Uyarılar', icon: AlertTriangle },
    { key: 'pricing', label: 'Fiyat Analizi', icon: DollarSign },
    { key: 'rules', label: 'Fiyat Kuralları', icon: Shield },
    { key: 'experiments', label: 'A/B Deneyleri', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Rakip Analizi & Fiyat Zekası
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Rakip takibi, fiyatlandırma kuralları, A/B deneyleri ve akıllı uyarılar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SnapshotButton />
            <AutoDiscoverButton />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-1 border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'alerts' && <AlertsTab />}
            {activeTab === 'pricing' && <PricingTab />}
            {activeTab === 'rules' && <RulesTab />}
            {activeTab === 'experiments' && <ExperimentsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==================== OVERVIEW TAB ====================
function OverviewTab() {
  const { data: competitors, loading } = useCompetitors();
  const competitorList = Array.isArray(competitors) ? competitors : [];
  const { alertCount } = useCompetitorAlerts();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Takip Edilen Rakip" value={competitorList.length} icon={Users} color="blue" />
        <KpiCard title="Aktif Uyarı" value={alertCount} icon={AlertTriangle} color="red" />
        <KpiCard
          title="Toplam Ürün Takibi"
          value={competitorList.reduce((s: number, c: any) => s + (c.productCount || c._count?.products || 0), 0)}
          icon={Target}
          color="green"
        />
        <KpiCard
          title="Platform"
          value={new Set(competitorList.map((c: any) => c.platform)).size}
          icon={BarChart3}
          color="purple"
        />
      </div>

      {/* Competitor List */}
      <Card title="Rakipler" loading={loading}>
        {competitorList.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Henüz rakip eklenmemiş</p>
            <p className="text-sm mt-1">Otomatik keşif veya snapshot ile rakip ekleyebilirsiniz</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {competitorList.map((comp: any) => (
              <CompetitorRow key={comp.id} competitor={comp} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function CompetitorRow({ competitor }: { competitor: any }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`"${competitor.name}" rakibini silmek istediğinize emin misiniz?`)) return;
    setDeleting(true);
    try {
      await apiClient.deleteCompetitor(competitor.id);
      window.location.reload();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-3 px-2 group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          {competitor.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm">{competitor.name}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{competitor.platform}</span>
            <span>{competitor.productCount || competitor._count?.products || 0} ürün</span>
            {competitor.rating && <span>⭐ {Number(competitor.rating).toFixed(1)}</span>}
          </div>
        </div>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
      >
        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ==================== ALERTS TAB ====================
function AlertsTab() {
  const { alerts, alertCount, loading, refetch } = useCompetitorAlerts(5);

  return (
    <Card title={`Uyarılar (${alertCount})`} loading={loading} action={
      <button onClick={() => refetch?.()} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
        <RefreshCw className="w-3 h-3" /> Yenile
      </button>
    }>
      {alerts.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-40 text-green-400" />
          <p className="font-medium">Aktif uyarı yok</p>
          <p className="text-sm mt-1">Tüm fiyatlar eşik değeri içinde</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <AlertRow key={`${alert.productId}-${alert.type}-${i}`} alert={alert} />
          ))}
        </div>
      )}
    </Card>
  );
}

function AlertRow({ alert }: { alert: CompetitorAlert }) {
  const severityColors: Record<string, string> = {
    high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    medium: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    low: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  const icons: Record<string, React.ElementType> = {
    price_gap_high: TrendingUp,
    stockout_vs_competitor: XCircle,
    low_margin_risk: AlertTriangle,
  };
  const Icon = icons[alert.type] || AlertTriangle;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${severityColors[alert.severity] || severityColors.medium}`}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-current" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{alert.productTitle}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{alert.details}</p>
        {alert.myPrice && alert.competitorAvgPrice && (
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span>Bizim: <strong>{alert.myPrice.toFixed(2)} ₺</strong></span>
            <span>Rakip Ort: <strong>{alert.competitorAvgPrice.toFixed(2)} ₺</strong></span>
          </div>
        )}
      </div>
      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
        alert.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
      }`}>
        {alert.severity}
      </span>
    </div>
  );
}

// ==================== PRICING TAB ====================
function PricingTab() {
  const { analysis, loading, applyPrice } = usePricingAnalysis();
  const [applying, setApplying] = useState<string | null>(null);

  const handleApply = async (item: PricingItem) => {
    setApplying(item.id);
    try {
      await applyPrice(item.id, item.recommendedPrice);
    } finally {
      setApplying(null);
    }
  };

  return (
    <Card title="Fiyat Analizi" loading={loading}>
      {analysis.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Fiyat verisi yok</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="pb-3 pr-2">Ürün</th>
                <th className="pb-3 px-2">Mevcut</th>
                <th className="pb-3 px-2">Önerilen</th>
                <th className="pb-3 px-2">Rakip Ort.</th>
                <th className="pb-3 px-2">Marj</th>
                <th className="pb-3 px-2">Durum</th>
                <th className="pb-3 pl-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {analysis.slice(0, 50).map((item) => (
                <PricingRow key={item.id} item={item} onApply={handleApply} applying={applying === item.id} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function PricingRow({ item, onApply, applying }: { item: PricingItem; onApply: (item: PricingItem) => void; applying: boolean }) {
  const diff = item.recommendedPrice - item.currentPrice;
  const diffPct = item.currentPrice > 0 ? (diff / item.currentPrice) * 100 : 0;

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
      <td className="py-2.5 pr-2">
        <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{item.productName || item.id}</p>
      </td>
      <td className="py-2.5 px-2 font-mono">{item.currentPrice.toFixed(2)} ₺</td>
      <td className="py-2.5 px-2">
        <span className={`font-mono font-bold ${diff < 0 ? 'text-red-600' : diff > 0 ? 'text-green-600' : 'text-slate-600'}`}>
          {item.recommendedPrice.toFixed(2)} ₺
        </span>
        <span className="text-xs text-slate-400 ml-1">({diffPct >= 0 ? '+' : ''}{diffPct.toFixed(1)}%)</span>
      </td>
      <td className="py-2.5 px-2 font-mono text-slate-600 dark:text-slate-400">{item.competitorAvg?.toFixed(2) || '-'} ₺</td>
      <td className="py-2.5 px-2">
        <span className={`font-mono ${item.margin > 20 ? 'text-green-600' : item.margin > 10 ? 'text-amber-600' : 'text-red-600'}`}>
          %{item.margin?.toFixed(1) || 0}
        </span>
      </td>
      <td className="py-2.5 px-2">
        <StatusBadge status={item.buyBoxStatus || 'no-competition'} />
      </td>
      <td className="py-2.5 pl-2">
        {diff !== 0 && (
          <button
            onClick={() => onApply(item)}
            disabled={applying}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {applying ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Uygula'}
          </button>
        )}
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    winning: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    losing: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'no-competition': 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  };
  const labels: Record<string, string> = { winning: 'Kazanıyor', losing: 'Kaybediyor', 'no-competition': 'Rekabet Yok' };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || styles['no-competition']}`}>
      {labels[status] || status}
    </span>
  );
}

// ==================== RULES TAB ====================
function RulesTab() {
  const { rules, loading, createRule, deleteRule } = usePricingRules();
  const [showForm, setShowForm] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleBulkReprice = async () => {
    if (!confirm('Tüm ürünler için toplu yeniden fiyatlandırma yapılacak. Devam edilsin mi?')) return;
    setBulkLoading(true);
    try {
      const result = await apiClient.bulkReprice() as any;
      alert(`Toplu fiyatlandırma: ${result.applied}/${result.total} ürün güncellendi`);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Fiyat Kuralları" loading={loading} action={
        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkReprice}
            disabled={bulkLoading}
            className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-1"
          >
            {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            Toplu Fiyatla
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Kural Ekle
          </button>
        </div>
      }>
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <RuleForm onSubmit={async (data) => { await createRule(data); setShowForm(false); }} onCancel={() => setShowForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {rules.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Henüz kural tanımlanmamış</p>
            <p className="text-sm mt-1">Kural ekleyerek otomatik fiyatlandırmayı aktifleştirin</p>
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {rules.map((rule) => (
              <RuleRow key={rule.id} rule={rule} onDelete={deleteRule} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function RuleForm({ onSubmit, onCancel }: { onSubmit: (data: Record<string, unknown>) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('competitor');
  const [actionType, setActionType] = useState('undercut');
  const [actionValue, setActionValue] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name || `${type} kuralı`,
      type,
      action: { type: actionType, value: Number(actionValue), reference: 'competitor_avg' },
      priority: 10,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3 border border-slate-200 dark:border-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kural adı"
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm">
          <option value="competitor">Rakip Bazlı</option>
          <option value="margin">Marj Bazlı</option>
          <option value="dynamic">Dinamik</option>
        </select>
        <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm">
          <option value="undercut">Rakibi Alt (undercut)</option>
          <option value="percentage">Yüzde</option>
          <option value="match">Eşitle</option>
          <option value="margin_floor">Min. Marj</option>
          <option value="margin_target">Hedef Marj</option>
        </select>
        <input
          type="number"
          value={actionValue}
          onChange={(e) => setActionValue(e.target.value)}
          placeholder="Değer (%)"
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">İptal</button>
        <button type="submit" className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700">Kaydet</button>
      </div>
    </form>
  );
}

function RuleRow({ rule, onDelete }: { rule: PricingRuleData; onDelete: (id: string) => void }) {
  const typeLabels: Record<string, string> = {
    competitor: 'Rakip',
    margin: 'Marj',
    dynamic: 'Dinamik',
    bulk: 'Toplu',
    'time-based': 'Zamanlı',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
        <div>
          <p className="font-medium text-sm text-slate-900 dark:text-white">{rule.name}</p>
          <p className="text-xs text-slate-500">
            {typeLabels[rule.type] || rule.type} · Öncelik: {rule.priority} · {rule.appliedCount} kez uygulandı
          </p>
        </div>
      </div>
      <button onClick={() => onDelete(rule.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ==================== EXPERIMENTS TAB ====================
function ExperimentsTab() {
  const { experiments, loading, createExperiment, stopExperiment, evaluateExperiment } = useExperiments();
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleStop = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await stopExperiment(id) as any;
      alert(`Deney durduruldu. Kazanan: ${result?.winner || 'Belirsiz'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEvaluate = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await evaluateExperiment(id) as any;
      alert(`Sonuç: ${result?.recommendation || 'Daha fazla veri gerekli'}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="A/B Fiyat Deneyleri" loading={loading} action={
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Yeni Deney
        </button>
      }>
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <ExperimentForm onSubmit={async (data) => { await createExperiment(data); setShowForm(false); }} onCancel={() => setShowForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {experiments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Henüz A/B deney yok</p>
            <p className="text-sm mt-1">Fiyat deneyleri oluşturarak en karlı fiyatı belirleyin</p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {experiments.map((exp) => (
              <ExperimentRow
                key={exp.id}
                experiment={exp}
                onStop={handleStop}
                onEvaluate={handleEvaluate}
                loading={actionLoading === exp.id}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ExperimentForm({ onSubmit, onCancel }: { onSubmit: (data: Record<string, unknown>) => void; onCancel: () => void }) {
  const [productId, setProductId] = useState('');
  const [testPrice, setTestPrice] = useState('');
  const [name, setName] = useState('');
  const [days, setDays] = useState('7');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ productId, testPrice: Number(testPrice), name: name || undefined, durationDays: Number(days) });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3 border border-slate-200 dark:border-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Ürün ID" required className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Deney adı (opsiyonel)" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm" />
        <input type="number" value={testPrice} onChange={(e) => setTestPrice(e.target.value)} placeholder="Test Fiyatı (₺)" required className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm" />
        <input type="number" value={days} onChange={(e) => setDays(e.target.value)} placeholder="Süre (gün)" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm" />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">İptal</button>
        <button type="submit" className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700">Başlat</button>
      </div>
    </form>
  );
}

function ExperimentRow({ experiment, onStop, onEvaluate, loading }: {
  experiment: ExperimentData;
  onStop: (id: string) => void;
  onEvaluate: (id: string) => void;
  loading: boolean;
}) {
  const isActive = experiment.status === 'active';
  const result = experiment.result;

  return (
    <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-slate-900 dark:text-white">{experiment.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {isActive ? 'Aktif' : 'Tamamlandı'}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
            <span>Kontrol: <strong>{Number(experiment.controlPrice).toFixed(2)} ₺</strong></span>
            <span>Test: <strong>{Number(experiment.testPrice).toFixed(2)} ₺</strong></span>
            <span>{experiment.durationDays} gün</span>
            <span>Satış: {experiment.controlSales} / {experiment.testSales}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <>
              <button onClick={() => onEvaluate(experiment.id)} disabled={loading} className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1">
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />} Değerlendir
              </button>
              <button onClick={() => onStop(experiment.id)} disabled={loading} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 flex items-center gap-1">
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />} Durdur
              </button>
            </>
          )}
        </div>
      </div>
      {result && (
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="flex items-center gap-4 text-xs">
            <span className={`font-bold ${result.winner === 'test' ? 'text-green-600' : result.winner === 'control' ? 'text-blue-600' : 'text-slate-500'}`}>
              Kazanan: {result.winner === 'test' ? 'Test' : result.winner === 'control' ? 'Kontrol' : 'Belirsiz'}
            </span>
            <span>Gelir farkı: {result.revenueLift >= 0 ? '+' : ''}{result.revenueLift}%</span>
            <span>Güven: %{(result.significance * 100).toFixed(0)}</span>
            {result.isSignificant && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
          </div>
          <p className="text-xs text-slate-500 mt-1">{result.recommendation}</p>
        </div>
      )}
    </div>
  );
}

// ==================== SHARED COMPONENTS ====================
function Card({ title, children, loading, action }: {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
        <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
          {action}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function SnapshotButton() {
  const [loading, setLoading] = useState(false);

  const handleSnapshot = async () => {
    setLoading(true);
    try {
      const result = await apiClient.runCompetitorSnapshot() as any;
      alert(`Snapshot tamamlandı! ${result.scannedCompetitors} rakip, ${result.scannedProducts} ürün tarandı.`);
    } catch {
      alert('Snapshot başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSnapshot}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
      Snapshot Al
    </button>
  );
}

function AutoDiscoverButton() {
  const [loading, setLoading] = useState(false);

  const handleDiscover = async () => {
    setLoading(true);
    try {
      const result = await apiClient.autoDiscoverCompetitors() as any;
      alert(`${result.discovered} yeni rakip keşfedildi!`);
      if (result.discovered > 0) window.location.reload();
    } catch {
      alert('Otomatik keşif başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDiscover}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
      Otomatik Keşfet
    </button>
  );
}
