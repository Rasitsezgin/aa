"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  User, MessageSquare, Award, Star, Clock, Calendar, MapPin,
  Link as LinkIcon, Shield, Mail, MessageCircle, Edit2,
  FileText, ThumbsUp, Eye, Flag, Ban, UserPlus, UserMinus, Loader2, X,
} from "lucide-react";
import ForumShell from "@/components/forum/ForumShell";
import {
  blockForumUser, fetchForumUserProfile, followForumUser, formatRelativeTime,
  reportForumUser, unblockForumUser, unfollowForumUser, updateForumProfile,
  type ForumUserProfileItem,
} from "@/lib/forum-api";

type TabId = "overview" | "topics" | "posts" | "reputation" | "badges";

function formatJoinDate(value: string): string {
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ForumUserProfilePage() {
  const params = useParams();
  const profileId = params?.id as string;
  const { data: session } = useSession();
  const [user, setUser] = useState<ForumUserProfileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ about: "", location: "", website: "", signature: "" });
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (!profileId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchForumUserProfile(profileId)
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const requireAuth = () => {
    if (session) return true;
    window.location.href = `/login?callbackUrl=${encodeURIComponent(`/forum/user/${profileId}`)}`;
    return false;
  };

  const handleFollowToggle = async () => {
    if (!user || !requireAuth()) return;
    setActionLoading(true);
    try {
      if (user.isFollowing) {
        await unfollowForumUser(user.id);
        setUser((prev) => prev ? { ...prev, isFollowing: false, followerCount: Math.max(0, prev.followerCount - 1) } : prev);
        showToast("Takip bırakıldı");
      } else {
        await followForumUser(user.id);
        setUser((prev) => prev ? { ...prev, isFollowing: true, followerCount: prev.followerCount + 1 } : prev);
        showToast("Kullanıcı takip edildi");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockToggle = async () => {
    if (!user || !requireAuth()) return;
    if (!user.isBlocked && !window.confirm(`${user.name} kullanıcısını engellemek istediğinize emin misiniz?`)) {
      return;
    }
    setActionLoading(true);
    try {
      if (user.isBlocked) {
        await unblockForumUser(user.id);
        setUser((prev) => prev ? { ...prev, isBlocked: false } : prev);
        showToast("Engel kaldırıldı");
      } else {
        await blockForumUser(user.id);
        setUser((prev) => prev ? { ...prev, isBlocked: true, isFollowing: false } : prev);
        showToast("Kullanıcı engellendi");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = () => {
    if (!user) return;
    setEditForm({
      about: user.about || "",
      location: user.location || "",
      website: user.website || "",
      signature: user.signature || "",
    });
    setShowEditModal(true);
  };

  const saveProfile = async () => {
    setEditSaving(true);
    try {
      const updated = await updateForumProfile(editForm);
      setUser(updated);
      setShowEditModal(false);
      showToast("Profil güncellendi");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Güncelleme başarısız");
    } finally {
      setEditSaving(false);
    }
  };

  const submitReport = async () => {
    if (!user || !requireAuth()) return;
    setReportSubmitting(true);
    try {
      await reportForumUser(user.id, reportReason, reportDescription);
      setShowReportModal(false);
      showToast("Raporunuz alındı. Teşekkürler.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Rapor gönderilemedi");
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ForumShell>
        <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </ForumShell>
    );
  }

  if (error || !user) {
    return (
      <ForumShell>
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Profil bulunamadı</h1>
            <p className="text-slate-500 mb-6">{error || "Bu kullanıcı profili mevcut değil."}</p>
            <Link href="/forum" className="text-orange-600 hover:text-orange-500 font-medium">
              Foruma dön
            </Link>
          </div>
        </div>
      </ForumShell>
    );
  }

  const tabs: Array<{ id: TabId; label: string; icon: typeof User }> = [
    { id: "overview", label: "Genel Bakış", icon: User },
    { id: "topics", label: "Konular", icon: FileText },
    { id: "posts", label: "Mesajlar", icon: MessageSquare },
    { id: "reputation", label: "İtibar", icon: Star },
    { id: "badges", label: "Rozetler", icon: Award },
  ];

  return (
    <ForumShell>
      <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#0B1120]">
        <div
          className={`h-48 md:h-64 bg-gradient-to-r from-orange-600 to-amber-500 relative ${user.coverImage ? "bg-cover bg-center" : ""}`}
          style={user.coverImage ? { backgroundImage: `url(${user.coverImage})` } : undefined}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-12">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative -mt-20 md:-mt-24">
                <div
                  className={`w-32 h-32 md:w-40 md:h-40 rounded-2xl flex items-center justify-center text-white text-4xl md:text-5xl font-bold shadow-lg border-4 border-white dark:border-slate-900 ${
                    user.isStaff ? "bg-gradient-to-br from-red-500 to-orange-500" : "bg-gradient-to-br from-orange-500 to-amber-500"
                  }`}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                {user.isOnline && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-slate-900" />
                )}
              </div>

              <div className="flex-1 pt-2">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: `${user.primaryGroup.color}20`, color: user.primaryGroup.color }}
                      >
                        {user.primaryGroup.name}
                      </span>
                      {user.isStaff && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1">
                          <Shield className="w-4 h-4" /> Yetkili
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 mt-1">@{user.username}</p>
                    {user.title && <p className="text-orange-600 font-medium mt-1">{user.title}</p>}
                    <p className="text-sm text-slate-400 mt-1">
                      Seviye {user.level} · {user.totalXp} XP ·{" "}
                      <Link href={`/forum/user/${user.id}/connections?tab=followers`} className="hover:text-orange-600">
                        {user.followerCount} takipçi
                      </Link>
                      {" · "}
                      <Link href={`/forum/user/${user.id}/connections?tab=following`} className="hover:text-orange-600">
                        {user.followingCount} takip
                      </Link>
                    </p>
                  </div>
                  {user.isOwnProfile ? (
                    <button
                      type="button"
                      onClick={openEditModal}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-500"
                    >
                      <Edit2 className="w-4 h-4" /> Profili Düzenle
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {!user.isBlocked && (
                        <button
                          type="button"
                          onClick={handleFollowToggle}
                          disabled={actionLoading}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium disabled:opacity-60 ${
                            user.isFollowing ? "bg-slate-200 text-slate-700" : "bg-orange-600 text-white hover:bg-orange-500"
                          }`}
                        >
                          {user.isFollowing ? (
                            <><UserMinus className="w-4 h-4" /> Takibi Bırak</>
                          ) : (
                            <><UserPlus className="w-4 h-4" /> Takip Et</>
                          )}
                        </button>
                      )}
                      {session ? (
                        <Link
                          href={`/forum/messages/new?to=${user.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
                        >
                          <Mail className="w-4 h-4" /> Mesaj
                        </Link>
                      ) : (
                        <Link
                          href={`/login?callbackUrl=${encodeURIComponent(`/forum/messages/new?to=${user.id}`)}`}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
                        >
                          <Mail className="w-4 h-4" /> Mesaj
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {user.about && <p className="text-slate-600 dark:text-slate-300 mt-4 max-w-2xl">{user.about}</p>}

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {formatJoinDate(user.joinedAt)} tarihinde katıldı
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Son görülme: {formatRelativeTime(user.lastSeenAt)}
                  </span>
                  {user.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {user.location}
                    </span>
                  )}
                  {user.website && (
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-orange-600 hover:underline">
                      <LinkIcon className="w-4 h-4" /> Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              {[
                { label: "Mesaj", value: user.postCount },
                { label: "Konu", value: user.topicCount },
                { label: "İtibar", value: `+${user.reputation}`, accent: true },
                { label: "Teşekkür", value: user.thanksReceived },
                { label: "Rozet", value: user.badges.length },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`text-2xl font-bold ${stat.accent ? "text-green-600" : "text-slate-900 dark:text-white"}`}>
                    {typeof stat.value === "number" ? stat.value.toLocaleString("tr-TR") : stat.value}
                  </p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 w-fit overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? "bg-orange-100 text-orange-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {activeTab === "overview" && (
                <>
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Son Mesajlar</h3>
                    {user.recentPosts.length === 0 ? (
                      <p className="text-slate-500 text-sm">Henüz mesaj yok.</p>
                    ) : (
                      <div className="space-y-4">
                        {user.recentPosts.slice(0, 5).map((post) => (
                          <div key={post.id} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div className="flex-1">
                              <Link href={`/forum/topic/${post.topicSlug}`} className="text-sm font-medium text-slate-900 dark:text-white hover:text-orange-600">
                                {post.topicTitle}
                              </Link>
                              <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(post.createdAt)} · {post.boardName}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Son Konular</h3>
                    {user.recentTopics.length === 0 ? (
                      <p className="text-slate-500 text-sm">Henüz konu açılmamış.</p>
                    ) : (
                      <div className="space-y-3">
                        {user.recentTopics.slice(0, 5).map((topic) => (
                          <Link
                            key={topic.id}
                            href={`/forum/topic/${topic.slug}`}
                            className="block p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{topic.title}</p>
                                <p className="text-sm text-slate-500">{topic.boardName} · {formatRelativeTime(topic.createdAt)}</p>
                              </div>
                              <span className="flex items-center gap-1 text-sm text-slate-400">
                                <MessageCircle className="w-4 h-4" /> {topic.replyCount}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === "topics" && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold">Tüm Konular ({user.topicCount})</h3>
                  </div>
                  {user.recentTopics.length === 0 ? (
                    <p className="p-6 text-slate-500 text-sm">Henüz konu yok.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {user.recentTopics.map((topic) => (
                        <Link
                          key={topic.id}
                          href={`/forum/topic/${topic.slug}`}
                          className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{topic.title}</p>
                            <p className="text-sm text-slate-500">{topic.boardName} · {formatRelativeTime(topic.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-400">
                            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {topic.viewCount}</span>
                            <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {topic.replyCount}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "posts" && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold">Tüm Mesajlar ({user.postCount})</h3>
                  </div>
                  {user.recentPosts.length === 0 ? (
                    <p className="p-6 text-slate-500 text-sm">Henüz mesaj yok.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {user.recentPosts.map((post) => (
                        <div key={post.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <Link href={`/forum/topic/${post.topicSlug}`} className="text-sm font-medium text-orange-600 hover:underline">
                            {post.topicTitle}
                          </Link>
                          <p className="text-slate-700 dark:text-slate-300 line-clamp-2 mt-1">{post.excerpt}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span>{formatRelativeTime(post.createdAt)}</span>
                            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.reactionCount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reputation" && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4">İtibar Özeti</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">+{user.reputation}</p>
                      <p className="text-sm text-slate-500">Toplam itibar</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{user.helpfulCount}</p>
                      <p className="text-sm text-slate-500">Faydalı yanıt</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "badges" && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4">Rozetler ({user.badges.length})</h3>
                  {user.badges.length === 0 ? (
                    <p className="text-slate-500 text-sm">Henüz rozet kazanılmamış.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {user.badges.map((badge) => (
                        <div
                          key={badge.id}
                          className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                          title={`${badge.name} — ${formatJoinDate(badge.earnedAt)}`}
                        >
                          <div
                            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
                            style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
                          >
                            <Award className="w-8 h-8" />
                          </div>
                          <p className="font-medium text-sm">{badge.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <h3 className="font-bold text-slate-800 dark:text-white mb-3">Rozetler</h3>
                {user.badges.length === 0 ? (
                  <p className="text-sm text-slate-500">Rozet yok</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.badges.slice(0, 6).map((badge) => (
                      <div
                        key={badge.id}
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
                        title={badge.name}
                      >
                        <Award className="w-5 h-5" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {user.signature && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-2">İmza</h3>
                  <p className="text-sm text-slate-500 italic">{user.signature}</p>
                </div>
              )}

              {!user.isOwnProfile && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-3">İşlemler</h3>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => requireAuth() && setShowReportModal(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
                    >
                      <Flag className="w-4 h-4" /> Rapor Et
                    </button>
                    <button
                      type="button"
                      onClick={handleBlockToggle}
                      disabled={actionLoading}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm disabled:opacity-60"
                    >
                      <Ban className="w-4 h-4" /> {user.isBlocked ? "Engeli Kaldır" : "Engelle"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white text-sm rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Profili Düzenle</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { key: "about" as const, label: "Hakkımda", rows: 3 },
                { key: "location" as const, label: "Konum", rows: 1 },
                { key: "website" as const, label: "Website", rows: 1 },
                { key: "signature" as const, label: "İmza", rows: 2 },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{field.label}</label>
                  <textarea
                    value={editForm[field.key]}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    rows={field.rows}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
                  />
                </div>
              ))}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                  İptal
                </button>
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={editSaving}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 disabled:opacity-60"
                >
                  {editSaving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Kullanıcıyı Raporla</h3>
              <button type="button" onClick={() => setShowReportModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Neden</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
                >
                  <option value="spam">Spam</option>
                  <option value="offensive">Saldırgan içerik</option>
                  <option value="harassment">Taciz</option>
                  <option value="off_topic">Konu dışı</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Açıklama</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
                  placeholder="İsteğe bağlı açıklama..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={submitReport}
                  disabled={reportSubmitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 disabled:opacity-60"
                >
                  {reportSubmitting ? "Gönderiliyor..." : "Raporla"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ForumShell>
  );
}
