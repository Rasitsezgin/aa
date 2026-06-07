"use client";

import { useEffect, useState } from "react";
import { Calendar, Plus, Trash2, Video, Users, Save } from "lucide-react";

interface AdminEvent {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  startAt: string;
  endAt?: string | null;
  isOnline: boolean;
  location?: string | null;
  meetingUrl?: string | null;
  maxAttendees?: number | null;
  status: string;
  attendeeCount: number;
}

const emptyForm = {
  title: "",
  description: "",
  type: "webinar",
  startAt: "",
  endAt: "",
  isOnline: true,
  location: "",
  meetingUrl: "",
  maxAttendees: "",
};

export default function CommunityEventsAdminPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/community/events");
      if (res.ok) {
        setEvents(await res.json());
      }
    } catch (error) {
      console.error("Events fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/community/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : null,
        }),
      });

      if (res.ok) {
        setForm(emptyForm);
        setShowForm(false);
        await fetchEvents();
      } else {
        const data = await res.json();
        alert(data.error || "Etkinlik oluşturulamadı");
      }
    } catch {
      alert("Etkinlik oluşturulurken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Bu etkinliği iptal etmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/admin/community/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchEvents();
      }
    } catch {
      alert("İptal işlemi başarısız");
    }
  };

  if (loading) {
    return <div className="p-8">Yükleniyor...</div>;
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Topluluk Etkinlikleri</h1>
          <p className="text-slate-500 mt-1">Community sayfasında görünen etkinlikleri yönetin</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
        >
          <Plus size={16} />
          Yeni Etkinlik
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Başlık</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Açıklama</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tür</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800"
              >
                <option value="webinar">Webinar</option>
                <option value="workshop">Workshop</option>
                <option value="meetup">Meetup</option>
                <option value="ama">AMA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kontenjan (boş = sınırsız)</label>
              <input
                type="number"
                min={1}
                value={form.maxAttendees}
                onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Başlangıç</label>
              <input
                required
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bitiş (opsiyonel)</label>
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Konum / Platform</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Zoom, İstanbul, vb."
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Toplantı linki</label>
              <input
                value={form.meetingUrl}
                onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isOnline}
              onChange={(e) => setForm({ ...form, isOnline: e.target.checked })}
            />
            Online etkinlik
          </label>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Kaydediliyor..." : "Etkinliği Yayınla"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border border-dashed rounded-xl">
            <Calendar size={32} className="mx-auto mb-2 opacity-50" />
            Henüz etkinlik yok
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-start justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                  {event.isOnline ? <Video size={18} /> : <Users size={18} />}
                </div>
                <div>
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-sm text-slate-500">
                    {new Date(event.startAt).toLocaleString("tr-TR")} • {event.attendeeCount} katılımcı
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
                    event.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>
              {event.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={() => handleCancel(event.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="İptal et"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
