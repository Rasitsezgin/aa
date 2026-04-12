"use client";

import React, { useState } from 'react';
import { useEditor } from '../EditorContext';
import type { ExportOptions } from '../types';
import {
  Download, Share2, Copy, Store, Instagram, Facebook,
  Twitter, Smartphone, Loader2, Check, ImageIcon,
  MonitorSmartphone, Globe, Send, ArrowUpFromLine,
} from 'lucide-react';

const FORMAT_OPTIONS = [
  { id: 'png' as const, label: 'PNG', desc: 'Şeffaf arka plan destekli, en yüksek kalite', icon: '🖼️' },
  { id: 'jpeg' as const, label: 'JPEG', desc: 'Küçük dosya boyutu, fotoğraflar için ideal', icon: '📷' },
  { id: 'webp' as const, label: 'WebP', desc: 'Modern format, küçük boyut & yüksek kalite', icon: '🌐' },
];

const SCALE_OPTIONS = [
  { value: 1, label: '1x', desc: 'Standart' },
  { value: 2, label: '2x', desc: 'Yüksek çözünürlük' },
  { value: 3, label: '3x', desc: 'Ultra çözünürlük' },
];

interface ShareTarget {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  action: 'download' | 'marketplace' | 'share';
  shareUrl?: string;
}

const SHARE_TARGETS: ShareTarget[] = [
  { id: 'download', label: 'Bilgisayara İndir', icon: Download, color: 'bg-blue-600', action: 'download' },
  { id: 'marketplace', label: 'Pazaryerine Gönder', icon: Store, color: 'bg-emerald-600', action: 'marketplace' },
  { id: 'instagram', label: 'Instagram Story', icon: Instagram, color: 'bg-gradient-to-br from-purple-600 to-pink-500', action: 'share' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-700', action: 'share' },
  { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'bg-slate-800', action: 'share' },
  { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone, color: 'bg-green-600', action: 'share' },
  { id: 'clipboard', label: 'Panoya Kopyala', icon: Copy, color: 'bg-purple-600', action: 'share' },
];

export default function ExportPanel() {
  const { exportCanvas, exportCanvasBlob, canvasSize, setActivePanel } = useEditor();
  const [format, setFormat] = useState<ExportOptions['format']>('png');
  const [quality, setQuality] = useState(0.92);
  const [scale, setScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [productIdForUpload, setProductIdForUpload] = useState('');
  const [showMarketplaceUpload, setShowMarketplaceUpload] = useState(false);

  const exportOptions: ExportOptions = { format, quality, scale };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const dataUrl = await exportCanvas(exportOptions);
      const link = document.createElement('a');
      link.download = `gorsel-${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`;
      link.href = dataUrl;
      link.click();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    setIsExporting(true);
    try {
      const blob = await exportCanvasBlob({ format: 'png', quality: 1, scale });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch {
      alert('Panoya kopyalanamadı. Tarayıcı izni gerekebilir.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToSocial = async (platform: string) => {
    setIsExporting(true);
    try {
      const blob = await exportCanvasBlob(exportOptions);
      const file = new File([blob], `gorsel.${format === 'jpeg' ? 'jpg' : format}`, { type: `image/${format}` });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Düzenlenmiş Görsel',
          text: 'Pazaryönetimi Görsel Editörü ile oluşturuldu',
          files: [file],
        });
      } else {
        // Fallback: İndir
        handleDownload();
      }
    } catch {
      // Kullanıcı paylaşımı iptal etmişse sessizce geç
    } finally {
      setIsExporting(false);
    }
  };

  const handleMarketplaceUpload = async () => {
    if (!productIdForUpload.trim()) return;
    setIsExporting(true);
    try {
      const blob = await exportCanvasBlob({ format: 'png', quality: 1, scale: 1 });
      const formData = new FormData();
      formData.append('image', blob, `product-image-${Date.now()}.png`);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${API_URL}/image-editor/products/${productIdForUpload}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
        setShowMarketplaceUpload(false);
      } else {
        alert('Görsel yüklenemedi. Lütfen tekrar deneyin.');
      }
    } catch {
      alert('Bağlantı hatası. API\'ye erişilemiyor.');
    } finally {
      setIsExporting(false);
    }
  };

  const outputWidth = canvasSize.width * scale;
  const outputHeight = canvasSize.height * scale;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Başarılı export bildirimi */}
      {exportSuccess && (
        <div className="mx-3 mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2">
          <Check size={16} className="text-emerald-400" />
          <span className="text-xs font-medium text-emerald-300">İşlem başarılı!</span>
        </div>
      )}

      {/* Format seçimi */}
      <div className="p-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dosya Formatı</h3>
        <div className="space-y-1.5">
          {FORMAT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setFormat(opt.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left
                ${format === opt.id
                  ? 'border-primary/50 bg-primary/10 ring-1 ring-primary/20'
                  : 'border-slate-700 hover:border-slate-600 hover:bg-white/3'}`}
            >
              <span className="text-lg">{opt.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${format === opt.id ? 'text-primary' : 'text-slate-300'}`}>{opt.label}</p>
                <p className="text-[10px] text-slate-500 truncate">{opt.desc}</p>
              </div>
              {format === opt.id && <Check size={16} className="text-primary shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* Kalite */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kalite</h3>
          <span className="text-xs text-slate-500">{Math.round(quality * 100)}%</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={quality}
          onChange={e => setQuality(parseFloat(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-slate-600">Düşük (küçük dosya)</span>
          <span className="text-[9px] text-slate-600">Yüksek (büyük dosya)</span>
        </div>
      </div>

      {/* Çözünürlük */}
      <div className="px-3 pb-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Çözünürlük</h3>
        <div className="flex gap-1.5">
          {SCALE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setScale(opt.value)}
              className={`flex-1 py-2 px-2 rounded-lg border text-center transition-all
                ${scale === opt.value
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'}`}
            >
              <p className="text-sm font-bold">{opt.label}</p>
              <p className="text-[9px] opacity-60">{opt.desc}</p>
            </button>
          ))}
        </div>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-slate-500">
            Çıktı: <strong className="text-slate-400">{outputWidth} × {outputHeight}px</strong>
          </span>
        </div>
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* Paylaşım hedefleri */}
      <div className="p-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Gönder & Paylaş</h3>
        <div className="space-y-1.5">
          {SHARE_TARGETS.map(target => (
            <button
              key={target.id}
              onClick={() => {
                if (target.id === 'download') handleDownload();
                else if (target.id === 'marketplace') setShowMarketplaceUpload(true);
                else if (target.id === 'clipboard') handleCopyToClipboard();
                else handleShareToSocial(target.id);
              }}
              disabled={isExporting}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-700 hover:border-slate-600 hover:bg-white/3 transition-all group disabled:opacity-50"
            >
              <div className={`w-9 h-9 rounded-lg ${target.color} flex items-center justify-center shrink-0`}>
                {isExporting ? (
                  <Loader2 size={16} className="text-white animate-spin" />
                ) : (
                  <target.icon size={16} className="text-white" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{target.label}</p>
              </div>
              <ArrowUpFromLine size={14} className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Pazaryerine yükleme modal */}
      {showMarketplaceUpload && (
        <div className="mx-3 mb-3 bg-slate-800 border border-emerald-500/30 rounded-xl p-3 space-y-2">
          <h4 className="text-xs font-bold text-emerald-400">Pazaryerine Gönder</h4>
          <p className="text-[10px] text-slate-500">Düzenlenen görseli doğrudan ürüne ekleyin.</p>
          <input
            type="text"
            value={productIdForUpload}
            onChange={e => setProductIdForUpload(e.target.value)}
            placeholder="Ürün ID girin..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleMarketplaceUpload}
              disabled={!productIdForUpload.trim() || isExporting}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Gönder
            </button>
            <button
              onClick={() => setShowMarketplaceUpload(false)}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Kısayollar */}
      <div className="p-3 mt-auto">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3">
          <p className="text-[10px] text-slate-500 space-y-0.5">
            <span className="block">⌨️ <strong>Ctrl+S</strong> → Proje Kaydet</span>
            <span className="block">⌨️ <strong>Ctrl+E</strong> → Dışa Aktar</span>
            <span className="block">⌨️ <strong>Ctrl+Z</strong> → Geri Al</span>
            <span className="block">⌨️ <strong>Ctrl+Shift+Z</strong> → Yinele</span>
          </p>
        </div>
      </div>
    </div>
  );
}
