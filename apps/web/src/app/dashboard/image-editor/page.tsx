"use client";

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { EditorProvider, useEditor } from '@/components/image-editor/EditorContext';
import EditorCanvas from '@/components/image-editor/EditorCanvas';
import EditorTopBar from '@/components/image-editor/EditorTopBar';
import EditorToolbar from '@/components/image-editor/EditorToolbar';
import EditorLeftPanel from '@/components/image-editor/EditorLeftPanel';
import EditorRightPanel from '@/components/image-editor/EditorRightPanel';

function ImageEditorContent() {
  const searchParams = useSearchParams();
  if (!searchParams) return null;
  const { addImageFromURL, canvasReady, setCanvasSize } = useEditor();

  // URL parametrelerinden görsel/ürün yükleme
  useEffect(() => {
    if (!canvasReady) return;

    const imageUrl = searchParams.get('imageUrl');
    const productId = searchParams.get('productId');
    const preset = searchParams.get('preset');

    // Preset boyut ayarla
    if (preset) {
      const presets: Record<string, { width: number; height: number; name: string }> = {
        'trendyol': { width: 800, height: 800, name: 'Trendyol' },
        'hepsiburada': { width: 800, height: 800, name: 'Hepsiburada' },
        'amazon': { width: 2000, height: 2000, name: 'Amazon' },
        'instagram-post': { width: 1080, height: 1080, name: 'Instagram Post' },
        'instagram-story': { width: 1080, height: 1920, name: 'Instagram Story' },
        'facebook': { width: 1200, height: 630, name: 'Facebook Post' },
        'youtube': { width: 1280, height: 720, name: 'YouTube Thumbnail' },
      };
      const p = presets[preset.toLowerCase()];
      if (p) setCanvasSize(p);
    }

    // Doğrudan görsel URL'si ile aç
    if (imageUrl) {
      addImageFromURL(decodeURIComponent(imageUrl));
    }

    // Ürün ID ile görselleri çek
    if (productId) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      fetch(`${API_URL}/products/${productId}`, {
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => res.json())
        .then(product => {
          const mainImage = product.images?.find((img: any) => img.isMain);
          if (mainImage) {
            addImageFromURL(mainImage.url);
          } else if (product.images?.length > 0) {
            addImageFromURL(product.images[0].url);
          }
        })
        .catch(() => {
          // API erişilemiyorsa sessizce geç
        });
    }
  }, [canvasReady, searchParams, addImageFromURL, setCanvasSize]);

  return (
    <div className="h-[calc(100vh-0px)] flex flex-col bg-[#0d1117] overflow-hidden -m-6 lg:-m-0">
      {/* Üst çubuk */}
      <EditorTopBar />

      {/* Ana içerik */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sol araç çubuğu (ikonlar) */}
        <EditorToolbar />

        {/* Sol panel (genişletilmiş içerik) */}
        <EditorLeftPanel />

        {/* Canvas alanı */}
        <EditorCanvas />

        {/* Sağ panel (özellikler + katmanlar) */}
        <EditorRightPanel />
      </div>
    </div>
  );
}

export default function ImageEditorPage() {
  return (
    <EditorProvider>
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center bg-[#0d1117]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-[3px] border-slate-800" />
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 animate-spin" />
            </div>
            <p className="text-sm font-medium text-slate-400 animate-pulse">
              Görsel Editör yükleniyor...
            </p>
          </div>
        </div>
      }>
        <ImageEditorContent />
      </Suspense>
    </EditorProvider>
  );
}
