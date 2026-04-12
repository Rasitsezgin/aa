"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import type { EditorTool, PanelType, ExportOptions, FilterSettings, EditorHistoryEntry } from './types';
import { DEFAULT_FILTERS } from './types';

// ─── Fabric.js modülü (dinamik import ile yüklenir) ─────
let fabricModule: any = null;

async function loadFabric() {
  if (fabricModule) return fabricModule;
  fabricModule = await import('fabric');
  return fabricModule;
}

// ─── Context Tipi ────────────────────────────────────────
interface EditorContextValue {
  // Canvas
  canvasRef: React.MutableRefObject<any>;
  canvasSize: { width: number; height: number; name: string };
  setCanvasSize: (size: { width: number; height: number; name: string }) => void;
  canvasReady: boolean;
  zoom: number;
  setZoom: (z: number) => void;

  // Araçlar
  activeTool: EditorTool;
  setActiveTool: (tool: EditorTool) => void;
  activePanel: PanelType;
  setActivePanel: (panel: PanelType) => void;

  // Seçili nesne
  activeObject: any;
  refreshActiveObject: () => void;

  // Renkler
  fillColor: string;
  setFillColor: (c: string) => void;
  strokeColor: string;
  setStrokeColor: (c: string) => void;
  strokeWidth: number;
  setStrokeWidth: (w: number) => void;

  // Çizim
  brushSize: number;
  setBrushSize: (s: number) => void;
  brushColor: string;
  setBrushColor: (c: string) => void;

  // Font
  fontSize: number;
  setFontSize: (s: number) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;

  // Filtreler
  filterSettings: FilterSettings;
  setFilterSettings: (f: FilterSettings) => void;

  // Eylemler
  initCanvas: (element: HTMLCanvasElement) => Promise<void>;
  addText: (text?: string, options?: any) => void;
  addShape: (type: string, options?: any) => void;
  addImageFromURL: (url: string) => Promise<void>;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  alignObjects: (alignment: string) => void;
  flipHorizontal: () => void;
  flipVertical: () => void;
  setOpacity: (opacity: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  exportCanvas: (options: ExportOptions) => Promise<string>;
  exportCanvasBlob: (options: ExportOptions) => Promise<Blob>;
  clearCanvas: () => void;
  saveProject: () => string;
  loadProject: (json: string) => Promise<void>;
  applyFiltersToSelected: (settings: FilterSettings) => void;
  setCanvasBackgroundColor: (color: string) => void;
  canvasBackgroundColor: string;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetZoom: () => void;
  selectAll: () => void;
  deselectAll: () => void;
  getObjects: () => any[];
  cropToSelection: () => void;
  lockSelected: () => void;
  unlockSelected: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
}

// ─── History yardımcısı ─────────────────────────────────
const MAX_HISTORY = 50;

// ─── Provider ────────────────────────────────────────────
export function EditorProvider({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<any>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800, name: 'Trendyol' });
  const [zoom, setZoomState] = useState(1);
  const [activeTool, setActiveToolState] = useState<EditorTool>('select');
  const [activePanel, setActivePanel] = useState<PanelType>('templates');
  const [activeObject, setActiveObject] = useState<any>(null);
  const [fillColor, setFillColor] = useState('#3b82f6');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [canvasBackgroundColor, setCanvasBgColor] = useState('#ffffff');

  // History
  const historyRef = useRef<EditorHistoryEntry[]>([]);
  const historyIndexRef = useRef(-1);
  const isRestoringRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateHistoryState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRestoringRef.current) return;
    const json = JSON.stringify(canvas.toJSON(['selectable', 'evented', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'name']));
    const entry: EditorHistoryEntry = { json, timestamp: Date.now() };

    // Eğer geri almışsak, sonraki kayıtları sil
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }

    historyRef.current.push(entry);
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    }
    historyIndexRef.current = historyRef.current.length - 1;
    updateHistoryState();
  }, [updateHistoryState]);

  // ─── Canvas Başlatma ──────────────────────────────────
  const initCanvas = useCallback(async (element: HTMLCanvasElement) => {
    const fabric = await loadFabric();
    const { Canvas: FabricCanvas } = fabric;

    if (canvasRef.current) {
      canvasRef.current.dispose();
    }

    const canvas = new FabricCanvas(element, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: canvasBackgroundColor,
      selection: true,
      preserveObjectStacking: true,
      controlsAboveOverlay: true,
      centeredScaling: false,
      centeredRotation: true,
      stopContextMenu: true,
      fireRightClick: true,
    });

    // Seçim olayları
    canvas.on('selection:created', (e: any) => setActiveObject(e.selected?.[0] || null));
    canvas.on('selection:updated', (e: any) => setActiveObject(e.selected?.[0] || null));
    canvas.on('selection:cleared', () => setActiveObject(null));

    // Nesne değişim olayları → History kaydet
    canvas.on('object:modified', () => saveHistory());
    canvas.on('object:added', () => saveHistory());
    canvas.on('object:removed', () => saveHistory());

    canvasRef.current = canvas;
    setCanvasReady(true);

    // İlk history kaydı
    setTimeout(() => saveHistory(), 100);
  }, [canvasSize.width, canvasSize.height, canvasBackgroundColor, saveHistory]);

  // ─── Araç Değişimi ────────────────────────────────────
  const setActiveTool = useCallback((tool: EditorTool) => {
    setActiveToolState(tool);
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = tool === 'draw' || tool === 'eraser';

    if (tool === 'draw' || tool === 'eraser') {
      loadFabric().then((fabric) => {
        const brush = new fabric.PencilBrush(canvas);
        brush.width = tool === 'eraser' ? brushSize * 3 : brushSize;
        brush.color = tool === 'eraser' ? canvasBackgroundColor : brushColor;
        canvas.freeDrawingBrush = brush;
      });
    }

    if (tool === 'hand') {
      canvas.defaultCursor = 'grab';
      canvas.selection = false;
    } else if (tool === 'select') {
      canvas.defaultCursor = 'default';
      canvas.selection = true;
    } else {
      canvas.defaultCursor = 'crosshair';
      canvas.selection = false;
    }
  }, [brushSize, brushColor, canvasBackgroundColor]);

  // ─── Zoom ─────────────────────────────────────────────
  const setZoom = useCallback((z: number) => {
    const clamped = Math.min(Math.max(z, 0.1), 5);
    setZoomState(clamped);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.setZoom(clamped);
      canvas.setWidth(canvasSize.width * clamped);
      canvas.setHeight(canvasSize.height * clamped);
      canvas.renderAll();
    }
  }, [canvasSize]);

  const zoomIn = useCallback(() => setZoom(zoom * 1.2), [zoom, setZoom]);
  const zoomOut = useCallback(() => setZoom(zoom / 1.2), [zoom, setZoom]);
  const resetZoom = useCallback(() => setZoom(1), [setZoom]);
  const zoomToFit = useCallback(() => {
    const container = document.getElementById('editor-canvas-container');
    if (!container) return;
    const padding = 80;
    const scaleX = (container.clientWidth - padding) / canvasSize.width;
    const scaleY = (container.clientHeight - padding) / canvasSize.height;
    setZoom(Math.min(scaleX, scaleY, 1));
  }, [canvasSize, setZoom]);

  // ─── Active Object Refresh ────────────────────────────
  const refreshActiveObject = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    setActiveObject(obj ? { ...obj } : null);
  }, []);

  // ─── Nesne Ekleme ─────────────────────────────────────
  const addText = useCallback((text?: string, options?: any) => {
    loadFabric().then((fabric) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const textbox = new fabric.Textbox(text || 'Metin yazın...', {
        left: canvasSize.width / 2 - 100,
        top: canvasSize.height / 2 - 20,
        fontSize: fontSize,
        fontFamily: fontFamily,
        fill: fillColor,
        textAlign: 'left',
        width: 300,
        editable: true,
        ...options,
      });
      canvas.add(textbox);
      canvas.setActiveObject(textbox);
      canvas.renderAll();
    });
  }, [canvasSize, fontSize, fontFamily, fillColor]);

  const addShape = useCallback((type: string, options?: any) => {
    loadFabric().then((fabric) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const centerX = canvasSize.width / 2;
      const centerY = canvasSize.height / 2;
      let shape: any;

      const baseProps = {
        fill: fillColor,
        stroke: strokeWidth > 0 ? strokeColor : undefined,
        strokeWidth: strokeWidth,
        ...options,
      };

      switch (type) {
        case 'rectangle':
          shape = new fabric.Rect({ left: centerX - 75, top: centerY - 50, width: 150, height: 100, rx: 0, ry: 0, ...baseProps });
          break;
        case 'rounded-rectangle':
          shape = new fabric.Rect({ left: centerX - 75, top: centerY - 50, width: 150, height: 100, rx: 12, ry: 12, ...baseProps });
          break;
        case 'circle':
          shape = new fabric.Circle({ left: centerX - 50, top: centerY - 50, radius: 50, ...baseProps });
          break;
        case 'ellipse':
          shape = new fabric.Ellipse({ left: centerX - 75, top: centerY - 40, rx: 75, ry: 40, ...baseProps });
          break;
        case 'triangle':
          shape = new fabric.Triangle({ left: centerX - 50, top: centerY - 50, width: 100, height: 100, ...baseProps });
          break;
        case 'line':
          shape = new fabric.Line([centerX - 75, centerY, centerX + 75, centerY], {
            stroke: strokeColor || '#000000', strokeWidth: strokeWidth || 3, ...options,
          });
          break;
        case 'arrow': {
          const arrowPath = 'M 0 0 L 150 0 L 135 -15 M 150 0 L 135 15';
          shape = new fabric.Path(arrowPath, {
            left: centerX - 75, top: centerY,
            stroke: strokeColor || '#000000', strokeWidth: strokeWidth || 3,
            fill: 'transparent', ...options,
          });
          break;
        }
        case 'star': {
          const points = [];
          const outerR = 60, innerR = 30, spikes = 5;
          for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (Math.PI / spikes) * i - Math.PI / 2;
            points.push({ x: centerX + r * Math.cos(angle), y: centerY + r * Math.sin(angle) });
          }
          shape = new fabric.Polygon(points, { ...baseProps });
          break;
        }
        case 'hexagon': {
          const hexPoints = [];
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            hexPoints.push({ x: centerX + 60 * Math.cos(angle), y: centerY + 60 * Math.sin(angle) });
          }
          shape = new fabric.Polygon(hexPoints, { ...baseProps });
          break;
        }
        case 'diamond': {
          const dPoints = [
            { x: centerX, y: centerY - 60 },
            { x: centerX + 45, y: centerY },
            { x: centerX, y: centerY + 60 },
            { x: centerX - 45, y: centerY },
          ];
          shape = new fabric.Polygon(dPoints, { ...baseProps });
          break;
        }
        default:
          shape = new fabric.Rect({ left: centerX - 50, top: centerY - 50, width: 100, height: 100, ...baseProps });
      }

      if (shape) {
        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
      }
    });
  }, [canvasSize, fillColor, strokeColor, strokeWidth]);

  const addImageFromURL = useCallback(async (url: string) => {
    const fabric = await loadFabric();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
    // Görseli canvas'a sığdır
    const maxW = canvasSize.width * 0.8;
    const maxH = canvasSize.height * 0.8;
    const scale = Math.min(maxW / (img.width || 1), maxH / (img.height || 1), 1);
    img.set({
      left: (canvasSize.width - (img.width || 0) * scale) / 2,
      top: (canvasSize.height - (img.height || 0) * scale) / 2,
      scaleX: scale,
      scaleY: scale,
    });

    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.renderAll();
  }, [canvasSize]);

  // ─── Nesne İşlemleri ──────────────────────────────────
  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const objs = canvas.getActiveObjects();
    objs.forEach((o: any) => canvas.remove(o));
    canvas.discardActiveObject();
    canvas.renderAll();
    setActiveObject(null);
  }, []);

  const duplicateSelected = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    const cloned = await obj.clone();
    cloned.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
    canvas.add(cloned);
    canvas.setActiveObject(cloned);
    canvas.renderAll();
  }, []);

  const bringForward = useCallback(() => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (obj) { canvas.bringObjectForward(obj); canvas.renderAll(); }
  }, []);

  const sendBackward = useCallback(() => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (obj) { canvas.sendObjectBackwards(obj); canvas.renderAll(); }
  }, []);

  const bringToFront = useCallback(() => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (obj) { canvas.bringObjectToFront(obj); canvas.renderAll(); }
  }, []);

  const sendToBack = useCallback(() => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (obj) { canvas.sendObjectToBack(obj); canvas.renderAll(); }
  }, []);

  const groupSelected = useCallback(async () => {
    const fabric = await loadFabric();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const activeSelection = canvas.getActiveObject();
    if (!activeSelection || activeSelection.type !== 'activeSelection') return;
    const group = new fabric.Group(activeSelection.getObjects(), {});
    canvas.discardActiveObject();
    activeSelection.getObjects().forEach((o: any) => canvas.remove(o));
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.renderAll();
  }, []);

  const ungroupSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj || obj.type !== 'group') return;
    const items = obj.getObjects();
    obj.destroy();
    canvas.remove(obj);
    items.forEach((item: any) => canvas.add(item));
    canvas.renderAll();
  }, []);

  const flipHorizontal = useCallback(() => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (obj) { obj.set('flipX', !obj.flipX); canvas.renderAll(); saveHistory(); }
  }, [saveHistory]);

  const flipVertical = useCallback(() => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (obj) { obj.set('flipY', !obj.flipY); canvas.renderAll(); saveHistory(); }
  }, [saveHistory]);

  const setOpacity = useCallback((opacity: number) => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (obj) { obj.set('opacity', opacity); canvas.renderAll(); saveHistory(); }
  }, [saveHistory]);

  const alignObjects = useCallback((alignment: string) => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj) return;
    switch (alignment) {
      case 'left': obj.set('left', 0); break;
      case 'center': obj.set('left', (canvasSize.width - (obj.width || 0) * (obj.scaleX || 1)) / 2); break;
      case 'right': obj.set('left', canvasSize.width - (obj.width || 0) * (obj.scaleX || 1)); break;
      case 'top': obj.set('top', 0); break;
      case 'middle': obj.set('top', (canvasSize.height - (obj.height || 0) * (obj.scaleY || 1)) / 2); break;
      case 'bottom': obj.set('top', canvasSize.height - (obj.height || 0) * (obj.scaleY || 1)); break;
    }
    canvas.renderAll();
    saveHistory();
  }, [canvasSize, saveHistory]);

  const selectAll = useCallback(async () => {
    const fabric = await loadFabric();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const objs = canvas.getObjects();
    if (objs.length === 0) return;
    const selection = new fabric.ActiveSelection(objs, { canvas });
    canvas.setActiveObject(selection);
    canvas.renderAll();
  }, []);

  const deselectAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();
    setActiveObject(null);
  }, []);

  const lockSelected = useCallback(() => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (obj) {
      obj.set({ lockMovementX: true, lockMovementY: true, lockRotation: true, lockScalingX: true, lockScalingY: true, selectable: false, evented: false });
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }, []);

  const unlockSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getObjects().forEach((obj: any) => {
      if (obj.lockMovementX) {
        obj.set({ lockMovementX: false, lockMovementY: false, lockRotation: false, lockScalingX: false, lockScalingY: false, selectable: true, evented: true });
      }
    });
    canvas.renderAll();
  }, []);

  // ─── Undo / Redo ──────────────────────────────────────
  const undo = useCallback(async () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    isRestoringRef.current = true;
    const entry = historyRef.current[historyIndexRef.current];
    const canvas = canvasRef.current;
    if (canvas && entry) {
      await canvas.loadFromJSON(entry.json);
      canvas.renderAll();
    }
    isRestoringRef.current = false;
    updateHistoryState();
  }, [updateHistoryState]);

  const redo = useCallback(async () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    isRestoringRef.current = true;
    const entry = historyRef.current[historyIndexRef.current];
    const canvas = canvasRef.current;
    if (canvas && entry) {
      await canvas.loadFromJSON(entry.json);
      canvas.renderAll();
    }
    isRestoringRef.current = false;
    updateHistoryState();
  }, [updateHistoryState]);

  // ─── Export ────────────────────────────────────────────
  const exportCanvas = useCallback(async (options: ExportOptions): Promise<string> => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    canvas.discardActiveObject();
    canvas.renderAll();
    return canvas.toDataURL({
      format: options.format,
      quality: options.quality,
      multiplier: options.scale,
    });
  }, []);

  const exportCanvasBlob = useCallback(async (options: ExportOptions): Promise<Blob> => {
    const dataUrl = await exportCanvas(options);
    const response = await fetch(dataUrl);
    return response.blob();
  }, [exportCanvas]);

  // ─── Proje Kaydetme / Yükleme ─────────────────────────
  const saveProject = useCallback((): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '{}';
    return JSON.stringify({
      version: '1.0',
      canvasSize,
      backgroundColor: canvasBackgroundColor,
      canvas: canvas.toJSON(['selectable', 'evented', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'name']),
    });
  }, [canvasSize, canvasBackgroundColor]);

  const loadProject = useCallback(async (json: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const data = JSON.parse(json);
      if (data.canvasSize) setCanvasSize(data.canvasSize);
      if (data.backgroundColor) setCanvasBgColor(data.backgroundColor);
      if (data.canvas) {
        await canvas.loadFromJSON(data.canvas);
        canvas.renderAll();
        saveHistory();
      }
    } catch {
      console.error('Proje yüklenemedi');
    }
  }, [saveHistory]);

  // ─── Canvas temizle ────────────────────────────────────
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = canvasBackgroundColor;
    canvas.renderAll();
    saveHistory();
    setActiveObject(null);
  }, [canvasBackgroundColor, saveHistory]);

  // ─── Filtre uygulama ──────────────────────────────────
  const applyFiltersToSelected = useCallback(async (settings: FilterSettings) => {
    const fabric = await loadFabric();
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!obj || obj.type !== 'image') return;

    const imgObj = obj as any;
    imgObj.filters = [];

    if (settings.brightness !== 0) imgObj.filters.push(new fabric.filters.Brightness({ brightness: settings.brightness }));
    if (settings.contrast !== 0) imgObj.filters.push(new fabric.filters.Contrast({ contrast: settings.contrast }));
    if (settings.saturation !== 0) imgObj.filters.push(new fabric.filters.Saturation({ saturation: settings.saturation }));
    if (settings.blur > 0) imgObj.filters.push(new fabric.filters.Blur({ blur: settings.blur }));
    if (settings.grayscale) imgObj.filters.push(new fabric.filters.Grayscale());
    if (settings.sepia) imgObj.filters.push(new fabric.filters.Sepia());
    if (settings.invert) imgObj.filters.push(new fabric.filters.Invert());
    if (settings.hueRotation !== 0) imgObj.filters.push(new fabric.filters.HueRotation({ rotation: settings.hueRotation / 360 }));

    imgObj.applyFilters();
    canvas.renderAll();
    setFilterSettings(settings);
    saveHistory();
  }, [saveHistory]);

  // ─── Arkaplan rengi ────────────────────────────────────
  const setCanvasBackgroundColor = useCallback((color: string) => {
    setCanvasBgColor(color);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.backgroundColor = color;
      canvas.renderAll();
      saveHistory();
    }
  }, [saveHistory]);

  const getObjects = useCallback(() => {
    return canvasRef.current?.getObjects() || [];
  }, []);

  const cropToSelection = useCallback(() => {
    // Kırpma işlemi - seçili alanı kırp
  }, []);

  // ─── Klavye kısayolları ────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Input/textarea içindeyken kısayolları devre dışı bırak
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (isCtrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (canvasRef.current?.getActiveObject()) { e.preventDefault(); deleteSelected(); }
      }
      if (isCtrl && e.key === 'a') { e.preventDefault(); selectAll(); }
      if (isCtrl && e.key === 'd') { e.preventDefault(); duplicateSelected(); }
      if (isCtrl && e.key === 'g' && !e.shiftKey) { e.preventDefault(); groupSelected(); }
      if (isCtrl && e.key === 'g' && e.shiftKey) { e.preventDefault(); ungroupSelected(); }
      if (e.key === 'Escape') { deselectAll(); }
      if (e.key === 'v' && !isCtrl) { setActiveTool('select'); }
      if (e.key === 'h' && !isCtrl) { setActiveTool('hand'); }
      if (e.key === 'b' && !isCtrl) { setActiveTool('draw'); }
      if (e.key === 't' && !isCtrl) { setActiveTool('text'); }
      if (e.key === 'r' && !isCtrl) { setActiveTool('rectangle'); }
      if (e.key === 'o' && !isCtrl) { setActiveTool('circle'); }
      if (e.key === 'l' && !isCtrl) { setActiveTool('line'); }
      if (e.key === '=' && isCtrl) { e.preventDefault(); zoomIn(); }
      if (e.key === '-' && isCtrl) { e.preventDefault(); zoomOut(); }
      if (e.key === '0' && isCtrl) { e.preventDefault(); resetZoom(); }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, deleteSelected, selectAll, duplicateSelected, groupSelected, ungroupSelected, deselectAll, setActiveTool, zoomIn, zoomOut, resetZoom]);

  const value: EditorContextValue = {
    canvasRef, canvasSize, setCanvasSize, canvasReady, zoom, setZoom,
    activeTool, setActiveTool, activePanel, setActivePanel,
    activeObject, refreshActiveObject,
    fillColor, setFillColor, strokeColor, setStrokeColor, strokeWidth, setStrokeWidth,
    brushSize, setBrushSize, brushColor, setBrushColor,
    fontSize, setFontSize, fontFamily, setFontFamily,
    filterSettings, setFilterSettings,
    initCanvas, addText, addShape, addImageFromURL,
    deleteSelected, duplicateSelected, bringForward, sendBackward, bringToFront, sendToBack,
    groupSelected, ungroupSelected, alignObjects, flipHorizontal, flipVertical, setOpacity,
    undo, redo, canUndo, canRedo,
    exportCanvas, exportCanvasBlob, clearCanvas, saveProject, loadProject,
    applyFiltersToSelected, setCanvasBackgroundColor, canvasBackgroundColor,
    zoomIn, zoomOut, zoomToFit, resetZoom,
    selectAll, deselectAll, getObjects, cropToSelection, lockSelected, unlockSelected,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
