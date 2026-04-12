"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  LayoutTemplate,
  Edit2,
  Trash2,
  Eye,
  ArrowLeft,
  CheckCircle,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Copy,
  Save,
  X,
  Palette,
  Type,
  Link as LinkIcon,
  ExternalLink,
  AlertCircle,
  Image,
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

interface FooterBottomBar {
  id: string;
  copyright?: string;
  showCopyright: boolean;
  showSocial: boolean;
  socialLinks: any[];
  showPaymentIcons: boolean;
  paymentIcons: any[];
}

interface Footer {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  isDefault: boolean;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  logoUrl?: string;
  logoText?: string;
  tagline?: string;
  columns: FooterColumn[];
  bottomBar?: FooterBottomBar;
  createdAt: string;
  updatedAt: string;
}

export default function EnhancedFooterAdminClient({ footers }: { footers: Footer[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFooter, setExpandedFooter] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const filteredFooters = footers.filter(
    (footer) =>
      footer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      footer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (footerId: string) => {
    if (!confirm("Bu footer'ı silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!")) return;

    setIsDeleting(footerId);
    try {
      const response = await fetch(`/api/admin/footers/${footerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Footer silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting footer:", error);
      alert("Footer silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetDefault = async (footerId: string) => {
    try {
      const response = await fetch(`/api/admin/footers/${footerId}/set-default`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Varsayılan footer ayarlanırken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error setting default footer:", error);
      alert("Varsayılan footer ayarlanırken bir hata oluştu.");
    }
  };

  const handleDuplicate = async (footer: Footer) => {
    try {
      const response = await fetch("/api/admin/footers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${footer.name} (Kopya)`,
          location: footer.location,
          isActive: false,
          isDefault: false,
          bgColor: footer.bgColor,
          textColor: footer.textColor,
          tagline: footer.tagline,
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Footer kopyalanırken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error duplicating footer:", error);
      alert("Footer kopyalanırken bir hata oluştu.");
    }
  };

  const renderFooterPreview = (footer: Footer) => {
    const bgColor = footer.bgColor || "bg-slate-900";
    const textColor = footer.textColor || "text-white";

    return (
      <div className={`${bgColor} ${textColor} p-6 rounded-lg`}>
        <div className="grid grid-cols-4 gap-4">
          {footer.columns.slice(0, 4).map((column) => (
            <div key={column.id}>
              <h4 className="font-semibold mb-2">{column.title}</h4>
              <ul className="space-y-1 text-sm opacity-80">
                {column.links.slice(0, 3).map((link) => (
                  <li key={link.id}>{link.label}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {footer.bottomBar && (
          <div className="mt-4 pt-4 border-t border-white/20 text-sm opacity-60 text-center">
            {footer.bottomBar.copyright}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <LayoutTemplate className="w-6 h-6 text-emerald-600" />
                  Footer Yönetimi
                </h1>
                <p className="text-slate-500 text-sm">
                  {footers.length} footer, {footers.reduce((acc, f) => acc + f.columns.length, 0)} kolon
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showPreview ? "bg-emerald-100 text-emerald-700" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <Eye className="w-4 h-4" />
                Önizleme
              </button>
              <Link
                href="/admin/footers/new"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yeni Footer
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <LayoutTemplate className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{footers.length}</p>
                <p className="text-sm text-slate-500">Toplam Footer</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{footers.filter((f) => f.isActive).length}</p>
                <p className="text-sm text-slate-500">Aktif Footer</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{footers.filter((f) => f.isDefault).length}</p>
                <p className="text-sm text-slate-500">Varsayılan</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Type className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {footers.reduce((acc, f) => acc + f.columns.reduce((acc2, c) => acc2 + c.links.length, 0), 0)}
                </p>
                <p className="text-sm text-slate-500">Toplam Link</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Footer ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Footer List */}
        <div className="space-y-4">
          {filteredFooters.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <LayoutTemplate className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Henüz footer bulunmuyor.</p>
              <Link
                href="/admin/footers/new"
                className="text-emerald-600 hover:underline mt-2 inline-block"
              >
                Yeni footer oluştur
              </Link>
            </div>
          ) : (
            filteredFooters.map((footer) => (
              <motion.div
                key={footer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <LayoutTemplate className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold">{footer.name}</h3>
                        {footer.isDefault && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                            Varsayılan
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                          {footer.location}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">
                        {footer.columns.length} kolon • {footer.columns.reduce((acc, c) => acc + c.links.length, 0)} link • Son güncelleme: {new Date(footer.updatedAt).toLocaleDateString("tr-TR")}
                      </p>

                      {showPreview && footer.columns.length > 0 && (
                        <div className="mb-4">{renderFooterPreview(footer)}</div>
                      )}

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${
                            footer.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {footer.isActive ? "Aktif" : "Pasif"}
                        </span>
                        {footer.bgColor && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Palette className="w-3 h-3" />
                            {footer.bgColor}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpandedFooter(expandedFooter === footer.id ? null : footer.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Detayları göster"
                      >
                        {expandedFooter === footer.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                      <Link
                        href={`/admin/footers/${footer.id}/edit`}
                        className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600"
                        title="Düzenle"
                      >
                        <Edit2 className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(footer)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                        title="Kopyala"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleSetDefault(footer.id)}
                        disabled={footer.isDefault}
                        className="p-2 hover:bg-yellow-50 rounded-lg transition-colors text-yellow-600 disabled:opacity-50"
                        title="Varsayılan yap"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(footer.id)}
                        disabled={isDeleting === footer.id}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        title="Sil"
                      >
                        {isDeleting === footer.id ? (
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Columns */}
                <AnimatePresence>
                  {expandedFooter === footer.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-200 bg-slate-50"
                    >
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-700">Kolonlar ve Linkler</h4>
                          <Link
                            href={`/admin/footers/${footer.id}/columns`}
                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            Kolonları Yönet →
                          </Link>
                        </div>
                        {footer.columns.length === 0 ? (
                          <div className="text-center py-8 bg-white rounded-lg border border-dashed border-slate-300">
                            <p className="text-slate-400 mb-2">Henüz kolon eklenmemiş</p>
                            <Link
                              href={`/admin/footers/${footer.id}/columns`}
                              className="text-sm text-emerald-600 hover:underline"
                            >
                              İlk kolonu ekle
                            </Link>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {footer.columns.map((column, index) => (
                              <div key={column.id} className="bg-white p-4 rounded-lg border border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs font-medium">
                                    {index + 1}
                                  </span>
                                  <h5 className="font-medium">{column.title}</h5>
                                  {!column.isActive && (
                                    <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full">
                                      Pasif
                                    </span>
                                  )}
                                </div>
                                <ul className="space-y-1">
                                  {column.links.slice(0, 5).map((link) => (
                                    <li key={link.id} className="text-sm text-slate-500 flex items-center gap-1">
                                      {link.isExternal && <ExternalLink className="w-3 h-3" />}
                                      {link.label}
                                    </li>
                                  ))}
                                  {column.links.length > 5 && (
                                    <li className="text-xs text-slate-400">+{column.links.length - 5} daha</li>
                                  )}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}

                        {footer.bottomBar && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span>Alt Bar:</span>
                              {footer.bottomBar.showCopyright && <span>✓ Copyright</span>}
                              {footer.bottomBar.showSocial && <span>✓ Sosyal Medya</span>}
                              {footer.bottomBar.showPaymentIcons && <span>✓ Ödeme İkonları</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
