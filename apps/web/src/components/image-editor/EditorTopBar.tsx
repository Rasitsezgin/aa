"use client";

import React, { useState } from 'react';
import { useEditor } from './EditorContext';
import {
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2,
  Download, Save, FolderOpen, Trash2, RotateCcw,
  ChevronDown, FileImage, Share2, Monitor,
} from 'lucide-react';
import { CANVAS_PRESETS } from './types';

export default function EditorTopBar() {
  const {
    undo, redo, canUndo, canRedo,
    zoom, zoomIn, zoomOut, zoomToFit, resetZoom,
    canvasSize, setCanvasSize, clearCanvas,
    saveProject, loadProject, setActivePanel,
  } = useEditor();

  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [customW, setCustomW] = useState('');
  const [customH, setCustomH] = useState('');

  const handleSaveJSON = () => {
    const json = saveProject();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gorsel-proje-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      loadProject(text);
    };
    input.click();
  };

  const handleCustomSize = () => {
    const w = parseInt(customW);
    const h = parseInt(customH);
    if (w > 0 && h > 0 && w <= 8000 && h <= 8000) {
      setCanvasSize({ width: w, height: h, name: `Özel (${w}×${h})` });
      setShowSizeMenu(false);
      setCustomW('');
      setCustomH('');
    }
  };

  const sizeCategories = {
    marketplace: CANVAS_PRESETS.filter(p => p.category === 'marketplace'),
    social: CANVAS_PRESETS.filter(p => p.category === 'social'),
    custom: CANVAS_PRESETS.filter(p => p.category === 'custom'),
  };

  return (
    <div className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 gap-2 shrink-0">
      {/* Sol: Dosya + Geri Al / Yinele */}
      <div className="flex items-center gap-1">
        {/* Dosya menüsü */}
        <div className="relative">
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <FileImage size={16} />
            <span className="hidden sm:inline">Dosya</span>
            <ChevronDown size={12} />
          </button>
          {showFileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowFileMenu(false)} />
              <div className="absolute top-full left-0 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                <button onClick={() => { clearCanvas(); setShowFileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                  <RotateCcw size={15} /> Yeni Proje
                </button>
                <button onClick={() => { handleLoadJSON(); setShowFileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                  <FolderOpen size={15} /> Proje Aç
                </button>
                <button onClick={() => { handleSaveJSON(); setShowFileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                  <Save size={15} /> Proje Kaydet
                  <span className="ml-auto text-xs text-slate-500">Ctrl+S</span>
                </button>
                <div className="h-px bg-slate-700 my-1" />
                <button onClick={() => { setActivePanel('export'); setShowFileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                  <Download size={15} /> Dışa Aktar
                  <span className="ml-auto text-xs text-slate-500">Ctrl+E</span>
                </button>
                <div className="h-px bg-slate-700 my-1" />
                <button onClick={() => { clearCanvas(); setShowFileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                  <Trash2 size={15} /> Tümünü Temizle
                </button>
              </div>
            </>
          )}
        </div>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        {/* Undo / Redo */}
        <button onClick={undo} disabled={!canUndo} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Geri Al (Ctrl+Z)">
          <Undo2 size={16} />
        </button>
        <button onClick={redo} disabled={!canRedo} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Yinele (Ctrl+Y)">
          <Redo2 size={16} />
        </button>
      </div>

      {/* Orta: Canvas boyutu */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowSizeMenu(!showSizeMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700 transition-colors"
          >
            <Monitor size={14} />
            <span>{canvasSize.name}</span>
            <span className="text-slate-500 text-xs">({canvasSize.width}×{canvasSize.height})</span>
            <ChevronDown size={12} />
          </button>

          {showSizeMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSizeMenu(false)} />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 py-2 max-h-[70vh] overflow-y-auto">
                {/* Pazaryeri */}
                <div className="px-3 py-1.5 text-xs font-bold text-primary uppercase tracking-wider">Pazaryeri</div>
                {sizeCategories.marketplace.map(p => (
                  <button key={p.name} onClick={() => { setCanvasSize({ ...p }); setShowSizeMenu(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-white/5 transition-colors ${canvasSize.name === p.name ? 'text-primary bg-primary/5' : 'text-slate-300'}`}>
                    <span>{p.name}</span>
                    <span className="text-xs text-slate-500">{p.width}×{p.height}</span>
                  </button>
                ))}

                <div className="h-px bg-slate-700 my-1" />
                <div className="px-3 py-1.5 text-xs font-bold text-green-400 uppercase tracking-wider">Sosyal Medya</div>
                {sizeCategories.social.map(p => (
                  <button key={p.name} onClick={() => { setCanvasSize({ ...p }); setShowSizeMenu(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-white/5 transition-colors ${canvasSize.name === p.name ? 'text-primary bg-primary/5' : 'text-slate-300'}`}>
                    <span>{p.name}</span>
                    <span className="text-xs text-slate-500">{p.width}×{p.height}</span>
                  </button>
                ))}

                <div className="h-px bg-slate-700 my-1" />
                <div className="px-3 py-1.5 text-xs font-bold text-purple-400 uppercase tracking-wider">Standart Boyutlar</div>
                {sizeCategories.custom.map(p => (
                  <button key={p.name} onClick={() => { setCanvasSize({ ...p }); setShowSizeMenu(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-white/5 transition-colors ${canvasSize.name === p.name ? 'text-primary bg-primary/5' : 'text-slate-300'}`}>
                    <span>{p.name}</span>
                    <span className="text-xs text-slate-500">{p.width}×{p.height}</span>
                  </button>
                ))}

                <div className="h-px bg-slate-700 my-1" />
                <div className="px-3 py-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider">Özel Boyut</div>
                <div className="px-3 py-2 flex items-center gap-2">
                  <input type="number" placeholder="Genişlik" value={customW} onChange={e => setCustomW(e.target.value)}
                    className="w-24 px-2 py-1.5 text-sm bg-slate-900 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-primary" />
                  <span className="text-slate-500">×</span>
                  <input type="number" placeholder="Yükseklik" value={customH} onChange={e => setCustomH(e.target.value)}
                    className="w-24 px-2 py-1.5 text-sm bg-slate-900 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-primary" />
                  <button onClick={handleCustomSize}
                    className="px-3 py-1.5 text-xs font-bold bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors">
                    Uygula
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sağ: Zoom + Export */}
      <div className="flex items-center gap-1">
        <button onClick={zoomOut} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Uzaklaştır">
          <ZoomOut size={16} />
        </button>
        <button onClick={resetZoom} className="px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-white/5 rounded-lg min-w-[48px] text-center transition-colors">
          {Math.round(zoom * 100)}%
        </button>
        <button onClick={zoomIn} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Yakınlaştır">
          <ZoomIn size={16} />
        </button>
        <button onClick={zoomToFit} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Sığdır">
          <Maximize2 size={16} />
        </button>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        <button
          onClick={() => setActivePanel('export')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40"
        >
          <Share2 size={15} />
          <span className="hidden sm:inline">Dışa Aktar</span>
        </button>
      </div>
    </div>
  );
}
