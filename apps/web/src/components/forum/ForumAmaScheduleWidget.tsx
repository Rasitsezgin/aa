'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, Video, UserCheck, Bell, CheckCircle,
  Sparkles, ArrowRight, MessageSquare
} from 'lucide-react';

interface AmaSession {
  id: string;
  expertName: string;
  expertRole: string;
  topic: string;
  dateStr: string;
  timeStr: string;
  isLiveNow: boolean;
  avatarLetter: string;
  badge: string;
}

const UPCOMING_AMA: AmaSession = {
  id: 'ama-2025-01',
  expertName: 'Kemal Tekin (SMMM)',
  expertRole: 'E-Ticaret Mali Müşaviri & Vergi Danışmanı',
  topic: '2025 E-Ticaret Vergi Tevkifatı, Genç Girişimci İstisnası ve Denetim Süreçleri',
  dateStr: 'Bu Perşembe',
  timeStr: '20:00 - 21:30',
  isLiveNow: false,
  avatarLetter: 'K',
  badge: 'Canlı Soru - Cevap',
};

export default function ForumAmaScheduleWidget() {
  const [hasSubscribed, setHasSubscribed] = useState(false);

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-900/5 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-950 rounded-2xl border border-amber-500/30 p-4 sm:p-5 shadow-xs relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
            <Video size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                Haftalık &quot;Uzmana Sor&quot; (AMA)
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase">
                Canlı
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Sektör liderleri sorularınızı canlı yanıtlıyor
            </span>
          </div>
        </div>
      </div>

      {/* AMA Card Details */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3.5 border border-amber-500/20 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
            {UPCOMING_AMA.avatarLetter}
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
              {UPCOMING_AMA.expertName}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {UPCOMING_AMA.expertRole}
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 border-t border-slate-100 dark:border-slate-800 pt-2">
          &quot;{UPCOMING_AMA.topic}&quot;
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-amber-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">{UPCOMING_AMA.dateStr}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-amber-500" />
            <span>{UPCOMING_AMA.timeStr}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setHasSubscribed(!hasSubscribed)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
            hasSubscribed
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
          }`}
        >
          {hasSubscribed ? (
            <>
              <CheckCircle size={14} /> Hatırlatıcı Eklendi
            </>
          ) : (
            <>
              <Bell size={14} /> Hatırlatıcı Kur (SMS/Mail)
            </>
          )}
        </button>

        <Link
          href="/forum/topic/e-ticarette-genc-girisimci-istisnasi-sahis-sirketi-ve-vergi-tevkifati-2024-2026-rehberi"
          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-orange-600 transition-colors inline-flex items-center gap-1"
        >
          <MessageSquare size={13} /> Soru Bırak
        </Link>
      </div>
    </div>
  );
}
