"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import {
  Search, Package, Loader2, ChevronRight, Layers,
  Store, ExternalLink, Filter
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  sku?: string;
  price?: number | string;
  stock?: number;
  tenantId?: string;
  platform?: string;
  status?: string;
  updatedAt?: string;
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => adminApi.getProducts({ search: search || undefined, page, limit: 20 }),
  });

  const products: Product[] = data?.products ?? data?.items ?? [];
  const pagination = data?.pagination ?? { total: products.length, page: 1, totalPages: 1 };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Ürün Yönetimi</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Platform genelinde tüm tenant ürünlerini görüntüleyin
          </p>
        </div>
        <Link
          href="/admin/products/variant-manager"
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all"
        >
          <Layers size={16} /> Varyant Yöneticisi
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Ürün adı veya SKU ara..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Filter size={16} />
          {pagination.total ?? products.length} ürün
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">Ürünler yüklenemedi</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Henüz ürün bulunmuyor</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 text-left text-xs uppercase text-slate-500">
                <th className="px-6 py-4">Ürün</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Fiyat</th>
                <th className="px-6 py-4">Stok</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-purple-500" />
                      </div>
                      <span className="font-semibold text-foreground">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-500">{product.sku ?? '—'}</td>
                  <td className="px-6 py-4 font-bold">
                    ₺{Number(product.price ?? 0).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">{product.stock ?? 0}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-bold bg-blue-500/10 text-blue-500 rounded-lg">
                      {product.platform ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/products/variant-manager?productId=${product.id}`}
                      className="flex items-center gap-1 text-sm text-purple-500 hover:text-purple-600 font-medium"
                    >
                      Varyantlar <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-40"
          >
            Önceki
          </button>
          <span className="px-4 py-2 text-sm text-slate-500">
            {page} / {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-40"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}
