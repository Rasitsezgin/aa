"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, UserPlus, Users } from "lucide-react";
import ForumShell from "@/components/forum/ForumShell";
import { formatRelativeTime } from "@/lib/forum-api";

interface ConnectionUser {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  groupColor: string;
  isOnline: boolean;
  reputation: number;
  postCount: number;
  followedAt: string;
}

export default function ForumConnectionsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const profileId = params?.id as string;
  const tab = searchParams.get("tab") === "following" ? "following" : "followers";

  const [profileName, setProfileName] = useState("");
  const [users, setUsers] = useState<ConnectionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    setError(null);

    fetch(`/api/forum/user/${profileId}/connections?type=${tab}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Liste yüklenemedi");
        setProfileName(data.profile?.name || "");
        setUsers(data.users || []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [profileId, tab]);

  return (
    <ForumShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href={`/forum/user/${profileId}`}
          className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-500 mb-6"
        >
          <ArrowLeft size={16} /> {profileName || "Profil"} sayfasına dön
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          {profileName} — {tab === "followers" ? "Takipçiler" : "Takip Edilenler"}
        </h1>

        <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 w-fit">
          <Link
            href={`/forum/user/${profileId}/connections?tab=followers`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
              tab === "followers" ? "bg-orange-100 text-orange-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4" /> Takipçiler
          </Link>
          <Link
            href={`/forum/user/${profileId}/connections?tab=following`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
              tab === "following" ? "bg-orange-100 text-orange-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <UserPlus className="w-4 h-4" /> Takip Edilenler
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="text-center text-slate-500 py-12">{error}</div>
        ) : users.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border p-12 text-center text-slate-500">
            {tab === "followers" ? "Henüz takipçi yok." : "Henüz kimseyi takip etmiyor."}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/forum/user/${user.id}`}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shrink-0 relative">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                  {user.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-sm text-slate-500">
                    <span style={{ color: user.groupColor }}>{user.title}</span>
                    {" · "}+{user.reputation} itibar · {user.postCount} mesaj
                  </p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{formatRelativeTime(user.followedAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ForumShell>
  );
}
