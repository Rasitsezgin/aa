"use client";

import React, { useState, useEffect } from 'react';
import { useEditor } from './EditorContext';
import { COLOR_PALETTE } from './types';
import {
  Layers, Settings2, Move, RotateCw, Maximize2,
  Eye, EyeOff, Lock, Unlock, Trash2, Copy,
  ChevronUp, ChevronDown, ChevronsUp, ChevronsDown,
  FlipHorizontal, FlipVertical, AlignStartHorizontal,
  AlignCenterHorizontal, AlignEndHorizontal,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  Type, Square, Circle, ImageIcon, Pencil, Group, Ungroup,
  Palette,
} from 'lucide-react';

export default function EditorRightPanel() {
  const {
    activeObject, canvasRef,
    deleteSelected, duplicateSelected,
    bringForward, sendBackward, bringToFront, sendToBack,
    flipHorizontal, flipVertical, setOpacity, alignObjects,
    groupSelected, ungroupSelected, lockSelected, unlockSelected,
    getObjects, canvasBackgroundColor, setCanvasBackgroundColor,
    fillColor, setFillColor, strokeColor, setStrokeColor,
  } = useEditor();
  const [tab, setTab] = useState<'properties' | 'layers'>('properties');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [objects, setObjects] = useState<any[]>([]);

  // Nesneleri periyodik güncelle
  useEffect(() => {
    const interval = setInterval(() => {
      setObjects([...getObjects()]);
    }, 500);
    return () => clearInterval(interval);
  }, [getObjects]);

  const obj = activeObject;

  const updateProp = (prop: string, value: any) => {
    if (!obj || !canvasRef.current) return;
    obj.set(prop, value);
    canvasRef.current.renderAll();
  };

  const getObjTypeName = (o: any) => {
    switch (o?.type) {
      case 'textbox': case 'text': case 'i-text': return 'Metin';
      case 'rect': return 'Dikdörtgen';
      case 'circle': return 'Daire';
      case 'triangle': return 'Üçgen';
      case 'ellipse': return 'Elips';
      case 'polygon': return 'Çokgen';
      case 'line': return 'Çizgi';
      case 'path': return 'Yol';
      case 'image': return 'Görsel';
      case 'group': return 'Grup';
      default: return o?.type || 'Nesne';
    }
  };

  const getObjIcon = (o: any) => {
    switch (o?.type) {
      case 'textbox': case 'text': case 'i-text': return Type;
      case 'rect': return Square;
      case 'circle': case 'ellipse': return Circle;
      case 'image': return ImageIcon;
      case 'path': return Pencil;
      case 'group': return Group;
      default: return Square;
    }
  };

  return (
    <div className="w-64 bg-surface border-l border-border flex flex-col shrink-0 overflow-hidden">
      {/* Tab seçicileri */}
      <div className="flex border-b border-border shrink-0">
        <button
          onClick={() => setTab('properties')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors
            ${tab === 'properties' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Settings2 size={14} /> Özellikler
        </button>
        <button
          onClick={() => setTab('layers')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors
            ${tab === 'layers' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Layers size={14} /> Katmanlar
          <span className="text-[9px] bg-slate-700 px-1.5 py-0.5 rounded-full">{objects.length}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'properties' ? (
          <div className="p-3 space-y-3">
            {obj ? (
              <>
                {/* Nesne tipi */}
                <div className="flex items-center gap-2 py-2 px-3 bg-slate-800/50 rounded-lg">
                  {React.createElement(getObjIcon(obj), { size: 14, className: 'text-primary' })}
                  <span className="text-xs font-bold text-white">{getObjTypeName(obj)}</span>
                </div>

                {/* Konum */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                    <Move size={10} /> Konum
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[9px] text-slate-600">X</label>
                      <input type="number" value={Math.round(obj.left || 0)}
                        onChange={e => updateProp('left', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-600">Y</label>
                      <input type="number" value={Math.round(obj.top || 0)}
                        onChange={e => updateProp('top', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>

                {/* Boyut */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                    <Maximize2 size={10} /> Boyut
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="text-[9px] text-slate-600">Genişlik</label>
                      <input type="number"
                        value={Math.round((obj.width || 0) * (obj.scaleX || 1))}
                        onChange={e => {
                          const w = parseInt(e.target.value) || 1;
                          updateProp('scaleX', w / (obj.width || 1));
                        }}
                        className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-600">Yükseklik</label>
                      <input type="number"
                        value={Math.round((obj.height || 0) * (obj.scaleY || 1))}
                        onChange={e => {
                          const h = parseInt(e.target.value) || 1;
                          updateProp('scaleY', h / (obj.height || 1));
                        }}
                        className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                </div>

                {/* Döndürme */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                    <RotateCw size={10} /> Döndürme
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="range" min={0} max={360} step={1}
                      value={Math.round(obj.angle || 0)}
                      onChange={e => updateProp('angle', parseInt(e.target.value))}
                      className="flex-1 accent-primary" />
                    <input type="number" value={Math.round(obj.angle || 0)}
                      onChange={e => updateProp('angle', parseInt(e.target.value) || 0)}
                      className="w-14 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white text-center focus:outline-none focus:border-primary"
                      min={0} max={360} />
                  </div>
                </div>

                {/* Opaklık */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Opaklık</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min={0} max={1} step={0.05}
                      value={obj.opacity ?? 1}
                      onChange={e => setOpacity(parseFloat(e.target.value))}
                      className="flex-1 accent-primary" />
                    <span className="text-[10px] text-slate-400 w-8 text-right">{Math.round((obj.opacity ?? 1) * 100)}%</span>
                  </div>
                </div>

                <div className="h-px bg-slate-700" />

                {/* Dolgu rengi (şekiller için) */}
                {obj.type !== 'image' && obj.type !== 'line' && obj.type !== 'path' && (
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                      <Palette size={10} /> Dolgu Rengi
                    </label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={obj.fill || fillColor}
                        onChange={e => { updateProp('fill', e.target.value); setFillColor(e.target.value); }}
                        className="w-8 h-8 rounded cursor-pointer border-0" />
                      <input type="text" value={obj.fill || fillColor}
                        onChange={e => { updateProp('fill', e.target.value); setFillColor(e.target.value); }}
                        className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                )}

                {/* Çerçeve */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Çerçeve</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={obj.stroke || strokeColor}
                      onChange={e => { updateProp('stroke', e.target.value); setStrokeColor(e.target.value); }}
                      className="w-8 h-8 rounded cursor-pointer border-0" />
                    <input type="number"
                      value={obj.strokeWidth || 0}
                      onChange={e => updateProp('strokeWidth', parseInt(e.target.value) || 0)}
                      className="w-14 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white text-center focus:outline-none focus:border-primary"
                      min={0} max={50} />
                  </div>
                </div>

                {/* Köşe yuvarlatma (rect için) */}
                {obj.type === 'rect' && (
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Köşe Yuvarlatma</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min={0} max={100} step={1}
                        value={obj.rx || 0}
                        onChange={e => { updateProp('rx', parseInt(e.target.value)); updateProp('ry', parseInt(e.target.value)); }}
                        className="flex-1 accent-primary" />
                      <span className="text-[10px] text-slate-400 w-8 text-right">{obj.rx || 0}</span>
                    </div>
                  </div>
                )}

                <div className="h-px bg-slate-700" />

                {/* Aynalama */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Çevir</label>
                  <div className="flex gap-1.5">
                    <button onClick={flipHorizontal}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-slate-700 transition-colors text-[10px]">
                      <FlipHorizontal size={13} /> Yatay
                    </button>
                    <button onClick={flipVertical}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-slate-700 transition-colors text-[10px]">
                      <FlipVertical size={13} /> Dikey
                    </button>
                  </div>
                </div>

                {/* Hizalama */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Hizala</label>
                  <div className="grid grid-cols-6 gap-1">
                    {[
                      { align: 'left', icon: AlignStartHorizontal },
                      { align: 'center', icon: AlignCenterHorizontal },
                      { align: 'right', icon: AlignEndHorizontal },
                      { align: 'top', icon: AlignStartVertical },
                      { align: 'middle', icon: AlignCenterVertical },
                      { align: 'bottom', icon: AlignEndVertical },
                    ].map(({ align, icon: Icon }) => (
                      <button key={align} onClick={() => alignObjects(align)}
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" title={align}>
                        <Icon size={14} className="mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sıralama */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Sıralama</label>
                  <div className="grid grid-cols-4 gap-1">
                    <button onClick={bringToFront} title="En Öne" className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <ChevronsUp size={14} className="mx-auto" />
                    </button>
                    <button onClick={bringForward} title="Bir Öne" className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <ChevronUp size={14} className="mx-auto" />
                    </button>
                    <button onClick={sendBackward} title="Bir Arkaya" className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <ChevronDown size={14} className="mx-auto" />
                    </button>
                    <button onClick={sendToBack} title="En Arkaya" className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <ChevronsDown size={14} className="mx-auto" />
                    </button>
                  </div>
                </div>

                <div className="h-px bg-slate-700" />

                {/* İşlemler */}
                <div className="flex gap-1.5">
                  <button onClick={duplicateSelected}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-slate-700 transition-colors text-[10px]">
                    <Copy size={12} /> Kopyala
                  </button>
                  <button onClick={deleteSelected}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg border border-slate-700 transition-colors text-[10px]">
                    <Trash2 size={12} /> Sil
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={groupSelected}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-slate-700 transition-colors text-[10px]">
                    <Group size={12} /> Grupla
                  </button>
                  <button onClick={ungroupSelected}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-slate-700 transition-colors text-[10px]">
                    <Ungroup size={12} /> Ayır
                  </button>
                </div>
              </>
            ) : (
              /* Hiçbir nesne seçili değil - canvas özellikleri */
              <div className="space-y-3">
                <div className="text-center py-4">
                  <Settings2 size={24} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">Nesne Seçin</p>
                  <p className="text-[10px] text-slate-600 mt-1">Özelliklerini düzenlemek için bir nesne seçin</p>
                </div>

                <div className="h-px bg-slate-700" />

                {/* Canvas arka plan rengi */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 block">Canvas Arkaplanı</label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button onClick={() => setShowBgPicker(!showBgPicker)}
                        className="w-8 h-8 rounded border border-slate-600" style={{ backgroundColor: canvasBackgroundColor }} />
                      {showBgPicker && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowBgPicker(false)} />
                          <div className="absolute bottom-full left-0 mb-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-40 p-2 w-52">
                            <div className="grid grid-cols-8 gap-1 mb-2">
                              {COLOR_PALETTE.slice(0, 24).map(color => (
                                <button key={color} onClick={() => { setCanvasBackgroundColor(color); setShowBgPicker(false); }}
                                  className="w-full aspect-square rounded border border-slate-600 hover:scale-110 transition-transform"
                                  style={{ backgroundColor: color }} />
                              ))}
                            </div>
                            <input type="color" value={canvasBackgroundColor}
                              onChange={e => setCanvasBackgroundColor(e.target.value)}
                              className="w-full h-7 rounded cursor-pointer" />
                          </div>
                        </>
                      )}
                    </div>
                    <input type="text" value={canvasBackgroundColor}
                      onChange={e => setCanvasBackgroundColor(e.target.value)}
                      className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-primary" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Katmanlar paneli */
          <div className="p-2">
            {objects.length === 0 ? (
              <div className="text-center py-8">
                <Layers size={24} className="mx-auto text-slate-600 mb-2" />
                <p className="text-sm text-slate-400">Katman Yok</p>
                <p className="text-[10px] text-slate-600 mt-1">Kanvasa nesne ekleyerek başlayın</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {[...objects].reverse().map((o, i) => {
                  const Icon = getObjIcon(o);
                  const isActive = obj === o;
                  const isLocked = o.lockMovementX;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        canvasRef.current?.setActiveObject(o);
                        canvasRef.current?.renderAll();
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all text-left
                        ${isActive ? 'bg-primary/15 text-primary border border-primary/30' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}
                    >
                      <Icon size={14} className="shrink-0" />
                      <span className="text-[11px] font-medium truncate flex-1">
                        {o.text?.substring(0, 20) || getObjTypeName(o)}
                      </span>
                      {isLocked && <Lock size={10} className="text-slate-600 shrink-0" />}
                      {!o.visible && <EyeOff size={10} className="text-slate-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Kilitle/Aç butonları */}
            {objects.length > 0 && (
              <div className="mt-3 flex gap-1.5">
                <button onClick={lockSelected}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] text-slate-500 hover:text-white hover:bg-white/5 rounded-lg border border-slate-700 transition-colors">
                  <Lock size={10} /> Kilitle
                </button>
                <button onClick={unlockSelected}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] text-slate-500 hover:text-white hover:bg-white/5 rounded-lg border border-slate-700 transition-colors">
                  <Unlock size={10} /> Tümünü Aç
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
