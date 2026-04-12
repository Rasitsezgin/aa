"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Save,
  Palette,
  Type,
  Moon,
  Sun,
  Check,
  RefreshCw,
} from "lucide-react";

interface Theme {
  id: string;
  name: string;
  key: string;
  isDefault: boolean;
  isActive: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  darkModeEnabled: boolean;
}

export default function ThemeManagementPage() {
  const router = useRouter();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch("/api/admin/themes");
      if (response.ok) {
        const data = await response.json();
        setThemes(data);
        setActiveTheme(data.find((t: Theme) => t.isDefault) || data[0]);
      }
    } catch (error) {
      console.error("Error fetching themes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!activeTheme) return;
    setIsSaving(true);
    try {
      await fetch(`/api/admin/themes/${activeTheme.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeTheme),
      });
      router.refresh();
    } catch (error) {
      console.error("Error saving theme:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const colors = [
    "slate", "gray", "zinc", "neutral", "stone",
    "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"
  ];

  const fonts = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Nunito"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Palette className="w-6 h-6 text-purple-600" />
                Tema Yönetimi
              </h1>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Kaydet
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Theme List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="font-semibold mb-4">Temalar</h2>
              <div className="space-y-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(theme)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      activeTheme?.id === theme.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500" />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{theme.name}</p>
                      {theme.isDefault && (
                        <span className="text-xs text-purple-600">Varsayılan</span>
                      )}
                    </div>
                    {activeTheme?.id === theme.id && <Check className="w-5 h-5 text-purple-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Theme Editor */}
          {activeTheme && (
            <div className="lg:col-span-2 space-y-6">
              {/* Colors */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Renkler
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ana Renk
                    </label>
                    <select
                      value={activeTheme.primaryColor}
                      onChange={(e) => setActiveTheme({ ...activeTheme, primaryColor: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      {colors.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      İkincil Renk
                    </label>
                    <select
                      value={activeTheme.secondaryColor}
                      onChange={(e) => setActiveTheme({ ...activeTheme, secondaryColor: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      {colors.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Vurgu Rengi
                    </label>
                    <select
                      value={activeTheme.accentColor}
                      onChange={(e) => setActiveTheme({ ...activeTheme, accentColor: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      {colors.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Tipografi
                </h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Font Ailesi
                  </label>
                  <select
                    value={activeTheme.fontFamily}
                    onChange={(e) => setActiveTheme({ ...activeTheme, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {fonts.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dark Mode */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Moon className="w-5 h-5" />
                  Koyu Mod
                </h2>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={activeTheme.darkModeEnabled}
                    onChange={(e) => setActiveTheme({ ...activeTheme, darkModeEnabled: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300"
                  />
                  <span>Koyu mod desteği etkin</span>
                </label>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold mb-4">Önizleme</h2>
                <div className="space-y-4 p-4 bg-slate-100 rounded-lg">
                  <div className={`h-12 bg-${activeTheme.primaryColor}-500 rounded flex items-center justify-center text-white font-semibold`}>
                    Ana Renk
                  </div>
                  <div className={`h-12 bg-${activeTheme.secondaryColor}-500 rounded flex items-center justify-center text-white font-semibold`}>
                    İkincil Renk
                  </div>
                  <div className={`h-12 bg-${activeTheme.accentColor}-500 rounded flex items-center justify-center text-white font-semibold`}>
                    Vurgu Rengi
                  </div>
                  <p style={{ fontFamily: activeTheme.fontFamily }} className="text-center">
                    Font: {activeTheme.fontFamily}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
