"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Edit2,
  Save,
  X,
  ExternalLink,
  Type,
  Link as LinkIcon,
  Eye,
  Check,
  AlertCircle,
  LayoutTemplate,
} from "lucide-react";

interface FooterLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  isExternal: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface FooterColumn {
  id: string;
  title: string;
  isActive: boolean;
  sortOrder: number;
  links: FooterLink[];
}

interface Footer {
  id: string;
  name: string;
  location: string;
  bgColor?: string;
  textColor?: string;
  columns: FooterColumn[];
}

export default function FooterColumnsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [footer, setFooter] = useState<Footer | null>(null);
  const [columns, setColumns] = useState<FooterColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedColumns, setExpandedColumns] = useState<string[]>([]);
  const [editingColumn, setEditingColumn] = useState<FooterColumn | null>(null);
  const [editingLink, setEditingLink] = useState<{ columnId: string; link: FooterLink | null } | null>(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [footerId, setFooterId] = useState<string>("");

  useEffect(() => {
    params.then(p => {
      setFooterId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (footerId) {
      fetchFooterAndColumns();
    }
  }, [footerId]);

  const fetchFooterAndColumns = async () => {
    try {
      const response = await fetch(`/api/admin/footers/${footerId}`);
      if (response.ok) {
        const data = await response.json();
        setFooter(data);
        setColumns(data.columns);
      } else {
        setError("Veriler yüklenirken bir hata oluştu.");
      }
    } catch (err) {
      setError("Veriler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorderColumns = async (newOrder: FooterColumn[]) => {
    setColumns(newOrder);
    
    try {
      await fetch(`/api/admin/footers/${footerId}/columns/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columns: newOrder.map((col, index) => ({ id: col.id, sortOrder: index })),
        }),
      });
    } catch (error) {
      console.error("Error reordering columns:", error);
    }
  };

  const handleSaveColumn = async (columnData: Partial<FooterColumn>) => {
    setIsSaving(true);
    try {
      const url = editingColumn
        ? `/api/admin/footers/${footerId}/columns/${editingColumn.id}`
        : `/api/admin/footers/${footerId}/columns`;
      const method = editingColumn ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(columnData),
      });

      if (response.ok) {
        await fetchFooterAndColumns();
        setEditingColumn(null);
        setShowAddColumn(false);
      } else {
        alert("Kolon kaydedilirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error saving column:", error);
      alert("Kolon kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm("Bu kolonu silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/admin/footers/${footerId}/columns/${columnId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setColumns(columns.filter((col) => col.id !== columnId));
      } else {
        alert("Kolon silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting column:", error);
      alert("Kolon silinirken bir hata oluştu.");
    }
  };

  const handleSaveLink = async (columnId: string, linkData: Partial<FooterLink>) => {
    setIsSaving(true);
    try {
      const isEditing = editingLink?.link?.id;
      const url = isEditing
        ? `/api/admin/footers/${footerId}/columns/${columnId}/links/${editingLink?.link?.id}`
        : `/api/admin/footers/${footerId}/columns/${columnId}/links`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkData),
      });

      if (response.ok) {
        await fetchFooterAndColumns();
        setEditingLink(null);
      } else {
        alert("Link kaydedilirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error saving link:", error);
      alert("Link kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLink = async (columnId: string, linkId: string) => {
    if (!confirm("Bu linki silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(
        `/api/admin/footers/${footerId}/columns/${columnId}/links/${linkId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        await fetchFooterAndColumns();
      } else {
        alert("Link silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting link:", error);
      alert("Link silinirken bir hata oluştu.");
    }
  };

  const toggleExpand = (columnId: string) => {
    setExpandedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const renderFooterPreview = () => {
    const bgColor = footer?.bgColor || "bg-slate-900";
    const textColor = footer?.textColor || "text-white";

    return (
      <div className={`${bgColor} ${textColor} p-4 rounded-lg`}>
        <div className={`grid gap-4 ${columns.length === 1 ? "grid-cols-1" : columns.length === 2 ? "grid-cols-2" : columns.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
          {columns.slice(0, 4).map((column) => (
            <div key={column.id}>
              <h4 className="font-semibold mb-2 text-sm">{column.title}</h4>
              <ul className="space-y-1 text-xs opacity-80">
                {column.links.slice(0, 3).map((link) => (
                  <li key={link.id}>{link.label}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/admin/footers`}
                className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{footer?.name} - Kolonlar</h1>
                <p className="text-slate-500 text-sm">{columns.length} kolon</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddColumn(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              Yeni Kolon
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columns List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-100 p-4 rounded-xl">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <GripVertical className="w-4 h-4" />
                Sürükle-Bırak ile Sırala
              </h2>

              {columns.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                  <p className="text-slate-400 mb-2">Henüz kolon yok</p>
                  <button
                    onClick={() => setShowAddColumn(true)}
                    className="text-emerald-600 hover:underline"
                  >
                    İlk kolonu ekle
                  </button>
                </div>
              ) : (
                <Reorder.Group axis="y" values={columns} onReorder={handleReorderColumns} className="space-y-3">
                  {columns.map((column, index) => {
                    const isExpanded = expandedColumns.includes(column.id);
                    const hasLinks = column.links.length > 0;

                    return (
                      <Reorder.Item key={column.id} value={column}>
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                          {/* Column Header */}
                          <div className="flex items-center gap-3 p-4">
                            <GripVertical className="w-5 h-5 text-slate-400 cursor-grab" />
                            <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-sm font-medium text-emerald-600">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <h3 className="font-medium">{column.title}</h3>
                              <p className="text-sm text-slate-400">{column.links.length} link</p>
                            </div>
                            {!column.isActive && (
                              <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full">
                                Pasif
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => hasLinks && toggleExpand(column.id)}
                                className={`p-2 hover:bg-slate-100 rounded-lg ${!hasLinks && "invisible"}`}
                              >
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => setEditingColumn(column)}
                                className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600"
                                title="Düzenle"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteColumn(column.id)}
                                className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                                title="Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Links List */}
                          {isExpanded && hasLinks && (
                            <div className="border-t border-slate-100 p-4 bg-slate-50">
                              <div className="space-y-2">
                                {column.links.map((link, linkIndex) => (
                                  <div
                                    key={link.id}
                                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200"
                                  >
                                    <span className="text-xs text-slate-400 w-4">{linkIndex + 1}</span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{link.label}</span>
                                        {link.isExternal && (
                                          <ExternalLink className="w-3 h-3 text-slate-400" />
                                        )}
                                      </div>
                                      <span className="text-xs text-slate-400">{link.url}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => setEditingLink({ columnId: column.id, link })}
                                        className="p-1.5 hover:bg-emerald-50 rounded text-emerald-600"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteLink(column.id, link.id)}
                                        className="p-1.5 hover:bg-red-50 rounded text-red-600"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => setEditingLink({ columnId: column.id, link: null })}
                                className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                              >
                                + Link Ekle
                              </button>
                            </div>
                          )}

                          {/* Add Link Button (when collapsed) */}
                          {!isExpanded && (
                            <div className="px-4 pb-4">
                              <button
                                onClick={() => setEditingLink({ columnId: column.id, link: null })}
                                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                              >
                                + Link Ekle
                              </button>
                            </div>
                          )}
                        </div>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-xl border border-slate-200 sticky top-24">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Canlı Önizleme
              </h2>
              {columns.length > 0 ? (
                renderFooterPreview()
              ) : (
                <p className="text-slate-400 text-sm">Kolon ekledikçe önizleme görünecek</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Column Modal */}
      <AnimatePresence>
        {(showAddColumn || editingColumn) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl w-full max-w-md"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingColumn ? "Kolon Düzenle" : "Yeni Kolon"}
                </h2>
                <ColumnForm
                  column={editingColumn}
                  onSave={handleSaveColumn}
                  onCancel={() => {
                    setEditingColumn(null);
                    setShowAddColumn(false);
                  }}
                  isSaving={isSaving}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link Modal */}
      <AnimatePresence>
        {editingLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl w-full max-w-md"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingLink.link ? "Link Düzenle" : "Yeni Link"}
                </h2>
                <LinkForm
                  link={editingLink.link}
                  onSave={(data) => handleSaveLink(editingLink.columnId, data)}
                  onCancel={() => setEditingLink(null)}
                  isSaving={isSaving}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ColumnForm({
  column,
  onSave,
  onCancel,
  isSaving,
}: {
  column: FooterColumn | null;
  onSave: (data: Partial<FooterColumn>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    title: column?.title || "",
    isActive: column?.isActive ?? true,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Kolon Başlığı *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          required
          placeholder="Hakkımızda, Ürünler, İletişim..."
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded border-slate-300"
        />
        <span className="text-sm">Aktif</span>
      </label>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Kaydet
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          İptal
        </button>
      </div>
    </form>
  );
}

function LinkForm({
  link,
  onSave,
  onCancel,
  isSaving,
}: {
  link: FooterLink | null;
  onSave: (data: Partial<FooterLink>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    label: link?.label || "",
    url: link?.url || "",
    icon: link?.icon || "",
    isExternal: link?.isExternal || false,
    isActive: link?.isActive ?? true,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Link Metni *
        </label>
        <input
          type="text"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          required
          placeholder="Ana Sayfa, Hakkımızda, İletişim..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          URL *
        </label>
        <input
          type="text"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          required
          placeholder="/sayfa-url veya https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          İkon (Lucide)
        </label>
        <input
          type="text"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          placeholder="home, mail, phone..."
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isExternal}
            onChange={(e) => setFormData({ ...formData, isExternal: e.target.checked })}
            className="rounded border-slate-300"
          />
          <span className="text-sm">Dış Link</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-slate-300"
          />
          <span className="text-sm">Aktif</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Kaydet
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
