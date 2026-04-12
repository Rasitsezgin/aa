"use client";

import React, { useState } from 'react';
import { useEditor } from '../EditorContext';

interface FramePreset {
  id: string;
  name: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  style: 'solid' | 'double' | 'dashed' | 'polaroid' | 'shadow' | 'glow' | 'vintage';
  padding?: number;
  innerColor?: string;
  outerGlow?: string;
}

const FRAME_PRESETS: FramePreset[] = [
  { id: 'classic-black', name: 'Klasik Siyah', borderColor: '#1a1a1a', borderWidth: 12, borderRadius: 0, style: 'solid' },
  { id: 'classic-white', name: 'Klasik Beyaz', borderColor: '#ffffff', borderWidth: 12, borderRadius: 0, style: 'solid' },
  { id: 'gold-frame', name: 'Altın Çerçeve', borderColor: '#d4a853', borderWidth: 14, borderRadius: 0, style: 'double', innerColor: '#b8941f' },
  { id: 'silver-frame', name: 'Gümüş Çerçeve', borderColor: '#c0c0c0', borderWidth: 14, borderRadius: 0, style: 'double', innerColor: '#a0a0a0' },
  { id: 'wood-frame', name: 'Ahşap Çerçeve', borderColor: '#8B4513', borderWidth: 16, borderRadius: 0, style: 'double', innerColor: '#A0522D' },
  { id: 'rounded-soft', name: 'Yumuşak Köşe', borderColor: '#ffffff', borderWidth: 10, borderRadius: 24, style: 'solid' },
  { id: 'rounded-bold', name: 'Kalın Yumuşak', borderColor: '#1a1a1a', borderWidth: 20, borderRadius: 32, style: 'solid' },
  { id: 'polaroid', name: 'Polaroid', borderColor: '#ffffff', borderWidth: 16, borderRadius: 4, style: 'polaroid', padding: 60 },
  { id: 'polaroid-vintage', name: 'Vintage Polaroid', borderColor: '#f5f0e0', borderWidth: 16, borderRadius: 4, style: 'polaroid', padding: 60 },
  { id: 'shadow-soft', name: 'Yumuşak Gölge', borderColor: 'transparent', borderWidth: 0, borderRadius: 12, style: 'shadow', outerGlow: 'rgba(0,0,0,0.3)' },
  { id: 'shadow-hard', name: 'Keskin Gölge', borderColor: 'transparent', borderWidth: 0, borderRadius: 0, style: 'shadow', outerGlow: 'rgba(0,0,0,0.5)' },
  { id: 'glow-blue', name: 'Mavi Işıltı', borderColor: '#3b82f6', borderWidth: 4, borderRadius: 12, style: 'glow', outerGlow: '#3b82f6' },
  { id: 'glow-gold', name: 'Altın Işıltı', borderColor: '#f59e0b', borderWidth: 4, borderRadius: 12, style: 'glow', outerGlow: '#f59e0b' },
  { id: 'glow-purple', name: 'Mor Işıltı', borderColor: '#8b5cf6', borderWidth: 4, borderRadius: 12, style: 'glow', outerGlow: '#8b5cf6' },
  { id: 'glow-pink', name: 'Pembe Işıltı', borderColor: '#ec4899', borderWidth: 4, borderRadius: 12, style: 'glow', outerGlow: '#ec4899' },
  { id: 'vintage-dark', name: 'Vintage Koyu', borderColor: '#3d2b1f', borderWidth: 18, borderRadius: 0, style: 'vintage', innerColor: '#5c3d2e' },
  { id: 'dashed-fun', name: 'Kesikli Eğlenceli', borderColor: '#ef4444', borderWidth: 5, borderRadius: 16, style: 'dashed' },
  { id: 'double-elegant', name: 'Çift Çizgi Zarif', borderColor: '#1a1a1a', borderWidth: 3, borderRadius: 0, style: 'double', innerColor: '#666666' },
];

// Dekoratif kenar süsleri
const DECORATIVE_BORDERS = [
  { id: 'corner-ornament', name: 'Köşe Süsü', emoji: '🔲' },
  { id: 'wave-border', name: 'Dalga Kenar', emoji: '🌊' },
  { id: 'star-border', name: 'Yıldız Kenar', emoji: '⭐' },
  { id: 'heart-border', name: 'Kalp Kenar', emoji: '❤️' },
  { id: 'leaf-border', name: 'Yaprak Kenar', emoji: '🍃' },
  { id: 'dot-border', name: 'Nokta Kenar', emoji: '⚪' },
];

export default function FramesPanel() {
  const { addShape, addText, canvasSize } = useEditor();
  const [selectedCategory, setSelectedCategory] = useState<'frames' | 'decorative'>('frames');

  const handleApplyFrame = (frame: FramePreset) => {
    const w = canvasSize?.width || 800;
    const h = canvasSize?.height || 600;

    if (frame.style === 'polaroid') {
      // Polaroid çerçeve: beyaz kenarlık, altında boşluk
      const pad = frame.borderWidth;
      const bottomPad = frame.padding || 60;
      // Üst beyaz çerçeve - tam kanvas kaplayan rectangle
      addShape('rectangle', {
        width: w,
        height: h,
        fill: 'transparent',
        stroke: frame.borderColor,
        strokeWidth: pad,
        rx: frame.borderRadius,
        ry: frame.borderRadius,
        left: w / 2,
        top: h / 2,
        selectable: true,
      });
      // Alt beyaz bant
      addShape('rectangle', {
        width: w,
        height: bottomPad,
        fill: frame.borderColor,
        stroke: 'transparent',
        strokeWidth: 0,
        left: w / 2,
        top: h - bottomPad / 2,
        selectable: true,
      });
    } else if (frame.style === 'double') {
      // Çift çizgi - dış + iç
      addShape('rectangle', {
        width: w - 8,
        height: h - 8,
        fill: 'transparent',
        stroke: frame.borderColor,
        strokeWidth: frame.borderWidth,
        rx: frame.borderRadius,
        ry: frame.borderRadius,
        left: w / 2,
        top: h / 2,
        selectable: true,
      });
      setTimeout(() => {
        addShape('rectangle', {
          width: w - frame.borderWidth * 2 - 16,
          height: h - frame.borderWidth * 2 - 16,
          fill: 'transparent',
          stroke: frame.innerColor || frame.borderColor,
          strokeWidth: Math.max(2, frame.borderWidth / 3),
          rx: frame.borderRadius,
          ry: frame.borderRadius,
          left: w / 2,
          top: h / 2,
          selectable: true,
        });
      }, 80);
    } else if (frame.style === 'glow') {
      addShape('rectangle', {
        width: w - 20,
        height: h - 20,
        fill: 'transparent',
        stroke: frame.borderColor,
        strokeWidth: frame.borderWidth,
        rx: frame.borderRadius,
        ry: frame.borderRadius,
        left: w / 2,
        top: h / 2,
        selectable: true,
        shadow: { color: frame.outerGlow || frame.borderColor, blur: 25, offsetX: 0, offsetY: 0 },
      });
    } else if (frame.style === 'shadow') {
      addShape('rectangle', {
        width: w - 40,
        height: h - 40,
        fill: 'transparent',
        stroke: '#ffffff',
        strokeWidth: 2,
        rx: frame.borderRadius,
        ry: frame.borderRadius,
        left: w / 2,
        top: h / 2,
        selectable: true,
        shadow: { color: frame.outerGlow || 'rgba(0,0,0,0.4)', blur: 20, offsetX: 5, offsetY: 5 },
      });
    } else if (frame.style === 'vintage') {
      addShape('rectangle', {
        width: w - 4,
        height: h - 4,
        fill: 'transparent',
        stroke: frame.borderColor,
        strokeWidth: frame.borderWidth,
        rx: 0,
        ry: 0,
        left: w / 2,
        top: h / 2,
        selectable: true,
      });
      setTimeout(() => {
        addShape('rectangle', {
          width: w - frame.borderWidth * 2 - 8,
          height: h - frame.borderWidth * 2 - 8,
          fill: 'transparent',
          stroke: frame.innerColor || '#5c3d2e',
          strokeWidth: 3,
          rx: 0,
          ry: 0,
          left: w / 2,
          top: h / 2,
          selectable: true,
        });
      }, 80);
    } else {
      // solid, dashed
      addShape('rectangle', {
        width: w - 8,
        height: h - 8,
        fill: 'transparent',
        stroke: frame.borderColor,
        strokeWidth: frame.borderWidth,
        rx: frame.borderRadius,
        ry: frame.borderRadius,
        left: w / 2,
        top: h / 2,
        selectable: true,
        ...(frame.style === 'dashed' ? { strokeDashArray: [12, 8] } : {}),
      });
    }
  };

  const handleDecorativeBorder = (borderId: string) => {
    const w = canvasSize?.width || 800;
    const h = canvasSize?.height || 600;
    const cornerSize = 30;

    if (borderId === 'corner-ornament') {
      const corners = [
        { x: 30, y: 30 }, { x: w - 30, y: 30 },
        { x: 30, y: h - 30 }, { x: w - 30, y: h - 30 },
      ];
      corners.forEach((pos, i) => {
        setTimeout(() => {
          addText('✦', {
            fontSize: cornerSize,
            fill: '#d4a853',
            left: pos.x,
            top: pos.y,
            textAlign: 'center',
          });
        }, i * 60);
      });
    } else if (borderId === 'dot-border') {
      const spacing = 40;
      const dots: { x: number; y: number }[] = [];
      for (let x = spacing; x < w; x += spacing) { dots.push({ x, y: 10 }); dots.push({ x, y: h - 10 }); }
      for (let y = spacing; y < h - spacing; y += spacing) { dots.push({ x: 10, y }); dots.push({ x: w - 10, y }); }
      dots.slice(0, 40).forEach((pos, i) => {
        setTimeout(() => {
          addShape('circle', {
            radius: 4,
            fill: '#d4a853',
            left: pos.x,
            top: pos.y,
            selectable: true,
          });
        }, i * 30);
      });
    } else {
      const emojiMap: Record<string, string> = {
        'wave-border': '〰️',
        'star-border': '✦',
        'heart-border': '♥',
        'leaf-border': '🍃',
      };
      const emoji = emojiMap[borderId] || '●';
      const count = 12;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = w / 2 + (w / 2 - 30) * Math.cos(angle);
        const y = h / 2 + (h / 2 - 30) * Math.sin(angle);
        setTimeout(() => {
          addText(emoji, { fontSize: 20, left: x, top: y, textAlign: 'center' });
        }, i * 50);
      }
    }
  };

  const renderFramePreview = (frame: FramePreset) => {
    const borderStyle = frame.style === 'dashed' ? 'dashed' : 'solid';
    const outerBorder = frame.borderColor === 'transparent' ? '2px solid #444' : `${Math.min(frame.borderWidth, 6)}px ${borderStyle} ${frame.borderColor}`;

    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ borderRadius: Math.min(frame.borderRadius, 12) }}>
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            border: outerBorder,
            borderRadius: Math.min(frame.borderRadius, 12),
            ...(frame.style === 'glow' ? { boxShadow: `0 0 12px ${frame.outerGlow}` } : {}),
            ...(frame.style === 'shadow' ? { boxShadow: `3px 3px 10px ${frame.outerGlow || 'rgba(0,0,0,0.4)'}` } : {}),
            ...(frame.style === 'polaroid' ? { borderBottom: `${Math.min(frame.padding || 20, 18)}px solid ${frame.borderColor}` } : {}),
          }}
        >
          <div className="w-3/4 h-1/2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-sm" />
        </div>
        {frame.style === 'double' && (
          <div className="absolute inset-[6px] border border-slate-500 pointer-events-none" style={{ borderRadius: Math.min(frame.borderRadius, 8) }} />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Kategori Seçimi */}
      <div className="flex gap-1 p-3">
        <button
          onClick={() => setSelectedCategory('frames')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
            selectedCategory === 'frames' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-slate-700'
          }`}
        >
          🖼️ Çerçeveler
        </button>
        <button
          onClick={() => setSelectedCategory('decorative')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
            selectedCategory === 'decorative' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-slate-700'
          }`}
        >
          ✨ Dekoratif
        </button>
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* İçerik */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {selectedCategory === 'frames' && (
          <div className="grid grid-cols-2 gap-2">
            {FRAME_PRESETS.map(frame => (
              <button
                key={frame.id}
                onClick={() => handleApplyFrame(frame)}
                className="flex flex-col gap-1.5 p-2 rounded-lg border border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                {renderFramePreview(frame)}
                <span className="text-[10px] text-slate-400 group-hover:text-white text-center truncate w-full">{frame.name}</span>
              </button>
            ))}
          </div>
        )}

        {selectedCategory === 'decorative' && (
          <div className="grid grid-cols-2 gap-2">
            {DECORATIVE_BORDERS.map(border => (
              <button
                key={border.id}
                onClick={() => handleDecorativeBorder(border.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <span className="text-3xl">{border.emoji}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-white">{border.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
