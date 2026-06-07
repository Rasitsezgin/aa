"use client";

import React from 'react';
import Link from 'next/link';
import { BookOpen, ExternalLink, Loader2, Plus, Save, Trash2 } from 'lucide-react';

type HelpSection = { id: string; name: string; slug: string };

type HelpArticleListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  status: string;
  isPinned: boolean;
  isFeatured: boolean;
  viewCount: number;
  helpfulCount: number;
  sectionName: string;
  updatedAt: string;
};

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Taslak' },
  { value: 'published', label: 'Yayında' },
  { value: 'archived', label: 'Arşiv' },
];

export default function HelpAdminContent() {
  const [sections, setSections] = React.useState<HelpSection[]>([]);
  const [articles, setArticles] = React.useState<HelpArticleListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState('');

  const [form, setForm] = React.useState({
    title: '',
    slug: '',
    sectionId: '',
    summary: '',
    content: '',
    status: 'draft',
    isPinned: false,
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
    keywords: '',
  });

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const [sectionsRes, articlesRes] = await Promise.all([
        fetch('/api/admin/help/sections', { cache: 'no-store' }),
        fetch('/api/admin/help/articles', { cache: 'no-store' }),
      ]);
      const sectionsData = await sectionsRes.json();
      const articlesData = await articlesRes.json();
      if (!sectionsRes.ok) throw new Error(sectionsData.error || 'Bölümler yüklenemedi');
      if (!articlesRes.ok) throw new Error(articlesData.error || 'Makaleler yüklenemedi');
      const loadedSections = sectionsData.sections || [];
      setSections(loadedSections);
      setArticles(articlesData.articles || []);
      setForm((f) => (
        f.sectionId || !loadedSections[0]
          ? f
          : { ...f, sectionId: loadedSections[0].id }
      ));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Veri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setSelectedId(null);
    setForm({
      title: '',
      slug: '',
      sectionId: sections[0]?.id || '',
      summary: '',
      content: '',
      status: 'draft',
      isPinned: false,
      isFeatured: false,
      metaTitle: '',
      metaDescription: '',
      keywords: '',
    });
  };

  const selectArticle = async (id: string) => {
    setMessage('');
    try {
      const res = await fetch(`/api/admin/help/articles/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Makale yüklenemedi');
      const a = data.article;
      setSelectedId(id);
      setForm({
        title: a.title,
        slug: a.slug,
        sectionId: a.sectionId,
        summary: a.summary || '',
        content: a.content,
        status: a.status,
        isPinned: a.isPinned,
        isFeatured: a.isFeatured,
        metaTitle: a.metaTitle || '',
        metaDescription: a.metaDescription || '',
        keywords: (a.keywords || []).join(', '),
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Makale yüklenemedi');
    }
  };

  const saveArticle = async () => {
    if (!form.title.trim() || !form.content.trim() || !form.sectionId) {
      setMessage('Başlık, içerik ve bölüm zorunlu');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        ...form,
        keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      };
      const res = await fetch(
        selectedId ? `/api/admin/help/articles/${selectedId}` : '/api/admin/help/articles',
        {
          method: selectedId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kayıt başarısız');
      setMessage(selectedId ? 'Makale güncellendi' : 'Makale oluşturuldu');
      await loadData();
      if (!selectedId && data.article?.id) {
        setSelectedId(data.article.id);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  };

  const archiveArticle = async () => {
    if (!selectedId || !window.confirm('Makale arşivlensin mi?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/help/articles/${selectedId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Arşivleme başarısız');
      setMessage('Makale arşivlendi');
      resetForm();
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Arşivleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      published: 'bg-green-100 text-green-700',
      draft: 'bg-amber-100 text-amber-700',
      archived: 'bg-slate-100 text-slate-600',
    };
    return colors[status] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="text-orange-500" /> Yardım Makaleleri
          </h1>
          <p className="text-sm text-slate-500 mt-1">Destek merkezi içerik yönetimi</p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-500"
        >
          <Plus className="w-4 h-4" /> Yeni Makale
        </button>
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b font-semibold text-sm">Makaleler ({articles.length})</div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
              {articles.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => selectArticle(article.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                    selectedId === article.id ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                  }`}
                >
                  <p className="font-medium text-sm line-clamp-2">{article.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(article.status)}`}>
                      {article.status}
                    </span>
                    <span className="text-xs text-slate-400">{article.sectionName}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Başlık *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="otomatik"
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Bölüm *</label>
              <select
                value={form.sectionId}
                onChange={(e) => setForm((f) => ({ ...f, sectionId: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-600"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Durum</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-600"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm((f) => ({ ...f, isPinned: e.target.checked }))} />
                Sabitlenmiş
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
                Öne çıkan
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Özet</label>
              <textarea
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-600"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">İçerik (Markdown) *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={12}
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono dark:bg-slate-900 dark:border-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Meta başlık</label>
              <input
                value={form.metaTitle}
                onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Anahtar kelimeler</label>
              <input
                value={form.keywords}
                onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                placeholder="virgülle ayırın"
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-600"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Meta açıklama</label>
              <textarea
                value={form.metaDescription}
                onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-600"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={saveArticle}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-500 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Kaydet
            </button>
            {selectedId && form.status === 'published' && form.slug && (
              <Link
                href={`/destek/${form.slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:underline"
              >
                <ExternalLink className="w-4 h-4" /> Önizle
              </Link>
            )}
            {selectedId && (
              <button
                type="button"
                onClick={archiveArticle}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Arşivle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
