"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface MenuItemForm {
  id?: string;
  label: string;
  url: string;
  type: string;
  icon: string;
  description: string;
  isActive: boolean;
  isHighlighted: boolean;
  highlightColor: string;
  imageUrl: string;
  columns: number;
  children: MenuItemForm[];
}

export default function NewMenuPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "HEADER",
    location: "header",
    isActive: true,
    isDefault: false,
  });

  const [menuItems, setMenuItems] = useState<MenuItemForm[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: menuItems,
        }),
      });

      if (response.ok) {
        router.push("/admin/menus");
      } else {
        const data = await response.json();
        setError(data.error || "Menü oluşturulurken bir hata oluştu.");
      }
    } catch (err) {
      setError("Menü oluşturulurken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const addMenuItem = (parentIndex?: number) => {
    const newItem: MenuItemForm = {
      label: "Yeni Öğe",
      url: "",
      type: "LINK",
      icon: "",
      description: "",
      isActive: true,
      isHighlighted: false,
      highlightColor: "",
      imageUrl: "",
      columns: 1,
      children: [],
    };

    if (parentIndex !== undefined) {
      const newItems = [...menuItems];
      newItems[parentIndex].children.push(newItem);
      setMenuItems(newItems);
    } else {
      setMenuItems([...menuItems, newItem]);
    }
  };

  const updateMenuItem = (index: number, field: string, value: any) => {
    const newItems = [...menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setMenuItems(newItems);
  };

  const removeMenuItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const toggleExpand = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(String(index))
        ? prev.filter((i) => i !== String(index))
        : [...prev, String(index)]
    );
  };

  const renderMenuItemForm = (item: MenuItemForm, index: number, level = 0) => (
    <div
      key={index}
      className={`border border-slate-200 rounded-lg overflow-hidden ${
        level > 0 ? "ml-6" : ""
      }`}
    >
      <div className="flex items-center gap-2 p-3 bg-slate-50">
        <GripVertical className="w-4 h-4 text-slate-400" />
        <button
          type="button"
          onClick={() => toggleExpand(index)}
          className="p-1 hover:bg-slate-200 rounded"
        >
          {expandedItems.includes(String(index)) ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <input
          type="text"
          value={item.label}
          onChange={(e) => updateMenuItem(index, "label", e.target.value)}
          className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded"
          placeholder="Etiket"
        />
        <button
          type="button"
          onClick={() => removeMenuItem(index)}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {expandedItems.includes(String(index)) && (
        <div className="p-3 space-y-3 bg-white">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Tip</label>
              <select
                value={item.type}
                onChange={(e) => updateMenuItem(index, "type", e.target.value)}
                className="w-full px-2 py-1 text-sm border border-slate-200 rounded"
              >
                <option value="LINK">Link</option>
                <option value="DROPDOWN">Dropdown</option>
                <option value="MEGA_MENU">Mega Menü</option>
                <option value="DIVIDER">Ayraç</option>
                <option value="LABEL">Etiket</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">URL</label>
              <input
                type="text"
                value={item.url}
                onChange={(e) => updateMenuItem(index, "url", e.target.value)}
                className="w-full px-2 py-1 text-sm border border-slate-200 rounded"
                placeholder="/sayfa-url"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">İkon</label>
              <input
                type="text"
                value={item.icon}
                onChange={(e) => updateMenuItem(index, "icon", e.target.value)}
                className="w-full px-2 py-1 text-sm border border-slate-200 rounded"
                placeholder="Lucide ikon adı"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Açıklama
              </label>
              <input
                type="text"
                value={item.description}
                onChange={(e) =>
                  updateMenuItem(index, "description", e.target.value)
                }
                className="w-full px-2 py-1 text-sm border border-slate-200 rounded"
                placeholder="Mega menü için açıklama"
              />
            </div>
          </div>

          {item.type === "MEGA_MENU" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Görsel URL
                </label>
                <input
                  type="text"
                  value={item.imageUrl}
                  onChange={(e) =>
                    updateMenuItem(index, "imageUrl", e.target.value)
                  }
                  className="w-full px-2 py-1 text-sm border border-slate-200 rounded"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Kolon Sayısı
                </label>
                <input
                  type="number"
                  value={item.columns}
                  onChange={(e) =>
                    updateMenuItem(index, "columns", parseInt(e.target.value))
                  }
                  className="w-full px-2 py-1 text-sm border border-slate-200 rounded"
                  min={1}
                  max={4}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.isActive}
                onChange={(e) =>
                  updateMenuItem(index, "isActive", e.target.checked)
                }
                className="rounded border-slate-300"
              />
              Aktif
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.isHighlighted}
                onChange={(e) =>
                  updateMenuItem(index, "isHighlighted", e.target.checked)
                }
                className="rounded border-slate-300"
              />
              Öne Çıkan
            </label>
          </div>

          {item.isHighlighted && (
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Vurgu Rengi
              </label>
              <input
                type="text"
                value={item.highlightColor}
                onChange={(e) =>
                  updateMenuItem(index, "highlightColor", e.target.value)
                }
                className="w-full px-2 py-1 text-sm border border-slate-200 rounded"
                placeholder="#FF0000 veya red-500"
              />
            </div>
          )}

          {/* Alt öğeler */}
          {item.children && item.children.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-500">Alt Öğeler</p>
              {item.children.map((child, childIndex) =>
                renderMenuItemForm(child, childIndex, level + 1)
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => addMenuItem(index)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-3 h-3" />
            Alt Öğe Ekle
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/menus"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Link>
        <h1 className="text-2xl font-bold">Yeni Menü Oluştur</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Genel Ayarlar</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Menü Adı
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Ana Menü"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tip
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="HEADER">Header Menü</option>
                <option value="FOOTER">Footer Menü</option>
                <option value="SIDEBAR">Sidebar Menü</option>
                <option value="MOBILE">Mobil Menü</option>
                <option value="MEGA">Mega Menü</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Konum
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="header"
              />
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-slate-300"
                />
                <span className="text-sm">Aktif</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="rounded border-slate-300"
                />
                <span className="text-sm">Varsayılan</span>
              </label>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Menü Öğeleri</h2>
            <button
              type="button"
              onClick={() => addMenuItem()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Öğe Ekle
            </button>
          </div>

          <div className="space-y-3">
            {menuItems.length === 0 ? (
              <p className="text-center text-slate-400 py-8">
                Henüz menü öğesi eklenmemiş. "Öğe Ekle" butonunu kullanın.
              </p>
            ) : (
              menuItems.map((item, index) => renderMenuItemForm(item, index))
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Menüyü Kaydet
              </>
            )}
          </button>
          <Link
            href="/admin/menus"
            className="px-6 py-3 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}
