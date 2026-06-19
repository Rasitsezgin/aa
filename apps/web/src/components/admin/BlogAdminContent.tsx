"use client";

import React from 'react';
import Link from 'next/link';
import {
  ExternalLink, ImagePlus, Loader2, Plus, RefreshCcw, Save, Search, Sparkles, Trash2, Upload,
} from 'lucide-react';
import { BLOG_CATEGORIES } from '@/lib/blog-meta';
import type { BlogPostItem } from '@/lib/blog-types';

type DraftResponse = {
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  source: 'ai' | 'fallback';
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  tags?: string;
};

function toLocalDate(value: string): string {
  return new Date(value).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function BlogAdminContent() {
  const [posts, setPosts] = React.useState<BlogPostItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string>('');

  const [topic, setTopic] = React.useState('Trendyol satis arttirma stratejileri');
  const [audience, setAudience] = React.useState('KOBI e-ticaret saticilari');
  const [tone, setTone] = React.useState('Profesyonel ve aksiyon odakli');
  const [keywords, setKeywords] = React.useState('trendyol, satis arttirma, pazaryeri, e-ticaret');
  const [length, setLength] = React.useState('medium');
  const [customInstructions, setCustomInstructions] = React.useState('');

  const [uploadingCover, setUploadingCover] = React.useState(false);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  const [form, setForm] = React.useState({
    title: '',
    slug: '',
    content: '',
    isActive: false,
    coverImage: '',
    tags: '',
    isFeatured: false,
    category: 'rehber',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  });

  const loadPosts = React.useCallback(async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/blog', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Blog listesi alinamadi.');
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Blog listesi alinamadi.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const resetForm = () => {
    setSelectedId(null);
    setForm({
      title: '',
      slug: '',
      content: '',
      isActive: false,
      coverImage: '',
      tags: '',
      isFeatured: false,
      category: 'rehber',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    });
  };

  const selectPost = (post: BlogPostItem) => {
    setSelectedId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      isActive: post.isActive,
      coverImage: post.coverImage || '',
      tags: post.tags.join(', '),
      isFeatured: post.isFeatured,
      category: post.category || 'rehber',
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      metaKeywords: post.metaKeywords || '',
    });
  };

  const uploadCover = async (file: File) => {
    setUploadingCover(true);
    setMessage('');
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('slug', form.slug || form.title || 'cover');
      const response = await fetch('/api/admin/blog/upload', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Kapak yüklenemedi');
      setForm((prev) => ({ ...prev, coverImage: data.url }));
      setMessage('Kapak görseli yüklendi.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kapak yüklenemedi.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setMessage('Baslik ve icerik zorunludur.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const endpoint = selectedId ? `/api/admin/blog/${selectedId}` : '/api/admin/blog';
      const method = selectedId ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Kayit islemi basarisiz.');

      setMessage(selectedId ? 'Blog guncellendi.' : 'Blog olusturuldu.');
      await loadPosts();

      if (data.post) {
        selectPost(data.post as BlogPostItem);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kayit islemi basarisiz.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm('Bu blog yazisini silmek istediginize emin misiniz?')) return;

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`/api/admin/blog/${selectedId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Silme islemi basarisiz.');

      setMessage('Blog silindi.');
      resetForm();
      await loadPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Silme islemi basarisiz.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!topic.trim()) {
      setMessage('AI taslak icin konu giriniz.');
      return;
    }

    setGenerating(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/blog/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, audience, tone, keywords, length, customInstructions }),
      });

      const data = (await response.json()) as DraftResponse & { message?: string };
      if (!response.ok) throw new Error(data.message || 'AI taslak olusturulamadi.');

      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        slug: data.slug || prev.slug,
        content: data.content || prev.content,
        metaTitle: data.metaTitle || prev.metaTitle,
        metaDescription: data.metaDescription || prev.metaDescription,
        metaKeywords: data.metaKeywords || prev.metaKeywords,
        tags: data.tags || prev.tags,
      }));

      if (data.source === 'fallback') {
        setMessage('AI servisi kullanilamadi, akilli taslak olusturuldu.');
      } else {
        setMessage('AI blog taslagi hazirlandi.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'AI taslak olusturulamadi.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Blog Yonetimi</h1>
        <p className="text-slate-500 font-medium">Blog yazilarini buradan olusturun, yayinlayin ve AI ile hizli taslaklar üretin.</p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Yayinlanan Taslaklar</h2>
              <button
                onClick={loadPosts}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"
                title="Yenile"
              >
                <RefreshCcw size={16} />
              </button>
            </div>

            {loading ? (
              <div className="py-8 flex items-center justify-center text-slate-500 gap-2 text-sm">
                <Loader2 className="animate-spin" size={16} /> Yukleniyor...
              </div>
            ) : posts.length === 0 ? (
              <div className="text-sm text-slate-500 py-6">Henuz blog yazisi bulunmuyor.</div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
                {posts.map((post) => {
                  const active = selectedId === post.id;
                  return (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => selectPost(post)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        active
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/60 dark:bg-black/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-sm text-foreground line-clamp-1">{post.title}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${post.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {post.isActive ? 'Yayinda' : 'Taslak'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">/{post.slug}</div>
                      <div className="text-xs text-slate-500 mt-1">{toLocalDate(post.updatedAt)} • {post.readTimeMinutes} dk</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Sparkles size={15} /> AI Blog Taslagi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Konu (ör. Trendyol Satış Artırma)"
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium"
              />
              <input
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                placeholder="Hedef kitle (ör. E-ticaret satıcıları)"
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium"
              />
              <input
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                placeholder="Yazi tonu (ör. Profesyonel, samimi, akıcı)"
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium"
              />
              <select
                value={length}
                onChange={(event) => setLength(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium"
              >
                <option value="short">Kısa Metin (~500 kelime)</option>
                <option value="medium">Standart İçerik (~1000 kelime)</option>
                <option value="long">Detaylı Rehber (~1500 kelime)</option>
                <option value="extra-long">Kapsamlı E-Kitap/Rehber (~2000+ kelime)</option>
              </select>
              <div className="md:col-span-2">
                <input
                  value={keywords}
                  onChange={(event) => setKeywords(event.target.value)}
                  placeholder="Anahtar kelimeler (virgülle, ör. trendyol, satış, e-ticaret)"
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <textarea
                  value={customInstructions}
                  onChange={(event) => setCustomInstructions(event.target.value)}
                  placeholder="Özel Yapay Zeka Talimatları (ör. 'İçerikte bol bol örnek vaka kullan, soru-cevap bölümü ekle, samimi bir dil kullan')"
                  className="w-full h-24 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-sm font-medium resize-none focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={generating}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm disabled:opacity-60"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {generating ? 'Taslak olusturuluyor...' : 'AI ile Taslak Uret'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Blog Editoru</h3>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
                Yayinda
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Blog başlığı"
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium"
              />
              <input
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="slug"
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium"
              />
              <select
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium"
              >
                {BLOG_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <input
                value={form.tags}
                onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                placeholder="Etiketler (virgülle)"
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium"
              />
            </div>

            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Kapak görseli</span>
              <div className="mt-3 flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-40 h-28 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-100 dark:bg-black/20 flex items-center justify-center">
                  {form.coverImage ? (
                    <img src={form.coverImage} alt="Kapak" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus className="text-slate-400" size={24} />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    value={form.coverImage}
                    onChange={(event) => setForm((prev) => ({ ...prev, coverImage: event.target.value }))}
                    placeholder="/uploads/blog/..."
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium"
                  />
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) await uploadCover(file);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 text-violet-600 text-sm font-bold disabled:opacity-50"
                  >
                    {uploadingCover ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    Kapak yükle
                  </button>
                </div>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => setForm((prev) => ({ ...prev, isFeatured: event.target.checked }))}
              />
              Öne çıkan yazı (blog ana sayfasında büyük kart)
            </label>

            <textarea
              value={form.content}
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              placeholder="Blog icerigi (Markdown destekli)"
              className="w-full min-h-[360px] rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-4 text-sm font-medium"
            />

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-500">
                <Search size={14} className="text-orange-500" /> SEO
              </div>
              <input
                value={form.metaTitle}
                onChange={(event) => setForm((prev) => ({ ...prev, metaTitle: event.target.value }))}
                placeholder="Meta başlık"
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium"
              />
              <textarea
                value={form.metaDescription}
                onChange={(event) => setForm((prev) => ({ ...prev, metaDescription: event.target.value }))}
                placeholder="Meta açıklama"
                rows={2}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-4 text-sm font-medium resize-none"
              />
              <input
                value={form.metaKeywords}
                onChange={(event) => setForm((prev) => ({ ...prev, metaKeywords: event.target.value }))}
                placeholder="Anahtar kelimeler (virgülle)"
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedId && form.slug && (
                <Link
                  href={`/blog/${form.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold"
                >
                  <ExternalLink size={16} /> Önizle
                </Link>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {selectedId ? 'Blogu güncelle' : 'Yeni blog kaydet'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm"
              >
                <Plus size={16} /> Yeni Form
              </button>

              {selectedId && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm disabled:opacity-60"
                >
                  <Trash2 size={16} /> Sil
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
