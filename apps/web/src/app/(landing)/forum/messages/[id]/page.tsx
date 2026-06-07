"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import ForumShell from "@/components/forum/ForumShell";
import {
  fetchForumConversation,
  formatRelativeTime,
  sendForumMessage,
  type ForumPrivateMessageItem,
} from "@/lib/forum-api";

export default function ForumConversationPage() {
  const params = useParams();
  const conversationId = params?.id as string;
  const { status } = useSession();
  const [title, setTitle] = useState("");
  const [peerId, setPeerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ForumPrivateMessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(`/forum/messages/${conversationId}`)}`;
      return;
    }
    if (status !== "authenticated" || !conversationId) return;

    fetchForumConversation(conversationId)
      .then((data) => {
        setTitle(data.conversation.title);
        setPeerId(data.conversation.peer?.id ?? null);
        setMessages(data.messages);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [status, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      const message = await sendForumMessage(conversationId, draft.trim());
      setMessages((prev) => [...prev, message]);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gönderilemedi");
    } finally {
      setSending(false);
    }
  };

  return (
    <ForumShell>
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <Link href="/forum/messages" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-lg text-slate-900 dark:text-white">{title || "Sohbet"}</h1>
            {peerId && (
              <Link href={`/forum/user/${peerId}`} className="text-sm text-orange-600 hover:underline">
                Profili gör
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : error && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">{error}</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-8">İlk mesajı siz gönderin</p>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.isMine
                        ? "bg-orange-600 text-white rounded-br-md"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md"
                    }`}
                  >
                    <div
                      className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: msg.contentHtml || msg.content }}
                    />
                    <p className={`text-[10px] mt-1 ${msg.isMine ? "text-orange-100" : "text-slate-400"}`}>
                      {formatRelativeTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="mt-4 flex gap-2 shrink-0">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="px-5 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-500 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Gönder
              </button>
            </form>
          </>
        )}
      </div>
    </ForumShell>
  );
}
