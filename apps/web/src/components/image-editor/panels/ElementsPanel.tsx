"use client";

import React, { useState } from 'react';
import { useEditor } from '../EditorContext';
import { COLOR_PALETTE } from '../types';
import {
  Square, Circle, Triangle, Minus, ArrowRight, Star,
  Hexagon, Diamond, RectangleHorizontal, Heart, Zap,
  Shield, Award, Tag, Badge, Bookmark, Flag,
  MessageCircle, MessageSquare, CloudRain, Sun,
  Wifi, BatteryCharging, Camera, Music,
  Pen, Pentagon, Octagon, Cross, Hash, Plus,
  CheckCircle, XCircle, AlertTriangle, Info,
  MoreHorizontal, Grip, GripVertical,
} from 'lucide-react';

interface ShapeDef {
  type: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

const BASIC_SHAPES: ShapeDef[] = [
  { type: 'rectangle', icon: Square, label: 'Dikdörtgen' },
  { type: 'rounded-rectangle', icon: RectangleHorizontal, label: 'Yuvarlatılmış' },
  { type: 'circle', icon: Circle, label: 'Daire' },
  { type: 'ellipse', icon: Circle, label: 'Elips' },
  { type: 'triangle', icon: Triangle, label: 'Üçgen' },
  { type: 'diamond', icon: Diamond, label: 'Eşkenar Dörtgen' },
  { type: 'hexagon', icon: Hexagon, label: 'Altıgen' },
  { type: 'star', icon: Star, label: 'Yıldız' },
];

const LINES_ARROWS: ShapeDef[] = [
  { type: 'line', icon: Minus, label: 'Çizgi' },
  { type: 'arrow', icon: ArrowRight, label: 'Ok' },
];

// Bölücü / Ayırıcı Çizgiler
interface DividerDef {
  id: string;
  label: string;
  type: 'solid' | 'dashed' | 'dotted' | 'double' | 'wave' | 'ornament';
  preview: string;
}

const DIVIDERS: DividerDef[] = [
  { id: 'solid-line', label: 'Düz Çizgi', type: 'solid', preview: '━━━━━━━━━━━━━━━' },
  { id: 'dashed-line', label: 'Kesikli Çizgi', type: 'dashed', preview: '╌╌╌╌╌╌╌╌╌╌╌╌╌' },
  { id: 'dotted-line', label: 'Noktalı Çizgi', type: 'dotted', preview: '┈┈┈┈┈┈┈┈┈┈┈┈┈' },
  { id: 'double-line', label: 'Çift Çizgi', type: 'double', preview: '═══════════════' },
  { id: 'ornament-line', label: 'Süslü Çizgi', type: 'ornament', preview: '─── ✦ ─── ✦ ───' },
  { id: 'wave-line', label: 'Dalga Çizgi', type: 'wave', preview: '〰️〰️〰️〰️〰️〰️' },
];

interface BadgeDef {
  type: string;
  label: string;
  bgColor: string;
  text: string;
}

const BADGES: BadgeDef[] = [
  { type: 'sale', label: '%İNDİRİM', bgColor: '#ef4444', text: '%50\nİNDİRİM' },
  { type: 'new', label: 'YENİ', bgColor: '#22c55e', text: 'YENİ' },
  { type: 'bestseller', label: 'ÇOK SATAN', bgColor: '#f59e0b', text: 'ÇOK\nSATAN' },
  { type: 'limited', label: 'SINIRLI', bgColor: '#8b5cf6', text: 'SINIRLI\nSTOK' },
  { type: 'free-shipping', label: 'ÜCRETSİZ KARGO', bgColor: '#06b6d4', text: 'ÜCRETSİZ\nKARGO' },
  { type: 'campaign', label: 'KAMPANYA', bgColor: '#ec4899', text: 'KAMPANYA' },
];

export default function ElementsPanel() {
  const { addShape, addText, fillColor, setFillColor, strokeColor, setStrokeColor, strokeWidth, setStrokeWidth } = useEditor();
  const [showFillPicker, setShowFillPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);

  const handleAddBadge = (badge: BadgeDef) => {
    addShape('circle', {
      fill: badge.bgColor,
      radius: 50,
      strokeWidth: 3,
      stroke: '#ffffff',
      shadow: { color: 'rgba(0,0,0,0.3)', blur: 10, offsetX: 2, offsetY: 2 },
    });
    setTimeout(() => {
      addText(badge.text, {
        fontSize: 18,
        fontWeight: 'bold',
        fill: '#ffffff',
        textAlign: 'center',
        width: 90,
      });
    }, 100);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Renk ayarları */}
      <div className="p-3 space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Renk Ayarları</h3>

        {/* Dolgu rengi */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-slate-500 w-12">Dolgu</label>
          <div className="relative flex-1">
            <button
              onClick={() => setShowFillPicker(!showFillPicker)}
              className="w-full flex items-center gap-2 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
            >
              <div className="w-5 h-5 rounded border border-slate-600" style={{ backgroundColor: fillColor }} />
              <span className="text-[11px] text-slate-300">{fillColor}</span>
            </button>
            {showFillPicker && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowFillPicker(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-40 p-2">
                  <div className="grid grid-cols-10 gap-1 mb-2">
                    {COLOR_PALETTE.map(color => (
                      <button key={color} onClick={() => { setFillColor(color); setShowFillPicker(false); }}
                        className="w-full aspect-square rounded border border-slate-600 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <input type="color" value={fillColor} onChange={e => setFillColor(e.target.value)}
                    className="w-full h-7 rounded cursor-pointer" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Çerçeve rengi */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-slate-500 w-12">Çerçeve</label>
          <div className="relative flex-1">
            <button
              onClick={() => setShowStrokePicker(!showStrokePicker)}
              className="w-full flex items-center gap-2 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
            >
              <div className="w-5 h-5 rounded border-2" style={{ borderColor: strokeColor, backgroundColor: 'transparent' }} />
              <span className="text-[11px] text-slate-300">{strokeColor}</span>
            </button>
            {showStrokePicker && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowStrokePicker(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-40 p-2">
                  <div className="grid grid-cols-10 gap-1 mb-2">
                    {COLOR_PALETTE.map(color => (
                      <button key={color} onClick={() => { setStrokeColor(color); setShowStrokePicker(false); }}
                        className="w-full aspect-square rounded border border-slate-600 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)}
                    className="w-full h-7 rounded cursor-pointer" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Çerçeve kalınlığı */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-slate-500 w-12">Kalınlık</label>
          <input type="range" min={0} max={20} step={1} value={strokeWidth}
            onChange={e => setStrokeWidth(parseInt(e.target.value))}
            className="flex-1 accent-primary" />
          <span className="text-[10px] text-slate-400 w-6 text-right">{strokeWidth}</span>
        </div>
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* Temel şekiller */}
      <div className="p-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Temel Şekiller</h3>
        <div className="grid grid-cols-4 gap-1.5">
          {BASIC_SHAPES.map(shape => (
            <button
              key={shape.type}
              onClick={() => addShape(shape.type)}
              className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <shape.icon size={22} className="text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-[9px] text-slate-500 group-hover:text-slate-300">{shape.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* Çizgiler & Oklar */}
      <div className="p-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Çizgiler & Oklar</h3>
        <div className="grid grid-cols-4 gap-1.5">
          {LINES_ARROWS.map(shape => (
            <button
              key={shape.type}
              onClick={() => addShape(shape.type)}
              className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <shape.icon size={22} className="text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-[9px] text-slate-500 group-hover:text-slate-300">{shape.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* E-ticaret rozetleri */}
      <div className="p-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">E-Ticaret Rozetleri</h3>
        <div className="grid grid-cols-3 gap-1.5">
          {BADGES.map(badge => (
            <button
              key={badge.type}
              onClick={() => handleAddBadge(badge)}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-slate-700 hover:border-primary/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[8px] font-bold leading-tight text-center"
                style={{ backgroundColor: badge.bgColor }}>
                {badge.text.replace('\n', ' ')}
              </div>
              <span className="text-[9px] text-slate-500 group-hover:text-slate-300">{badge.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* Bölücüler / Ayırıcılar */}
      <div className="p-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ayırıcı Çizgiler</h3>
        <div className="space-y-1">
          {DIVIDERS.map(divider => (
            <button
              key={divider.id}
              onClick={() => {
                if (divider.type === 'ornament' || divider.type === 'wave') {
                  addText(divider.preview, { fontSize: 16, textAlign: 'center', width: 300 });
                } else {
                  addShape('line', {
                    stroke: fillColor || '#ffffff',
                    strokeWidth: divider.type === 'double' ? 4 : 2,
                    ...(divider.type === 'dashed' ? { strokeDashArray: [12, 6] } : {}),
                    ...(divider.type === 'dotted' ? { strokeDashArray: [4, 4] } : {}),
                  });
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all group text-left"
            >
              <span className="text-[10px] text-slate-500 group-hover:text-slate-300 block truncate">{divider.preview}</span>
              <span className="text-[8px] text-slate-600">{divider.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* Dekoratif ikonlar */}
      <div className="p-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dekoratif İkonlar</h3>
        <p className="text-[10px] text-slate-500 mb-2">Tıklayarak kanvasa ekleyin</p>
        <div className="grid grid-cols-6 gap-1">
          {[Heart, Star, Zap, Shield, Award, Tag, Badge, Bookmark, Flag, MessageCircle, MessageSquare, Camera, Sun, Music, Wifi, CheckCircle, XCircle, AlertTriangle, Info, Hash, Plus, Cross].map((Icon, i) => (
            <button
              key={i}
              onClick={() => addText(String.fromCodePoint(0x2764 + i), { fontSize: 48, fontFamily: 'serif' })}
              className="p-2 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-all"
            >
              <Icon size={18} className="mx-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* Hızlı Şekil Kombinasyonları */}
      <div className="h-px bg-slate-700 mx-3" />
      <div className="p-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hızlı Butonlar</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'CTA Butonu', action: () => {
              addShape('rectangle', { width: 220, height: 50, fill: '#3b82f6', rx: 25, ry: 25 });
              setTimeout(() => addText('SATIN AL', { fontSize: 18, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', width: 200 }), 80);
            }},
            { label: 'Fiyat Etiketi', action: () => {
              addShape('rectangle', { width: 140, height: 60, fill: '#ef4444', rx: 8, ry: 8 });
              setTimeout(() => addText('₺99.90', { fontSize: 28, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', width: 130 }), 80);
            }},
            { label: 'Yıldız Puanı', action: () => {
              addText('⭐⭐⭐⭐⭐', { fontSize: 24, textAlign: 'center' });
            }},
            { label: 'Kargo İkonu', action: () => {
              addShape('rectangle', { width: 180, height: 36, fill: '#22c55e', rx: 18, ry: 18 });
              setTimeout(() => addText('🚚 Ücretsiz Kargo', { fontSize: 13, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', width: 170 }), 80);
            }},
            { label: 'Güvenli Alışveriş', action: () => {
              addShape('rectangle', { width: 200, height: 36, fill: '#3b82f6', rx: 18, ry: 18 });
              setTimeout(() => addText('🛡️ Güvenli Alışveriş', { fontSize: 13, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', width: 190 }), 80);
            }},
            { label: 'İade Garantisi', action: () => {
              addShape('rectangle', { width: 180, height: 36, fill: '#8b5cf6', rx: 18, ry: 18 });
              setTimeout(() => addText('↩️ Kolay İade', { fontSize: 13, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', width: 170 }), 80);
            }},
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className="px-3 py-2.5 rounded-lg border border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all text-[10px] text-slate-400 hover:text-white font-bold"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
