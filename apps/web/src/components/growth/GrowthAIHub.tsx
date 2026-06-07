'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  MessageSquare,
  Search,
  TrendingUp,
  RotateCcw,
  Star,
  Truck,
  Scale,
  Package,
  ArrowRightLeft,
  Percent,
  DollarSign,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ScanLine,
} from 'lucide-react';
import { useToast } from '@/providers/toast-provider';
import {
  fetchQaInbox,
  approveQa,
  fetchSeoBulk,
  fetchBuyboxDashboard,
  fetchReturnPatterns,
  fetchReviewQueue,
  fetchBaremSuggestions,
  fetchDesiDisputes,
  scanPackaging,
  fetchTransferProducts,
  fetchCommissionVerify,
  fetchFxSuggestions,
  type QaItem,
} from '@/lib/growth-ai-api';

const TABS = [
  { id: 'qa', label: 'AI Müşteri Yanıt', icon: MessageSquare },
  { id: 'seo', label: 'Pazaryeri SEO', icon: Search },
  { id: 'buybox', label: 'BuyBox', icon: TrendingUp },
  { id: 'returns', label: 'İade Analizi', icon: RotateCcw },
  { id: 'reviews', label: 'Yorum Hatırlatıcı', icon: Star },
  { id: 'logistics', label: 'Kargo & Barem', icon: Truck },
  { id: 'transfer', label: 'Ürün Aktarımı', icon: ArrowRightLeft },
  { id: 'finance', label: 'Komisyon & FX', icon: DollarSign },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function GrowthAIHub() {
  const toast = useToast();
  const [tab, setTab] = useState<TabId>('qa');
  const [loading, setLoading] = useState(false);
  const [qa, setQa] = useState<QaItem[]>([]);
  const [seo, setSeo] = useState<Array<{ title: string; avgScore: number; platforms: Array<{ platform: string; grade: string }> }>>([]);
  const [buybox, setBuybox] = useState<Array<{ title: string; platform: string; ourPrice: number; statusLabel: string; competitorPrice: number | null }>>([]);
  const [returns, setReturns] = useState<Array<{ title: string; returnRatePct: number; aiSuggestion: string; healthy: boolean }>>([]);
  const [reviews, setReviews] = useState<Array<{ orderNumber: string; reminderNote: string; status: string }>>([]);
  const [barem, setBarem] = useState<{ suggestions: Array<{ title: string; action: string; currentPrice: number; suggestedPrice: number }>; summary: { estimatedMonthlyMissed: number } } | null>(null);
  const [desi, setDesi] = useState<{ monthlyExtraCharge: number; disputes: Array<{ orderNumber: string; status: string }> } | null>(null);
  const [transfers, setTransfers] = useState<Array<{ title: string; sourcePlatform: string }>>([]);
  const [commission, setCommission] = useState<{ mismatches: number; recoverableAmount: number } | null>(null);
  const [fx, setFx] = useState<{ rates: { USD: number }; suggestions: Array<{ title: string; action: string }> } | null>(null);
  const [scanCode, setScanCode] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [q, s, b, r, rev, bar, d, t, c, f] = await Promise.all([
        fetchQaInbox().catch(() => []),
        fetchSeoBulk().catch(() => ({ items: [] })),
        fetchBuyboxDashboard().catch(() => ({ items: [] })),
        fetchReturnPatterns().catch(() => ({ products: [] })),
        fetchReviewQueue().catch(() => []),
        fetchBaremSuggestions().catch(() => null),
        fetchDesiDisputes().catch(() => null),
        fetchTransferProducts().catch(() => []),
        fetchCommissionVerify().catch(() => null),
        fetchFxSuggestions().catch(() => null),
      ]);
      setQa(q);
      setSeo(s.items || []);
      setBuybox(b.items || []);
      setReturns(r.products || []);
      setReviews(rev);
      setBarem(bar);
      setDesi(d);
      setTransfers(t);
      setCommission(c);
      setFx(f);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    try {
      await approveQa(id);
      toast.success('Yanıt pazaryerine gönderildi');
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleScan = async () => {
    if (!scanCode.trim()) return;
    try {
      const res = await scanPackaging(scanCode.trim());
      if (res.order) {
        setScanResult(`Sipariş ${res.order.orderNumber} · ${res.order.platform} · ${res.order.itemCount} ürün`);
      } else {
        setScanResult('Ürün tanındı');
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-6 pb-16" data-dashboard>
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">Büyüme & Yapay Zeka</p>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">AI Büyüme Merkezi</h1>
          <p className="text-sm text-slate-500 mt-1">Müşteri yanıtı, SEO, BuyBox, iade analizi ve lojistik optimizasyonu — tek panel.</p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 px-3.5 py-2 border border-border rounded-[10px] text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Yenile
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium border transition ${
                tab === t.id ? 'dash-nav-active border' : 'border-border text-slate-500 hover:text-foreground hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {tab === 'qa' && (
            <div className="space-y-3">
              {qa.length === 0 && !loading && <p className="text-sm text-slate-500">Açık müşteri sorusu yok.</p>}
              {qa.map((item) => (
                <div key={item.id} className="dash-card p-4">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <span className="text-xs font-semibold text-indigo-600">{item.platform}</span>
                    <span className="text-[11px] text-slate-500">{item.relativeTime}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-2">&ldquo;{item.question}&rdquo;</p>
                  <div className="rounded-[10px] bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 p-3 mb-3">
                    <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-1"><Bot className="w-3 h-3" /> AI Önerisi</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{item.aiSuggestion}</p>
                  </div>
                  {item.waitingApproval && (
                    <button type="button" onClick={() => handleApprove(item.id)} className="text-xs dash-btn-primary px-3 py-1.5">Onayla ve Gönder</button>
                  )}
                  {item.autoReplied && <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Otomatik Yanıtlandı</span>}
                </div>
              ))}
            </div>
          )}

          {tab === 'seo' && seo.map((item, i) => (
            <div key={i} className="dash-card p-4">
              <p className="text-sm font-semibold truncate mb-2">{item.title}</p>
              <div className="flex flex-wrap gap-2">
                {item.platforms?.slice(0, 4).map((p, j) => (
                  <span key={j} className="text-[11px] px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-border">
                    {p.platform} · %{p.score ?? item.avgScore} · {p.grade}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {tab === 'buybox' && buybox.map((item, i) => (
            <div key={i} className="dash-card p-4 flex justify-between items-center gap-3">
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-slate-500">{item.platform} · {item.ourPrice.toLocaleString('tr-TR')} ₺</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                item.statusLabel === 'Kazandınız' ? 'bg-emerald-500/10 text-emerald-600' : item.statusLabel === 'Kaybettiniz' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
              }`}>{item.statusLabel}</span>
            </div>
          ))}

          {tab === 'returns' && returns.map((item, i) => (
            <div key={i} className="dash-card p-4">
              <div className="flex justify-between mb-2">
                <p className="text-sm font-semibold">{item.title}</p>
                <span className={`text-xs font-semibold ${item.healthy ? 'text-emerald-600' : 'text-rose-600'}`}>%{item.returnRatePct} iade</span>
              </div>
              <p className="text-xs text-slate-500 flex items-start gap-1"><Bot className="w-3 h-3 mt-0.5 shrink-0" /> {item.aiSuggestion}</p>
            </div>
          ))}

          {tab === 'reviews' && reviews.map((item, i) => (
            <div key={i} className="dash-card p-4">
              <p className="text-sm font-semibold">Sipariş {item.orderNumber}</p>
              <p className="text-xs text-slate-500 mt-1">{item.reminderNote}</p>
            </div>
          ))}

          {tab === 'logistics' && (
            <>
              <div className="dash-card p-4">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2"><ScanLine className="w-4 h-4" /> Paketleme İstasyonu</p>
                <div className="flex gap-2">
                  <input value={scanCode} onChange={(e) => setScanCode(e.target.value)} placeholder="Barkod veya sipariş no" className="flex-1 px-3 py-2 rounded-[10px] border border-border bg-background text-sm" />
                  <button type="button" onClick={handleScan} className="dash-btn-primary px-4 py-2 text-sm">Okut</button>
                </div>
                {scanResult && <p className="text-xs text-emerald-600 mt-2">{scanResult}</p>}
              </div>
              {barem?.suggestions?.slice(0, 3).map((s, i) => (
                <div key={i} className="dash-card p-4">
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.action}: {s.currentPrice} ₺ → {s.suggestedPrice} ₺</p>
                </div>
              ))}
              {desi && (
                <p className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Bu ay tespit edilen fazla desi ücreti: {desi.monthlyExtraCharge} ₺</p>
              )}
            </>
          )}

          {tab === 'transfer' && transfers.map((t, i) => (
            <div key={i} className="dash-card p-4 flex justify-between">
              <p className="text-sm font-semibold truncate">{t.title}</p>
              <span className="text-xs text-slate-500">{t.sourcePlatform}</span>
            </div>
          ))}

          {tab === 'finance' && (
            <>
              {commission && (
                <div className="dash-card p-4">
                  <p className="text-sm font-semibold flex items-center gap-2"><Percent className="w-4 h-4" /> Komisyon Doğrulama</p>
                  <p className="text-xs text-slate-500 mt-1">{commission.mismatches} uyumsuzluk · Geri alınabilir: {commission.recoverableAmount} ₺</p>
                </div>
              )}
              {fx && (
                <div className="dash-card p-4">
                  <p className="text-sm font-semibold">Döviz Kurlu Fiyatlama (USD: {fx.rates.USD})</p>
                  <p className="text-xs text-slate-500 mt-1">{fx.suggestions.filter((s) => s.action === 'update').length} ürün güncelleme önerisi</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
