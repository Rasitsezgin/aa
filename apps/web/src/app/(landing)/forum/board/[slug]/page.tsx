"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, MessageSquare, Pin, Flame, Loader2 } from "lucide-react";
import ForumShell from "@/components/forum/ForumShell";
import { formatRelativeTime } from "@/lib/forum-api";

interface BoardTopic {
  id: string;
  title: string;
  slug: string;
  replyCount: number;
  viewCount: number;
  isPinned?: boolean;
  isHot?: boolean;
  author: { name: string; avatar: string };
  lastActivity: string;
}

interface BoardApiResponse {
  board: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    category?: { name: string };
  };
  topics: Array<{
    id: string;
    title: string;
    slug: string;
    replies: number;
    views: number;
    isPinned?: boolean;
    isHot?: boolean;
    author: { name: string; avatar: string };
    lastPost?: { date: string };
    createdAt: string;
  }>;
  pagination: { page: number; totalPages: number; totalCount: number };
}

export default function ForumBoardPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [data, setData] = useState<BoardApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/forum/board/${slug}`);
        if (!res.ok) throw new Error("Bölüm bulunamadı");
        setData(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Yüklenemedi");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <ForumShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      </ForumShell>
    );
  }

  if (error || !data) {
    return (
      <ForumShell>
        <div className="text-center py-24">
          <p className="text-slate-600 mb-4">{error || "Bölüm bulunamadı"}</p>
          <Link href="/forum" className="text-orange-600 hover:underline inline-flex items-center gap-2">
            <ChevronLeft size={16} /> Foruma dön
          </Link>
        </div>
      </ForumShell>
    );
  }

  return (
    <ForumShell>
      <div className="mb-6">
        <Link href="/forum" className="text-sm text-orange-600 hover:underline inline-flex items-center gap-1 mb-4">
          <ChevronLeft size={14} /> Forum
        </Link>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">{data.board.name}</h1>
        {data.board.description && (
          <p className="text-slate-600 dark:text-slate-400 mt-2">{data.board.description}</p>
        )}
        <p className="text-sm text-slate-500 mt-2">
          {data.board.category?.name} • {data.pagination.totalCount} konu
        </p>
      </div>

      <div className="space-y-3">
        {data.topics.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Bu bölümde henüz konu yok.</p>
            <Link href="/forum/new-topic" className="inline-block mt-4 text-orange-600 hover:underline">
              İlk konuyu aç
            </Link>
          </div>
        ) : (
          data.topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/forum/topic/${topic.slug}`}
              className="block p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-orange-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {topic.author.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {topic.isPinned && <Pin size={12} className="text-amber-500" />}
                    {topic.isHot && <Flame size={12} className="text-red-500" />}
                    <h2 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{topic.title}</h2>
                  </div>
                  <p className="text-xs text-slate-500">
                    {topic.author.name} • {topic.replies} yanıt • {topic.views} görüntülenme • {formatRelativeTime(new Date(topic.lastPost?.date || topic.createdAt))}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </ForumShell>
  );
}
