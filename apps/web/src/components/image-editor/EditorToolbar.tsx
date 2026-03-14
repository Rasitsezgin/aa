"use client";

import React from 'react';
import { useEditor } from './EditorContext';
import type { EditorTool, PanelType } from './types';
import {
  MousePointer2, Hand, Pencil, Type, Square, Circle,
  Triangle, Minus, ArrowRight, Star, Eraser, Hexagon,
  Diamond, RectangleHorizontal,
  // Panel ikonları
  LayoutTemplate, TypeIcon, Shapes, ImageIcon, Sparkles,
  Download, Paintbrush, Smile, Frame,
} from 'lucide-react';

interface ToolDef {
  id: EditorTool;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  shortcut?: string;
}

const tools: ToolDef[] = [
  { id: 'select', icon: MousePointer2, label: 'Seç', shortcut: 'V' },
  { id: 'hand', icon: Hand, label: 'El Aracı', shortcut: 'H' },
  { id: 'draw', icon: Pencil, label: 'Çizim', shortcut: 'B' },
  { id: 'eraser', icon: Eraser, label: 'Silgi', shortcut: 'E' },
  { id: 'text', icon: Type, label: 'Metin', shortcut: 'T' },
  { id: 'rectangle', icon: Square, label: 'Dikdörtgen', shortcut: 'R' },
  { id: 'circle', icon: Circle, label: 'Daire', shortcut: 'O' },
  { id: 'triangle', icon: Triangle, label: 'Üçgen' },
  { id: 'line', icon: Minus, label: 'Çizgi', shortcut: 'L' },
  { id: 'arrow', icon: ArrowRight, label: 'Ok' },
  { id: 'star', icon: Star, label: 'Yıldız' },
  { id: 'polygon', icon: Hexagon, label: 'Çokgen' },
];

interface PanelDef {
  id: PanelType;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

const panels: PanelDef[] = [
  { id: 'templates', icon: LayoutTemplate, label: 'Şablonlar' },
  { id: 'text', icon: TypeIcon, label: 'Metin' },
  { id: 'elements', icon: Shapes, label: 'Elemanlar' },
  { id: 'backgrounds', icon: Paintbrush, label: 'Arka Plan' },
  { id: 'stickers', icon: Smile, label: 'Çıkartmalar' },
  { id: 'frames', icon: Frame, label: 'Çerçeveler' },
  { id: 'images', icon: ImageIcon, label: 'Görseller' },
  { id: 'filters', icon: Sparkles, label: 'Filtreler' },
  { id: 'export', icon: Download, label: 'Dışa Aktar' },
];

export default function EditorToolbar() {
  const { activeTool, setActiveTool, activePanel, setActivePanel } = useEditor();

  return (
    <div className="w-16 bg-surface border-r border-border flex flex-col items-center py-3 gap-1 shrink-0 overflow-y-auto">
      {/* Panel sekmeleri */}
      <div className="flex flex-col items-center gap-0.5 w-full px-1 mb-2">
        {panels.map(panel => (
          <button
            key={panel.id}
            onClick={() => setActivePanel(activePanel === panel.id ? null : panel.id)}
            className={`w-full flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg transition-all text-[10px] font-medium
              ${activePanel === panel.id
                ? 'bg-primary/15 text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            title={panel.label}
          >
            <panel.icon size={18} />
            <span className="truncate w-full text-center">{panel.label}</span>
          </button>
        ))}
      </div>

      <div className="w-10 h-px bg-slate-700 mb-2" />

      {/* Araçlar */}
      <div className="flex flex-col items-center gap-0.5 w-full px-1">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`w-full flex items-center justify-center p-2 rounded-lg transition-all group relative
              ${activeTool === tool.id
                ? 'bg-primary/20 text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
          >
            <tool.icon size={17} />
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700 shadow-xl">
              {tool.label}
              {tool.shortcut && <span className="ml-2 text-slate-400">({tool.shortcut})</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
