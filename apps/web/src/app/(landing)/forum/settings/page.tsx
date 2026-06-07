"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Bell, Loader2, Save } from "lucide-react";
import ForumShell from "@/components/forum/ForumShell";

type NotificationPrefs = {
  pushEnabled: boolean;
  pushOnReply: boolean;
  pushOnMention: boolean;
  pushOnMessage: boolean;
  soundEnabled: boolean;
  emailOnReply: boolean;
  emailOnQuote: boolean;
  emailOnMention: boolean;
  emailOnReaction: boolean;
  emailOnMessage: boolean;
  emailOnAchievement: boolean;
  emailDigest: string;
};

const DEFAULT_PREFS: NotificationPrefs = {
  pushEnabled: true,
  pushOnReply: true,
  pushOnMention: true,
  pushOnMessage: true,
  soundEnabled: true,
  emailOnReply: true,
  emailOnQuote: true,
  emailOnMention: true,
  emailOnReaction: false,
  emailOnMessage: true,
  emailOnAchievement: true,
  emailDigest: "never",
};

export default function ForumSettingsPage() {
  const { status } = useSession();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = `/login?callbackUrl=${encodeURIComponent("/forum/settings")}`;
      return;
    }
    if (status !== "authenticated") return;

    fetch("/api/forum/settings/notifications")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setPrefs({ ...DEFAULT_PREFS, ...data.preferences });
      })
      .catch(() => setToast("Tercihler yüklenemedi"))
      .finally(() => setLoading(false));
  }, [status]);

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/forum/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPrefs({ ...DEFAULT_PREFS, ...data.preferences });
      setToast("Ayarlar kaydedildi");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Kayıt başarısız");
    } finally {
      setSaving(false);
    }
  };

  const pushToggles: Array<{ key: keyof NotificationPrefs; label: string; hint?: string }> = [
    { key: "pushOnReply", label: "Konu yanıtları" },
    { key: "pushOnMention", label: "Bahsetmeler ve takipçiler", hint: "Sizi takip edenler dahil" },
    { key: "pushOnMessage", label: "Özel mesajlar" },
  ];

  const emailToggles: Array<{ key: keyof NotificationPrefs; label: string }> = [
    { key: "emailOnReply", label: "Konu yanıtları" },
    { key: "emailOnMention", label: "Bahsetmeler" },
    { key: "emailOnMessage", label: "Özel mesajlar" },
    { key: "emailOnAchievement", label: "Rozet ve başarılar" },
    { key: "emailOnReaction", label: "Reaksiyonlar" },
  ];

  return (
    <ForumShell>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/forum" className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-500 mb-6">
          <ArrowLeft size={16} /> Foruma dön
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <Bell className="text-orange-500" /> Bildirim Ayarları
        </h1>
        <p className="text-slate-500 text-sm mb-8">Forum ve topluluk bildirim tercihlerinizi yönetin.</p>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="font-bold text-slate-900 dark:text-white mb-4">Anlık bildirimler</h2>
              <label className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium">Bildirimleri aç</span>
                <input type="checkbox" checked={prefs.pushEnabled} onChange={() => toggle("pushEnabled")} className="w-5 h-5 accent-orange-600" />
              </label>
              {pushToggles.map((item) => (
                <label key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div>
                    <span className="text-sm">{item.label}</span>
                    {item.hint && <p className="text-xs text-slate-400">{item.hint}</p>}
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(prefs[item.key])}
                    disabled={!prefs.pushEnabled}
                    onChange={() => toggle(item.key)}
                    className="w-5 h-5 accent-orange-600 disabled:opacity-40"
                  />
                </label>
              ))}
              <label className="flex items-center justify-between py-3 mt-2">
                <span className="text-sm">Bildirim sesi</span>
                <input type="checkbox" checked={prefs.soundEnabled} onChange={() => toggle("soundEnabled")} className="w-5 h-5 accent-orange-600" />
              </label>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="font-bold text-slate-900 dark:text-white mb-4">E-posta bildirimleri</h2>
              {emailToggles.map((item) => (
                <label key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-sm">{item.label}</span>
                  <input type="checkbox" checked={Boolean(prefs[item.key])} onChange={() => toggle(item.key)} className="w-5 h-5 accent-orange-600" />
                </label>
              ))}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">E-posta özeti</label>
                <select
                  value={prefs.emailDigest}
                  onChange={(e) => setPrefs((p) => ({ ...p, emailDigest: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="never">Gönderme</option>
                  <option value="daily">Günlük</option>
                  <option value="weekly">Haftalık</option>
                </select>
              </div>
            </section>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-500 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Kaydet
            </button>
          </form>
        )}

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white text-sm rounded-lg shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </ForumShell>
  );
}
