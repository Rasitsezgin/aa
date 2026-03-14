"use client";

import React from 'react';
import { useEditor } from './EditorContext';
import { X } from 'lucide-react';
import TemplatesPanel from './panels/TemplatesPanel';
import TextPanel from './panels/TextPanel';
import ElementsPanel from './panels/ElementsPanel';
import ImagesPanel from './panels/ImagesPanel';
import FiltersPanel from './panels/FiltersPanel';
import ExportPanel from './panels/ExportPanel';
import BackgroundsPanel from './panels/BackgroundsPanel';
import StickersPanel from './panels/StickersPanel';
import FramesPanel from './panels/FramesPanel';

const PANEL_TITLES: Record<string, string> = {
  templates: 'Şablonlar & Boyutlar',
  text: 'Metin Araçları',
  elements: 'Elemanlar & Şekiller',
  backgrounds: 'Arka Plan & Renkler',
  stickers: 'Çıkartmalar & Emoji',
  frames: 'Çerçeveler & Maskeler',
  images: 'Görseller',
  filters: 'Filtreler & Efektler',
  export: 'Dışa Aktar & Paylaş',
};

export default function EditorLeftPanel() {
  const { activePanel, setActivePanel } = useEditor();

  if (!activePanel) return null;

  const renderPanel = () => {
    switch (activePanel) {
      case 'templates': return <TemplatesPanel />;
      case 'text': return <TextPanel />;
      case 'elements': return <ElementsPanel />;
      case 'backgrounds': return <BackgroundsPanel />;
      case 'stickers': return <StickersPanel />;
      case 'frames': return <FramesPanel />;
      case 'images': return <ImagesPanel />;
      case 'filters': return <FiltersPanel />;
      case 'export': return <ExportPanel />;
      default: return null;
    }
  };

  return (
    <div className="w-72 bg-surface border-r border-border flex flex-col shrink-0 overflow-hidden">
      {/* Panel başlığı */}
      <div className="h-12 flex items-center justify-between px-3 border-b border-border shrink-0">
        <h2 className="text-sm font-bold text-white">{PANEL_TITLES[activePanel] || ''}</h2>
        <button
          onClick={() => setActivePanel(null)}
          className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Panel içeriği */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {renderPanel()}
      </div>
    </div>
  );
}
