"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  LayoutTemplate,
  Plus,
  Copy,
  Check,
  X,
  Edit2,
  Trash2,
  FileText,
  Image,
  Video,
  Mail,
  Sparkles,
  Star,
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  CheckCircle,
  Clock,
  Calendar,
  Tag,
  Search,
  Filter,
  Wand2,
  Bot,
} from "lucide-react";

interface ContentTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: "BLOG_POST" | "SOCIAL_POST" | "NEWSLETTER" | "VIDEO" | "PODCAST";
  structure: {
    sections: {
      type: string;
      title: string;
      content?: string;
      required: boolean;
    }[];
  };
  defaultTitle?: string;
  defaultExcerpt?: string;
  defaultContent?: string;
  defaultCategory?: string;
  defaultTags: string[];
  seoTemplate?: {
    titlePattern: string;
    descriptionPattern: string;
  };
  aiPrompts?: {
    title?: string;
    excerpt?: string;
    content?: string;
  };
  featuredImageTemplate?: string;
  isActive: boolean;
  isPublic: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
}

export default function ContentTemplatesPage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContentTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch("/api/admin/blog/templates");
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setTemplates(
          (data.templates ?? []).map((t: Record<string, unknown>) => ({
            id: String(t.id ?? ""),
            name: String(t.name ?? ""),
            slug: String(t.slug ?? t.id ?? ""),
            description: t.description as string | undefined,
            type: (t.type as ContentTemplate["type"]) ?? "BLOG_POST",
            structure: (t.structure as ContentTemplate["structure"]) ?? { sections: [] },
            defaultTags: (t.defaultTags as string[]) ?? [],
            isActive: t.isActive !== false,
            isPublic: Boolean(t.isPublic),
            usageCount: Number(t.usageCount ?? 0),
            createdBy: String(t.createdBy ?? "Admin"),
            createdAt: String(t.createdAt ?? new Date().toISOString()),
            aiPrompts: t.aiPrompts as ContentTemplate["aiPrompts"],
          }))
        );
      } catch {
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    }
    void loadTemplates();
  }, []);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || t.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "BLOG_POST": return <FileText className="w-5 h-5" />;
      case "SOCIAL_POST": return <Image className="w-5 h-5" />;
      case "NEWSLETTER": return <Mail className="w-5 h-5" />;
      case "VIDEO": return <Video className="w-5 h-5" />;
      case "PODCAST": return <Image className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "BLOG_POST": return "bg-blue-100 text-blue-600";
      case "SOCIAL_POST": return "bg-pink-100 text-pink-600";
      case "NEWSLETTER": return "bg-purple-100 text-purple-600";
      case "VIDEO": return "bg-red-100 text-red-600";
      case "PODCAST": return "bg-yellow-100 text-yellow-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/blog" className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <LayoutTemplate className="w-6 h-6 text-cyan-600" />
                  İçerik Şablonları
                </h1>
                <p className="text-slate-500 text-sm">Hazır şablonlarla hızlı içerik üretimi</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4" />
              Şablon Oluştur
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Şablon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg"
          >
            <option value="all">Tüm Tipler</option>
            <option value="BLOG_POST">Blog Yazısı</option>
            <option value="SOCIAL_POST">Sosyal Medya</option>
            <option value="NEWSLETTER">Newsletter</option>
            <option value="VIDEO">Video</option>
          </select>
        </div>

        {loading && (
          <div className="text-center py-12 text-slate-500">Yükleniyor...</div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Preview Area */}
              <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getTypeColor(template.type)}`}>
                  {getTypeIcon(template.type)}
                </div>
                {template.aiPrompts && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold">{template.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(template.type)}`}>
                    {template.type === "BLOG_POST" && "Blog"}
                    {template.type === "SOCIAL_POST" && "Sosyal"}
                    {template.type === "NEWSLETTER" && "Newsletter"}
                    {template.type === "VIDEO" && "Video"}
                  </span>
                </div>

                {template.description && (
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{template.description}</p>
                )}

                {/* Structure Preview */}
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-1">Yapı:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.structure.sections.slice(0, 3).map((section, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                        {section.title}
                      </span>
                    ))}
                    {template.structure.sections.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                        +{template.structure.sections.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {template.usageCount} kullanım
                  </span>
                  {template.isPublic && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Star className="w-3 h-3" /> Herkese açık
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/blog/new?template=${template.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm"
                  >
                    <Copy className="w-4 h-4" /> Kullan
                  </Link>
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <LayoutTemplate className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Henüz şablon bulunmuyor.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-cyan-600 hover:underline mt-2"
            >
              İlk şablonu oluştur
            </button>
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold">Yeni İçerik Şablonu</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Şablon Adı</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    placeholder="örn: Ürün Tanıtım Yazısı"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">İçerik Tipi</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "BLOG_POST", label: "Blog Yazısı", icon: FileText },
                      { id: "SOCIAL_POST", label: "Sosyal Medya", icon: Image },
                      { id: "NEWSLETTER", label: "Newsletter", icon: Mail },
                      { id: "VIDEO", label: "Video", icon: Video },
                    ].map((type) => (
                      <button
                        key={type.id}
                        className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-cyan-500 transition-colors"
                      >
                        <type.icon className="w-5 h-5 text-slate-400" />
                        <span className="font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Yapı</label>
                  <div className="space-y-2">
                    {["Giriş", "Ana Bölüm", "Sonuç", "CTA"].map((section, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          defaultValue={section}
                          className="flex-1 bg-transparent border-none outline-none"
                        />
                        <label className="flex items-center gap-2 text-sm text-slate-500">
                          <input type="checkbox" defaultChecked className="rounded" />
                          Zorunlu
                        </label>
                      </div>
                    ))}
                    <button className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-cyan-500 hover:text-cyan-600">
                      + Bölüm Ekle
                    </button>
                  </div>
                </div>

                {/* AI Settings */}
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <h3 className="font-medium text-purple-900 flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5" />
                    AI Desteği
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span className="text-sm text-slate-700">AI başlık önerisi</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span className="text-sm text-slate-700">AI içerik oluşturma</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span className="text-sm text-slate-700">AI SEO optimizasyonu</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg"
                >
                  İptal
                </button>
                <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                  Şablon Oluştur
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
