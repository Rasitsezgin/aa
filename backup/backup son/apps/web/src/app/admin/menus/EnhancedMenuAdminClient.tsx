"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus,
  Search,
  Menu as MenuIcon,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  ArrowLeft,
  LayoutGrid,
  GripVertical,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  X,
  ExternalLink,
  Image,
  Type,
  Columns,
  Move,
  Copy,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  url?: string;
  type: "LINK" | "DROPDOWN" | "MEGA_MENU" | "DIVIDER" | "LABEL";
  icon?: string;
  description?: string;
  isActive: boolean;
  isHighlighted: boolean;
  highlightColor?: string;
  imageUrl?: string;
  columns?: number;
  sortOrder: number;
  children?: MenuItem[];
  _count?: { children: number };
}

interface Menu {
  id: string;
  name: string;
  type: string;
  location: string;
  isActive: boolean;
  isDefault: boolean;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export default function EnhancedMenuAdminClient({ menus }: { menus: Menu[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const filteredMenus = menus.filter((menu) => {
    const matchesSearch =
      menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || menu.type.toLowerCase() === selectedType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (menuId: string) => {
    if (!confirm("Bu menüyü silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!")) return;

    setIsDeleting(menuId);
    try {
      const response = await fetch(`/api/admin/menus/${menuId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Menü silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      alert("Menü silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetDefault = async (menuId: string) => {
    try {
      const response = await fetch(`/api/admin/menus/${menuId}/set-default`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Varsayılan menü ayarlanırken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error setting default menu:", error);
      alert("Varsayılan menü ayarlanırken bir hata oluştu.");
    }
  };

  const handleDuplicate = async (menu: Menu) => {
    try {
      const response = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${menu.name} (Kopya)`,
          type: menu.type,
          location: menu.location,
          isActive: false,
          isDefault: false,
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Menü kopyalanırken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error duplicating menu:", error);
      alert("Menü kopyalanırken bir hata oluştu.");
    }
  };

  const getMenuTypeColor = (type: string) => {
    switch (type) {
      case "HEADER": return "bg-blue-100 text-blue-700";
      case "FOOTER": return "bg-green-100 text-green-700";
      case "SIDEBAR": return "bg-purple-100 text-purple-700";
      case "MOBILE": return "bg-orange-100 text-orange-700";
      case "MEGA": return "bg-pink-100 text-pink-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getMenuTypeLabel = (type: string) => {
    switch (type) {
      case "HEADER": return "Header";
      case "FOOTER": return "Footer";
      case "SIDEBAR": return "Sidebar";
      case "MOBILE": return "Mobil";
      case "MEGA": return "Mega Menü";
      default: return type;
    }
  };

  const countTotalItems = (items: MenuItem[]): number => {
    let count = items.length;
    items.forEach((item) => {
      if (item.children) {
        count += countTotalItems(item.children);
      }
    });
    return count;
  };

  const renderMenuPreview = (menu: Menu) => {
    return (
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className={`px-4 py-3 ${menu.type === "HEADER" ? "bg-slate-900 text-white" : "bg-slate-100"}`}>
          <div className="flex items-center gap-4">
            {menu.items.slice(0, 4).map((item) => (
              <span key={item.id} className="text-sm font-medium">
                {item.label}
              </span>
            ))}
            {menu.items.length > 4 && (
              <span className="text-sm text-slate-400">+{menu.items.length - 4} daha</span>
            )}
          </div>
        </div>
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
                  <MenuIcon className="w-6 h-6 text-blue-600" />
                  Menü Yönetimi
                </h1>
                <p className="text-slate-500 text-sm">
                  {menus.length} menü, {menus.reduce((acc, m) => acc + countTotalItems(m.items), 0)} toplam öğe
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showPreview ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <Eye className="w-4 h-4" />
                Önizleme
              </button>
              <Link
                href="/admin/menus/new"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yeni Menü
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
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MenuIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{menus.length}</p>
                <p className="text-sm text-slate-500">Toplam Menü</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{menus.filter((m) => m.isActive).length}</p>
                <p className="text-sm text-slate-500">Aktif Menü</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{menus.filter((m) => m.isDefault).length}</p>
                <p className="text-sm text-slate-500">Varsayılan</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Move className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {menus.reduce((acc, m) => acc + countTotalItems(m.items), 0)}
                </p>
                <p className="text-sm text-slate-500">Toplam Öğe</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Menü ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">Tüm Tipler</option>
            <option value="header">Header Menü</option>
            <option value="footer">Footer Menü</option>
            <option value="sidebar">Sidebar Menü</option>
            <option value="mobile">Mobil Menü</option>
            <option value="mega">Mega Menü</option>
          </select>
        </div>

        {/* Menu List */}
        <div className="space-y-4">
          {filteredMenus.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <MenuIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Henüz menü bulunmuyor.</p>
              <Link
                href="/admin/menus/new"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Yeni menü oluştur
              </Link>
            </div>
          ) : (
            filteredMenus.map((menu) => (
              <motion.div
                key={menu.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getMenuTypeColor(menu.type)}`}>
                      <LayoutGrid className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold">{menu.name}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getMenuTypeColor(menu.type)}`}>
                          {getMenuTypeLabel(menu.type)}
                        </span>
                        {menu.isDefault && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                            Varsayılan
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-3">
                        {menu.location} • {countTotalItems(menu.items)} öğe • Son güncelleme: {new Date(menu.updatedAt).toLocaleDateString("tr-TR")}
                      </p>

                      {showPreview && menu.items.length > 0 && (
                        <div className="mb-4">{renderMenuPreview(menu)}</div>
                      )}

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${
                            menu.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {menu.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setExpandedMenu(expandedMenu === menu.id ? null : menu.id)
                        }
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Detayları göster"
                      >
                        {expandedMenu === menu.id ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                      <Link
                        href={`/admin/menus/${menu.id}/edit`}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                        title="Düzenle"
                      >
                        <Edit2 className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(menu)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                        title="Kopyala"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleSetDefault(menu.id)}
                        disabled={menu.isDefault}
                        className="p-2 hover:bg-yellow-50 rounded-lg transition-colors text-yellow-600 disabled:opacity-50"
                        title="Varsayılan yap"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(menu.id)}
                        disabled={isDeleting === menu.id}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        title="Sil"
                      >
                        {isDeleting === menu.id ? (
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Menu Items */}
                <AnimatePresence>
                  {expandedMenu === menu.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-200 bg-slate-50"
                    >
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-700">Menü Öğeleri</h4>
                          <Link
                            href={`/admin/menus/${menu.id}/items`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Öğeleri Yönet →
                          </Link>
                        </div>
                        {menu.items.length === 0 ? (
                          <div className="text-center py-8 bg-white rounded-lg border border-dashed border-slate-300">
                            <p className="text-slate-400 mb-2">Henüz menü öğesi eklenmemiş</p>
                            <Link
                              href={`/admin/menus/${menu.id}/items`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              İlk öğeyi ekle
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {menu.items.map((item, index) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200"
                              >
                                <GripVertical className="w-4 h-4 text-slate-400" />
                                <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs font-medium text-slate-600">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <span className="font-medium">{item.label}</span>
                                  {item.url && (
                                    <span className="text-sm text-slate-400 ml-2">{item.url}</span>
                                  )}
                                </div>
                                {item.icon && (
                                  <span className="text-xs text-slate-400">🔹 {item.icon}</span>
                                )}
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full ${
                                    item.isActive
                                      ? "bg-green-100 text-green-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {item.isActive ? "Aktif" : "Pasif"}
                                </span>
                                {item.children && item.children.length > 0 && (
                                  <span className="text-xs text-slate-400">
                                    {item.children.length} alt öğe
                                  </span>
                                )}
                              </div>
                            ))}
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
