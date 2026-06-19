"use client";

import React from 'react';
import Link from 'next/link';
import {
  ExternalLink, ImagePlus, Loader2, Plus, RefreshCcw, Save, Search, Sparkles, Trash2, Upload,
  Eye, Code, Columns, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { BLOG_CATEGORIES } from '@/lib/blog-meta';
import type { BlogPostItem } from '@/lib/blog-types';
import { toast } from '@/components/ui/Toast';

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

  // Status message state (colored alerts)
  const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // Markdown preview active tab
  const [activeTab, setActiveTab] = React.useState<'edit' | 'preview' | 'split'>('edit');

  // Textarea reference for cursor manipulation on upload
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

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
    setMessage(null);

    try {
      const response = await fetch('/api/admin/blog', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Blog listesi alinamadi.');
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Blog listesi alinamadi.';
      setMessage({ text: msg, type: 'error' });
      toast.error('Hata', msg);
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
    setMessage(null);
    toast.info('Form Sıfırlandı', 'Yeni blog girişi için form temizlendi.');
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
    setMessage(null);
  };

  const uploadCover = async (file: File) => {
    setUploadingCover(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('slug', form.slug || form.title || 'cover');
      const response = await fetch('/api/admin/blog/upload', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Kapak yüklenemedi');
      setForm((prev) => ({ ...prev, coverImage: data.url }));
      setMessage({ text: 'Kapak görseli yüklendi.', type: 'success' });
      toast.success('Başarılı', 'Kapak görseli yüklendi.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Kapak yüklenemedi.';
      setMessage({ text: msg, type: 'error' });
      toast.error('Yükleme Hatası', msg);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setMessage({ text: 'Başlık ve içerik alanları zorunludur.', type: 'warning' });
      toast.warning('Eksik Bilgi', 'Başlık ve içerik alanları zorunludur.');
      return;
    }

    setSaving(true);
    setMessage(null);

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

      const successMsg = selectedId ? 'Blog yazısı güncellendi.' : 'Blog yazısı oluşturuldu.';
      setMessage({ text: successMsg, type: 'success' });
      toast.success('Başarılı', successMsg);
      await loadPosts();

      if (data.post) {
        selectPost(data.post as BlogPostItem);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Kayit islemi basarisiz.';
      setMessage({ text: msg, type: 'error' });
      toast.error('Hata', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm('Bu blog yazisini silmek istediginize emin misiniz?')) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/blog/${selectedId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Silme islemi basarisiz.');

      setMessage({ text: 'Blog yazısı silindi.', type: 'success' });
      toast.success('Silindi', 'Blog yazısı başarıyla silindi.');
      resetForm();
      await loadPosts();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Silme islemi basarisiz.';
      setMessage({ text: msg, type: 'error' });
      toast.error('Hata', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!topic.trim()) {
      setMessage({ text: 'AI taslak üretimi için lütfen bir konu giriniz.', type: 'warning' });
      toast.warning('Eksik Bilgi', 'AI taslak üretimi için lütfen bir konu giriniz.');
      return;
    }

    setGenerating(true);
    setMessage(null);
    toast.info('AI Taslak Üretiliyor', 'Yapay zeka detaylı blog içeriğini hazırlıyor, lütfen bekleyin...');

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
        const fallbackMsg = 'AI servisi kullanılamadı, varsayılan akıllı taslak yüklendi.';
        setMessage({ text: fallbackMsg, type: 'warning' });
        toast.warning('Bağlantı Sorunu', fallbackMsg);
      } else {
        const successMsg = 'Yapay zeka blog taslağı başarıyla hazırlandı ve alanlara dolduruldu.';
        setMessage({ text: successMsg, type: 'success' });
        toast.success('Taslak Hazır', successMsg);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'AI taslak olusturulamadi.';
      setMessage({ text: msg, type: 'error' });
      toast.error('Hata', msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleTextareaDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Geçersiz Dosya', 'Sadece görsel dosyalarını editöre sürükleyebilirsiniz.');
      return;
    }
    await handleInlineImageUpload(file);
  };

  const handleTextareaPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const file = e.clipboardData.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    e.preventDefault();
    await handleInlineImageUpload(file);
  };

  const handleInlineImageUpload = async (file: File) => {
    toast.info('Görsel Yükleniyor', `${file.name} sunucuya yükleniyor...`);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('slug', form.slug || form.title || 'inline-image');
      const response = await fetch('/api/admin/blog/upload', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Yükleme başarısız');

      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const markdownImage = `\n![${file.name.split('.')[0]}](${data.url})\n`;

      const newContent = text.substring(0, start) + markdownImage + text.substring(end);
      setForm((prev) => ({ ...prev, content: newContent }));
      toast.success('Görsel Eklendi', 'Görsel içeriğe başarıyla yerleştirildi.');
    } catch (err) {
      toast.error('Yükleme Hatası', err instanceof Error ? err.message : 'Görsel yüklenemedi.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Blog Yonetimi</h1>
        <p className="text-slate-500 font-medium">Blog yazilarini buradan olusturun, yayinlayin ve AI ile hizli taslaklar üretin.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-sm font-semibold flex items-start gap-2.5 shadow-sm ${
          message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400' :
          message.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400' :
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
          'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400'
        }`}>
          {message.type === 'error' && <AlertTriangle className="w-5 h-5 shrink-0" />}
          {message.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0" />}
          {message.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0" />}
          {message.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Yayinlanan Taslaklar</h2>
              <button
                onClick={loadPosts}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
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
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
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
              <Sparkles size={15} className="text-violet-500" /> AI Blog Taslagi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Konu (ör. Trendyol Satış Artırma)"
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium focus:outline-none focus:border-violet-500"
              />
              <input
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                placeholder="Hedef kitle (ör. E-ticaret satıcıları)"
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium focus:outline-none focus:border-violet-500"
              />
              <input
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                placeholder="Yazi tonu (ör. Profesyonel, samimi, akıcı)"
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium focus:outline-none focus:border-violet-500"
              />
              <select
                value={length}
                onChange={(event) => setLength(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium focus:outline-none focus:border-violet-500"
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
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium focus:outline-none focus:border-violet-500"
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
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm disabled:opacity-60 transition-all shadow-md shadow-violet-500/20"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {generating ? 'AI Taslak Hazırlanıyor...' : 'AI ile Taslak Uret'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Blog Editoru</h3>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
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
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium focus:outline-none focus:border-blue-500"
              />
              <input
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="slug"
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium focus:outline-none focus:border-blue-500"
              />
              <select
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium focus:outline-none focus:border-blue-500"
              >
                {BLOG_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <input
                value={form.tags}
                onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                placeholder="Etiketler (virgülle)"
                className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium focus:outline-none focus:border-blue-500"
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
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium focus:outline-none focus:border-blue-500"
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
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm font-bold disabled:opacity-50 transition-all hover:bg-violet-500/20"
                  >
                    {uploadingCover ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    Kapak yükle
                  </button>
                </div>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => setForm((prev) => ({ ...prev, isFeatured: event.target.checked }))}
              />
              Öne çıkan yazı (blog ana sayfasında büyük kart)
            </label>

            {/* Markdown Tab Switcher */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-1">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'edit'
                        ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Code size={14} /> Editör
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === 'preview'
                        ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Eye size={14} /> Önizleme
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('split')}
                    className={`hidden lg:flex pb-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all items-center gap-1.5 ${
                      activeTab === 'split'
                        ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Columns size={14} /> Yan Yana (Split)
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold hidden md:inline">
                  Görsel sürükleyip bırakabilir veya kopyalayıp yapıştırabilirsiniz.
                </span>
              </div>

              {/* Editor Tabs Content */}
              {activeTab === 'edit' && (
                <div className="relative group">
                  <textarea
                    ref={textareaRef}
                    value={form.content}
                    onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                    onDrop={handleTextareaDrop}
                    onPaste={handleTextareaPaste}
                    placeholder="Blog içeriği (Markdown destekli)"
                    className="w-full min-h-[380px] rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-4 text-sm font-medium focus:outline-none focus:border-violet-500"
                  />
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-[10px] px-2 py-1 rounded-md font-bold pointer-events-none">
                    Markdown Modu
                  </div>
                </div>
              )}

              {activeTab === 'preview' && (
                <div
                  className="w-full min-h-[380px] max-h-[500px] overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/25 p-6 prose-preview font-sans"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(form.content || '*Henüz içerik yazılmadı.*') }}
                />
              )}

              {activeTab === 'split' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <textarea
                    ref={textareaRef}
                    value={form.content}
                    onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                    onDrop={handleTextareaDrop}
                    onPaste={handleTextareaPaste}
                    placeholder="Blog içeriği (Markdown destekli)"
                    className="w-full h-[450px] rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-4 text-sm font-medium focus:outline-none focus:border-violet-500"
                  />
                  <div
                    className="w-full h-[450px] overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/25 p-6 prose-preview font-sans border-l-2 border-l-violet-500/20"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(form.content || '*Henüz içerik yazılmadı.*') }}
                  />
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-500">
                <Search size={14} className="text-orange-500" /> SEO Ayarları
              </div>
              <input
                value={form.metaTitle}
                onChange={(event) => setForm((prev) => ({ ...prev, metaTitle: event.target.value }))}
                placeholder="Meta başlık"
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium focus:outline-none focus:border-orange-500"
              />
              <textarea
                value={form.metaDescription}
                onChange={(event) => setForm((prev) => ({ ...prev, metaDescription: event.target.value }))}
                placeholder="Meta açıklama"
                rows={2}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-4 text-sm font-medium resize-none focus:outline-none focus:border-orange-500"
              />
              <input
                value={form.metaKeywords}
                onChange={(event) => setForm((prev) => ({ ...prev, metaKeywords: event.target.value }))}
                placeholder="Anahtar kelimeler (virgülle)"
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 text-sm font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Google SERP Preview Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-5 space-y-3 bg-white dark:bg-slate-900/40">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Search size={14} className="text-blue-500" /> Google Arama Sonuçları (SERP) Önizlemesi
              </span>
              <div className="border border-slate-200/80 dark:border-white/5 p-4 rounded-xl bg-white dark:bg-black/20 font-sans space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-300">Pazar Yönetimi</span>
                  <span>›</span>
                  <span>blog</span>
                  <span>›</span>
                  <span className="truncate max-w-[200px]">{form.slug || 'slug-adresi'}</span>
                </div>
                <h4 className="text-[19px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-tight">
                  {form.metaTitle || form.title || 'Yeni Blog Yazısı Başlığı'}
                </h4>
                <p className="text-[14px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
                  {form.metaDescription || (form.content ? form.content.slice(0, 155) + '...' : 'İçerik özeti veya meta açıklaması henüz girilmedi. Yapay zeka ile otomatik üretebilir veya kendiniz yazabilirsiniz.')}
                </p>
              </div>
            </div>

            {/* Floating Sticky Actions Dock */}
            <div className="sticky bottom-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex items-center justify-between z-30 shadow-xl transition-all">
              <div className="flex gap-2">
                {selectedId && form.slug && (
                  <Link
                    href={`/blog/${form.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <ExternalLink size={15} /> Önizle
                  </Link>
                )}
                {selectedId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-sm disabled:opacity-60 transition-all"
                  >
                    <Trash2 size={15} /> Sil
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors"
                >
                  <Plus size={15} /> Yeni Form
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm disabled:opacity-60 shadow-md shadow-blue-500/25 transition-all"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {selectedId ? 'Değişiklikleri Kaydet' : 'Yazıyı Yayınla'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Lightweight Markdown-to-HTML parser (0 dependencies, 100% stable in Next.js Server & Client)
function renderMarkdownToHtml(md: string): string {
  if (!md) return '';
  
  // Safe HTML escape to prevent XSS
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-base font-black text-slate-800 dark:text-slate-200 mt-4 mb-2">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-lg font-black text-slate-900 dark:text-white mt-5 mb-2 border-b border-slate-100 dark:border-white/5 pb-1">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-xl font-black text-slate-900 dark:text-white mt-6 mb-3">$1</h2>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-violet-500 pl-4 py-1 my-3 bg-violet-500/5 text-slate-600 dark:text-slate-400 italic rounded-r-lg">$1</blockquote>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-950 dark:text-white">$1</strong>');
  
  // Lists
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 my-1">$1</li>');
  html = html.replace(/^\s*\*\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 my-1">$1</li>');
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-slate-700 dark:text-slate-300 my-1">$1</li>');

  // Line breaks
  html = html.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('<h') || trimmed.startsWith('<li') || trimmed.startsWith('<block') || trimmed === '') {
      return line;
    }
    return `<p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">${line}</p>`;
  }).join('\n');

  return html;
}
