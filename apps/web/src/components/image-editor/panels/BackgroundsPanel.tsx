"use client";

import React, { useState } from 'react';
import { useEditor } from '../EditorContext';
import { COLOR_PALETTE, GRADIENT_PRESETS, PATTERN_PRESETS } from '../types';
import type { GradientDef, PatternDef } from '../types';
import { Droplets, Palette, Grid3X3, Paintbrush } from 'lucide-react';

type BgTab = 'solid' | 'gradient' | 'pattern';

// SVG pattern generators
function generatePatternSVG(pattern: PatternDef, size: number = 20): string {
  const s = size * pattern.scale;
  switch (pattern.type) {
    case 'dots':
      return `<svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg"><circle cx="${s / 2}" cy="${s / 2}" r="${s / 6}" fill="${pattern.color}"/></svg>`;
    case 'stripes':
      return `<svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${s / 3}" height="${s}" fill="${pattern.color}"/></svg>`;
    case 'grid':
      return `<svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${s}" height="1" fill="${pattern.color}"/><rect x="0" y="0" width="1" height="${s}" fill="${pattern.color}"/></svg>`;
    case 'diagonal':
      return `<svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="${s}" x2="${s}" y2="0" stroke="${pattern.color}" stroke-width="2"/></svg>`;
    case 'checkerboard':
      return `<svg width="${s * 2}" height="${s * 2}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${s}" height="${s}" fill="${pattern.color}"/><rect x="${s}" y="${s}" width="${s}" height="${s}" fill="${pattern.color}"/></svg>`;
    case 'diamond':
      return `<svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg"><polygon points="${s / 2},0 ${s},${s / 2} ${s / 2},${s} 0,${s / 2}" fill="none" stroke="${pattern.color}" stroke-width="1"/></svg>`;
    case 'cross':
      return `<svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg"><line x1="${s / 2}" y1="0" x2="${s / 2}" y2="${s}" stroke="${pattern.color}" stroke-width="1"/><line x1="0" y1="${s / 2}" x2="${s}" y2="${s / 2}" stroke="${pattern.color}" stroke-width="1"/></svg>`;
    default:
      return `<svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg"><circle cx="${s / 2}" cy="${s / 2}" r="${s / 6}" fill="${pattern.color}"/></svg>`;
  }
}

const SOLID_COLORS = [
  { name: 'Beyaz', color: '#ffffff' },
  { name: 'Açık Gri', color: '#f1f5f9' },
  { name: 'Gri', color: '#94a3b8' },
  { name: 'Koyu', color: '#1e293b' },
  { name: 'Siyah', color: '#000000' },
  { name: 'Krem', color: '#fef9f0' },
  { name: 'Açık Pembe', color: '#fce4ec' },
  { name: 'Açık Mavi', color: '#e3f2fd' },
  { name: 'Açık Yeşil', color: '#ecfdf5' },
  { name: 'Açık Sarı', color: '#fefce8' },
  { name: 'Açık Mor', color: '#f3e8ff' },
  { name: 'Açık Turuncu', color: '#fff7ed' },
  { name: 'Kırmızı', color: '#ef4444' },
  { name: 'Mavi', color: '#3b82f6' },
  { name: 'Yeşil', color: '#22c55e' },
  { name: 'Mor', color: '#8b5cf6' },
  { name: 'Turuncu', color: '#f97316' },
  { name: 'Pembe', color: '#ec4899' },
  { name: 'Turkuaz', color: '#06b6d4' },
  { name: 'Sarı', color: '#eab308' },
  { name: 'Lacivert', color: '#1e3a5f' },
  { name: 'Bordo', color: '#7f1d1d' },
  { name: 'Zümrüt', color: '#065f46' },
  { name: 'Kahverengi', color: '#78350f' },
];

export default function BackgroundsPanel() {
  const { setCanvasBackgroundColor, canvasBackgroundColor, addShape, canvasSize } = useEditor();
  const [activeTab, setActiveTab] = useState<BgTab>('solid');
  const [customColor, setCustomColor] = useState(canvasBackgroundColor);

  const handleGradient = (gradient: GradientDef) => {
    // Gradient'i çubuklara dönüştür (canvas üzerine rect olarak uygula)
    const stops = gradient.stops;
    const stepCount = stops.length;
    const height = canvasSize.height;
    const width = canvasSize.width;

    // Canvas arka planını ilk renkle ayarla
    setCanvasBackgroundColor(stops[0].color);

    // Gradient efekti için şeritler ekle
    const totalSteps = 20;
    for (let i = 0; i < totalSteps; i++) {
      const progress = i / totalSteps;
      // Renk interpolasyonu - basit geçiş
      let colorIdx = 0;
      for (let j = 0; j < stops.length - 1; j++) {
        if (progress >= stops[j].offset && progress <= stops[j + 1].offset) {
          colorIdx = j;
          break;
        }
      }
      const stop1 = stops[colorIdx];
      const stop2 = stops[Math.min(colorIdx + 1, stops.length - 1)];
      const localProgress = stop2.offset === stop1.offset ? 0 : (progress - stop1.offset) / (stop2.offset - stop1.offset);

      const color = interpolateColor(stop1.color, stop2.color, localProgress);

      const isVertical = (gradient.angle || 180) >= 135 && (gradient.angle || 180) <= 225;

      if (isVertical) {
        addShape('rectangle', {
          left: 0,
          top: (height / totalSteps) * i,
          width: width,
          height: height / totalSteps + 1,
          fill: color,
          strokeWidth: 0,
          selectable: false,
          evented: false,
        });
      } else {
        addShape('rectangle', {
          left: (width / totalSteps) * i,
          top: 0,
          width: width / totalSteps + 1,
          height: height,
          fill: color,
          strokeWidth: 0,
          selectable: false,
          evented: false,
        });
      }
    }
  };

  const handlePattern = (pattern: PatternDef) => {
    setCanvasBackgroundColor(pattern.backgroundColor);
    // Overlay pattern rects
    const patternSize = 40 * pattern.scale;
    const cols = Math.ceil(canvasSize.width / patternSize);
    const rows = Math.ceil(canvasSize.height / patternSize);

    // Sadece basit bir pattern overlay kullanalım - max 100 eleman
    const maxElements = 80;
    const step = Math.max(1, Math.floor((cols * rows) / maxElements));

    let count = 0;
    for (let r = 0; r < rows && count < maxElements; r++) {
      for (let c = 0; c < cols && count < maxElements; c++) {
        if ((r * cols + c) % step !== 0) continue;
        count++;

        if (pattern.type === 'dots') {
          addShape('circle', {
            left: c * patternSize + patternSize / 2 - 3,
            top: r * patternSize + patternSize / 2 - 3,
            radius: 3,
            fill: pattern.color,
            strokeWidth: 0,
            selectable: false,
            evented: false,
          });
        } else if (pattern.type === 'checkerboard') {
          if ((r + c) % 2 === 0) {
            addShape('rectangle', {
              left: c * patternSize,
              top: r * patternSize,
              width: patternSize,
              height: patternSize,
              fill: pattern.color,
              strokeWidth: 0,
              selectable: false,
              evented: false,
            });
          }
        }
      }
    }
  };

  const tabs: { id: BgTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'solid', label: 'Düz Renk', icon: Palette },
    { id: 'gradient', label: 'Gradient', icon: Droplets },
    { id: 'pattern', label: 'Desen', icon: Grid3X3 },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Tabs */}
      <div className="flex gap-1 p-3">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-bold rounded-lg transition-colors
              ${activeTab === tab.id ? 'bg-primary/20 text-primary' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* Düz Renk */}
      {activeTab === 'solid' && (
        <div className="p-3 space-y-3">
          {/* Mevcut renk */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg border border-slate-600" style={{ backgroundColor: canvasBackgroundColor }} />
            <span className="text-xs text-slate-400">{canvasBackgroundColor}</span>
          </div>

          {/* Hazır renkler */}
          <h4 className="text-[10px] font-bold text-slate-500 uppercase">Önerilen Renkler</h4>
          <div className="grid grid-cols-6 gap-1.5">
            {SOLID_COLORS.map(c => (
              <button
                key={c.color}
                onClick={() => { setCanvasBackgroundColor(c.color); setCustomColor(c.color); }}
                className={`aspect-square rounded-lg border transition-transform hover:scale-110 ${
                  canvasBackgroundColor === c.color ? 'border-primary ring-2 ring-primary/30' : 'border-slate-600'
                }`}
                style={{ backgroundColor: c.color }}
                title={c.name}
              />
            ))}
          </div>

          <div className="h-px bg-slate-700" />

          {/* Tüm palet */}
          <h4 className="text-[10px] font-bold text-slate-500 uppercase">Renk Paleti</h4>
          <div className="grid grid-cols-10 gap-1">
            {COLOR_PALETTE.map(color => (
              <button
                key={color}
                onClick={() => { setCanvasBackgroundColor(color); setCustomColor(color); }}
                className="w-full aspect-square rounded border border-slate-600/50 hover:scale-125 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="h-px bg-slate-700" />

          {/* Özel renk */}
          <h4 className="text-[10px] font-bold text-slate-500 uppercase">Özel Renk</h4>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={e => { setCustomColor(e.target.value); setCanvasBackgroundColor(e.target.value); }}
              className="w-10 h-10 rounded-lg cursor-pointer border border-slate-600"
            />
            <input
              type="text"
              value={customColor}
              onChange={e => {
                setCustomColor(e.target.value);
                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                  setCanvasBackgroundColor(e.target.value);
                }
              }}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              placeholder="#000000"
            />
          </div>
        </div>
      )}

      {/* Gradient */}
      {activeTab === 'gradient' && (
        <div className="p-3 space-y-3">
          <p className="text-[10px] text-slate-500">Gradient arka plan uygulandığında canvas üzerine şeritler eklenir.</p>
          <div className="grid grid-cols-2 gap-2">
            {GRADIENT_PRESETS.map(gradient => {
              const gradientCSS = gradient.type === 'linear'
                ? `linear-gradient(${gradient.angle || 180}deg, ${gradient.stops.map(s => `${s.color} ${s.offset * 100}%`).join(', ')})`
                : `radial-gradient(circle, ${gradient.stops.map(s => `${s.color} ${s.offset * 100}%`).join(', ')})`;

              return (
                <button
                  key={gradient.id}
                  onClick={() => handleGradient(gradient)}
                  className="flex flex-col rounded-xl overflow-hidden border border-slate-700 hover:border-primary/50 transition-all hover:shadow-md group"
                >
                  <div
                    className="h-16 w-full"
                    style={{ background: gradientCSS }}
                  />
                  <div className="px-2 py-1.5 bg-slate-800/50">
                    <span className="text-[10px] text-slate-300 font-medium">{gradient.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pattern */}
      {activeTab === 'pattern' && (
        <div className="p-3 space-y-3">
          <p className="text-[10px] text-slate-500">Desen arka planları küçük şekiller olarak canvas üzerine eklenir.</p>
          <div className="grid grid-cols-2 gap-2">
            {PATTERN_PRESETS.map(pattern => (
              <button
                key={pattern.id}
                onClick={() => handlePattern(pattern)}
                className="flex flex-col rounded-xl overflow-hidden border border-slate-700 hover:border-primary/50 transition-all group"
              >
                <div
                  className="h-14 w-full"
                  style={{ backgroundColor: pattern.backgroundColor }}
                >
                  {/* Mini pattern preview */}
                  <svg className="w-full h-full" viewBox="0 0 100 56">
                    {pattern.type === 'dots' && Array.from({ length: 5 }, (_, r) =>
                      Array.from({ length: 8 }, (_, c) => (
                        <circle key={`${r}-${c}`} cx={c * 12 + 6} cy={r * 12 + 6} r={2} fill={pattern.color} />
                      ))
                    ).flat()}
                    {pattern.type === 'stripes' && Array.from({ length: 10 }, (_, i) => (
                      <rect key={i} x={i * 10} y={0} width={4} height={56} fill={pattern.color} />
                    ))}
                    {pattern.type === 'grid' && (
                      <>
                        {Array.from({ length: 6 }, (_, i) => (
                          <line key={`h${i}`} x1={0} y1={i * 12} x2={100} y2={i * 12} stroke={pattern.color} strokeWidth={0.5} />
                        ))}
                        {Array.from({ length: 9 }, (_, i) => (
                          <line key={`v${i}`} x1={i * 12} y1={0} x2={i * 12} y2={56} stroke={pattern.color} strokeWidth={0.5} />
                        ))}
                      </>
                    )}
                    {pattern.type === 'checkerboard' && Array.from({ length: 5 }, (_, r) =>
                      Array.from({ length: 8 }, (_, c) => (r + c) % 2 === 0 ? (
                        <rect key={`${r}-${c}`} x={c * 12} y={r * 12} width={12} height={12} fill={pattern.color} />
                      ) : null)
                    ).flat()}
                    {pattern.type === 'diagonal' && Array.from({ length: 12 }, (_, i) => (
                      <line key={i} x1={i * 10 - 10} y1={56} x2={i * 10 + 40} y2={0} stroke={pattern.color} strokeWidth={1} />
                    ))}
                    {(pattern.type === 'diamond' || pattern.type === 'cross' || pattern.type === 'zigzag' || pattern.type === 'waves') && Array.from({ length: 5 }, (_, r) =>
                      Array.from({ length: 8 }, (_, c) => (
                        <circle key={`${r}-${c}`} cx={c * 14 + 7} cy={r * 14 + 7} r={1.5} fill={pattern.color} />
                      ))
                    ).flat()}
                  </svg>
                </div>
                <div className="px-2 py-1.5 bg-slate-800/50">
                  <span className="text-[10px] text-slate-300 font-medium">{pattern.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Yardımcı: Renk interpolasyonu ─────────────────────
function interpolateColor(color1: string, color2: string, factor: number): string {
  const hex = (c: string) => parseInt(c, 16);
  const r1 = hex(color1.slice(1, 3)), g1 = hex(color1.slice(3, 5)), b1 = hex(color1.slice(5, 7));
  const r2 = hex(color2.slice(1, 3)), g2 = hex(color2.slice(3, 5)), b2 = hex(color2.slice(5, 7));
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
