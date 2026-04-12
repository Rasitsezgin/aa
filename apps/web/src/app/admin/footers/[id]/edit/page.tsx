"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";

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
}

export default function EditFooterPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [footer, setFooter] = useState<Footer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [footerId, setFooterId] = useState<string>("");

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

  useEffect(() => {
    params.then(p => {
      setFooterId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (footerId) {
      fetchFooter();
    }
  }, [footerId]);

  const fetchFooter = async () => {
    try {
      const response = await fetch(`/api/admin/footers/${footerId}`);
      if (response.ok) {
        const data = await response.json();
        setFooter(data);
        setFormData({
          name: data.name,
          location: data.location,
          isActive: data.isActive,
          isDefault: data.isDefault,
          bgColor: data.bgColor || "",
          textColor: data.textColor || "",
          borderColor: data.borderColor || "",
          logoUrl: data.logoUrl || "",
          logoText: data.logoText || "",
          tagline: data.tagline || "",
        });
      } else {
        setError("Footer yüklenirken bir hata oluştu.");
      }
    } catch (err) {
      setError("Footer yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/footers/${footerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/footers");
      } else {
        const data = await response.json();
        setError(data.error || "Footer güncellenirken bir hata oluştu.");
      }
    } catch (err) {
      setError("Footer güncellenirken bir hata oluştu.");
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

  if (!footer) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || "Footer bulunamadı."}</p>
        <Link href="/admin/footers" className="text-blue-600 hover:underline mt-4 inline-block">
          Geri Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/footers" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Geri
        </Link>
        <h1 className="text-2xl font-bold">Footer Düzenle: {footer.name}</h1>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Footer Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
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
          <Link href="/admin/footers" className="px-6 py-3 border border-slate-200 rounded-lg hover:bg-slate-50">
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}
