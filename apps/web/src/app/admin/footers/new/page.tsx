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
} from "lucide-react";

interface FooterColumnForm {
  title: string;
  isActive: boolean;
  links: {
    label: string;
    url: string;
    icon: string;
    isExternal: boolean;
    isActive: boolean;
  }[];
}

export default function NewFooterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "main",
    isActive: true,
    isDefault: false,
    bgColor: "",
    textColor: "",
    borderColor: "",
    logoUrl: "",
    logoText: "",
    tagline: "",
  });

  const [columns, setColumns] = useState<FooterColumnForm[]>([]);
  const [bottomBar, setBottomBar] = useState({
    copyright: "© 2025 Tüm hakları saklıdır.",
    showCopyright: true,
    showSocial: true,
    socialLinks: [{ platform: "", url: "", icon: "" }],
    showPaymentIcons: true,
    paymentIcons: [{ name: "", url: "" }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/footers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          columns,
          bottomBar,
        }),
      });

      if (response.ok) {
        router.push("/admin/footers");
      } else {
        const data = await response.json();
        setError(data.error || "Footer oluşturulurken bir hata oluştu.");
      }
    } catch (err) {
      setError("Footer oluşturulurken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const addColumn = () => {
    setColumns([
      ...columns,
      {
        title: "Yeni Kolon",
        isActive: true,
        links: [],
      },
    ]);
  };

  const updateColumn = (index: number, field: string, value: any) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const addLink = (columnIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].links.push({
      label: "Yeni Link",
      url: "",
      icon: "",
      isExternal: false,
      isActive: true,
    });
    setColumns(newColumns);
  };

  const updateLink = (columnIndex: number, linkIndex: number, field: string, value: any) => {
    const newColumns = [...columns];
    newColumns[columnIndex].links[linkIndex] = {
      ...newColumns[columnIndex].links[linkIndex],
      [field]: value,
    };
    setColumns(newColumns);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const removeLink = (columnIndex: number, linkIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].links = newColumns[columnIndex].links.filter((_, i) => i !== linkIndex);
    setColumns(newColumns);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/footers" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Link>
        <h1 className="text-2xl font-bold">Yeni Footer Oluştur</h1>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Genel Ayarlar</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Footer Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Ana Footer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Konum</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="main">Ana Footer</option>
                <option value="bottom">Alt Bar</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Arka Plan Rengi</label>
              <input
                type="text"
                value={formData.bgColor}
                onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="bg-slate-900 veya #1a1a1a"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Yazı Rengi</label>
              <input
                type="text"
                value={formData.textColor}
                onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="text-white veya light"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Tagline / Slogan</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Şirket sloganı veya kısa açıklama"
              />
            </div>
            <div className="flex items-center gap-4 pt-2">
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

        {/* Columns */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Kolonlar</h2>
            <button
              type="button"
              onClick={addColumn}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Kolon Ekle
            </button>
          </div>

          <div className="space-y-4">
            {columns.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Henüz kolon eklenmemiş.</p>
            ) : (
              columns.map((column, columnIndex) => (
                <div key={columnIndex} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <GripVertical className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={column.title}
                      onChange={(e) => updateColumn(columnIndex, "title", e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm font-medium"
                      placeholder="Kolon Başlığı"
                    />
                    <button
                      type="button"
                      onClick={() => removeColumn(columnIndex)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="ml-6 space-y-2">
                    {column.links.map((link, linkIndex) => (
                      <div key={linkIndex} className="flex items-center gap-2 bg-slate-50 p-2 rounded">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateLink(columnIndex, linkIndex, "label", e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded"
                          placeholder="Link Metni"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updateLink(columnIndex, linkIndex, "url", e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded"
                          placeholder="URL"
                        />
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={link.isExternal}
                            onChange={(e) => updateLink(columnIndex, linkIndex, "isExternal", e.target.checked)}
                            className="rounded"
                          />
                          Dış
                        </label>
                        <button
                          type="button"
                          onClick={() => removeLink(columnIndex, linkIndex)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addLink(columnIndex)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Link Ekle
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">Alt Bar Ayarları</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={bottomBar.showCopyright}
                  onChange={(e) => setBottomBar({ ...bottomBar, showCopyright: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span className="text-sm">Copyright Göster</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={bottomBar.showSocial}
                  onChange={(e) => setBottomBar({ ...bottomBar, showSocial: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span className="text-sm">Sosyal Medya</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={bottomBar.showPaymentIcons}
                  onChange={(e) => setBottomBar({ ...bottomBar, showPaymentIcons: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span className="text-sm">Ödeme İkonları</span>
              </label>
            </div>
            {bottomBar.showCopyright && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Copyright Metni</label>
                <input
                  type="text"
                  value={bottomBar.copyright}
                  onChange={(e) => setBottomBar({ ...bottomBar, copyright: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="© 2025 Tüm hakları saklıdır."
                />
              </div>
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
                Footer'ı Kaydet
              </>
            )}
          </button>
          <Link href="/admin/footers" className="px-6 py-3 border border-slate-200 rounded-lg hover:bg-slate-50">
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}
