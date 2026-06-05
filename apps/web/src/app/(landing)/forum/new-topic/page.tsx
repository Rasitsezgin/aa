"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageSquare,
  ArrowLeft,
  Plus,
  X,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Smile,
  Paperclip,
  Eye,
  HelpCircle,
  Hash,
  ChevronDown,
  Send,
  Save,
} from "lucide-react";

interface Board {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryName: string;
}

export default function NewTopicPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [topicType, setTopicType] = useState<"normal" | "poll" | "question">("normal");
  const [isPreview, setIsPreview] = useState(false);

  // Fetch boards on mount
  useState(() => {
    // TODO: Replace with actual API call
    const mockBoards: Board[] = [
      { id: "1", name: "Genel", slug: "general", categoryName: "Forum" },
      { id: "2", name: "Satış", slug: "sales", categoryName: "İş" },
      { id: "3", name: "Destek", slug: "support", categoryName: "Yardım" },
    ];
    setBoards(mockBoards);
    setIsLoading(false);
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    // API call to create topic
    console.log({ title, content, board: selectedBoard, tags, type: topicType, isDraft });
    if (!isDraft) {
      router.push("/forum");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/forum" className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-600" />
                Yeni Konu Aç
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Eye className="w-4 h-4" />
                {isPreview ? "Düzenle" : "Önizle"}
              </button>
              <button
                onClick={() => handleSubmit(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Save className="w-4 h-4" /> Taslak
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={!title.trim() || !content.trim() || !selectedBoard}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" /> Gönder
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Board Selection */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Bölüm *</label>
              <div className="relative">
                <button
                  onClick={() => setShowBoardDropdown(!showBoardDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-lg hover:border-orange-300"
                >
                  {selectedBoard ? (
                    <div>
                      <span className="font-medium">{selectedBoard.name}</span>
                      <span className="text-slate-500 text-sm ml-2">({selectedBoard.categoryName})</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">Bölüm seçin...</span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showBoardDropdown ? "rotate-180" : ""}`} />
                </button>
                {showBoardDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {boards.map((board) => (
                      <button
                        key={board.id}
                        onClick={() => {
                          setSelectedBoard(board);
                          setShowBoardDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                      >
                        <p className="font-medium">{board.name}</p>
                        <p className="text-sm text-slate-500">{board.categoryName}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Title Input */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Konu Başlığı *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Başlık girin..."
                className="w-full px-4 py-3 text-lg border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                maxLength={100}
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{title.length}/100</p>
            </div>

            {/* Topic Type */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <label className="block text-sm font-medium text-slate-700 mb-3">Konu Tipi</label>
              <div className="flex gap-3">
                {[
                  { id: "normal", label: "Normal", icon: MessageSquare },
                  { id: "question", label: "Soru", icon: HelpCircle },
                  { id: "poll", label: "Anket", icon: Hash },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setTopicType(type.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                      topicType === type.id
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-slate-200 hover:border-orange-300"
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    <span className="font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Editor */}
            {!isPreview ? (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-3 border-b border-slate-200 bg-slate-50 overflow-x-auto">
                  <button className="p-2 hover:bg-white rounded" title="Kalın">
                    <Bold className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-white rounded" title="İtalik">
                    <Italic className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="w-px h-6 bg-slate-300 mx-1"></div>
                  <button className="p-2 hover:bg-white rounded" title="Bağlantı">
                    <LinkIcon className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-white rounded" title="Sırasız Liste">
                    <List className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-white rounded" title="Sıralı Liste">
                    <ListOrdered className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-white rounded" title="Alıntı">
                    <Quote className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-white rounded" title="Kod">
                    <Code className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="w-px h-6 bg-slate-300 mx-1"></div>
                  <button className="p-2 hover:bg-white rounded" title="Resim">
                    <ImageIcon className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-white rounded" title="Emoji">
                    <Smile className="w-4 h-4 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-white rounded" title="Dosya Ekle">
                    <Paperclip className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Mesajınızı buraya yazın... BBCode ve Markdown desteklenir."
                  className="w-full h-96 p-4 resize-none border-0 focus:ring-0"
                />
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                  <span>Markdown & BBCode desteklenir</span>
                  <span>{content.length} karakter</span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold mb-4">{title || "(Başlıksız)"}</h2>
                <div className="prose prose-slate max-w-none">
                  {content ? (
                    <p className="whitespace-pre-wrap">{content}</p>
                  ) : (
                    <p className="text-slate-400 italic">İçerik yok...</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Tags */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <label className="block text-sm font-medium text-slate-700 mb-3">Etiketler</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-orange-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Etiket ekle..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-gradient-to-br from-amber-600 to-purple-600 rounded-xl p-4 text-white">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" /> Kurallar
              </h3>
              <ul className="space-y-2 text-sm text-orange-100">
                <li>• Arama yapmadan önce benzer konuları kontrol edin</li>
                <li>• Açıklayıcı başlıklar kullanın</li>
                <li>• Spam ve reklam yapmayın</li>
                <li>• Saygılı ve yapıcı olun</li>
                <li>• Gizli bilgileri paylaşmayın</li>
              </ul>
            </div>

            {/* Drafts */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-800 mb-3">Taslaklar</h3>
              <p className="text-sm text-slate-500">Kaydedilmiş taslak bulunmuyor.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
