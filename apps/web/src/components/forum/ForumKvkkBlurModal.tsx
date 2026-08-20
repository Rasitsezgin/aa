'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ShieldAlert, EyeOff, Upload, Download, Check, X,
  RotateCcw, Sparkles, Image as ImageIcon
} from 'lucide-react';

interface ForumKvkkBlurModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageMasked?: (dataUrl: string) => void;
}

export default function ForumKvkkBlurModal({
  isOpen,
  onClose,
  onImageMasked,
}: ForumKvkkBlurModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState<number>(25);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  }, [imageSrc]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Siyah buzlama / gizleme kutusu
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleReset = () => {
    if (!imageRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(imageRef.current, 0, 0);
  };

  const handleConfirm = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
    if (onImageMasked) {
      onImageMasked(dataUrl);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                KVKK & Gizlilik Maskeleme Aracı
              </h3>
              <p className="text-[11px] text-slate-400">
                Ekran görüntünüzdeki müşteri adı, telefon ve hassas tutarları gizleyin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!imageSrc ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center space-y-3 hover:border-orange-500 transition-colors">
              <ImageIcon size={48} className="mx-auto text-slate-400 opacity-60" />
              <div>
                <p className="font-bold text-sm text-slate-700 dark:text-slate-200">
                  Panel Ekran Görüntüsünü Yükleyin
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  PNG, JPG veya WebP dosyası seçin
                </p>
              </div>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-all">
                <Upload size={14} /> Dosya Seç
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex items-center justify-between gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    Fırça Boyutu:
                  </span>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="accent-orange-500 w-24"
                  />
                  <span className="font-mono text-slate-500">{brushSize}px</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-medium inline-flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Sıfırla
                  </button>
                  <label className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-medium cursor-pointer inline-flex items-center gap-1">
                    <Upload size={12} /> Farklı Görsel
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Canvas Area */}
              <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[450px]">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDraw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onMouseMove={draw}
                  className="max-w-full max-h-[450px] object-contain cursor-crosshair"
                />
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                💡 Fare ile gizlemek istediğiniz isim veya barkodların üzerini boyayın.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {imageSrc && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <Check size={14} /> Foruma Güvenle Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
