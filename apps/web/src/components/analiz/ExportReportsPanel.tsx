'use client';

import { motion } from 'framer-motion';
import { Download, FileJson, FileText, Mail, Share2 } from 'lucide-react';
import {
  downloadCsvReport,
  downloadJsonReport,
  downloadTextReport,
  shareAnalysisUrl,
  type ExportableAnalysis,
} from '@/lib/analysis-export';

const cardClass =
  'bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:shadow-xl hover:border-orange-500/20 transition-all';

export function ExportReportsPanel({ data }: { data: ExportableAnalysis }) {
  const handleShare = async () => {
    const ok = await shareAnalysisUrl(data.url);
    if (!ok) window.alert('Link panoya kopyalandı.');
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[32px] p-6 md:p-8">
      <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <Download className="text-orange-500" size={24} />
        Raporlar & Export
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        Gerçek analiz verilerinizi indirin veya paylaşın
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          onClick={() => downloadTextReport(data)}
          className={cardClass}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-3 shadow-lg">
            <FileText className="text-white" size={24} />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-1">Metin Raporu</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Özet metrikler ve ürün listesi</p>
          <span className="px-4 py-2 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold">
            İndir (.txt)
          </span>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          onClick={() => downloadCsvReport(data)}
          className={cardClass}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3 shadow-lg">
            <FileJson className="text-white" size={24} />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-1">Ürün Tablosu</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Excel uyumlu CSV</p>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold">
            İndir (.csv)
          </span>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          onClick={() => downloadJsonReport(data)}
          className={cardClass}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-3 shadow-lg">
            <Mail className="text-white" size={24} />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-1">Tam Veri (JSON)</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Tüm metrikler ve kaynaklar</p>
          <span className="px-4 py-2 bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-bold">
            İndir (.json)
          </span>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          onClick={handleShare}
          className={cardClass}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 shadow-lg">
            <Share2 className="text-white" size={24} />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-1">Paylaş</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Analiz linkini paylaş veya kopyala</p>
          <span className="px-4 py-2 bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold">
            Paylaş
          </span>
        </motion.button>
      </div>
    </div>
  );
}
