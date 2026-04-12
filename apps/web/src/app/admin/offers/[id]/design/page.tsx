"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Palette,
  Image,
  Type,
  Layout,
  Monitor,
  Smartphone,
  Tablet,
  Upload,
  X,
  Check,
  RefreshCw,
  Sparkles,
  ChevronDown,
  GripVertical,
  Eye,
  Trash2,
} from "lucide-react";

interface DesignSettings {
  // Colors
  bgColor: string;
  bgColorTo?: string;
  textColor: string;
  accentColor: string;
  buttonColor: string;
  buttonTextColor: string;
  cardBgColor: string;
  
  // Images
  backgroundImage?: string;
  overlayOpacity: number;
  heroImage?: string;
  logoImage?: string;
  
  // Typography
  titleSize: string;
  titleWeight: string;
  subtitleSize: string;
  bodySize: string;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  
  // Spacing & Layout
  paddingY: string;
  paddingX: string;
  maxWidth: string;
  borderRadius: string;
  contentLayout: "left" | "center" | "right" | "split";
  
  // Effects
  showParticles: boolean;
  showGlow: boolean;
  animationSpeed: "slow" | "normal" | "fast";
  shadowIntensity: string;
}

interface SpecialOffer {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  design: DesignSettings;
}

const presetGradients = [
  { name: "Mor-Mavi", from: "from-purple-600", to: "to-blue-600", color: "#7C3AED" },
  { name: "Pembe-Turuncu", from: "from-pink-500", to: "to-orange-500", color: "#EC4899" },
  { name: "Yeşil-Mavi", from: "from-emerald-500", to: "to-cyan-500", color: "#10B981" },
  { name: "Kırmızı-Mor", from: "from-red-500", to: "to-purple-600", color: "#EF4444" },
  { name: "Mavi-Indigo", from: "from-blue-500", to: "to-indigo-600", color: "#3B82F6" },
  { name: "Turuncu-Kırmızı", from: "from-orange-500", to: "to-red-600", color: "#F97316" },
  { name: "Sarı-Turuncu", from: "from-yellow-400", to: "to-orange-500", color: "#FBBF24" },
  { name: "Koyu", from: "from-slate-800", to: "to-slate-900", color: "#1E293B" },
];

const fontFamilies = [
  { value: "Inter", label: "Inter (Modern)" },
  { value: "Poppins", label: "Poppins (Yuvarlak)" },
  { value: "Montserrat", label: "Montserrat (Güçlü)" },
  { value: "Roboto", label: "Roboto (Klasik)" },
  { value: "Playfair Display", label: "Playfair (Şık)" },
  { value: "Bebas Neue", label: "Bebas (Gösterişli)" },
];

export default function OfferDesignPage() {
  const router = useRouter();
  const [offer, setOffer] = useState<SpecialOffer | null>(null);
  const [settings, setSettings] = useState<DesignSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"colors" | "images" | "typography" | "layout">("colors");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);

  // Initialize mock data
  useState(() => {
    const mockOffer: SpecialOffer = {
      id: "1",
      title: "Özel Teklif",
      subtitle: "Sınırlı süreli fırsat",
      design: {
        bgColor: "from-purple-600",
        bgColorTo: "to-blue-600",
        textColor: "text-white",
        accentColor: "#FF4081",
        buttonColor: "#FFFFFF",
        buttonTextColor: "#000000",
        cardBgColor: "#FFFFFF",
        overlayOpacity: 0,
        titleSize: "text-5xl",
        titleWeight: "font-bold",
        subtitleSize: "text-lg",
        bodySize: "text-base",
        fontFamily: "Inter",
        textAlign: "center",
        paddingY: "py-24",
        paddingX: "px-12",
        maxWidth: "max-w-7xl",
        borderRadius: "rounded-xl",
        contentLayout: "center",
        showParticles: false,
        showGlow: false,
        animationSpeed: "normal",
        shadowIntensity: "shadow-lg",
      }
    };
    setOffer(mockOffer);
    setSettings(mockOffer.design);
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch("/api/admin/media");
      if (response.ok) {
        const data = await response.json();
        setGallery(data.map((m: any) => m.url));
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
  };

  const handleSave = async () => {
    if (!offer || !settings) return;
    setIsSaving(true);
    try {
      await fetch(`/api/admin/offers/${offer.id}/design`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ design: settings }),
      });
      router.refresh();
    } catch (error) {
      console.error("Error saving design:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(type);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (settings) {
          setSettings({ ...settings, [type]: data.url });
        }
        fetchGallery();
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(null);
    }
  };

  const updateSetting = (key: keyof DesignSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const getGradientClasses = () => {
    if (!settings) return '';
    return `bg-gradient-to-r ${settings.bgColor} ${settings.bgColorTo || ""}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={offer ? `/admin/offers/${offer.id}/edit` : '/admin/offers'} className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Tasarım Ayarları</h1>
                <p className="text-slate-500 text-sm">{offer?.title || 'Özel Teklif'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => offer && settings && setSettings(offer.design)}
                disabled={!offer || !settings}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Sıfırla
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !offer || !settings}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Settings */}
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200">
              {[
                { id: "colors", icon: Palette, label: "Renkler" },
                { id: "images", icon: Image, label: "Görseller" },
                { id: "typography", icon: Type, label: "Yazı" },
                { id: "layout", icon: Layout, label: "Düzen" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-pink-100 text-pink-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Colors Tab */}
            {activeTab === "colors" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Hazır Gradientler
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {presetGradients.map((gradient) => (
                      <button
                        key={gradient.name}
                        onClick={() => {
                          updateSetting("bgColor", gradient.from);
                          updateSetting("bgColorTo", gradient.to);
                        }}
                        className={`relative h-16 rounded-lg bg-gradient-to-r ${gradient.from} ${gradient.to} ${
                          settings?.bgColor === gradient.from ? "ring-2 ring-offset-2 ring-pink-500" : ""
                        }`}
                        title={gradient.name}
                      >
                        {settings?.bgColor === gradient.from && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white drop-shadow-lg" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Ana Renk (From)</label>
                    <input
                      type="text"
                      value={settings?.bgColor || ""}
                      onChange={(e) => updateSetting("bgColor", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="from-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">İkincil Renk (To)</label>
                    <input
                      type="text"
                      value={settings?.bgColorTo || ""}
                      onChange={(e) => updateSetting("bgColorTo", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="to-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Yazı Rengi</label>
                    <select
                      value={settings?.textColor || "text-white"}
                      onChange={(e) => updateSetting("textColor", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="text-white">Beyaz</option>
                      <option value="text-slate-900">Koyu</option>
                      <option value="text-slate-800">Gri (Koyu)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vurgu Rengi</label>
                    <input
                      type="color"
                      value={settings?.accentColor || "#FF4081"}
                      onChange={(e) => updateSetting("accentColor", e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Buton Rengi</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={settings?.buttonColor || "#FFFFFF"}
                      onChange={(e) => updateSetting("buttonColor", e.target.value)}
                      className="w-20 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings?.buttonColor || ""}
                      onChange={(e) => updateSetting("buttonColor", e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === "images" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                {/* Background Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Arka Plan Görseli</label>
                  <div className="space-y-3">
                    {settings?.backgroundImage && (
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <img src={settings.backgroundImage} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => updateSetting("backgroundImage", undefined)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-pink-500 cursor-pointer transition-colors">
                        <Upload className="w-5 h-5" />
                        <span className="text-sm">Yükle</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "backgroundImage")}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {uploadingImage === "backgroundImage" && (
                      <p className="text-sm text-slate-500">Yükleniyor...</p>
                    )}
                  </div>
                </div>

                {/* Hero Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hero Görseli</label>
                  <div className="space-y-3">
                    {settings?.heroImage && (
                      <div className="relative aspect-square max-w-48 rounded-lg overflow-hidden">
                        <img src={settings.heroImage} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => updateSetting("heroImage", undefined)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-pink-500 cursor-pointer transition-colors">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm">Görsel Yükle</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "heroImage")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Overlay Opacity */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Overlay Opaklık: {settings?.overlayOpacity || 0}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings?.overlayOpacity || 0}
                    onChange={(e) => updateSetting("overlayOpacity", parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Gallery */}
                <div>
                  <h4 className="font-medium mb-3">Medya Galerisi</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {gallery.map((url) => (
                      <button
                        key={url}
                        onClick={() => updateSetting("backgroundImage", url)}
                        className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-pink-500"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Typography Tab */}
            {activeTab === "typography" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Font Ailesi</label>
                  <select
                    value={settings?.fontFamily || "Inter"}
                    onChange={(e) => updateSetting("fontFamily", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {fontFamilies.map((font) => (
                      <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Başlık Boyutu</label>
                    <select
                      value={settings?.titleSize || "text-5xl"}
                      onChange={(e) => updateSetting("titleSize", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="text-3xl">Küçük (3xl)</option>
                      <option value="text-4xl">Orta (4xl)</option>
                      <option value="text-5xl">Büyük (5xl)</option>
                      <option value="text-6xl">Çok Büyük (6xl)</option>
                      <option value="text-7xl">Dev (7xl)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Başlık Kalınlığı</label>
                    <select
                      value={settings?.titleWeight || "font-bold"}
                      onChange={(e) => updateSetting("titleWeight", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="font-normal">Normal</option>
                      <option value="font-semibold">Yarı Kalın</option>
                      <option value="font-bold">Kalın</option>
                      <option value="font-black">Çok Kalın</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Metin Hizalama</label>
                  <div className="flex gap-2">
                    {["left", "center", "right"].map((align) => (
                      <button
                        key={align}
                        onClick={() => updateSetting("textAlign", align as any)}
                        className={`flex-1 py-2 rounded-lg border ${
                          settings?.textAlign === align
                            ? "bg-pink-100 border-pink-500 text-pink-700"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {align === "left" && "Sol"}
                        {align === "center" && "Orta"}
                        {align === "right" && "Sağ"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Layout Tab */}
            {activeTab === "layout" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Dikey Padding</label>
                    <select
                      value={settings?.paddingY || "py-24"}
                      onChange={(e) => updateSetting("paddingY", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="py-8">Küçük</option>
                      <option value="py-16">Orta</option>
                      <option value="py-24">Büyük</option>
                      <option value="py-32">Çok Büyük</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Yatay Padding</label>
                    <select
                      value={settings?.paddingX || "px-12"}
                      onChange={(e) => updateSetting("paddingX", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    >
                      <option value="px-4">Küçük</option>
                      <option value="px-8">Orta</option>
                      <option value="px-12">Büyük</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">İçerik Düzeni</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "left", label: "Sol", icon: "←" },
                      { id: "center", label: "Orta", icon: "↔" },
                      { id: "right", label: "Sağ", icon: "→" },
                      { id: "split", label: "İkiye Böl", icon: "◫" },
                    ].map((layout) => (
                      <button
                        key={layout.id}
                        onClick={() => updateSetting("contentLayout", layout.id as any)}
                        className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                          settings?.contentLayout === layout.id
                            ? "bg-pink-100 border-pink-500 text-pink-700"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-2xl">{layout.icon}</span>
                        <span className="text-sm font-medium">{layout.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Köşe Yuvarlakliği</label>
                  <select
                    value={settings?.borderRadius || "rounded-xl"}
                    onChange={(e) => updateSetting("borderRadius", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="rounded-none">Köşeli</option>
                    <option value="rounded-lg">Hafif Yuvarlak</option>
                    <option value="rounded-xl">Yuvarlak</option>
                    <option value="rounded-2xl">Çok Yuvarlak</option>
                    <option value="rounded-full">Tam Yuvarlak</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings?.showParticles || false}
                      onChange={(e) => updateSetting("showParticles", e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300"
                    />
                    <span className="text-slate-700">Parçacık Efekti</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings?.showGlow || false}
                      onChange={(e) => updateSetting("showGlow", e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300"
                    />
                    <span className="text-slate-700">Işık Patlaması (Glow)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-4">
            {/* Device Toggle */}
            <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
              <span className="text-sm font-medium text-slate-600 px-3">Önizleme</span>
              <div className="flex gap-1">
                {[
                  { id: "desktop", icon: Monitor },
                  { id: "tablet", icon: Tablet },
                  { id: "mobile", icon: Smartphone },
                ].map((device) => (
                  <button
                    key={device.id}
                    onClick={() => setPreviewDevice(device.id as any)}
                    className={`p-2 rounded-lg ${
                      previewDevice === device.id ? "bg-pink-100 text-pink-700" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <device.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            <div
              className={`mx-auto transition-all duration-300 ${
                previewDevice === "desktop" ? "max-w-full" : previewDevice === "tablet" ? "max-w-2xl" : "max-w-sm"
              }`}
            >
              <div
                className={`relative overflow-hidden ${getGradientClasses()} ${settings?.paddingY || "py-24"} ${settings?.paddingX || "px-12"} ${settings?.textColor || "text-white"}`}
                style={{
                  fontFamily: settings?.fontFamily || "Inter",
                  backgroundImage: settings?.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Overlay */}
                {settings?.backgroundImage && (
                  <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: (settings?.overlayOpacity || 0) / 100 }}
                  />
                )}

                {/* Glow Effect */}
                {settings?.showGlow && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
                  </div>
                )}

                {/* Particles */}
                {settings?.showParticles && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
                        style={{
                          top: `${20 + i * 15}%`,
                          left: `${10 + i * 15}%`,
                          animationDelay: `${i * 0.5}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className={`relative z-10 ${settings?.textAlign === "center" ? "text-center" : settings?.textAlign === "right" ? "text-right" : ""}`}>
                  <div className={`flex ${settings?.contentLayout === "split" ? "flex-row items-center gap-8" : "flex-col"}`}>
                    <div className={`${settings?.contentLayout === "split" ? "flex-1" : ""}`}>
                      {/* Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-4">
                        <Sparkles className="w-3 h-3" />
                        Özel Teklif
                      </div>

                      {/* Title */}
                      <h2 className={`${settings?.titleSize || "text-5xl"} ${settings?.titleWeight || "font-bold"} mb-3`}>
                        {offer?.title || 'Özel Teklif'}
                      </h2>

                      {offer?.subtitle && (
                        <p className="text-lg opacity-90 mb-4">{offer.subtitle}</p>
                      )}

                      {/* CTA */}
                      <button
                        className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-lg"
                        style={{
                          backgroundColor: settings?.buttonColor || "#FFFFFF",
                          color: settings?.buttonTextColor || "#000000",
                        }}
                      >
                        Hemen Başvur
                        <span>→</span>
                      </button>
                    </div>

                    {/* Hero Image */}
                    {settings?.heroImage && settings?.contentLayout === "split" && (
                      <div className="flex-1">
                        <img
                          src={settings.heroImage}
                          alt=""
                          className={`w-full max-w-sm mx-auto ${settings?.borderRadius || "rounded-xl"}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h4 className="font-medium text-sm text-slate-600 mb-2">Önizleme Bilgisi</h4>
              <p className="text-xs text-slate-500">
                Gerçek zamanlı değişiklikleri görmek için ayarları düzenleyin. 
                Kaydet butonuna bastığınızda değişiklikler yayınlanacak.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
