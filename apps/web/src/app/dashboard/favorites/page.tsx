"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bookmark, Plus, Star, Trash2, ArrowRight,
} from 'lucide-react';
import { NAV_ITEMS } from '@/lib/navigation.config';

type Favorite = {
  id: string;
  title: string;
  url: string;
  category: string;
  color: string;
};

type Shortcut = {
  id: string;
  label: string;
  keys: string;
  action: string;
};

const allPages = NAV_ITEMS.filter((i) => i.commandPalette).map((i) => ({
  title: i.label,
  url: i.href,
}));

const shortcuts: Shortcut[] = [
  { id: '1', label: 'Yeni Ürün', keys: 'Alt+N', action: 'Ürün ekleme sayfasını aç' },
  { id: '2', label: 'Arama', keys: 'Ctrl+K', action: 'Global arama' },
  { id: '3', label: 'Dashboard', keys: 'Alt+D', action: "Dashboard'a git" },
  { id: '4', label: 'Siparişler', keys: 'Alt+O', action: 'Siparişlere git' },
  { id: '5', label: 'Bildirimler', keys: 'Alt+B', action: 'Bildirim panelini aç' },
];

async function persistFavorites(favorites: Favorite[]) {
  await fetch('/api/user/favorites', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ favorites }),
  });
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tab, setTab] = useState<'favorites' | 'shortcuts'>('favorites');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/favorites', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.favorites) setFavorites(data.favorites);
      })
      .finally(() => setLoading(false));
  }, []);

  const removeFav = async (id: string) => {
    const next = favorites.filter((f) => f.id !== id);
    setFavorites(next);
    await persistFavorites(next);
  };

  const addFav = async (page: (typeof allPages)[0]) => {
    if (favorites.some((f) => f.url === page.url)) return;
    const next = [
      ...favorites,
      {
        id: `f${Date.now()}`,
        title: page.title,
        url: page.url,
        category: 'Sayfa',
        color: 'indigo',
      },
    ];
    setFavorites(next);
    setShowAddModal(false);
    await persistFavorites(next);
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-yellow-500" /> Favoriler & Kısayollar
        </h1>
        <p className="text-slate-500 mt-1">Sık kullandığınız sayfalar hesabınıza kaydedilir</p>
      </div>

      <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
        <button
          type="button"
          onClick={() => setTab('favorites')}
          className={`flex-1 py-2.5 text-sm rounded-lg font-medium ${tab === 'favorites' ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-500'}`}
        >
          <Star className="w-4 h-4 inline mr-2" />
          Favoriler ({favorites.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('shortcuts')}
          className={`flex-1 py-2.5 text-sm rounded-lg font-medium ${tab === 'shortcuts' ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-500'}`}
        >
          Klavye Kısayolları ({shortcuts.length})
        </button>
      </div>

      {tab === 'favorites' && (
        <>
          {loading ? (
            <p className="text-sm text-slate-500">Yükleniyor...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((fav, i) => (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-surface rounded-2xl border border-border p-5 group hover:border-yellow-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <Link href={fav.url} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-yellow-500/20 rounded-xl shrink-0">
                        <Bookmark className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-foreground truncate">{fav.title}</h3>
                        <p className="text-xs text-slate-500 truncate">{fav.url}</p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeFav(fav.id)}
                      className="p-1.5 hover:bg-background rounded-lg text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="border-2 border-dashed border-border rounded-2xl p-5 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-yellow-400 hover:border-yellow-500/30 transition-colors"
              >
                <Plus className="w-5 h-5" /> Favori Ekle
              </button>
            </div>
          )}

          {showAddModal && (
            <div
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface rounded-2xl w-full max-w-md border border-border p-6 max-h-[70vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-foreground mb-4">Sayfa Ekle</h3>
                <div className="space-y-2">
                  {allPages
                    .filter((p) => !favorites.some((f) => f.url === p.url))
                    .map((page) => (
                      <button
                        key={page.url}
                        type="button"
                        onClick={() => addFav(page)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-background rounded-xl transition-colors text-left"
                      >
                        <Bookmark className="w-5 h-5 text-slate-400" />
                        <span className="text-sm text-foreground">{page.title}</span>
                        <ArrowRight className="w-4 h-4 text-slate-600 ml-auto" />
                      </button>
                    ))}
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}

      {tab === 'shortcuts' && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {shortcuts.map((sc) => (
            <div key={sc.id} className="flex items-center justify-between p-4 border-b border-border/50 last:border-0">
              <div>
                <div className="text-sm font-medium text-foreground">{sc.label}</div>
                <div className="text-xs text-slate-500">{sc.action}</div>
              </div>
              <kbd className="px-3 py-1.5 bg-background rounded-lg text-sm text-slate-400 border border-border font-mono">
                {sc.keys}
              </kbd>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
