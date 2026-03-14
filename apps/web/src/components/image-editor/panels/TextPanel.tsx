"use client";

import React, { useState } from 'react';
import { useEditor } from '../EditorContext';
import { FONT_LIST, COLOR_PALETTE } from '../types';
import {
  Type, Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, Strikethrough, ChevronDown,
  Plus, Minus, Palette, Sparkles,
} from 'lucide-react';

interface TextPreset {
  label: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  text: string;
  fill?: string;
  shadow?: { color: string; blur: number; offsetX: number; offsetY: number };
  stroke?: string;
  strokeWidth?: number;
}

const TEXT_PRESETS: TextPreset[] = [
  { label: 'Başlık', fontSize: 56, fontWeight: 'bold', fontStyle: 'normal', text: 'Başlık ekleyin' },
  { label: 'Alt Başlık', fontSize: 36, fontWeight: '600', fontStyle: 'normal', text: 'Alt başlık ekleyin' },
  { label: 'Gövde Metni', fontSize: 20, fontWeight: 'normal', fontStyle: 'normal', text: 'Gövde metni ekleyin' },
  { label: 'Küçük Metin', fontSize: 14, fontWeight: 'normal', fontStyle: 'normal', text: 'Küçük metin ekleyin' },
  { label: 'Etkileyici Başlık', fontSize: 72, fontWeight: '900', fontStyle: 'normal', text: 'WOW!' },
  { label: 'İndirim Etiketi', fontSize: 48, fontWeight: 'bold', fontStyle: 'normal', text: '%50 İNDİRİM', fill: '#ef4444' },
  { label: 'Ürün Fiyatı', fontSize: 42, fontWeight: 'bold', fontStyle: 'normal', text: '₺199.99', fill: '#22c55e' },
  { label: 'CTA Butonu Metni', fontSize: 24, fontWeight: 'bold', fontStyle: 'normal', text: 'HEMEN AL' },
  { label: 'Altyazı', fontSize: 16, fontWeight: 'normal', fontStyle: 'italic', text: 'Altyazı metni...' },
  { label: 'Logo Metni', fontSize: 40, fontWeight: '800', fontStyle: 'normal', text: 'MARKA' },
  { label: 'Neon Metin', fontSize: 48, fontWeight: 'bold', fontStyle: 'normal', text: 'NEON', fill: '#00ff88', shadow: { color: '#00ff88', blur: 20, offsetX: 0, offsetY: 0 } },
  { label: 'Gölgeli Başlık', fontSize: 52, fontWeight: '900', fontStyle: 'normal', text: 'GÖLGE', shadow: { color: 'rgba(0,0,0,0.5)', blur: 8, offsetX: 4, offsetY: 4 } },
  { label: 'Konturlu Metin', fontSize: 56, fontWeight: 'bold', fontStyle: 'normal', text: 'KONTUR', fill: 'transparent', stroke: '#ffffff', strokeWidth: 3 },
  { label: '3D Metin', fontSize: 48, fontWeight: '900', fontStyle: 'normal', text: '3D ETKİSİ', shadow: { color: 'rgba(0,0,0,0.6)', blur: 1, offsetX: 3, offsetY: 3 } },
  { label: 'Altın Metin', fontSize: 44, fontWeight: 'bold', fontStyle: 'normal', text: 'PREMIUM', fill: '#d4a853', shadow: { color: 'rgba(0,0,0,0.4)', blur: 6, offsetX: 2, offsetY: 2 } },
];

interface TextEffectDef {
  id: string;
  name: string;
  preview: string;
  apply: { shadow?: any; stroke?: string; strokeWidth?: number; fill?: string };
}

const TEXT_EFFECTS: TextEffectDef[] = [
  { id: 'none', name: 'Yok', preview: 'Aa', apply: { shadow: null, stroke: '', strokeWidth: 0 } },
  { id: 'shadow-soft', name: 'Yumuşak Gölge', preview: 'Aa', apply: { shadow: { color: 'rgba(0,0,0,0.4)', blur: 10, offsetX: 3, offsetY: 3 } } },
  { id: 'shadow-hard', name: 'Keskin Gölge', preview: 'Aa', apply: { shadow: { color: 'rgba(0,0,0,0.7)', blur: 1, offsetX: 4, offsetY: 4 } } },
  { id: 'glow-white', name: 'Beyaz Işıltı', preview: 'Aa', apply: { shadow: { color: 'rgba(255,255,255,0.8)', blur: 15, offsetX: 0, offsetY: 0 } } },
  { id: 'glow-blue', name: 'Mavi Işıltı', preview: 'Aa', apply: { shadow: { color: '#3b82f6', blur: 20, offsetX: 0, offsetY: 0 } } },
  { id: 'glow-green', name: 'Yeşil Neon', preview: 'Aa', apply: { shadow: { color: '#00ff88', blur: 20, offsetX: 0, offsetY: 0 } } },
  { id: 'glow-pink', name: 'Pembe Neon', preview: 'Aa', apply: { shadow: { color: '#ff00ff', blur: 20, offsetX: 0, offsetY: 0 } } },
  { id: 'stroke-white', name: 'Beyaz Kontur', preview: 'Aa', apply: { stroke: '#ffffff', strokeWidth: 2 } },
  { id: 'stroke-black', name: 'Siyah Kontur', preview: 'Aa', apply: { stroke: '#000000', strokeWidth: 2 } },
  { id: '3d-effect', name: '3D Efekti', preview: 'Aa', apply: { shadow: { color: 'rgba(0,0,0,0.6)', blur: 0, offsetX: 3, offsetY: 3 } } },
  { id: 'retro', name: 'Retro', preview: 'Aa', apply: { shadow: { color: '#ef4444', blur: 0, offsetX: 3, offsetY: 3 }, stroke: '#1a1a1a', strokeWidth: 1 } },
  { id: 'emboss', name: 'Kabartma', preview: 'Aa', apply: { shadow: { color: 'rgba(255,255,255,0.5)', blur: 2, offsetX: -1, offsetY: -1 } } },
];

export default function TextPanel() {
  const {
    addText, activeObject, canvasRef,
    fontSize, setFontSize, fontFamily, setFontFamily, fillColor, setFillColor,
  } = useEditor();
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [fontSearch, setFontSearch] = useState('');

  const isTextSelected = activeObject && (activeObject.type === 'textbox' || activeObject.type === 'text' || activeObject.type === 'i-text');

  const handlePresetAdd = (preset: TextPreset) => {
    addText(preset.text, {
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      fontStyle: preset.fontStyle,
      fill: preset.fill || fillColor,
      fontFamily: fontFamily,
      ...(preset.shadow ? { shadow: preset.shadow } : {}),
      ...(preset.stroke ? { stroke: preset.stroke, strokeWidth: preset.strokeWidth || 2 } : {}),
    });
  };

  const updateTextProp = (prop: string, value: any) => {
    if (!isTextSelected || !canvasRef.current) return;
    activeObject.set(prop, value);
    canvasRef.current.renderAll();
  };

  const toggleBold = () => {
    const current = activeObject?.fontWeight;
    updateTextProp('fontWeight', current === 'bold' || current >= 700 ? 'normal' : 'bold');
  };

  const toggleItalic = () => {
    updateTextProp('fontStyle', activeObject?.fontStyle === 'italic' ? 'normal' : 'italic');
  };

  const toggleUnderline = () => {
    updateTextProp('underline', !activeObject?.underline);
  };

  const toggleStrikethrough = () => {
    updateTextProp('linethrough', !activeObject?.linethrough);
  };

  const filteredFonts = FONT_LIST.filter(f =>
    f.toLowerCase().includes(fontSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Metin ekleme presetleri */}
      <div className="p-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Metin Ekle</h3>
        <div className="space-y-1.5">
          {TEXT_PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => handlePresetAdd(preset)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10">
                <Type size={14} className="text-slate-400 group-hover:text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-500">{preset.label}</p>
                <p className="text-sm text-slate-200 truncate" style={{
                  fontWeight: preset.fontWeight as any,
                  fontStyle: preset.fontStyle as any,
                  fontSize: Math.min(preset.fontSize / 3, 18),
                }}>
                  {preset.text}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Metin düzenleme - sadece metin seçiliyse */}
      {isTextSelected && (
        <>
          <div className="h-px bg-slate-700 mx-3" />
          <div className="p-3 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metin Düzenleme</h3>

            {/* Font seçici */}
            <div className="relative">
              <button
                onClick={() => setShowFontPicker(!showFontPicker)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:border-slate-600 transition-colors"
              >
                <span style={{ fontFamily: activeObject.fontFamily || fontFamily }}>
                  {activeObject.fontFamily || fontFamily}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {showFontPicker && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowFontPicker(false)} />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-40 max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-slate-700">
                      <input
                        type="text"
                        placeholder="Font ara..."
                        value={fontSearch}
                        onChange={e => setFontSearch(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="overflow-y-auto">
                      {filteredFonts.map(font => (
                        <button
                          key={font}
                          onClick={() => {
                            updateTextProp('fontFamily', font);
                            setFontFamily(font);
                            setShowFontPicker(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors
                            ${(activeObject.fontFamily || fontFamily) === font ? 'text-primary bg-primary/5' : 'text-slate-300'}`}
                          style={{ fontFamily: font }}
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Font boyutu */}
            <div className="flex items-center gap-2">
              <button onClick={() => { const s = Math.max(8, (activeObject.fontSize || 32) - 2); updateTextProp('fontSize', s); setFontSize(s); }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Minus size={14} />
              </button>
              <input
                type="number"
                value={activeObject.fontSize || fontSize}
                onChange={e => { const s = parseInt(e.target.value) || 16; updateTextProp('fontSize', s); setFontSize(s); }}
                className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-center text-white focus:outline-none focus:border-primary"
                min={8}
                max={200}
              />
              <button onClick={() => { const s = Math.min(200, (activeObject.fontSize || 32) + 2); updateTextProp('fontSize', s); setFontSize(s); }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Plus size={14} />
              </button>
            </div>

            {/* Stil butonları */}
            <div className="flex gap-1">
              <button onClick={toggleBold}
                className={`flex-1 p-2 rounded-lg transition-colors ${activeObject.fontWeight === 'bold' || activeObject.fontWeight >= 700 ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Bold size={15} className="mx-auto" />
              </button>
              <button onClick={toggleItalic}
                className={`flex-1 p-2 rounded-lg transition-colors ${activeObject.fontStyle === 'italic' ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Italic size={15} className="mx-auto" />
              </button>
              <button onClick={toggleUnderline}
                className={`flex-1 p-2 rounded-lg transition-colors ${activeObject.underline ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Underline size={15} className="mx-auto" />
              </button>
              <button onClick={toggleStrikethrough}
                className={`flex-1 p-2 rounded-lg transition-colors ${activeObject.linethrough ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Strikethrough size={15} className="mx-auto" />
              </button>
            </div>

            {/* Hizalama */}
            <div className="flex gap-1">
              {[
                { align: 'left', icon: AlignLeft },
                { align: 'center', icon: AlignCenter },
                { align: 'right', icon: AlignRight },
                { align: 'justify', icon: AlignJustify },
              ].map(({ align, icon: Icon }) => (
                <button
                  key={align}
                  onClick={() => updateTextProp('textAlign', align)}
                  className={`flex-1 p-2 rounded-lg transition-colors ${activeObject.textAlign === align ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon size={15} className="mx-auto" />
                </button>
              ))}
            </div>

            {/* Metin rengi */}
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Metin Rengi</label>
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                >
                  <div className="w-5 h-5 rounded-md border border-slate-600" style={{ backgroundColor: activeObject.fill || fillColor }} />
                  <span className="text-xs text-slate-300">{activeObject.fill || fillColor}</span>
                </button>
                {showColorPicker && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowColorPicker(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-40 p-3">
                      <div className="grid grid-cols-10 gap-1 mb-3">
                        {COLOR_PALETTE.map(color => (
                          <button
                            key={color}
                            onClick={() => { updateTextProp('fill', color); setFillColor(color); }}
                            className="w-full aspect-square rounded-md border border-slate-600 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <input
                        type="color"
                        value={activeObject.fill || fillColor}
                        onChange={e => { updateTextProp('fill', e.target.value); setFillColor(e.target.value); }}
                        className="w-full h-8 rounded-lg cursor-pointer"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Satır aralığı */}
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Satır Aralığı</label>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.1}
                value={activeObject.lineHeight || 1.16}
                onChange={e => updateTextProp('lineHeight', parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <span className="text-[10px] text-slate-500">{(activeObject.lineHeight || 1.16).toFixed(1)}</span>
            </div>

            {/* Harf aralığı */}
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Harf Aralığı</label>
              <input
                type="range"
                min={-200}
                max={800}
                step={10}
                value={activeObject.charSpacing || 0}
                onChange={e => updateTextProp('charSpacing', parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <span className="text-[10px] text-slate-500">{activeObject.charSpacing || 0}</span>
            </div>

            {/* Metin Efektleri */}
            <div>
              <h4 className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
                <Sparkles size={12} /> Metin Efektleri
              </h4>
              <div className="grid grid-cols-3 gap-1">
                {TEXT_EFFECTS.map(effect => (
                  <button
                    key={effect.id}
                    onClick={() => {
                      if (effect.apply.shadow) {
                        updateTextProp('shadow', effect.apply.shadow);
                      } else if (effect.apply.shadow === null) {
                        updateTextProp('shadow', null);
                      }
                      if (effect.apply.stroke !== undefined) {
                        updateTextProp('stroke', effect.apply.stroke || null);
                        updateTextProp('strokeWidth', effect.apply.strokeWidth || 0);
                      }
                    }}
                    className="p-2 rounded-lg border border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                    title={effect.name}
                  >
                    <span
                      className="text-sm font-bold text-white block"
                      style={{
                        textShadow: effect.apply.shadow
                          ? `${effect.apply.shadow.offsetX}px ${effect.apply.shadow.offsetY}px ${effect.apply.shadow.blur}px ${effect.apply.shadow.color}`
                          : 'none',
                        WebkitTextStroke: effect.apply.stroke ? `${effect.apply.strokeWidth || 1}px ${effect.apply.stroke}` : undefined,
                      }}
                    >
                      {effect.preview}
                    </span>
                    <span className="text-[7px] text-slate-500 mt-0.5 block truncate">{effect.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
