"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { useEditor } from './EditorContext';

export default function EditorCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    initCanvas, canvasReady, canvasSize, zoom, setZoom,
    activeTool, addText, addShape, canvasRef,
  } = useEditor();

  // Canvas init
  useEffect(() => {
    if (canvasElRef.current && !canvasReady) {
      initCanvas(canvasElRef.current);
    }
  }, [initCanvas, canvasReady]);

  // Canvas boyut değişimi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setWidth(canvasSize.width * zoom);
    canvas.setHeight(canvasSize.height * zoom);
    canvas.setZoom(zoom);
    canvas.renderAll();
  }, [canvasSize, zoom, canvasRef]);

  // Scroll ile zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(zoom * delta);
    }
  }, [zoom, setZoom]);

  // Tıklama ile nesne ekleme (çizim modları)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || activeTool === 'select' || activeTool === 'hand' || activeTool === 'draw' || activeTool === 'eraser') return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (activeTool === 'text') {
      addText(undefined, { left: x - 50, top: y - 16 });
    } else if (['rectangle', 'circle', 'triangle', 'line', 'arrow', 'star', 'polygon'].includes(activeTool)) {
      addShape(activeTool, { left: x - 50, top: y - 50 });
    }
  }, [activeTool, addText, addShape, zoom, canvasRef]);

  return (
    <div
      id="editor-canvas-container"
      ref={containerRef}
      className="flex-1 overflow-auto bg-[#1a1a2e] flex items-center justify-center relative"
      onWheel={handleWheel}
    >
      {/* Kılavuz arka plan deseni */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Canvas sarmalayıcı */}
      <div
        className="relative shadow-2xl"
        style={{
          width: canvasSize.width * zoom,
          height: canvasSize.height * zoom,
          transition: 'width 0.2s, height 0.2s',
        }}
        onClick={handleCanvasClick}
      >
        {/* Boyut göstergesi */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full whitespace-nowrap">
          {canvasSize.width} × {canvasSize.height}px • {Math.round(zoom * 100)}%
        </div>

        <canvas ref={canvasElRef} />
      </div>

      {/* Zoom kontrolleri - alt kısım */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-800/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-slate-700">
        <button onClick={() => setZoom(zoom / 1.2)} className="text-slate-400 hover:text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700 transition-colors">−</button>
        <span className="text-xs text-slate-300 w-12 text-center font-medium">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(zoom * 1.2)} className="text-slate-400 hover:text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700 transition-colors">+</button>
      </div>
    </div>
  );
}
