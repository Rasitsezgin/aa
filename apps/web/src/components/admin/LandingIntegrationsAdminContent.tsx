"use client";

import React from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { categoryMeta, type CategoryId } from '@/components/landing/integrations-data';

type LandingIntegrationItem = {
  id: string;
  name: string;
  category: CategoryId;
  color: string;
  gradient: string;
  logo: string;
  desc: string;
  shortDesc: string;
  features: string[];
  stats: { users: string; syncTime: string; uptime: string };
  rating: number;
  reviews: number;
  isPopular: boolean;
  isNew: boolean;
  isPublished: boolean;
  documentation: string;
  setupTime: string;
  price: string;
  requirements: string[];
  sortOrder: number;
  updatedAt: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
};

const EMPTY_FORM = {
  id: '',
  name: '',
  category: 'pazaryeri' as CategoryId,
  color: '#F27A1A',
  gradient: 'from-orange-500 to-orange-600',
  logo: '',
  desc: '',
  shortDesc: '',
  features: '',
  requirements: '',
  statsUsers: '1K+',
  statsSyncTime: '< 5 dk',
  statsUptime: '99.9%',
  rating: '4.5',
  reviews: '0',
  isPopular: false,
  isNew: false,
  isPublished: true,
  documentation: '',
  setupTime: '5 dakika',
  price: 'Ücretsiz',
  sortOrder: '0',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  ogImage: '',
  noIndex: false,
};

const CATEGORY_OPTIONS = categoryMeta.filter((c) => c.id !== 'all');

export default function LandingIntegrationsAdminContent() {
  const [items, setItems] = React.useState<LandingIntegrationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [isNew, setIsNew] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [uploadingLogo, setUploadingLogo] = React.useState(false);
  const [uploadingOg, setUploadingOg] = React.useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const ogInputRef = React.useRef<HTMLInputElement>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/landing-integrations', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Liste yüklenemedi');
      setItems(data.integrations || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Veri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const selectItem = (item: LandingIntegrationItem) => {
    setIsNew(false);
    setSelectedId(item.id);
    setForm({
      id: item.id,
      name: item.name,
      category: item.category,
      color: item.color,
      gradient: item.gradient,
      logo: item.logo,
      desc: item.desc,
      shortDesc: item.shortDesc,
      features: item.features.join('\n'),
      requirements: item.requirements.join('\n'),
      statsUsers: item.stats.users,
      statsSyncTime: item.stats.syncTime,
      statsUptime: item.stats.uptime,
      rating: String(item.rating),
      reviews: String(item.reviews),
      isPopular: item.isPopular,
      isNew: item.isNew,
      isPublished: item.isPublished,
      documentation: item.documentation,
      setupTime: item.setupTime,
      price: item.price,
      sortOrder: String(item.sortOrder),
      metaTitle: item.metaTitle || '',
      metaDescription: item.metaDescription || '',
      metaKeywords: (item.metaKeywords || []).join(', '),
      ogImage: item.ogImage || '',
      noIndex: Boolean(item.noIndex),
    });
    setMessage('');
  };

  const uploadImage = async (file: File, target: 'logo' | 'ogImage') => {
    const setUploading = target === 'logo' ? setUploadingLogo : setUploadingOg;
    setUploading(true);
    setMessage('');
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('integrationId', form.id || form.name || 'logo');
      const res = await fetch('/api/admin/landing-integrations/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Yükleme başarısız');
      setForm((f) => ({ ...f, [target]: data.url }));
      setMessage(target === 'logo' ? 'Logo yüklendi' : 'OG görseli yüklendi');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Yükleme başarısız');
    } finally {
      setUploading(false);
    }
  };

  const handleImagePick = (target: 'logo' | 'ogImage') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImage(file, target);
    e.target.value = '';
  };

  const startNew = () => {
    setIsNew(true);
    setSelectedId(null);
    setForm({ ...EMPTY_FORM, sortOrder: String(items.length) });
    setMessage('');
  };

  const buildPayload = () => ({
    id: form.id || undefined,
    name: form.name,
    category: form.category,
    color: form.color,
    gradient: form.gradient,
    logo: form.logo,
    desc: form.desc,
    shortDesc: form.shortDesc,
    features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
    requirements: form.requirements.split('\n').map((r) => r.trim()).filter(Boolean),
    stats: {
      users: form.statsUsers,
      syncTime: form.statsSyncTime,
      uptime: form.statsUptime,
    },
    rating: Number(form.rating),
    reviews: Number(form.reviews),
    isPopular: form.isPopular,
    isNew: form.isNew,
    isPublished: form.isPublished,
    documentation: form.documentation || `/docs/${form.id || 'yeni'}`,
    setupTime: form.setupTime,
    price: form.price,
    sortOrder: Number(form.sortOrder),
    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
    metaKeywords: form.metaKeywords,
    ogImage: form.ogImage,
    noIndex: form.noIndex,
  });

  const handleSave = async () => {
    if (!form.name.trim()) {
      setMessage('Pazaryeri adı zorunludur');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const payload = buildPayload();
      const url = isNew
        ? '/api/admin/landing-integrations'
        : `/api/admin/landing-integrations/${selectedId}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kayıt başarısız');

      await loadData();
      if (data.integration) selectItem(data.integration);
      setIsNew(false);
      setMessage('Kaydedildi');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || isNew) return;
    if (!window.confirm('Bu pazaryerini silmek istediğinize emin misiniz?')) return;

    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/landing-integrations/${selectedId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Silme başarısız');
      setSelectedId(null);
      setForm(EMPTY_FORM);
      await loadData();
      setMessage('Silindi');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Silme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Tüm pazaryerleri varsayılan listeye sıfırlanacak. Devam edilsin mi?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/landing-integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sıfırlama başarısız');
      setSelectedId(null);
      setForm(EMPTY_FORM);
      setIsNew(false);
      await loadData();
      setMessage('Varsayılan listeye sıfırlandı');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sıfırlama başarısız');
    } finally {
      setSaving(false);
    }
  };

  const publishedCount = items.filter((i) => i.isPublished).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-orange-500/10">
              <Globe className="text-orange-500" size={24} />
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Pazaryeri Kataloğu</h1>
          </div>
          <p className="text-slate-500 font-medium">
            /entegrasyonlar sayfasında görünen pazaryerlerini ekleyin, düzenleyin veya yayından kaldırın.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/entegrasyonlar"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-background transition-colors"
          >
            <ExternalLink size={16} />
            Sayfayı görüntüle
          </Link>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-background transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Varsayılana sıfırla
          </button>
          <button
            type="button"
            onClick={startNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
            Yeni pazaryeri
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-surface rounded-2xl border border-border">
          <div className="text-2xl font-black">{items.length}</div>
          <div className="text-xs text-slate-500">Toplam kayıt</div>
        </div>
        <div className="p-4 bg-surface rounded-2xl border border-border">
          <div className="text-2xl font-black text-emerald-600">{publishedCount}</div>
          <div className="text-xs text-slate-500">Yayında</div>
        </div>
        <div className="p-4 bg-surface rounded-2xl border border-border">
          <div className="text-2xl font-black text-orange-500">{items.filter((i) => i.isPopular).length}</div>
          <div className="text-xs text-slate-500">Popüler</div>
        </div>
        <div className="p-4 bg-surface rounded-2xl border border-border">
          <div className="text-2xl font-black text-blue-500">{items.filter((i) => i.isNew).length}</div>
          <div className="text-xs text-slate-500">Yeni</div>
        </div>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-border text-sm font-medium">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border font-bold text-sm">Pazaryerleri</div>
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-slate-500 text-center">Henüz kayıt yok. Yeni pazaryeri ekleyin.</div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-border">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={`w-full text-left p-4 hover:bg-background/60 transition-colors ${
                    selectedId === item.id && !isNew ? 'bg-orange-500/5 border-l-2 border-l-orange-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-foreground truncate">{item.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {CATEGORY_OPTIONS.find((c) => c.id === item.category)?.name || item.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.isPopular && <Star size={12} className="text-orange-500 fill-orange-500" />}
                      {item.isNew && <Sparkles size={12} className="text-emerald-500" />}
                      {item.isPublished ? (
                        <Eye size={12} className="text-emerald-500" />
                      ) : (
                        <EyeOff size={12} className="text-slate-400" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6">
          {!selectedId && !isNew ? (
            <div className="py-16 text-center text-slate-500">
              Düzenlemek için soldan bir pazaryeri seçin veya yeni ekleyin.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-lg font-black">{isNew ? 'Yeni pazaryeri' : 'Pazaryeri düzenle'}</h2>
                <div className="flex gap-2 flex-wrap">
                  {!isNew && selectedId && (
                    <Link
                      href={`/entegrasyonlar/${selectedId}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-bold hover:bg-background"
                    >
                      <ExternalLink size={14} />
                      Detay önizle
                    </Link>
                  )}
                  {!isNew && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-600 bg-red-500/10 text-sm font-bold disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Sil
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Kaydet
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ad *</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kimlik (slug)</span>
                  <input
                    value={form.id}
                    onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                    disabled={!isNew}
                    placeholder="trendyol"
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm disabled:opacity-60"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</span>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as CategoryId }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sıra</span>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kısa açıklama</span>
                  <input
                    value={form.shortDesc}
                    onChange={(e) => setForm((f) => ({ ...f, shortDesc: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detaylı açıklama</span>
                  <textarea
                    rows={3}
                    value={form.desc}
                    onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm resize-none"
                  />
                </label>
                <div className="block md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logo</span>
                  <div className="mt-2 flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-dashed border-border bg-background/50">
                    <div className="w-20 h-20 rounded-2xl border border-border bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                      {form.logo.startsWith('/') ? (
                        <img src={form.logo} alt="Logo önizleme" className="w-full h-full object-contain p-2" />
                      ) : (
                        <span className="text-lg font-black text-orange-500">{form.logo || '?'}</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        value={form.logo}
                        onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))}
                        placeholder="/uploads/integrations/... veya TY"
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                      />
                      <div className="flex flex-wrap gap-2">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="hidden"
                          onChange={handleImagePick('logo')}
                        />
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploadingLogo}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-bold disabled:opacity-50"
                        >
                          {uploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                          Logo yükle
                        </button>
                        <span className="text-xs text-slate-500 self-center">PNG, JPG, WEBP, SVG · max 2MB</span>
                      </div>
                    </div>
                  </div>
                </div>
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Renk</span>
                  <input
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gradient (Tailwind)</span>
                  <input
                    value={form.gradient}
                    onChange={(e) => setForm((f) => ({ ...f, gradient: e.target.value }))}
                    placeholder="from-orange-500 to-orange-600"
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Özellikler (her satır bir özellik)</span>
                  <textarea
                    rows={4}
                    value={form.features}
                    onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm resize-none"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gereksinimler (her satır)</span>
                  <textarea
                    rows={3}
                    value={form.requirements}
                    onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm resize-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kurulum süresi</span>
                  <input
                    value={form.setupTime}
                    onChange={(e) => setForm((f) => ({ ...f, setupTime: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fiyat etiketi</span>
                  <input
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Satıcı sayısı</span>
                  <input
                    value={form.statsUsers}
                    onChange={(e) => setForm((f) => ({ ...f, statsUsers: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Senkron süresi</span>
                  <input
                    value={form.statsSyncTime}
                    onChange={(e) => setForm((f) => ({ ...f, statsSyncTime: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uptime</span>
                  <input
                    value={form.statsUptime}
                    onChange={(e) => setForm((f) => ({ ...f, statsUptime: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Puan</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Değerlendirme sayısı</span>
                  <input
                    type="number"
                    value={form.reviews}
                    onChange={(e) => setForm((f) => ({ ...f, reviews: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Search size={16} className="text-orange-500" />
                  <h3 className="font-black text-foreground">SEO — Detay sayfası</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block md:col-span-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meta başlık</span>
                    <input
                      value={form.metaTitle}
                      onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                      placeholder={`${form.name || 'Pazaryeri'} Entegrasyonu | Pazaryonetimi`}
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meta açıklama</span>
                    <textarea
                      rows={2}
                      value={form.metaDescription}
                      onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                      placeholder={form.shortDesc || 'Arama sonuçlarında görünecek açıklama (120-165 karakter önerilir)'}
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm resize-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">{form.metaDescription.length} karakter</p>
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Anahtar kelimeler</span>
                    <input
                      value={form.metaKeywords}
                      onChange={(e) => setForm((f) => ({ ...f, metaKeywords: e.target.value }))}
                      placeholder="trendyol entegrasyonu, pazaryeri, stok senkron"
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                    />
                  </label>
                  <div className="block md:col-span-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">OG görsel (sosyal paylaşım)</span>
                    <div className="mt-2 flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-dashed border-border bg-background/50">
                      <div className="w-28 h-16 rounded-xl border border-border bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center shrink-0">
                        {form.ogImage ? (
                          <img src={form.ogImage} alt="OG önizleme" className="w-full h-full object-cover" />
                        ) : (
                          <ImagePlus size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          value={form.ogImage}
                          onChange={(e) => setForm((f) => ({ ...f, ogImage: e.target.value }))}
                          placeholder="/uploads/integrations/... veya boş bırakın (logo kullanılır)"
                          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                        />
                        <div className="flex flex-wrap gap-2">
                          <input
                            ref={ogInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={handleImagePick('ogImage')}
                          />
                          <button
                            type="button"
                            onClick={() => ogInputRef.current?.click()}
                            disabled={uploadingOg}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 text-sm font-bold disabled:opacity-50"
                          >
                            {uploadingOg ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            OG görsel yükle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer md:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.noIndex}
                      onChange={(e) => setForm((f) => ({ ...f, noIndex: e.target.checked }))}
                    />
                    Arama motorlarından gizle (noindex)
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                  />
                  Yayında
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPopular}
                    onChange={(e) => setForm((f) => ({ ...f, isPopular: e.target.checked }))}
                  />
                  Popüler
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.checked }))}
                  />
                  Yeni
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
