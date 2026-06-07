'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Layers, Search, Plus, Trash2, Save, Package } from 'lucide-react';
import Link from 'next/link';
import { useProducts } from '@/lib/hooks';
import { useTenantId } from '@/lib/tenant';
import { loadSkuGroups, saveSkuGroups, type SkuGroup } from '@/lib/sku-groups';

type ProductRow = {
  id: string;
  sku: string;
  title: string;
  stock: number;
  platform?: string;
};

export default function GroupMappingPage() {
  const tenantId = useTenantId();
  const { data: productsData, loading } = useProducts(1, 100);
  const [groups, setGroups] = useState<SkuGroup[]>([]);
  const [search, setSearch] = useState('');
  const [masterSku, setMasterSku] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const products: ProductRow[] = useMemo(() => {
    const raw = productsData?.products || productsData?.data || productsData || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((p: any) => ({
      id: p.id,
      sku: p.sku || p.barcode || p.id,
      title: p.title || p.name || 'Ürün',
      stock: p.stock ?? 0,
      platform: p.platform,
    }));
  }, [productsData]);

  useEffect(() => {
    if (!tenantId) return;
    loadSkuGroups(tenantId).then(setGroups).catch(() => setGroups([]));
  }, [tenantId]);

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const createGroup = () => {
    if (!masterSku.trim() || selectedIds.length === 0) return;
    const stock = products
      .filter((p) => selectedIds.includes(p.id))
      .reduce((min, p) => Math.min(min, p.stock), Number.MAX_SAFE_INTEGER);

    const next: SkuGroup = {
      masterSku: masterSku.trim(),
      masterStock: stock === Number.MAX_SAFE_INTEGER ? 0 : stock,
      variantIds: selectedIds,
      updatedAt: new Date().toISOString(),
    };
    setGroups((prev) => [...prev.filter((g) => g.masterSku !== next.masterSku), next]);
    setMasterSku('');
    setSelectedIds([]);
  };

  const persist = async () => {
    if (!tenantId) return;
    const savedGroups = await saveSkuGroups(tenantId, groups);
    setGroups(savedGroups);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const removeGroup = (sku: string) => {
    setGroups((prev) => prev.filter((g) => g.masterSku !== sku));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black flex items-center gap-3">
          <Layers className="w-8 h-8 text-orange-500" />
          SKU Eşleme (Master Stok)
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Farklı pazaryeri SKU&apos;larını tek master stok altında birleştirin. Satış bir kanaldan düşünce tüm kanallar senkron güncellenir.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl p-6 text-white">
            <h2 className="font-black mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" /> Yeni Grup
            </h2>
            <input
              value={masterSku}
              onChange={(e) => setMasterSku(e.target.value)}
              placeholder="Master SKU (örn: MASTER-TSH-BLK-L)"
              className="w-full mb-3 px-4 py-3 rounded-xl bg-white/10 border border-white/20 font-bold placeholder-white/50"
            />
            <p className="text-xs text-orange-100 mb-3">{selectedIds.length} varyant seçildi</p>
            <button
              type="button"
              onClick={createGroup}
              className="w-full py-3 rounded-xl bg-white text-orange-700 font-black text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Grubu Oluştur
            </button>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm">Kayıtlı Gruplar ({groups.length})</h3>
              <button type="button" onClick={persist} className="text-xs font-black text-orange-600 flex items-center gap-1">
                <Save className="w-3.5 h-3.5" /> {saved ? 'Kaydedildi' : 'Kaydet'}
              </button>
            </div>
            {groups.map((g) => (
              <div key={g.masterSku} className="p-3 rounded-xl border border-border bg-background/50">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{g.masterSku}</p>
                    <p className="text-[10px] text-slate-500">{g.variantIds.length} varyant · Stok: {g.masterStock}</p>
                  </div>
                  <button type="button" onClick={() => removeGroup(g.masterSku)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {groups.length === 0 && <p className="text-xs text-slate-500 text-center py-4">Henüz grup yok</p>}
          </div>
        </div>

        <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ürün veya SKU ara..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm"
            />
          </div>

          {loading ? (
            <p className="text-sm text-slate-500 text-center py-10">Ürünler yükleniyor...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500 mb-3">Ürün bulunamadı</p>
              <Link href="/dashboard/products" className="text-orange-600 text-sm font-bold hover:underline">
                Ürün ekle →
              </Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-[28rem] overflow-y-auto">
              {filtered.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedIds.includes(p.id) ? 'border-orange-500/40 bg-orange-500/5' : 'border-border hover:border-orange-500/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    className="rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{p.title}</p>
                    <p className="text-[10px] text-slate-500">{p.sku} · Stok: {p.stock}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
