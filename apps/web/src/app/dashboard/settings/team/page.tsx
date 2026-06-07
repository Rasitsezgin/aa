"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Users, ShieldCheck, Mail, UserPlus, LayoutPanelLeft, Loader2,
} from 'lucide-react';

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId?: string;
  lastLogin: string;
};

type RoleRow = {
  id: string;
  name: string;
  description?: string | null;
  count: number;
  permissions: string[];
};

const PERMISSION_LABELS: Record<string, { module: string; desc: string }> = {
  'product:view': { module: 'Ürün Görüntüleme', desc: 'Ürün listesini görebilir.' },
  'product:edit': { module: 'Ürün Düzenleme', desc: 'Ürün bilgilerini güncelleyebilir.' },
  'product:create': { module: 'Ürün Ekleme', desc: 'Yeni ürün oluşturabilir.' },
  'order:view': { module: 'Sipariş Görüntüleme', desc: 'Siparişleri görebilir.' },
  'order:edit': { module: 'Sipariş Düzenleme', desc: 'Sipariş durumunu değiştirebilir.' },
  'order:ship': { module: 'Kargo İşlemleri', desc: 'Kargo ve sevkiyat yönetebilir.' },
  'settings:view': { module: 'Ayarlar', desc: 'Sistem ayarlarını görebilir.' },
  'settings:edit': { module: 'Ayar Düzenleme', desc: 'Sistem ayarlarını değiştirebilir.' },
  'analytics:view': { module: 'Analitik', desc: 'Rapor ve metrikleri görebilir.' },
};

export default function TeamManagementPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/team', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setMembers(data.members || []);
      setRoles(data.roles || []);
      if (!selectedRoleId && data.roles?.[0]?.id) {
        setSelectedRoleId(data.roles[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const roleMembers = useMemo(
    () => members.filter((m) => m.roleId === selectedRoleId || m.role === selectedRole?.name),
    [members, selectedRoleId, selectedRole?.name],
  );

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          name: inviteName.trim(),
          roleId: selectedRoleId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Davet başarısız');
      setMessage(data.message || 'Personel eklendi');
      setInviteOpen(false);
      setInviteEmail('');
      setInviteName('');
      await loadTeam();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const permissionRows = (selectedRole?.permissions || []).map((p) => ({
    key: p,
    ...(PERMISSION_LABELS[p] || { module: p, desc: 'Sistem izni' }),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Ekip yükleniyor...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Ekip ve Rol Yönetimi
          </h1>
          <p className="text-slate-500 mt-2">
            Tenant kullanıcılarını ve rollerini yönetin. Yeni personel ekleyin, rol izinlerini görüntüleyin.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Yeni Personel Ekle
        </button>
      </div>

      {message && (
        <p className="text-sm font-medium text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          {message}
        </p>
      )}

      {inviteOpen && (
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
          <h3 className="font-bold">Yeni Personel</h3>
          <input
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="Ad Soyad"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
          />
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="E-posta"
            type="email"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
          />
          <div className="flex gap-2">
            <button type="button" onClick={handleInvite} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold">
              {saving ? 'Ekleniyor...' : 'Ekle'}
            </button>
            <button type="button" onClick={() => setInviteOpen(false)} className="px-4 py-2 border border-border rounded-xl text-sm">
              İptal
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">Roller</h3>
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleId(role.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                selectedRoleId === role.id
                  ? 'bg-primary/5 border-primary/30 text-primary'
                  : 'bg-surface border-border'
              }`}
            >
              <span className="font-bold text-sm text-left">{role.name}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                {role.count}
              </span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-9 space-y-6">
          {selectedRole && selectedRole.name !== 'Yönetici' && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-4">
              <ShieldCheck className="w-6 h-6 text-indigo-500 shrink-0" />
              <p className="text-sm">
                <strong>{selectedRole.name}</strong> rolünün izinleri veritabanından okunuyor.
              </p>
            </div>
          )}

          <div className="bg-surface border border-border rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <LayoutPanelLeft className="w-5 h-5 text-slate-400" /> İzinler
              </h3>
            </div>
            <div className="divide-y divide-border">
              {permissionRows.length === 0 ? (
                <p className="p-6 text-sm text-slate-500 text-center">Bu role atanmış izin yok.</p>
              ) : (
                permissionRows.map((perm) => (
                  <div key={perm.key} className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{perm.module}</p>
                      <p className="text-xs text-slate-500">{perm.desc}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">Aktif</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold">Personeller ({roleMembers.length})</h3>
            </div>
            <div className="divide-y divide-border">
              {roleMembers.length === 0 ? (
                <p className="p-6 text-sm text-slate-500 text-center">Bu role atanmış personel yok.</p>
              ) : (
                roleMembers.map((member) => (
                  <div key={member.id} className="p-4 px-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{member.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {member.email}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400">
                      Son aktivite: {new Date(member.lastLogin).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
