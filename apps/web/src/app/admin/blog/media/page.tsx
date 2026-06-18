"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Archive,
  Upload,
  X,
  Check,
  Copy,
  Trash2,
  Download,
  Sparkles,
  Tag,
  Folder,
  MoreHorizontal,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Wand2,
  LayoutTemplate,
  Calendar,
  ChevronDown,
} from "lucide-react";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "ARCHIVE";
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  aiTags: string[];
  aiDescription?: string;
  tags: string[];
  folders: string[];
  alt?: string;
  caption?: string;
  usedInPosts: string[];
  useCount: number;
  uploadedBy: string;
  createdAt: string;
}

interface Folder {
  id: string;
  name: string;
  path: string;
  itemCount: number;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAIFilter, setShowAIFilter] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMedia() {
      try {
        const res = await fetch("/api/admin/blog/media");
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setMedia(
          (data.media ?? []).map((m: Record<string, unknown>) => ({
            id: String(m.id ?? ""),
            name: String(m.name ?? ""),
            url: String(m.url ?? ""),
            type: (String(m.type ?? "IMAGE").toUpperCase() as MediaItem["type"]),
            size: Number(m.size ?? 0),
            width: m.width as number | undefined,
            height: m.height as number | undefined,
            duration: m.duration as number | undefined,
            aiTags: (m.aiTags as string[]) ?? [],
            aiDescription: m.aiDescription as string | undefined,
            tags: (m.tags as string[]) ?? [],
            folders: m.folders
              ? (m.folders as string[])
              : m.folder
                ? [String(m.folder)]
                : [],
            alt: m.alt as string | undefined,
            caption: m.caption as string | undefined,
            usedInPosts: (m.usedInPosts as string[]) ?? [],
            useCount: Number(m.useCount ?? 0),
            uploadedBy: String(m.uploadedBy ?? "Sistem"),
            createdAt: String(m.createdAt ?? new Date().toISOString()),
          }))
        );
        setFolders(
          (data.folders ?? []).map((f: Record<string, unknown>) => ({
            id: String(f.id ?? ""),
            name: String(f.name ?? ""),
            path: String(f.path ?? f.id ?? ""),
            itemCount: Number(f.itemCount ?? 0),
          }))
        );
      } catch {
        setMedia([]);
        setFolders([]);
      } finally {
        setLoading(false);
      }
    }
    void loadMedia();
  }, []);
  const [isDragging, setIsDragging] = useState(false);

  const filteredMedia = media.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.aiTags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.aiDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFolder =
      !selectedFolder || item.folders.some((f) => f.startsWith(selectedFolder));
    
    const matchesType = selectedType === "all" || item.type === selectedType;
    
    return matchesSearch && matchesFolder && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "IMAGE": return <ImageIcon className="w-5 h-5" />;
      case "VIDEO": return <Video className="w-5 h-5" />;
      case "AUDIO": return <Music className="w-5 h-5" />;
      case "DOCUMENT": return <FileText className="w-5 h-5" />;
      case "ARCHIVE": return <Archive className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "IMAGE": return "bg-purple-100 text-purple-600";
      case "VIDEO": return "bg-red-100 text-red-600";
      case "AUDIO": return "bg-yellow-100 text-yellow-600";
      case "DOCUMENT": return "bg-blue-100 text-blue-600";
      case "ARCHIVE": return "bg-slate-100 text-slate-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const toggleSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const selectAll = () => {
    if (selectedItems.length === filteredMedia.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredMedia.map((m) => m.id));
    }
  };

  const stats = {
    total: media.length,
    images: media.filter((m) => m.type === "IMAGE").length,
    videos: media.filter((m) => m.type === "VIDEO").length,
    totalSize: media.reduce((acc, m) => acc + m.size, 0),
    aiTagged: media.filter((m) => m.aiTags.length > 0).length,
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file upload
    setShowUploadModal(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
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
                  <ImageIcon className="w-6 h-6 text-pink-600" />
                  Medya Kütüphanesi
                </h1>
                <p className="text-slate-500 text-sm">
                  {stats.total} medya • {formatFileSize(stats.totalSize)} • {stats.aiTagged} AI etiketli
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAIFilter(!showAIFilter)}
                className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showAIFilter
                    ? "bg-purple-100 border-purple-300 text-purple-700"
                    : "border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI Arama
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                <Upload className="w-4 h-4" />
                Yükle
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Yükleniyor...</div>
        ) : (
        <>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-slate-500">Toplam</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-purple-600">{stats.images}</p>
            <p className="text-sm text-slate-500">Görsel</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-red-600">{stats.videos}</p>
            <p className="text-sm text-slate-500">Video</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-slate-600">{formatFileSize(stats.totalSize)}</p>
            <p className="text-sm text-slate-500">Toplam Boyut</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-purple-600">{stats.aiTagged}</p>
            <p className="text-sm text-slate-500">AI Etiketli</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Folders */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  Klasörler
                </h3>
                <button className="p-1 hover:bg-slate-100 rounded">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedFolder("")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                    selectedFolder === "" ? "bg-pink-50 text-pink-700" : "hover:bg-slate-50"
                  }`}
                >
                  <span>Tüm Medya</span>
                  <span className="text-slate-400">{media.length}</span>
                </button>
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.path)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                      selectedFolder === folder.path ? "bg-pink-50 text-pink-700" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      {folder.name}
                    </span>
                    <span className="text-slate-400">{folder.itemCount}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={showAIFilter ? "AI ile arayın... (örn: mavi arka planlı laptop)" : "Medya ara..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none ${
                    showAIFilter
                      ? "border-purple-300 focus:ring-purple-500 bg-purple-50"
                      : "border-slate-200 focus:ring-pink-500"
                  }`}
                />
                {showAIFilter && (
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                )}
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              >
                <option value="all">Tüm Tipler</option>
                <option value="IMAGE">Görsel</option>
                <option value="VIDEO">Video</option>
                <option value="AUDIO">Ses</option>
                <option value="DOCUMENT">Doküman</option>
              </select>
              <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-pink-100 text-pink-700" : "hover:bg-slate-100"}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-pink-100 text-pink-700" : "hover:bg-slate-100"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between bg-pink-50 border border-pink-200 rounded-lg p-3 mb-4"
              >
                <span className="text-sm text-pink-700 font-medium">
                  {selectedItems.length} öğe seçildi
                </span>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm bg-white text-slate-700 rounded hover:bg-slate-100">
                    Taşı
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-white text-slate-700 rounded hover:bg-slate-100">
                    Etiketle
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                    Sil
                  </button>
                </div>
              </motion.div>
            )}

            {/* Select All */}
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredMedia.length && filteredMedia.length > 0}
                  onChange={selectAll}
                  className="w-4 h-4 rounded border-slate-300"
                />
                Tümünü Seç
              </label>
              <span className="text-sm text-slate-500">
                {filteredMedia.length} sonuç
              </span>
            </div>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDragging(false)}
              className={`transition-all ${isDragging ? "ring-2 ring-pink-500 ring-offset-4 bg-pink-50 rounded-xl" : ""}`}
            >
              {/* Grid View */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMedia.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`group relative bg-white rounded-xl border overflow-hidden cursor-pointer ${
                        selectedItems.includes(item.id)
                          ? "border-pink-500 ring-2 ring-pink-500"
                          : "border-slate-200 hover:border-pink-300"
                      }`}
                      onClick={() => setSelectedMedia(item)}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-square bg-slate-100 relative overflow-hidden">
                        {item.type === "IMAGE" ? (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className={`p-4 rounded-xl ${getTypeColor(item.type)}`}>
                              {getTypeIcon(item.type)}
                            </div>
                          </div>
                        )}
                        
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(item.url);
                              }}
                              className="p-2 bg-white rounded-full text-slate-700 hover:bg-slate-100"
                              title="URL Kopyala"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelection(item.id);
                              }}
                              className={`p-2 rounded-full ${
                                selectedItems.includes(item.id)
                                  ? "bg-pink-500 text-white"
                                  : "bg-white text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* AI Badge */}
                        {item.aiTags.length > 0 && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI
                          </div>
                        )}

                        {/* Type Badge */}
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                          {item.type === "IMAGE" && item.width && `${item.width}x${item.height}`}
                          {item.type === "VIDEO" && item.duration && `${Math.round(item.duration)}s`}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h3 className="font-medium text-sm text-slate-900 truncate">{item.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatFileSize(item.size)}
                        </p>
                        {item.useCount > 0 && (
                          <p className="text-xs text-pink-600 mt-1">
                            {item.useCount} yazıda kullanıldı
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                        selectedItems.includes(item.id) ? "bg-pink-50" : ""
                      }`}
                      onClick={() => setSelectedMedia(item)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelection(item.id);
                        }}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.type === "IMAGE" ? (
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className={getTypeColor(item.type)}>{getTypeIcon(item.type)}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900">{item.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                          <span>{formatFileSize(item.size)}</span>
                          {item.aiTags.length > 0 && (
                            <span className="flex items-center gap-1 text-purple-600">
                              <Sparkles className="w-3 h-3" /> {item.aiTags.slice(0, 3).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(item.url);
                          }}
                          className="p-2 hover:bg-slate-200 rounded-lg"
                        >
                          <Copy className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold">Medya Yükle</h2>
                <p className="text-slate-500">Dosyaları sürükleyin veya seçin</p>
              </div>
              <div className="p-6">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-pink-500 transition-colors">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-700">Dosyaları buraya sürükleyin</p>
                  <p className="text-sm text-slate-500 mt-2">veya</p>
                  <button className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                    Bilgisayardan Seç
                  </button>
                  <p className="text-xs text-slate-400 mt-4">
                    Desteklenen formatlar: JPG, PNG, GIF, MP4, MP3, PDF
                  </p>
                </div>

                <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Wand2 className="w-5 h-5 text-purple-600" />
                    <h3 className="font-medium text-purple-900">AI Otomatik Etiketleme</h3>
                  </div>
                  <p className="text-sm text-purple-700">
                    Yüklenen görseller otomatik olarak AI tarafından analiz edilecek ve etiketlenecektir.
                    Bu sayede içeriklerinizi daha kolay bulabilirsiniz.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg"
                >
                  İptal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Detail Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
            >
              {/* Preview */}
              <div className="flex-1 bg-slate-900 flex items-center justify-center p-4">
                {selectedMedia.type === "IMAGE" ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.name}
                    className="max-w-full max-h-[50vh] md:max-h-[70vh] object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <div className={`inline-block p-8 rounded-2xl ${getTypeColor(selectedMedia.type)}`}>
                      {getTypeIcon(selectedMedia.type)}
                    </div>
                    <p className="text-white mt-4">{selectedMedia.name}</p>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="w-full md:w-96 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Medya Detayları</h2>
                  <button onClick={() => setSelectedMedia(null)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dosya Adı</label>
                    <input
                      type="text"
                      defaultValue={selectedMedia.name}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>

                  {selectedMedia.type === "IMAGE" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Alt Metin</label>
                        <input
                          type="text"
                          defaultValue={selectedMedia.alt}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                          placeholder="Görsel açıklaması..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Başlık</label>
                        <input
                          type="text"
                          defaultValue={selectedMedia.caption}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* AI Info */}
                  {selectedMedia.aiTags.length > 0 && (
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <h3 className="font-medium text-purple-900 flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4" />
                        AI Analizi
                      </h3>
                      {selectedMedia.aiDescription && (
                        <p className="text-sm text-purple-700 mb-2">
                          {selectedMedia.aiDescription}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {selectedMedia.aiTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Etiketler</label>
                    <input
                      type="text"
                      defaultValue={selectedMedia.tags.join(", ")}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="etiket1, etiket2"
                    />
                  </div>

                  {/* Usage */}
                  {selectedMedia.usedInPosts.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Kullanılan Yazılar ({selectedMedia.useCount})
                      </label>
                      <div className="space-y-1">
                        {selectedMedia.usedInPosts.map((postId, i) => (
                          <Link
                            key={i}
                            href={`/admin/blog/${postId}/edit`}
                            className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg text-sm text-indigo-600"
                          >
                            <LayoutTemplate className="w-4 h-4" />
                            Yazı #{postId.slice(-6)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedMedia.url)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                    >
                      <Copy className="w-4 h-4" /> URL Kopyala
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      <Download className="w-4 h-4" /> İndir
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
