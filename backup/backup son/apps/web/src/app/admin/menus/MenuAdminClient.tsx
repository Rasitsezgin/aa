"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Menu as MenuIcon,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  ArrowLeft,
  Layers,
  LayoutGrid,
  GripVertical,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  url?: string;
  type: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  children?: MenuItem[];
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
}

export default function MenuAdminClient({ menus }: { menus: Menu[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredMenus = menus.filter((menu) => {
    const matchesSearch =
      menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || menu.type.toLowerCase() === selectedType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (menuId: string) => {
    if (!confirm("Bu menüyü silmek istediğinizden emin misiniz?")) return;

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

  const renderMenuItems = (items: MenuItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} className={`${level > 0 ? "ml-6 border-l-2 border-slate-200 pl-4" : ""}`}>
        <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-lg mb-1">
          <GripVertical className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium">{item.label}</span>
          {item.icon && <span className="text-xs text-slate-500">({item.icon})</span>}
          {item.url && (
            <span className="text-xs text-slate-400 ml-auto">{item.url}</span>
          )}
          <span
            className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              item.isActive
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {item.isActive ? "Aktif" : "Pasif"}
          </span>
        </div>
        {item.children && item.children.length > 0 && (
          <div className="mt-1">{renderMenuItems(item.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MenuIcon className="w-6 h-6" />
            Menü Yönetimi
          </h1>
          <p className="text-slate-500 mt-1">
            Mega menü ve navigasyon menülerini yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Link>
          <Link
            href="/admin/menus/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni Menü
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
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
          className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{menu.name}</h3>
                    {menu.isDefault && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                        Varsayılan
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {menu.type} • {menu.location} • {menu.items.length} öğe
                  </p>
                </div>
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
                  <button
                    onClick={() =>
                      setExpandedMenu(expandedMenu === menu.id ? null : menu.id)
                    }
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {expandedMenu === menu.id ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  <Link
                    href={`/admin/menus/${menu.id}/edit`}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-blue-600"
                  >
                    <Edit2 className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleSetDefault(menu.id)}
                    disabled={menu.isDefault}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Varsayılan yap"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(menu.id)}
                    disabled={isDeleting === menu.id}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-red-600"
                  >
                    {isDeleting === menu.id ? (
                      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Menu Items */}
              <AnimatePresence>
                {expandedMenu === menu.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-200 bg-slate-50 p-4"
                  >
                    <h4 className="text-sm font-semibold text-slate-500 mb-3">
                      Menü Öğeleri
                    </h4>
                    {menu.items.length === 0 ? (
                      <p className="text-sm text-slate-400">
                        Henüz menü öğesi eklenmemiş.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {renderMenuItems(menu.items)}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
