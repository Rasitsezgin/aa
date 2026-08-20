'use client';

import { useState } from 'react';
import {
  Send, MessageCircle, X, Bell, CheckCircle2, Copy,
  ExternalLink, Smartphone, ShieldCheck
} from 'lucide-react';

interface ForumTelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForumTelegramBotModal({
  isOpen,
  onClose,
}: ForumTelegramBotModalProps) {
  const [copied, setCopied] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'telegram' | 'whatsapp'>('telegram');

  const authCode = "PZR-8942-TOPLULUK";

  const handleCopy = () => {
    navigator.clipboard.writeText(authCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Send size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                Anlık Bildirim & Bot Entegrasyonu
              </h3>
              <p className="text-[11px] text-blue-100">
                Sorunuza cevap geldiğinde anında bildirim alın
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Channel Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedChannel('telegram')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedChannel === 'telegram'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Send size={14} className="text-sky-500" /> Telegram Botu
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannel('whatsapp')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedChannel === 'whatsapp'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <MessageCircle size={14} className="text-emerald-500" /> WhatsApp Grubu
            </button>
          </div>

          {selectedChannel === 'telegram' ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                <span className="font-bold text-sky-800 dark:text-sky-300 block">
                  3 Kolay Adımda Bağlayın:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  <li>Telegram uygulamasında <strong>@PazaryonetimiBot</strong> botunu açın.</li>
                  <li><strong>/start</strong> komutunu gönderin.</li>
                  <li>Aşağıdaki tek seferlik doğrulama kodunu bota yapıştırın.</li>
                </ol>
              </div>

              {/* Code Box */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Doğrulama Kodunuz
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-sm text-slate-900 dark:text-white text-center">
                    {authCode}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1.5"
                  >
                    {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
              </div>

              <a
                href="https://t.me/PazaryonetimiBot"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 transition-all"
              >
                <span>Telegram Botunu Başlat</span>
                <ExternalLink size={14} />
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                  VIP Satıcı WhatsApp Topluluğu:
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Günün en kritik pazaryeri komisyon değişiklikleri, flaş algoritma güncellemeleri ve sıcak e-ticaret haberleri tek yönlü duyuru kanalımızda.
                </p>
              </div>

              <a
                href="https://chat.whatsapp.com/sample-pazaryonetimi"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>WhatsApp Kanalına Katıl</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
