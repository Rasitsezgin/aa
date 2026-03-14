"use client";

import React, { useState, useEffect } from 'react';
import {
  Megaphone, AlertTriangle, Bell, Clock, Send, Trash2, History,
  Power, Eye, Calendar, CheckCircle, XCircle
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  targetAudience: 'all' | 'paying' | 'trial';
  createdAt: string;
  expiresAt: string | null;
  sent: boolean;
}

interface MaintenanceMode {
  enabled: boolean;
  message: string;
  expectedEndTime: string | null;
  allowedIps: string[];
  lastUpdated: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceMode>({
    enabled: false,
    message: 'Sistemimiz şu anda bakım modundadır. Kısa süre içinde tekrar erişilebilir olacaktır.',
    expectedEndTime: null,
    allowedIps: [],
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'critical',
    targetAudience: 'all' as 'all' | 'paying' | 'trial',
    expiresAt: '',
  });
  const [showMaintenanceEdit, setShowMaintenanceEdit] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({ ...maintenance });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [announcementsRes, maintenanceRes] = await Promise.all([
        fetch('/api/admin/announcements'),
        fetch('/api/admin/maintenance'),
      ]);
      const announcementsData = await announcementsRes.json();
      const maintenanceData = await maintenanceRes.json();
      setAnnouncements(announcementsData);
      setMaintenance(maintenanceData);
    } catch (error) {
      // Mock data
      setAnnouncements([
        { id: '1', title: 'Yeni Özellik!', message: 'AI Fiyat Optimizasyonu artık kullanılabilir.', type: 'info', targetAudience: 'all', createdAt: new Date().toISOString(), expiresAt: null, sent: true },
        { id: '2', title: 'Planlı Bakım', message: 'Bu hafta sonu 02:00-04:00 arası bakım yapılacaktır.', type: 'warning', targetAudience: 'all', createdAt: new Date(Date.now() - 86400000).toISOString(), expiresAt: null, sent: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) return;

    setSending(true);
    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnnouncement),
      });
      const data = await res.json();
      setAnnouncements(prev => [{
        id: data.id || Date.now().toString(),
        ...newAnnouncement,
        createdAt: new Date().toISOString(),
        expiresAt: newAnnouncement.expiresAt || null,
        sent: true,
      }, ...prev]);
    } catch (error) {
      setAnnouncements(prev => [{
        id: Date.now().toString(),
        ...newAnnouncement,
        createdAt: new Date().toISOString(),
        expiresAt: newAnnouncement.expiresAt || null,
        sent: true,
      }, ...prev]);
    } finally {
      setSending(false);
      setShowNewAnnouncement(false);
      setNewAnnouncement({ title: '', message: '', type: 'info', targetAudience: 'all', expiresAt: '' });
    }
  };

  const toggleMaintenance = async () => {
    const newEnabled = !maintenance.enabled;
    try {
      await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...maintenance, enabled: newEnabled }),
      });
    } catch (error) { }
    setMaintenance(prev => ({ ...prev, enabled: newEnabled, lastUpdated: new Date().toISOString() }));
  };

  const updateMaintenance = async () => {
    try {
      await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenanceForm),
      });
    } catch (error) { }
    setMaintenance({ ...maintenanceForm, lastUpdated: new Date().toISOString() });
    setShowMaintenanceEdit(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const typeConfig = {
    info: { label: 'Bilgi', color: 'bg-blue-500/10 text-blue-600', icon: <Bell size={16} /> },
    warning: { label: 'Uyarı', color: 'bg-yellow-500/10 text-yellow-600', icon: <AlertTriangle size={16} /> },
    critical: { label: 'Kritik', color: 'bg-red-500/10 text-red-600', icon: <AlertTriangle size={16} /> },
  };

  const audienceConfig = {
    all: 'Tüm Kullanıcılar',
    paying: 'Ödeme Yapan',
    trial: 'Deneme Sürecinde',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <Megaphone className="w-6 h-6 text-orange-500" />
            </div>
            Duyurular & Bakım Modu
          </h1>
          <p className="text-slate-500 mt-1">Platform genelinde duyurular gönderin ve bakım modunu yönetin</p>
        </div>
        <button
          onClick={() => setShowNewAnnouncement(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition-colors"
        >
          <Send size={16} />
          Yeni Duyuru
        </button>
      </div>

      {/* Maintenance Mode Card */}
      <div className={`rounded-2xl border-2 p-6 ${maintenance.enabled
          ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-500/30'
          : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5'
        }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${maintenance.enabled ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <Power size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground flex items-center gap-3">
                Bakım Modu
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${maintenance.enabled ? 'bg-red-500 text-white' : 'bg-green-500/10 text-green-600'
                  }`}>
                  {maintenance.enabled ? 'AKTİF' : 'KAPALI'}
                </span>
              </h3>
              <p className="text-slate-500 mt-1">{maintenance.message}</p>
              {maintenance.expectedEndTime && (
                <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                  <Clock size={14} />
                  Tahmini bitiş: {formatDate(maintenance.expectedEndTime)}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setMaintenanceForm({ ...maintenance }); setShowMaintenanceEdit(true); }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Ayarlar
            </button>
            <button
              onClick={toggleMaintenance}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${maintenance.enabled
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
                }`}
            >
              {maintenance.enabled ? 'Devre Dışı Bırak' : 'Etkinleştir'}
            </button>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/5 flex items-center gap-2">
          <History size={18} />
          <h3 className="font-bold text-foreground">Duyuru Geçmişi</h3>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-white/5">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${typeConfig[announcement.type].color}`}>
                      {typeConfig[announcement.type].icon}
                      {typeConfig[announcement.type].label}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                      {audienceConfig[announcement.targetAudience]}
                    </span>
                    {announcement.sent && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle size={14} />
                        Gönderildi
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-foreground">{announcement.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{announcement.message}</p>
                  <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(announcement.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Henüz duyuru gönderilmedi</p>
            </div>
          )}
        </div>
      </div>

      {/* New Announcement Modal */}
      {showNewAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewAnnouncement(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl text-foreground mb-6">Yeni Duyuru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Başlık *</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="Duyuru başlığı..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Mesaj *</label>
                <textarea
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                  placeholder="Duyuru içeriği..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Tür</label>
                  <select
                    value={newAnnouncement.type}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="info">Bilgi</option>
                    <option value="warning">Uyarı</option>
                    <option value="critical">Kritik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Hedef</label>
                  <select
                    value={newAnnouncement.targetAudience}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, targetAudience: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">Tüm Kullanıcılar</option>
                    <option value="paying">Ödeme Yapanlar</option>
                    <option value="trial">Deneme Sürecinde</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Bitiş Tarihi (opsiyonel)</label>
                <input
                  type="datetime-local"
                  value={newAnnouncement.expiresAt}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiresAt: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewAnnouncement(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                İptal
              </button>
              <button
                onClick={sendAnnouncement}
                disabled={sending || !newAnnouncement.title || !newAnnouncement.message}
                className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send size={16} />
                    Gönder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Settings Modal */}
      {showMaintenanceEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowMaintenanceEdit(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-xl text-foreground mb-6">Bakım Modu Ayarları</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Mesaj</label>
                <textarea
                  value={maintenanceForm.message}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Tahmini Bitiş</label>
                <input
                  type="datetime-local"
                  value={maintenanceForm.expectedEndTime || ''}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, expectedEndTime: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">İzinli IP&apos;ler (virgülle ayrılmış)</label>
                <input
                  type="text"
                  value={maintenanceForm.allowedIps.join(', ')}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, allowedIps: e.target.value.split(',').map(ip => ip.trim()).filter(Boolean) })}
                  placeholder="192.168.1.1, 10.0.0.1"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMaintenanceEdit(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                İptal
              </button>
              <button
                onClick={updateMaintenance}
                className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
