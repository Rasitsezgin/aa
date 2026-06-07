"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle, RefreshCw, CheckCircle2, Search, XCircle, Store,
} from 'lucide-react';
import Link from 'next/link';

type Discrepancy = {
  id: string;
  sku: string;
  name: string;
  localStock: number;
  marketStock: number;
  marketplace: string;
  status: 'critical' | 'warning' | 'synced';
  lastSyncAt: string | null;
};

function formatRelative(iso: string | null) {
  if (!iso) return 'Bilinmiyor';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}

export default function DiscrepancyManagerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [results, setResults] = useState<Discrepancy[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (scan = false) => {
    if (scan) setIsScanning(true);
    else setLoading(true);
    try {
      const res = await fetch('/api/inventory/discrepancies', {
        method: scan ? 'POST' : 'GET',
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      setResults(data.items || []);
      setLastScan(data.lastScan || data.scannedAt || null);
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = results.filter(
    (r) =>
      r.sku.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.marketplace.toLowerCase().includes(search.toLowerCase()),
  );

  const criticalCount = results.filter((r) => r.status === 'critical').length;
  const warningCount = results.filter((r) => r.status === 'warning').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            Ürün Farklılık Kontrolü
          </h1>
          <p className="text-slate-500 mt-2">
            Yerel stok ile pazaryeri stoklarını karşılaştırır.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">
            Son tarama: {lastScan ? formatRelative(lastScan) : 'Henüz yok'}
          </span>
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isScanning}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Taranıyor...' : 'Yeni Tarama'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-3xl p-6">
          <div className="text-sm font-bold text-slate-500 mb-2">Kritik</div>
          <div className="text-4xl font-black text-red-500">{criticalCount}</div>
        </div>
        <div className="bg-surface border border-border rounded-3xl p-6">
          <div className="text-sm font-bold text-slate-500 mb-2">Uyarı</div>
          <div className="text-4xl font-black text-amber-500">{warningCount}</div>
        </div>
        <div className="bg-surface border border-border rounded-3xl p-6">
          <div className="text-sm font-bold text-slate-500 mb-2">Toplam Fark</div>
          <div className="text-4xl font-black text-foreground">{results.length}</div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold">Fark Listesi</h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SKU veya ürün ara..."
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <p className="p-10 text-center text-slate-500">Yükleniyor...</p>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold">Stok farkı bulunamadı</p>
            <p className="text-sm text-slate-500 mt-1">
              Pazaryeri bağlantısı olan ürünlerde fark oluşursa burada listelenir.
            </p>
            <Link href="/dashboard/settings/integrations" className="text-orange-600 text-sm font-bold mt-4 inline-block">
              Entegrasyon ekle →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((item) => (
              <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.sku}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Store className="w-4 h-4 text-slate-400" />
                  {item.marketplace}
                </div>
                <div className="text-sm">
                  Yerel: <strong>{item.localStock}</strong> · Pazaryeri: <strong>{item.marketStock}</strong>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    item.status === 'critical'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {item.status === 'critical' ? 'Kritik' : 'Uyarı'}
                </span>
                <Link
                  href="/dashboard/inventory/group-mapping"
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  SKU Eşle
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
