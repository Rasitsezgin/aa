"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Bot,
  Wand2,
  Image as ImageIcon,
  Type,
  X,
  Loader2,
  Lightbulb,
  FileText,
  Settings,
  Layout,
  AlertCircle,
  CheckCircle,
  Copy,
  Zap,
  PenTool,
  Search,
  Plus,
} from "lucide-react";

interface AIAssistPanelProps {
  content: string;
  title: string;
  onApplySuggestion: (suggestion: string, type: string) => void;
}

// AI Assistant Sidebar Component
function AIAssistPanel({ content, title, onApplySuggestion }: AIAssistPanelProps) {
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "images" | "ideas">("content");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [prompt, setPrompt] = useState("");

  const generateContent = async (type: string, customPrompt?: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          content,
          prompt: customPrompt,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("AI generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async (prompt: string, style: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/blog/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });

      if (response.ok) {
        const data = await response.json();
        onApplySuggestion(data.imageUrl, "image");
      }
    } catch (error) {
      console.error("Image generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-slate-800">AI Asistan</h3>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {[
            { id: "content", icon: Type, label: "İçerik" },
            { id: "seo", icon: Search, label: "SEO" },
            { id: "images", icon: Image, label: "Görsel" },
            { id: "ideas", icon: Lightbulb, label: "Fikirler" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "content" && (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase">Hızlı İşlemler</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => generateContent("improve")}
                  disabled={isGenerating}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors"
                >
                  <PenTool className="w-4 h-4 text-purple-600 mb-1" />
                  <p className="text-xs font-medium">İçeriği İyileştir</p>
                </button>
                <button
                  onClick={() => generateContent("expand")}
                  disabled={isGenerating}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors"
                >
                  <FileText className="w-4 h-4 text-blue-600 mb-1" />
                  <p className="text-xs font-medium">Detaylandır</p>
                </button>
                <button
                  onClick={() => generateContent("summarize")}
                  disabled={isGenerating}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors"
                >
                  <Zap className="w-4 h-4 text-yellow-600 mb-1" />
                  <p className="text-xs font-medium">Özet Çıkar</p>
                </button>
                <button
                  onClick={() => generateContent("tone")}
                  disabled={isGenerating}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-pink-600 mb-1" />
                  <p className="text-xs font-medium">Ton Değiştir</p>
                </button>
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase">Özel İstek</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ne yapmamı istersin? (örn: Daha profesyonel bir giriş yaz)"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                rows={3}
              />
              <button
                onClick={() => generateContent("custom", prompt)}
                disabled={isGenerating || !prompt}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Oluştur
                  </>
                )}
              </button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase">Öneriler</p>
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-purple-50 border border-purple-100 rounded-lg"
                  >
                    <p className="text-sm text-slate-700 mb-2">{suggestion.text}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApplySuggestion(suggestion.text, "content")}
                        className="flex-1 py-1.5 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700"
                      >
                        Uygula
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(suggestion.text)}
                        className="p-1.5 hover:bg-purple-100 rounded text-purple-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "images" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase">AI Görsel Oluştur</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Görsel açıklaması yazın..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                rows={3}
              />
              
              <p className="text-xs font-medium text-slate-500">Stil</p>
              <div className="flex flex-wrap gap-2">
                {["Gerçekçi", "3D", "Çizim", "Minimal", "Suluboya", "Dijital Sanat"].map((style) => (
                  <button
                    key={style}
                    onClick={() => generateImage(prompt, style)}
                    className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    {style}
                  </button>
                ))}
              </div>

              <button
                onClick={() => generateImage(prompt, "Dijital Sanat")}
                disabled={isGenerating || !prompt}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    Görsel Oluştur
                  </>
                )}
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
              <p className="text-xs text-yellow-700">
                <Lightbulb className="w-3 h-3 inline mr-1" />
                İpucu: Detaylı açıklamalar daha iyi sonuçlar verir. Örn: &quot;Modern bir ofiste laptop kullanan genç profesyonel&quot;
              </p>
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="space-y-4">
            <button
              onClick={() => generateContent("seo")}
              disabled={isGenerating}
              className="w-full py-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-700 font-medium flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              SEO Analizi Yap
            </button>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-1">SEO Puanı</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-sm font-bold text-green-600">75/100</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">İyileştirmeler</p>
                {[
                  { type: "warning", text: "Meta açıklaması 150 karakterden uzun" },
                  { type: "success", text: "Başlık SEO uyumlu" },
                  { type: "info", text: "Alt başlıklar eklenebilir" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                      item.type === "success"
                        ? "bg-green-50 text-green-700"
                        : item.type === "warning"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {item.type === "success" && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                    {item.type === "warning" && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    {item.type === "info" && <Lightbulb className="w-4 h-4 flex-shrink-0" />}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "ideas" && (
          <div className="space-y-4">
            <button
              onClick={() => generateContent("titles")}
              disabled={isGenerating}
              className="w-full py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 font-medium flex items-center justify-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Başlık Fikirleri
            </button>

            <button
              onClick={() => generateContent("outlines")}
              disabled={isGenerating}
              className="w-full py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-purple-700 font-medium flex items-center justify-center gap-2"
            >
              <Layout className="w-4 h-4" />
              İçerik Taslağı
            </button>

            <button
              onClick={() => generateContent("related")}
              disabled={isGenerating}
              className="w-full py-3 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg text-pink-700 font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              İlgili Konular
            </button>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Trend Konular</p>
              {[
                "E-ticaret SEO Stratejileri 2024",
                "Pazaryeri Komisyon Hesaplama",
                "AI Destekli Ürün Açıklamaları",
                "Çok Kanallı Satış Yönetimi",
              ].map((topic, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(topic)}
                  className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BlogEditPage({ post }: { post?: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
  
  const [formData, setFormData] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    status: post?.status || "DRAFT",
    categoryId: post?.categoryId || "",
    tags: post?.tags?.map((t: any) => t.name).join(", ") || "",
    featuredImage: post?.featuredImage || "",
    metaTitle: post?.metaTitle || "",
    metaDescription: post?.metaDescription || "",
    scheduledAt: post?.scheduledAt || "",
  });

  const [aiGenerated, setAiGenerated] = useState({
    title: false,
    excerpt: false,
    content: false,
    images: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = post?.id ? `/api/admin/blog/posts/${post.id}` : "/api/admin/blog/posts";
      const method = post?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          aiGeneratedContent: aiGenerated,
        }),
      });

      if (response.ok) {
        router.push("/admin/blog");
      } else {
        alert("Kaydetme başarısız oldu.");
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const applyAISuggestion = (suggestion: string, type: string) => {
    if (type === "title") {
      setFormData({ ...formData, title: suggestion });
      setAiGenerated({ ...aiGenerated, title: true });
    } else if (type === "content") {
      setFormData({ ...formData, content: formData.content + "\n\n" + suggestion });
      setAiGenerated({ ...aiGenerated, content: true });
    } else if (type === "excerpt") {
      setFormData({ ...formData, excerpt: suggestion });
      setAiGenerated({ ...aiGenerated, excerpt: true });
    } else if (type === "image") {
      setFormData({ ...formData, featuredImage: suggestion });
      setAiGenerated({ ...aiGenerated, images: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/blog" className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">{post ? "Yazı Düzenle" : "Yeni Yazı"}</h1>
                <p className="text-sm text-slate-500">
                  {aiGenerated.title || aiGenerated.content || aiGenerated.excerpt ? (
                    <span className="flex items-center gap-1 text-purple-600">
                      <Sparkles className="w-3 h-3" /> AI destekli
                    </span>
                  ) : (
                    "Blog yazınızı oluşturun"
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="DRAFT">Taslak</option>
                <option value="SCHEDULED">Planla</option>
                <option value="PUBLISHED">Yayınla</option>
              </select>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Kaydet
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 flex gap-6 border-t border-slate-100">
            {[
              { id: "content", icon: Type, label: "İçerik" },
              { id: "seo", icon: Search, label: "SEO" },
              { id: "settings", icon: Settings, label: "Ayarlar" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "content" && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Başlık
                  {aiGenerated.title && (
                    <span className="ml-2 text-xs text-purple-600 flex items-center gap-1 inline-flex">
                      <Sparkles className="w-3 h-3" /> AI
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 text-xl font-semibold border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Yazı başlığı..."
                />
              </div>

              {/* Slug */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="yazi-basligi"
                  />
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kapak Görseli
                  {aiGenerated.images && (
                    <span className="ml-2 text-xs text-purple-600 flex items-center gap-1 inline-flex">
                      <Sparkles className="w-3 h-3" /> AI
                    </span>
                  )}
                </label>
                <div className="flex gap-4">
                  {formData.featuredImage ? (
                    <div className="relative w-40 h-24 rounded-lg overflow-hidden">
                      <Image
                        src={formData.featuredImage}
                        alt="Kapak görseli"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, featuredImage: "" })}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 h-24 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={formData.featuredImage}
                      onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="Görsel URL..."
                    />
                    <p className="text-xs text-slate-500">
                      AI Asistan panelinden görsel oluşturabilirsiniz
                    </p>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Özet
                  {aiGenerated.excerpt && (
                    <span className="ml-2 text-xs text-purple-600 flex items-center gap-1 inline-flex">
                      <Sparkles className="w-3 h-3" /> AI
                    </span>
                  )}
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  rows={3}
                  placeholder="Yazının kısa özeti..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  İçerik
                  {aiGenerated.content && (
                    <span className="ml-2 text-xs text-purple-600 flex items-center gap-1 inline-flex">
                      <Sparkles className="w-3 h-3" /> AI destekli
                    </span>
                  )}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm leading-relaxed"
                  rows={20}
                  placeholder="Yazı içeriğini buraya yazın veya AI Asistan'dan yardım alın..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Etiketler</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="etic1, etiket2, etiket3"
                />
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">SEO Optimizasyonu</h3>
                </div>
                <p className="text-sm text-blue-700">
                  AI Asistan panelinden otomatik SEO analizi yapabilirsiniz.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Meta Başlık</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="SEO başlığı (60 karakter)"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.metaTitle.length}/60 karakter
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Meta Açıklama</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  rows={3}
                  placeholder="SEO açıklaması (160 karakter)"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.metaDescription.length}/160 karakter
                </p>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Kategori seçin</option>
                  <option value="1">E-ticaret</option>
                  <option value="2">Pazaryeri</option>
                  <option value="3">AI & Teknoloji</option>
                </select>
              </div>

              {formData.status === "SCHEDULED" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Yayın Tarihi</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Assist Panel */}
      <AIAssistPanel
        content={formData.content}
        title={formData.title}
        onApplySuggestion={applyAISuggestion}
      />
    </div>
  );
}
