"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BookOpen, Calendar, Clock, Search, Sparkles, Tag, TrendingUp,
} from 'lucide-react';
import type { BlogPostItem } from '@/lib/blog-types';
import { BLOG_CATEGORIES } from '@/lib/blog-meta';
import MarketingPageShell from '@/components/landing/MarketingPageShell';

type BlogClientProps = {
  posts: BlogPostItem[];
  tags: string[];
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function categoryColor(category: string): string {
  const map: Record<string, string> = {
    pazaryeri: 'bg-orange-500/10 text-orange-600 border-orange-200/60',
    eticaret: 'bg-blue-500/10 text-blue-600 border-blue-200/60',
    strateji: 'bg-violet-500/10 text-violet-600 border-violet-200/60',
    rehber: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60',
    haber: 'bg-rose-500/10 text-rose-600 border-rose-200/60',
  };
  return map[category] || 'bg-slate-500/10 text-slate-600 border-slate-200/60';
}

function PostCard({ post, large = false }: { post: BlogPostItem; large?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 backdrop-blur-sm hover:border-orange-300/60 dark:hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/10 transition-all ${large ? 'md:col-span-2' : ''}`}
    >
      {post.coverImage ? (
        <div className={`relative overflow-hidden ${large ? 'h-56 md:h-72' : 'h-44'}`}>
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      ) : (
        <div className={`${large ? 'h-40 md:h-48' : 'h-32'} bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-transparent`} />
      )}

      <div className={`p-6 ${post.coverImage && large ? 'absolute bottom-0 left-0 right-0 text-white' : ''}`}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full border ${post.coverImage && large ? 'bg-white/15 text-white border-white/20' : categoryColor(post.category)}`}>
            {post.categoryLabel}
          </span>
          {post.isFeatured && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full ${post.coverImage && large ? 'bg-amber-400/20 text-amber-100' : 'bg-amber-500/10 text-amber-600'}`}>
              <Sparkles size={10} /> Öne çıkan
            </span>
          )}
        </div>

        <h2 className={`font-black tracking-tight line-clamp-2 group-hover:text-orange-500 transition-colors ${large ? 'text-2xl md:text-3xl' : 'text-xl'} ${post.coverImage && large ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
          {post.title}
        </h2>
        <p className={`mt-3 text-sm line-clamp-3 leading-relaxed ${post.coverImage && large ? 'text-white/85' : 'text-slate-600 dark:text-slate-400'}`}>
          {post.excerpt}
        </p>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${post.coverImage && large ? 'bg-white/10 text-white/90' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className={`mt-5 pt-4 border-t flex items-center justify-between text-xs ${post.coverImage && large ? 'border-white/15 text-white/75' : 'border-slate-200 dark:border-white/10 text-slate-500'}`}>
          <span className="inline-flex items-center gap-1"><Calendar size={13} /> {formatDate(post.updatedAt)}</span>
          <span className="inline-flex items-center gap-1"><Clock size={13} /> {post.readTimeMinutes} dk</span>
        </div>

        <div className={`mt-4 inline-flex items-center gap-2 text-sm font-bold ${post.coverImage && large ? 'text-white' : 'text-orange-600'}`}>
          Yazıyı oku <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export default function BlogClient({ posts, tags }: BlogClientProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const featured = useMemo(
    () => posts.find((p) => p.isFeatured) || posts[0] || null,
    [posts],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchCategory = category === 'all' || post.category === category;
      const matchTag = !activeTag || post.tags.includes(activeTag);
      const matchSearch = !q
        || post.title.toLowerCase().includes(q)
        || post.excerpt.toLowerCase().includes(q)
        || post.tags.some((t) => t.toLowerCase().includes(q));
      return matchCategory && matchTag && matchSearch;
    });
  }, [posts, search, category, activeTag]);

  const gridPosts = useMemo(() => {
    if (!featured) return filtered;
    const withoutFeatured = filtered.filter((p) => p.id !== featured.id);
    if (search || category !== 'all' || activeTag) return filtered;
    return withoutFeatured;
  }, [filtered, featured, search, category, activeTag]);

  const avgRead = posts.length
    ? Math.round(posts.reduce((sum, p) => sum + p.readTimeMinutes, 0) / posts.length)
    : 0;

  const showFeatured = featured && !search && category === 'all' && !activeTag;

  return (
    <MarketingPageShell padded={false} className="pb-20">
        <section className="border-b border-slate-200/50 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-10 lg:pt-16 lg:pb-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-white/5 text-orange-700 dark:text-orange-300 text-xs font-bold mb-5 border border-orange-200/60 dark:border-orange-500/20">
                  <BookOpen size={14} />
                  E-ticaret bilgi merkezi
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black text-slate-900 dark:text-white tracking-tight leading-[1.08]">
                  Pazaryeri operasyonlarınızı{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                    büyüten içerikler
                  </span>
                </h1>
                <p className="mt-5 text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                  Pratik rehberler, satış stratejileri ve saha deneyimleri. Trendyol, Hepsiburada ve çok kanallı e-ticaret için uzman içerikler.
                </p>

                <div className="relative mt-8 max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Trendyol, stok, SEO, fiyatlandırma ara…"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 text-sm shadow-lg shadow-slate-200/30 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>

                <div className="flex flex-wrap gap-6 mt-8">
                  <div>
                    <div className="text-2xl font-black text-orange-600">{posts.length}</div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Yayın</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-orange-600">{tags.length}</div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Etiket</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-orange-600">{avgRead} dk</div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ort. okuma</div>
                  </div>
                </div>
              </div>

              {showFeatured && featured && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  <PostCard post={featured} large />
                </motion.div>
              )}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="sticky top-[calc(4rem+env(safe-area-inset-top,0px))] z-20 -mx-4 px-4 sm:mx-0 sm:px-0 py-3">
            <div className="rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-2 shadow-lg">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() => setCategory('all')}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${category === 'all' ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-orange-600'}`}
                >
                  Tümü
                </button>
                {BLOG_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${category === cat.id ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:text-orange-600'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {tags.slice(0, 12).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${activeTag === tag ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-orange-300'}`}
                >
                  <Tag size={12} />
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-8 mb-6">
            <p className="text-sm text-slate-500">
              <span className="font-black text-slate-800 dark:text-slate-200 text-lg">{filtered.length}</span>
              {' '}yazı
              {search && <span className="text-orange-600 font-medium"> · &quot;{search}&quot;</span>}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Sonuç bulunamadı</h3>
              <p className="text-slate-500 text-sm mb-6">Farklı bir arama veya kategori deneyin.</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setCategory('all'); setActiveTag(null); }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-sm"
              >
                Tümünü göster
              </button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {gridPosts.map((post) => (
                  <motion.div key={post.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-10 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/25 via-transparent to-amber-600/15" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">14 gün ücretsiz deneyin</h2>
                <p className="text-slate-300 mt-2 max-w-md">Blogdaki stratejileri uygulamak için Pazaryönetimi&apos;ni hemen test edin.</p>
              </div>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-orange-700 font-bold hover:bg-orange-50 transition-colors shrink-0"
              >
                Hemen başla <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
    </MarketingPageShell>
  );
}
