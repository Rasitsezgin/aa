'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Link2,
  AlertTriangle,
  TrendingUp,
  Zap,
  FileText,
  Truck,
  BarChart3,
  Loader2,
  RefreshCw,
  Boxes,
  Shield,
} from 'lucide-react';
import { useToast } from '@/providers/toast-provider';
import {
  fetchBundles,
  fetchStockAlerts,
  scanStockAlerts,
  fetchBuyBoxRules,
  runBuyBoxRobot,
  fetchBuyBoxSnapshots,
  autoApproveOrders,
  fetchProfitRadar,
  importFromLink,
  type BundleRow,
  type ProfitRadar,
} from '@/lib/commerce-ops-api';

const TABS = [
  { id: 'catalog', label: 'Katalog & Stok', icon: Package },
  { id: 'buybox', label: 'BuyBox Robotu', icon: TrendingUp },
  { id: 'automation', label: 'Otomasyon', icon: Zap },
  { id: 'finance', label: 'Finans Radarı', icon: BarChart3 },
] as const;

type TabId = (typeof TABS)[number]['id'];

/** Sentos-parite operasyon merkezi — ürün, stok, BuyBox, otomasyon, finans */
export function OperationsHub() {
  const toast = useToast();
  const [tab, setTab] = useState<TabId>('catalog');
  const [loading, setLoading] = useState(false);
  const [bundles, setBundles] = useState<BundleRow[]>([]);
  const [stockAlerts, setStockAlerts] = useState<Array<{ title?: string; criticalLevel: number }>>([]);
  const [buyBoxRules, setBuyBoxRules] = useState<Array<{ platform: string; minMarginPct: string | number }>>([]);
  const [snapshots, setSnapshots] = useState<Array<{ platform: string; hasBuyBox: boolean; product: { title: string } }>>([]);
  const [radar, setRadar] = useState<ProfitRadar | null>(null);
  const [importUrl, setImportUrl] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, s, r, snap, fin] = await Promise.all([
        fetchBundles().catch(() => []),
        fetchStockAlerts().catch(() => []),
        fetchBuyBoxRules().catch(() => []),
        fetchBuyBoxSnapshots().catch(() => []),
        fetchProfitRadar().catch(() => null),
      ]);
      setBundles(b);
      setStockAlerts(s);
      setBuyBoxRules(r);
      setSnapshots(snap);
      setRadar(fin);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleImport = async () => {
    if (!importUrl.trim()) return;
    setLoading(true);
    try {
      const res = await importFromLink(importUrl.trim());
      toast.success(`Ürün eklendi: ${res.product.title}`);
      setImportUrl('');
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleStockScan = async () => {
    setLoading(true);
    try {
      const res = await scanStockAlerts();
      toast.success(`${res.total} kritik stok uyarısı işlendi`);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyBoxRun = async () => {
    setLoading(true);
    try {
      const res = await runBuyBoxRobot();
      toast.success(`BuyBox robotu: ${res.processed} ürün tarandı`);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoApprove = async () => {
    setLoading(true);
    try {
      const res = await autoApproveOrders();
      toast.success(`${res.approved} sipariş onaylandı`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Operasyon Merkezi
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Ürün, stok, BuyBox, sipariş otomasyonu ve finans — tek ekrandan yönetin.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Yenile
          </button>
        </header>

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${
                  active
                    ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-200'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid gap-4"
          >
            {tab === 'catalog' && (
              <>
                <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Link2 className="w-5 h-5 text-emerald-400" />
                    <h2 className="font-semibold">Link ile Ürün Kaydı</h2>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    Trendyol, Hepsiburada veya Amazon ürün linkini yapıştırın — özellikler kataloğa aktarılır.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      placeholder="https://www.trendyol.com/..."
                      className="flex-1 px-4 py-2 rounded-lg bg-slate-900/80 border border-white/10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleImport}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium"
                    >
                      İçe Aktar
                    </button>
                  </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Boxes className="w-5 h-5 text-violet-400" />
                      <h2 className="font-semibold">Bundle (Set) Ürünler</h2>
                    </div>
                    <span className="text-xs text-slate-400">{bundles.length} set</span>
                  </div>
                  {bundles.length === 0 ? (
                    <p className="text-sm text-slate-500">Henüz bundle oluşturulmamış.</p>
                  ) : (
                    <ul className="space-y-2">
                      {bundles.slice(0, 8).map((b) => (
                        <li
                          key={b.id}
                          className="flex justify-between items-center px-3 py-2 rounded-lg bg-slate-900/50 text-sm"
                        >
                          <span>{b.name} <span className="text-slate-500">({b.sku})</span></span>
                          <span className="text-emerald-400">{b.items.length} parça</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <h2 className="font-semibold">Kritik Stok Uyarıları</h2>
                    </div>
                    <button
                      type="button"
                      onClick={handleStockScan}
                      disabled={loading}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-200"
                    >
                      Tarama Başlat
                    </button>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    Kritik seviyenin altındaki ürünler uyarılır; isteğe bağlı ilan durdurma ve çok kanallı stok senkronu.
                  </p>
                  <p className="text-xs text-slate-500">{stockAlerts.length} kural tanımlı</p>
                </section>
              </>
            )}

            {tab === 'buybox' && (
              <>
                <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-sky-400" />
                      <h2 className="font-semibold">Akıllı Fiyatlandırma & BuyBox</h2>
                    </div>
                    <button
                      type="button"
                      onClick={handleBuyBoxRun}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-medium"
                    >
                      Robotu Çalıştır
                    </button>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Belirlediğiniz kâr marjından ödün vermeden rakiplerinizi izleyin ve BuyBox&apos;ı koruyun.
                  </p>
                  <p className="text-xs text-slate-500 mb-4">{buyBoxRules.length} aktif kural</p>
                  {snapshots.length > 0 && (
                    <ul className="space-y-2">
                      {snapshots.slice(0, 6).map((s, i) => (
                        <li
                          key={i}
                          className="flex justify-between text-sm px-3 py-2 rounded-lg bg-slate-900/50"
                        >
                          <span>{s.product.title}</span>
                          <span className={s.hasBuyBox ? 'text-emerald-400' : 'text-rose-400'}>
                            {s.platform} — {s.hasBuyBox ? 'BuyBox' : 'Kayıp'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )}

            {tab === 'automation' && (
              <div className="grid md:grid-cols-3 gap-4">
                <ActionCard
                  icon={Zap}
                  title="Otomatik Sipariş Onayı"
                  desc="Bekleyen siparişleri tek tıkla onaylayın."
                  action="Onayla"
                  onAction={handleAutoApprove}
                  loading={loading}
                />
                <ActionCard
                  icon={FileText}
                  title="Toplu E-Fatura"
                  desc="Seçili siparişler için E-Arşiv / E-Fatura oluşturun."
                  action="Siparişlere Git"
                  href="/dashboard/orders"
                />
                <ActionCard
                  icon={Truck}
                  title="Toplu Kargo Etiketi"
                  desc="Anlaşmalı kargo firmalarıyla toplu etiket basın."
                  action="Kargoya Git"
                  href="/dashboard/shipping"
                />
              </div>
            )}

            {tab === 'finance' && !radar && (
              <p className="text-sm text-slate-500">Finans verisi yüklenemedi veya henüz sipariş yok.</p>
            )}

            {tab === 'finance' && radar && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-fuchsia-400" />
                  Finansal Röntgen — Son {radar.periodDays ?? 30} Gün
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="Ciro" value={`₺${radar.summary.revenue.toLocaleString('tr-TR')}`} />
                  <Stat label="Komisyon" value={`₺${radar.summary.commission.toLocaleString('tr-TR')}`} />
                  <Stat label="Net Kâr" value={`₺${radar.summary.netProfit.toLocaleString('tr-TR')}`} />
                  <Stat label="Marj" value={`%${radar.summary.marginPct.toFixed(1)}`} />
                </div>
                {Object.keys(radar.byPlatform).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-slate-400 mb-2">Platform bazlı</p>
                    <ul className="space-y-1 text-sm">
                      {Object.entries(radar.byPlatform).map(([plat, data]) => (
                        <li key={plat} className="flex justify-between">
                          <span>{plat}</span>
                          <span className="text-emerald-400">₺{data.profit.toLocaleString('tr-TR')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-900/60 p-3 border border-white/5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  desc,
  action,
  onAction,
  href,
  loading,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  action: string;
  onAction?: () => void;
  href?: string;
  loading?: boolean;
}) {
  const btn = (
    <button
      type="button"
      onClick={onAction}
      disabled={loading && !!onAction}
      className="mt-3 text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
    >
      {loading && onAction ? <Loader2 className="w-4 h-4 animate-spin inline" /> : action}
    </button>
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <Icon className="w-6 h-6 text-indigo-400 mb-2" />
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-slate-400 mt-1">{desc}</p>
      {href ? (
        <a href={href} className="mt-3 inline-block text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10">
          {action}
        </a>
      ) : (
        btn
      )}
    </div>
  );
}
