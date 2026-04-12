"use client";

import { useState, useEffect } from "react";
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

interface MenuItem {
  id: string;
  label: string;
  url: string;
  type: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  isHighlighted: boolean;
  highlightColor?: string;
  imageUrl?: string;
  columns?: number;
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
}

export default function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "items">("general");
  const [menuId, setMenuId] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    type: "HEADER",
    location: "header",
    isActive: true,
    isDefault: false,
  });

  useEffect(() => {
    params.then(p => {
      setMenuId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (menuId) {
      fetchMenu();
    }
  }, [menuId]);

  const fetchMenu = async () => {
    try {
      const response = await fetch(`/api/admin/menus/${menuId}`);
      if (response.ok) {
        const data = await response.json();
        setMenu(data);
        setFormData({
          name: data.name,
          type: data.type,
          location: data.location,
          isActive: data.isActive,
          isDefault: data.isDefault,
        });
      } else {
        setError("Menü yüklenirken bir hata oluştu.");
      }
    } catch (err) {
      setError("Menü yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/menus/${menuId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/menus");
      } else {
        const data = await response.json();
        setError(data.error || "Menü güncellenirken bir hata oluştu.");
      }
    } catch (err) {
      setError("Menü güncellenirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || "Menü bulunamadı."}</p>
        <Link href="/admin/menus" className="text-blue-600 hover:underline mt-4 inline-block">
          Geri Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/menus" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Link>
        <h1 className="text-2xl font-bold">Menü Düzenle: {menu.name}</h1>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 font-medium ${
            activeTab === "general"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Genel Ayarlar
        </button>
        <button
          onClick={() => setActiveTab("items")}
          className={`px-4 py-2 font-medium ${
            activeTab === "items"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Menü Öğeleri
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === "general" && (
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Menü Adı</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tip</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Konum</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm">Aktif</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm">Varsayılan</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "items" && (
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Menü Öğeleri</h2>
              <Link
                href={`/admin/menus/${menuId}/items`}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Öğe Yönetimi
              </Link>
            </div>
            <p className="text-slate-500 mb-4">
              Menü öğelerini düzenlemek için &quot;Öğe Yönetimi&quot; butonuna tıklayın.
            </p>
            <div className="space-y-2">
              {menu.items.length === 0 ? (
                <p className="text-center text-slate-400 py-8">Henüz menü öğesi eklenmemiş.</p>
              ) : (
                menu.items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <GripVertical className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{item.label}</span>
                    {item.url && <span className="text-sm text-slate-500 ml-auto">{item.url}</span>}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {item.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Değişiklikleri Kaydet
              </>
            )}
          </button>
          <Link href="/admin/menus" className="px-6 py-3 border border-slate-200 rounded-lg hover:bg-slate-50">
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}
