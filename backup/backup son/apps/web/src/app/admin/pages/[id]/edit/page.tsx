"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Globe,
  Layout,
  Settings,
  Layers,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  GripVertical,
  Edit,
} from "lucide-react";

interface PageSection {
  id: string;
  name: string;
  title: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: {
    blocks: number;
  };
}

interface Page {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  isHomePage: boolean;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  layout: string;
  theme: string | null;
  customCss: string | null;
  sections: PageSection[];
}

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "seo" | "sections" | "settings">(
    "general"
  );
  const [pageId, setPageId] = useState<string>("");
  const [formData, setFormData] = useState<Partial<Page>>({});

  useEffect(() => {
    params.then(p => {
      setPageId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (pageId) {
      fetchPage();
    }
  }, [pageId]);

  const fetchPage = async () => {
    try {
      const response = await fetch(`/api/admin/pages/${pageId}`);
      if (response.ok) {
        const data = await response.json();
        setPage(data);
        setFormData(data);
      } else {
        setError("Sayfa yüklenirken bir hata oluştu.");
      }
    } catch (err) {
      setError("Sayfa yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updated = await response.json();
        setPage((prev) => (prev ? { ...prev, ...updated } : null));
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Sayfa güncellenirken bir hata oluştu.");
      }
    } catch (err) {
      setError("Sayfa güncellenirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSection = async () => {
    const name = prompt("Bölüm adı:");
    if (!name) return;

    try {
      const response = await fetch(`/api/admin/pages/${pageId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        fetchPage();
      }
    } catch (err) {
      console.error("Error adding section:", err);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Bu bölümü silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(
        `/api/admin/pages/${pageId}/sections/${sectionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchPage();
      }
    } catch (err) {
      console.error("Error deleting section:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">Sayfa bulunamadı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pages"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{page.title}</h1>
            <p className="text-slate-500 flex items-center gap-2">
              <Globe size={14} />
              /{page.slug}
              {page.isHomePage && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Ana Sayfa
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${page.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
          >
            <Eye size={18} />
            Görüntüle
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save size={18} />
                Kaydet
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
        >
          <AlertCircle size={20} className="text-red-500" />
          <span className="text-red-700">{error}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {[
          { id: "general", label: "Genel", icon: Layout },
          { id: "sections", label: "Bölümler", icon: Layers },
          { id: "seo", label: "SEO", icon: Globe },
          { id: "settings", label: "Ayarlar", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* General Tab */}
        {activeTab === "general" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg border border-slate-200 p-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sayfa Başlığı
                </label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">/</span>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tip
                  </label>
                  <select
                    value={formData.type || "CONTENT"}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CONTENT">İçerik</option>
                    <option value="LANDING">Landing</option>
                    <option value="BLOG">Blog</option>
                    <option value="PRICING">Fiyatlandırma</option>
                    <option value="CONTACT">İletişim</option>
                    <option value="CUSTOM">Özel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Durum
                  </label>
                  <select
                    value={formData.status || "DRAFT"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DRAFT">Taslak</option>
                    <option value="PUBLISHED">Yayında</option>
                    <option value="ARCHIVED">Arşiv</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sections Tab */}
        {activeTab === "sections" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Sayfa Bölümleri
              </h3>
              <button
                type="button"
                onClick={handleAddSection}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={18} />
                Bölüm Ekle
              </button>
            </div>

            {page.sections.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <Layers size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 mb-4">Henüz bölüm eklenmemiş.</p>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus size={18} />
                  İlk Bölümü Ekle
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {page.sections.map((section) => (
                  <div
                    key={section.id}
                    className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical
                        size={20}
                        className="text-slate-400 cursor-move"
                      />
                      <div>
                        <h4 className="font-medium text-slate-900">
                          {section.name}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {section._count?.blocks || 0} blok
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/pages/${pageId}/sections/${section.id}`}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg border border-slate-200 p-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Meta Başlık
                </label>
                <input
                  type="text"
                  value={formData.metaTitle || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metaTitle: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO başlığı..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Meta Açıklama
                </label>
                <textarea
                  value={formData.metaDescription || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metaDescription: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO açıklaması..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Anahtar Kelimeler
                </label>
                <input
                  type="text"
                  value={formData.metaKeywords || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      metaKeywords: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e-ticaret, yazılım, otomasyon"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg border border-slate-200 p-6"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Layout
                  </label>
                  <select
                    value={formData.layout || "default"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        layout: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="default">Varsayılan</option>
                    <option value="full-width">Tam Genişlik</option>
                    <option value="sidebar">Kenar Çubuğu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tema
                  </label>
                  <select
                    value={formData.theme || "light"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        theme: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Açık</option>
                    <option value="dark">Koyu</option>
                    <option value="brand">Marka</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Özel CSS
                </label>
                <textarea
                  value={formData.customCss || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customCss: e.target.value,
                    }))
                  }
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="/* Özel CSS kodu */"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isHomePage || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isHomePage: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">Ana Sayfa</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">Aktif</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}
