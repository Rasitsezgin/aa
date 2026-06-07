"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, Mail, MessageSquare } from "lucide-react";
import ForumShell from "@/components/forum/ForumShell";
import { fetchForumConversations, formatRelativeTime, type ForumConversationItem } from "@/lib/forum-api";

export default function ForumMessagesPage() {
  const { status } = useSession();
  const [conversations, setConversations] = useState<ForumConversationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = `/login?callbackUrl=${encodeURIComponent("/forum/messages")}`;
      return;
    }
    if (status !== "authenticated") return;

    fetchForumConversations()
      .then((data) => {
        setConversations(data.conversations);
        setUnreadCount(data.unreadCount);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <ForumShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-7 h-7 text-orange-500" /> Özel Mesajlar
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-orange-600 mt-1">{unreadCount} okunmamış mesaj</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border p-8 text-center text-slate-500">{error}</div>
        ) : conversations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300 mb-2">Henüz mesajınız yok</p>
            <p className="text-sm text-slate-500">Bir kullanıcı profilinden mesaj göndererek sohbet başlatabilirsiniz.</p>
            <Link href="/forum" className="inline-block mt-6 text-orange-600 hover:text-orange-500 font-medium">
              Foruma git
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/forum/messages/${conv.id}`}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shrink-0">
                  {conv.peer?.avatar ? (
                    <img src={conv.peer.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (conv.title.charAt(0) || "?").toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{conv.title}</p>
                    <span className="text-xs text-slate-400 shrink-0">{formatRelativeTime(conv.lastMessageAt)}</span>
                  </div>
                  {conv.lastMessage && (
                    <p className="text-sm text-slate-500 truncate mt-0.5">
                      {conv.lastMessage.isMine ? "Sen: " : ""}{conv.lastMessage.content}
                    </p>
                  )}
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </ForumShell>
  );
}
