"use client";

import React, { useState, useMemo } from 'react';
import { useEditor } from '../EditorContext';
import { CANVAS_PRESETS } from '../types';
import { ADVANCED_TEMPLATES, TEMPLATE_CATEGORIES } from '../templates/advanced-templates';
import {
  Store, Instagram, Monitor, Search, X, Sparkles, Eye,
} from 'lucide-react';

const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  marketplace: Store,
  social: Instagram,
  custom: Monitor,
};

const categoryLabels: Record<string, string> = {
  marketplace: 'Pazaryeri',
  social: 'Sosyal Medya',
  custom: 'Standart',
};

export default function TemplatesPanel() {
  const { setCanvasSize, setCanvasBackgroundColor, addText, addShape, clearCanvas } = useEditor();
  const [presetCategory, setPresetCategory] = useState<string>('all');
  const [templateCategory, setTemplateCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const handleSelectPreset = (preset: typeof CANVAS_PRESETS[0]) => {
    setCanvasSize({ width: preset.width, height: preset.height, name: preset.name });
  };

  const handleApplyTemplate = async (template: typeof ADVANCED_TEMPLATES[0]) => {
    // Canvas boyutunu ayarla
    setCanvasSize({
      width: template.canvasWidth,
      height: template.canvasHeight,
      name: template.name,
    });

    clearCanvas();
    setCanvasBackgroundColor(template.backgroundColor);

    // Tüm elementleri sırayla ekle
    let delay = 100;
    for (const element of template.elements) {
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = 30; // İlk eleman sonrası daha hızlı
      
      if (element.type === 'text') {
        const { text, ...props } = element.props;
        addText(text, props);
      } else {
        const typeMap: Record<string, string> = {
          rect: 'rectangle',
          circle: 'circle',
          triangle: 'triangle',
          ellipse: 'ellipse',
          line: 'line',
          polygon: 'polygon',
        };
        const shapeName = typeMap[element.type] || element.type;
        addShape(shapeName, element.props);
      }
    }
  };

  const filteredPresets = CANVAS_PRESETS.filter(p =>
    presetCategory === 'all' || p.category === presetCategory
  );

  const filteredTemplates = useMemo(() => {
    return ADVANCED_TEMPLATES.filter(t => {
      const matchesCategory = templateCategory === 'all' || t.category === templateCategory;
      const matchesSearch = searchQuery === '' ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [templateCategory, searchQuery]);

  // Basit template thumbnail renderer
  const renderMiniPreview = (template: typeof ADVANCED_TEMPLATES[0]) => {
    const scaleX = 120 / template.canvasWidth;
    const scaleY = 80 / template.canvasHeight;
    const scale = Math.min(scaleX, scaleY);
    const w = template.canvasWidth * scale;
    const h = template.canvasHeight * scale;

    return (
      <div
        className="relative overflow-hidden rounded-lg flex items-center justify-center"
        style={{ width: '100%', aspectRatio: `${template.canvasWidth}/${template.canvasHeight}`, maxHeight: 100, backgroundColor: template.backgroundColor }}
      >
        {/* Basitleştirilmiş mini önizleme - ilk birkaç elemanı göster */}
        <svg width="100%" height="100%" viewBox={`0 0 ${template.canvasWidth} ${template.canvasHeight}`} preserveAspectRatio="xMidYMid meet">
          {template.elements.slice(0, 8).map((el, i) => {
            if (el.type === 'rect') {
              return (
                <rect
                  key={i}
                  x={el.props.left || 0}
                  y={el.props.top || 0}
                  width={el.props.width || 100}
                  height={el.props.height || 100}
                  fill={el.props.fill || 'transparent'}
                  rx={el.props.rx || 0}
                  opacity={el.props.opacity || 1}
                />
              );
            }
            if (el.type === 'circle') {
              return (
                <circle
                  key={i}
                  cx={(el.props.left || 0) + (el.props.radius || 0)}
                  cy={(el.props.top || 0) + (el.props.radius || 0)}
                  r={el.props.radius || 20}
                  fill={el.props.fill || '#ccc'}
                  opacity={el.props.opacity || 1}
                />
              );
            }
            if (el.type === 'text' && el.props.fontSize >= 32) {
              return (
                <text
                  key={i}
                  x={el.props.left || 0}
                  y={(el.props.top || 0) + (el.props.fontSize || 16)}
                  fill={el.props.fill || '#000'}
                  fontSize={el.props.fontSize || 16}
                  fontWeight={el.props.fontWeight || 'normal'}
                  opacity={el.props.opacity || 1}
                >
                  {(el.props.text || '').split('\n')[0].substring(0, 20)}
                </text>
              );
            }
            return null;
          })}
        </svg>
        {hoveredTemplate === template.id && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm transition-all">
            <div className="flex items-center gap-1 text-white text-[10px] font-bold bg-primary/80 px-2 py-1 rounded-full">
              <Eye size={10} /> Uygula
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Arama */}
      <div className="p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Şablon ara... (ör: indirim, story, trendyol)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Boyut preset'leri toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-300 hover:border-slate-600 transition-colors"
        >
          <span className="text-xs font-bold">📐 Canvas Boyutu Seç</span>
          <span className="text-[10px] text-slate-500">{showPresets ? '▲' : '▼'}</span>
        </button>

        {showPresets && (
          <div className="mt-2 p-2 bg-slate-800/80 border border-slate-700 rounded-lg">
            <div className="flex gap-1 mb-2">
              {['all', 'marketplace', 'social', 'custom'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setPresetCategory(cat)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors
                    ${presetCategory === cat ? 'bg-primary/20 text-primary' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                >
                  {cat === 'all' ? 'Tümü' : categoryLabels[cat]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto scrollbar-thin">
              {filteredPresets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg border border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className="w-full flex items-center justify-center h-6">
                    <div className="bg-slate-600 rounded-sm" style={{ aspectRatio: `${preset.width}/${preset.height}`, height: 20 }} />
                  </div>
                  <span className="text-[9px] text-slate-300 truncate w-full text-center">{preset.name}</span>
                  <span className="text-[8px] text-slate-500">{preset.width}×{preset.height}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* Şablon Kategorileri */}
      <div className="px-3 py-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles size={12} /> Gelişmiş Şablonlar
          <span className="ml-auto text-[10px] font-normal text-slate-500">{filteredTemplates.length} şablon</span>
        </h3>
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {TEMPLATE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setTemplateCategory(cat.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors shrink-0
                ${templateCategory === cat.id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Şablon Grid */}
      <div className="flex-1 overflow-y-auto px-3 py-1 scrollbar-thin">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search size={32} className="text-slate-600 mb-3" />
            <p className="text-sm text-slate-500">Şablon bulunamadı</p>
            <p className="text-[11px] text-slate-600 mt-1">Farklı anahtar kelimeler deneyin</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 pb-4">
            {filteredTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => handleApplyTemplate(template)}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                className="group flex flex-col rounded-xl overflow-hidden border border-slate-700 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02]"
              >
                {renderMiniPreview(template)}
                <div className="p-2 bg-slate-800/50">
                  <p className="text-[11px] font-bold text-slate-200 truncate">{template.name}</p>
                  <p className="text-[9px] text-slate-500 truncate">{template.description}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {template.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="text-[8px] bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-[8px] text-slate-600">
                      {template.canvasWidth}×{template.canvasHeight}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
