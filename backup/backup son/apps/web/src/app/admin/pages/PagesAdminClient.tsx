"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  FileText,
  Edit2,
  Trash2,
  Eye,
  Home,
  Layout,
  CheckCircle,
  XCircle,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Globe,
  Settings,
  Layers,
  Grid3X3,
} from "lucide-react";
import Link from "next/link";

interface Page {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  isHomePage: boolean;
  isActive: boolean;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  sections: {
    id: string;
    name: string;
    isActive: boolean;
  }[];
}

interface PagesAdminClientProps {
  pages: Page[];
}

export default function PagesAdminClient({ pages }: PagesAdminClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || page.type.toLowerCase() === selectedType;
    const matchesStatus =
      selectedStatus === "all" || page.status.toLowerCase() === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = async (pageId: string) => {
    if (!confirm("Bu sayfayı silmek istediğinizden emin misiniz?")) return;

    setIsDeleting(pageId);
    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Sayfa silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting page:", error);
      alert("Sayfa silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(null);
      setShowDropdown(null);
    }
  };

  const handleSetHomePage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/admin/pages/${pageId}/set-home`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Ana sayfa ayarlanırken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error setting home page:", error);
      alert("Ana sayfa ayarlanırken bir hata oluştu.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} />
            Yayında
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Edit2 size={12} />
            Taslak
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle size={12} />
            Arşiv
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "LANDING":
        return <Home size={16} className="text-blue-500" />;
      case "CONTENT":
        return <FileText size={16} className="text-green-500" />;
      case "BLOG":
        return <Layout size={16} className="text-purple-500" />;
      case "PRICING":
        return <Grid3X3 size={16} className="text-orange-500" />;
      default:
        return <Layers size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sayfa Yönetimi</h1>
          <p className="text-slate-500 mt-1">
            CMS sayfalarını oluşturun, düzenleyin ve yönetin
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Yeni Sayfa
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Sayfa ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tüm Tipler</option>
          <option value="landing">Ana Sayfa</option>
          <option value="content">İçerik</option>
          <option value="blog">Blog</option>
          <option value="pricing">Fiyatlandırma</option>
          <option value="product">Ürün</option>
          <option value="contact">İletişim</option>
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="published">Yayında</option>
          <option value="draft">Taslak</option>
          <option value="archived">Arşiv</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{pages.length}</div>
          <div className="text-sm text-slate-500">Toplam Sayfa</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-green-600">
            {pages.filter((p) => p.status === "PUBLISHED").length}
          </div>
          <div className="text-sm text-slate-500">Yayında</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-yellow-600">
            {pages.filter((p) => p.status === "DRAFT").length}
          </div>
          <div className="text-sm text-slate-500">Taslak</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-blue-600">
            {pages.reduce((acc, p) => acc + p.sections.length, 0)}
          </div>
          <div className="text-sm text-slate-500">Toplam Bölüm</div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Sayfa
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Bölümler
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Son Güncelleme
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPages.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <Layers size={48} className="mx-auto mb-4 text-slate-300" />
                    <p>Sayfa bulunamadı.</p>
                    <Link
                      href="/admin/pages/new"
                      className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                    >
                      Yeni sayfa oluştur
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr
                    key={page.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {page.isHomePage && (
                          <Home size={16} className="text-blue-500" />
                        )}
                        <div>
                          <div className="font-medium text-slate-900">
                            {page.title}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-1">
                            <Globe size={12} />
                            /{page.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(page.type)}
                        <span className="text-sm text-slate-600 capitalize">
                          {page.type.toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(page.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Layers size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {page.sections.length} bölüm
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(page.updatedAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setShowDropdown(
                              showDropdown === page.id ? null : page.id
                            )
                          }
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={20} className="text-slate-600" />
                        </button>

                        <AnimatePresence>
                          {showDropdown === page.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
                            >
                              <Link
                                href={`/${page.slug}`}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Eye size={16} />
                                Görüntüle
                              </Link>
                              <Link
                                href={`/admin/pages/${page.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Edit2 size={16} />
                                Düzenle
                              </Link>
                              <Link
                                href={`/admin/pages/${page.id}/sections`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Layout size={16} />
                                Bölümleri Yönet
                              </Link>
                              <hr className="my-1" />
                              {!page.isHomePage && (
                                <button
                                  onClick={() => handleSetHomePage(page.id)}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"
                                >
                                  <Home size={16} />
                                  Ana Sayfa Yap
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(page.id)}
                                disabled={isDeleting === page.id}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                              >
                                <Trash2 size={16} />
                                {isDeleting === page.id
                                  ? "Siliniyor..."
                                  : "Sil"}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
