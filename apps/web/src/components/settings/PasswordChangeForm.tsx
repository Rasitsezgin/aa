'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Key, Loader2, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

/** Şifre değiştirme formu — profil ve güvenlik sayfalarında kullanılır */
export function PasswordChangeForm() {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('Şifre hatası', 'Yeni şifre en az 8 karakter olmalıdır');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Şifre hatası', 'Yeni şifreler eşleşmiyor');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Şifre değiştirilemedi');
      }

      toast.success('Başarılı', data.message || 'Şifreniz güncellendi');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Hata', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Key className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Şifre Değiştir</h3>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Mevcut Şifre
        </label>
        <div className="relative">
          <input
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary pr-12"
            placeholder="Mevcut şifreniz"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Yeni Şifre
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary pr-12"
              placeholder="En az 8 karakter"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Yeni Şifre (Tekrar)
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary"
            placeholder="Yeni şifreyi tekrar girin"
          />
        </div>
      </div>

      <p className="text-xs text-slate-500 flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5" />
        Güçlü bir şifre için harf, rakam ve özel karakter kullanın.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-60 transition-all"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        Şifreyi Güncelle
      </button>
    </form>
  );
}
