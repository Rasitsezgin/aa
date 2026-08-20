'use client';

import { useState } from 'react';
import {
  Sparkles, Bot, CheckCircle2, ChevronDown, RefreshCw,
  ThumbsUp, MessageSquare, ArrowRight, ExternalLink, Zap
} from 'lucide-react';

interface ForumAiAssistantWidgetProps {
  topicTitle?: string;
  topicBoard?: string;
  initialSummary?: string;
  keyPoints?: string[];
  recommendedTool?: {
    name: string;
    description: string;
    url: string;
  };
}

export default function ForumAiAssistantWidget({
  topicTitle,
  topicBoard,
  initialSummary,
  keyPoints,
  recommendedTool,
}: ForumAiAssistantWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasFeedback, setHasFeedback] = useState<'yes' | 'no' | null>(null);

  const summaryText = initialSummary || (
    topicTitle
      ? `Bu konu ${topicBoard || 'pazaryeri'} operasyonunda satıcıların sık karşılaştığı algoritmik ve maliyet hesaplamalarını ele almaktadır. Yapılan topluluk analizine göre en kritik faktör doğru maliyet baremi ve canlı stok takibidir.`
      : "Pazaryonetimi AI Bot, mevzuat ve platform kurallarını tarayarak sorularınıza anlık ön çözümler üretir."
  );

  const defaultKeyPoints = keyPoints || [
    "Resmi komisyon baremleri ve kargo kesintilerini önceden simüle edin.",
    "Stok 3 ve altındayken Buffer Stock (Güvenlik Stoğu) kuralını devreye alın.",
    "Kötü niyetli iadelerde kamera kayıtları ile 48 saat içinde itiraz edin.",
  ];

  return (
    <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-transparent dark:from-orange-950/20 dark:via-slate-900 dark:to-slate-900 p-4 sm:p-5 shadow-xs relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-sm">
            <Bot size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                Pazaryonetimi AI Asistanı
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-[10px] font-extrabold tracking-wide uppercase">
                Yapay Zeka Özeti
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Resmi mevzuat ve tecrübe havuzundan derlendi
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
        >
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-orange-500/15 pt-3">
          <p>{summaryText}</p>

          {/* Key Bullet Points */}
          <div className="bg-white/80 dark:bg-slate-950/60 rounded-xl p-3 border border-orange-500/20 space-y-2">
            <span className="font-bold text-xs text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
              💡 Kritik Başarı Faktörleri:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {defaultKeyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Tool Bar */}
          {recommendedTool && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-orange-500 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {recommendedTool.name}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {recommendedTool.description}
                  </span>
                </div>
              </div>
              <a
                href={recommendedTool.url}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs shrink-0 transition-colors inline-flex items-center gap-1"
              >
                <span>Kullan</span>
                <ArrowRight size={12} />
              </a>
            </div>
          )}

          {/* Feedback Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-400">
            <span>Bu yapay zeka özeti faydalı oldu mu?</span>
            <div className="flex items-center gap-2">
              {hasFeedback ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Geri bildiriminiz için teşekkürler! 👍
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setHasFeedback('yes')}
                    className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium"
                  >
                    Evet 👍
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasFeedback('no')}
                    className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium"
                  >
                    Hayır 👎
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
