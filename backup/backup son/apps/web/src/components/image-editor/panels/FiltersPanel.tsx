"use client";

import React, { useState, useEffect } from 'react';
import { useEditor } from '../EditorContext';
import { FILTER_PRESETS, DEFAULT_FILTERS } from '../types';
import type { FilterSettings } from '../types';
import {
  Sparkles, RotateCcw, SunMedium, Contrast, Droplets,
  CircleDot, Palette, Eye, Sliders,
} from 'lucide-react';

export default function FiltersPanel() {
  const { activeObject, applyFiltersToSelected, filterSettings, setFilterSettings } = useEditor();
  const [localSettings, setLocalSettings] = useState<FilterSettings>({ ...DEFAULT_FILTERS });
  const isImage = activeObject && activeObject.type === 'image';

  // Seçili nesne değiştiğinde filtre ayarlarını sıfırla
  useEffect(() => {
    if (isImage) {
      setLocalSettings({ ...filterSettings });
    }
  }, [activeObject]);

  const handleSliderChange = (key: keyof FilterSettings, value: number | boolean) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    if (isImage) {
      applyFiltersToSelected(newSettings);
    }
  };

  const handlePresetApply = (preset: typeof FILTER_PRESETS[0]) => {
    const newSettings = { ...DEFAULT_FILTERS, ...preset.settings };
    setLocalSettings(newSettings);
    if (isImage) {
      applyFiltersToSelected(newSettings);
    }
  };

  const handleReset = () => {
    setLocalSettings({ ...DEFAULT_FILTERS });
    if (isImage) {
      applyFiltersToSelected({ ...DEFAULT_FILTERS });
    }
  };

  interface SliderDef {
    key: keyof FilterSettings;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    min: number;
    max: number;
    step: number;
    unit?: string;
  }

  const sliders: SliderDef[] = [
    { key: 'brightness', label: 'Parlaklık', icon: SunMedium, min: -1, max: 1, step: 0.05 },
    { key: 'contrast', label: 'Kontrast', icon: Contrast, min: -1, max: 1, step: 0.05 },
    { key: 'saturation', label: 'Doygunluk', icon: Palette, min: -1, max: 1, step: 0.05 },
    { key: 'blur', label: 'Bulanıklık', icon: Droplets, min: 0, max: 1, step: 0.02 },
    { key: 'hueRotation', label: 'Renk Tonu', icon: CircleDot, min: -180, max: 180, step: 5, unit: '°' },
  ];

  interface ToggleDef {
    key: keyof FilterSettings;
    label: string;
  }

  const toggles: ToggleDef[] = [
    { key: 'grayscale', label: 'Siyah & Beyaz' },
    { key: 'sepia', label: 'Sepya' },
    { key: 'invert', label: 'Negatif' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Uyarı - görsel seçili değilse */}
      {!isImage && (
        <div className="p-3">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
            <Eye size={24} className="mx-auto text-amber-400 mb-2" />
            <p className="text-sm font-medium text-amber-300">Filtre Uygulamak İçin</p>
            <p className="text-[11px] text-amber-400/70 mt-1">
              Kanvasta bir görsel seçin,<br />sonra filtre uygulayın.
            </p>
          </div>
        </div>
      )}

      {/* Filtre presetleri */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtre Presetleri</h3>
          <button onClick={handleReset} className="text-[10px] text-slate-500 hover:text-primary flex items-center gap-1 transition-colors">
            <RotateCcw size={10} /> Sıfırla
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {FILTER_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handlePresetApply(preset)}
              disabled={!isImage}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all
                ${!isImage ? 'opacity-40 cursor-not-allowed border-slate-800' :
                  'border-slate-700 hover:border-primary/50 hover:bg-primary/5 cursor-pointer'}`}
            >
              {/* Mini önizleme */}
              <div className="w-full aspect-square rounded-md overflow-hidden bg-slate-700/50 relative">
                <div
                  className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"
                  style={{
                    filter: [
                      preset.settings.brightness ? `brightness(${1 + (preset.settings.brightness || 0)})` : '',
                      preset.settings.contrast ? `contrast(${1 + (preset.settings.contrast || 0)})` : '',
                      preset.settings.saturation ? `saturate(${1 + (preset.settings.saturation || 0)})` : '',
                      preset.settings.grayscale ? 'grayscale(1)' : '',
                      preset.settings.sepia ? 'sepia(1)' : '',
                      preset.settings.invert ? 'invert(1)' : '',
                      preset.settings.hueRotation ? `hue-rotate(${preset.settings.hueRotation}deg)` : '',
                    ].filter(Boolean).join(' ') || 'none',
                  }}
                />
              </div>
              <span className="text-[9px] text-slate-400 font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* Manuel ayarlar */}
      <div className="p-3 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders size={12} />
          Detaylı Ayarlar
        </h3>

        {sliders.map(slider => (
          <div key={slider.key}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <slider.icon size={12} />
                {slider.label}
              </label>
              <span className="text-[10px] text-slate-500 tabular-nums">
                {typeof localSettings[slider.key] === 'number'
                  ? slider.unit
                    ? `${localSettings[slider.key]}${slider.unit}`
                    : (localSettings[slider.key] as number).toFixed(2)
                  : ''}
              </span>
            </div>
            <input
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={localSettings[slider.key] as number}
              onChange={e => handleSliderChange(slider.key, parseFloat(e.target.value))}
              disabled={!isImage}
              className="w-full accent-primary disabled:opacity-40"
            />
          </div>
        ))}

        <div className="h-px bg-slate-700" />

        {/* Toggle efektler */}
        <div className="space-y-2">
          {toggles.map(toggle => (
            <label key={toggle.key} className={`flex items-center justify-between py-1.5 ${!isImage ? 'opacity-40' : 'cursor-pointer'}`}>
              <span className="text-[11px] text-slate-400">{toggle.label}</span>
              <button
                onClick={() => isImage && handleSliderChange(toggle.key, !localSettings[toggle.key])}
                disabled={!isImage}
                className={`w-9 h-5 rounded-full transition-colors relative ${localSettings[toggle.key] ? 'bg-primary' : 'bg-slate-700'}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${localSettings[toggle.key] ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
              </button>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
