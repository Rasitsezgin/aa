'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Mail, Smartphone, ShoppingCart, Package, Zap, ArrowLeft, Save, Loader2 } from 'lucide-react';

const prefs = [
  { id: 'orders', label: 'Yeni sipariş', desc: 'Sipariş oluşturulduğunda', icon: ShoppingCart, email: true, push: true },
  { id: 'stock', label: 'Stok uyarıları', desc: 'Kritik stok seviyesi', icon: Package, email: true, push: true },
  { id: 'sync', label: 'Senkron hataları', desc: 'Entegrasyon başarısız olduğunda', icon: Zap, email: true, push: false },
  { id: 'marketing', label: 'Pazarlama', desc: 'Kampanya ve öneriler', icon: Mail, email: false, push: false },
];

type PrefsMap = Record<string, { email: boolean; push: boolean }>;

export default function NotificationPreferencesPage() {
  const [settings, setSettings] = useState<PrefsMap>(() =>
    Object.fromEntries(prefs.map((p) => [p.id, { email: p.email, push: p.push }])),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings/notifications', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') setSettings(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string, channel: 'email' | 'push') => {
    setSettings((prev) => ({
      ...prev,
      [id]: { ...prev[id], [channel]: !prev[id][channel] },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/settings" className="p-2 rounded-xl border border-border bg-surface">
          <ArrowLeft className="w-4 h-4 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground">Bildirim Tercihleri</h1>
          <p className="text-sm text-slate-500">E-posta ve push bildirimlerini yönetin</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
          Yükleniyor...
        </div>
      ) : (
        <div className="space-y-3">
          {prefs.map((pref) => {
            const Icon = pref.icon;
            const s = settings[pref.id] || { email: false, push: false };
            return (
              <div key={pref.id} className="p-4 bg-surface border border-border rounded-2xl">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{pref.label}</p>
                    <p className="text-xs text-slate-500">{pref.desc}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={s.email} onChange={() => toggle(pref.id, 'email')} className="rounded" />
                    <Mail className="w-4 h-4 text-slate-400" /> E-posta
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={s.push} onChange={() => toggle(pref.id, 'push')} className="rounded" />
                    <Smartphone className="w-4 h-4 text-slate-400" /> Push
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || loading}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-500 disabled:opacity-60 transition-all"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saved ? 'Kaydedildi' : 'Tercihleri Kaydet'}
      </button>

      <Link
        href="/dashboard/notification-center"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border bg-surface text-sm font-bold text-orange-600 hover:border-orange-500/30 transition-all"
      >
        <Bell className="w-4 h-4" />
        Bildirim Merkezine Git
      </Link>
    </div>
  );
}
