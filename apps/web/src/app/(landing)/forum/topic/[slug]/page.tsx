"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  ArrowLeft,
  Pin,
  Lock,
  Eye,
  MessageCircle,
  ThumbsUp,
  Heart,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Reply,
  Share2,
  Flag,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Award,
  Star,
  Image as ImageIcon,
  Smile,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  Code,
  Send,
} from "lucide-react";

interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  type: "NORMAL" | "STICKY" | "ANNOUNCEMENT" | "SOLVED";
  status: "OPEN" | "CLOSED";
  author: {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
    isStaff?: boolean;
    reputation: number;
    postCount: number;
    joinedAt: string;
  };
  board: {
    id: string;
    name: string;
    slug: string;
  };
  viewCount: number;
  replyCount: number;
  reactionCount: number;
  isWatching: boolean;
  createdAt: string;
  tags: string[];
}

interface ForumPost {
  id: string;
  postNumber: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
    isStaff?: boolean;
    isOnline: boolean;
    reputation: number;
    postCount: number;
    joinedAt: string;
    badges: string[];
    signature?: string;
  };
  content: string;
  contentHtml: string;
  createdAt: string;
  editedAt?: string;
  editCount: number;
  reactionCount: number;
  reactions: {
    type: "like" | "thanks" | "helpful" | "love";
    count: number;
    userReacted: boolean;
  }[];
  isBestAnswer?: boolean;
}

export default function ForumTopicPage() {
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [showReplyEditor, setShowReplyEditor] = useState(false);

  // Initialize mock data
  useState(() => {
    const mockTopic: ForumTopic = {
      id: "1",
      title: "Örnek Konu Başlığı",
      slug: "ornek-konu",
      type: "NORMAL",
      status: "OPEN",
      author: { id: "1", name: "Admin", reputation: 100, postCount: 50, joinedAt: "2024-01-01" },
      board: { id: "1", name: "Genel", slug: "general" },
      viewCount: 1234,
      replyCount: 5,
      reactionCount: 42,
      createdAt: "2024-01-15T10:30:00Z",
      tags: ["örnek", "konu"],
      isWatching: false,
    };
    setTopic(mockTopic);

    const mockPosts: ForumPost[] = [
      {
        id: "1",
        postNumber: 1,
        author: { id: "1", name: "Admin", isOnline: true, reputation: 100, postCount: 50, joinedAt: "2024-01-01", badges: [] },
        content: "Bu bir örnek içeriktir.",
        contentHtml: "<p>Bu bir örnek içeriktir.</p>",
        createdAt: "2 saat önce",
        editCount: 0,
        reactionCount: 5,
        reactions: [],
      },
    ];
    setPosts(mockPosts);
  });

  const getReactionIcon = (type: string) => {
    switch (type) {
      case "like": return <ThumbsUp className="w-4 h-4" />;
      case "love": return <Heart className="w-4 h-4" />;
      case "thanks": return <Star className="w-4 h-4" />;
      case "helpful": return <CheckCircle className="w-4 h-4" />;
      default: return <ThumbsUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/forum" className="hover:text-indigo-600">Forum</Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            {topic ? (
              <>
                <Link href={`/forum/board/${topic.board.slug}`} className="hover:text-indigo-600">{topic.board.name}</Link>
                <ChevronLeft className="w-4 h-4 rotate-180" />
                <span className="text-slate-700 font-medium truncate">{topic.title}</span>
              </>
            ) : (
              <span className="text-slate-400">Yükleniyor...</span>
            )}
          </div>
        </div>
      </div>

      {!topic ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
              <div className="w-48 h-4 bg-slate-200 rounded mb-2"></div>
              <div className="w-32 h-4 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Topic Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {topic.type === "STICKY" && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Sabit
                  </span>
                )}
                {topic.type === "ANNOUNCEMENT" && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Duyuru
                  </span>
                )}
                {topic.type === "SOLVED" && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Çözüldü
                  </span>
                )}
                {topic.status === "CLOSED" && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Kapalı
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{topic.title}</h1>
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {topic.viewCount.toLocaleString()} görüntülenme</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {topic.replyCount} cevap</span>
                <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> {topic.reactionCount} beğeni</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {topic.tags.map((tag) => (
                  <Link key={tag} href={`/forum/tag/${tag}`} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm hover:bg-indigo-100">
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg" title="Abone Ol">
                <Bookmark className={`w-5 h-5 ${topic.isWatching ? "fill-indigo-600 text-indigo-600" : "text-slate-400"}`} />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg" title="Paylaş">
                <Share2 className="w-5 h-5 text-slate-400" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg" title="Rapor Et">
                <Flag className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              id={`post-${post.postNumber}`}
              className={`bg-white rounded-xl border ${post.isBestAnswer ? "border-green-500 ring-1 ring-green-500" : "border-slate-200"} overflow-hidden`}
            >
              {/* Best Answer Banner */}
              {post.isBestAnswer && (
                <div className="bg-green-500 text-white px-4 py-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium text-sm">En İyi Cevap</span>
                </div>
              )}

              <div className="flex">
                {/* Author Sidebar */}
                <div className="w-48 bg-slate-50 p-4 border-r border-slate-200 hidden sm:block">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white text-xl font-bold ${
                        post.author.isStaff ? "bg-gradient-to-br from-red-500 to-orange-500" : "bg-gradient-to-br from-indigo-500 to-purple-600"
                      }`}>
                        {post.author.name.charAt(0).toUpperCase()}
                      </div>
                      {post.author.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <Link href={`/forum/user/${post.author.id}`} className="block font-semibold text-slate-900 mt-3 hover:text-indigo-600">
                      {post.author.name}
                    </Link>
                    {post.author.title && (
                      <p className="text-xs text-slate-500 mt-1">{post.author.title}</p>
                    )}
                    {post.author.isStaff && (
                      <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full mt-2">
                        Yetkili
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">İtibar</span>
                      <span className="font-medium text-green-600">+{post.author.reputation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mesaj</span>
                      <span className="font-medium">{post.author.postCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Katılım</span>
                      <span className="font-medium">{post.author.joinedAt}</span>
                    </div>
                  </div>

                  {post.author.badges.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {post.author.badges.map((badge) => (
                        <span key={badge} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded" title={badge}>
                          <Award className="w-3 h-3" />
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <div className="flex-1 p-4">
                  {/* Mobile Author */}
                  <div className="sm:hidden flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      post.author.isStaff ? "bg-red-500" : "bg-indigo-500"
                    }`}>
                      {post.author.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{post.author.name}</p>
                      <p className="text-xs text-slate-500">{post.author.postCount} mesaj</p>
                    </div>
                  </div>

                  {/* Post Meta */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Link href={`#post-${post.postNumber}`} className="font-medium text-slate-700 hover:text-indigo-600">
                        #{post.postNumber}
                      </Link>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.createdAt}
                      </span>
                      {post.editedAt && (
                        <span className="text-slate-400">(düzenlendi: {post.editedAt})</span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div 
                    className="prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                  />

                  {/* Signature */}
                  {post.author.signature && (
                    <div className="mt-6 pt-4 border-t border-slate-200 text-sm text-slate-500 italic">
                      {post.author.signature}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {post.reactions.map((reaction) => (
                        <button
                          key={reaction.type}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                            reaction.userReacted
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {getReactionIcon(reaction.type)}
                          <span>{reaction.count}</span>
                        </button>
                      ))}
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">
                        <Reply className="w-4 h-4" /> Cevapla
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">
                        <Share2 className="w-4 h-4" /> Alıntı
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reply Editor */}
        {topic.status === "OPEN" && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Reply className="w-5 h-5" /> Cevap Yaz
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <button className="p-1.5 hover:bg-slate-200 rounded" title="Kalın">
                  <Bold className="w-4 h-4 text-slate-600" />
                </button>
                <button className="p-1.5 hover:bg-slate-200 rounded" title="İtalik">
                  <Italic className="w-4 h-4 text-slate-600" />
                </button>
                <button className="p-1.5 hover:bg-slate-200 rounded" title="Bağlantı">
                  <LinkIcon className="w-4 h-4 text-slate-600" />
                </button>
                <button className="p-1.5 hover:bg-slate-200 rounded" title="Liste">
                  <List className="w-4 h-4 text-slate-600" />
                </button>
                <button className="p-1.5 hover:bg-slate-200 rounded" title="Kod">
                  <Code className="w-4 h-4 text-slate-600" />
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <button className="p-1.5 hover:bg-slate-200 rounded" title="Resim">
                  <ImageIcon className="w-4 h-4 text-slate-600" />
                </button>
                <button className="p-1.5 hover:bg-slate-200 rounded" title="Emoji">
                  <Smile className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Cevabınızı buraya yazın..."
                className="w-full h-32 px-4 py-3 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">BBCode ve Markdown desteklenir</p>
                <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                  <Send className="w-4 h-4" /> Gönder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button className="p-2 hover:bg-slate-200 rounded-lg disabled:opacity-50" disabled>
            <ChevronLeft className="w-5 h-5" />
          </button>
          {[1, 2, 3, "...", 10].map((page, i) => (
            <button
              key={i}
              className={`w-10 h-10 rounded-lg font-medium ${
                page === 1
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-slate-200 text-slate-700"
              }`}
            >
              {page}
            </button>
          ))}
          <button className="p-2 hover:bg-slate-200 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
