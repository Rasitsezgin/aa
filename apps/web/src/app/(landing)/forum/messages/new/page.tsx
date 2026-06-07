"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import ForumShell from "@/components/forum/ForumShell";
import { startForumConversation } from "@/lib/forum-api";

export default function NewForumMessagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const to = searchParams.get("to");
  const { status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      const callback = to ? `/forum/messages/new?to=${to}` : "/forum/messages";
      window.location.href = `/login?callbackUrl=${encodeURIComponent(callback)}`;
      return;
    }
    if (status !== "authenticated") return;

    if (!to) {
      router.replace("/forum/messages");
      return;
    }

    startForumConversation(to)
      .then((data) => router.replace(`/forum/messages/${data.conversationId}`))
      .catch((err: Error) => setError(err.message));
  }, [status, to, router]);

  return (
    <ForumShell>
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        {error ? (
          <>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => router.push("/forum/messages")}
              className="text-orange-600 hover:underline"
            >
              Mesajlara dön
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
            <p className="text-slate-500">Sohbet hazırlanıyor...</p>
          </>
        )}
      </div>
    </ForumShell>
  );
}
