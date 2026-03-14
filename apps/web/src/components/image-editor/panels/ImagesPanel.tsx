"use client";

import React, { useState, useCallback } from 'react';
import { useEditor } from '../EditorContext';
import {
  Upload, Link, ImageIcon, Package, X, Loader2,
  Search, RefreshCw, Store,
} from 'lucide-react';

interface ImportedImage {
  id: string;
  url: string;
  name: string;
  isMain?: boolean;
}

export default function ImagesPanel() {
  const { addImageFromURL, canvasSize } = useEditor();
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState('');
  const [productImages, setProductImages] = useState<ImportedImage[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [recentImages, setRecentImages] = useState<ImportedImage[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleAddFromURL = async () => {
    if (!urlInput.trim()) return;
    setIsLoading(true);
    try {
      await addImageFromURL(urlInput.trim());
      setRecentImages(prev => [{ id: Date.now().toString(), url: urlInput.trim(), name: 'URL Görseli' }, ...prev].slice(0, 20));
      setUrlInput('');
    } catch {
      alert('Görsel yüklenemedi. URL\'yi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;
    setIsLoading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const url = e.target?.result as string;
        await addImageFromURL(url);
        setRecentImages(prev => [{ id: Date.now().toString(), url, name: file.name }, ...prev].slice(0, 20));
      };
      reader.readAsDataURL(file);
    }
    setIsLoading(false);
  }, [addImageFromURL]);

  const triggerFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e: any) => handleFileUpload(e.target.files);
    input.click();
  };

  // Ürün görsellerini çekme (pazaryeri entegrasyonu)
  const fetchProductImages = async () => {
    if (!productId.trim()) return;
    setLoadingProducts(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${API_URL}/products/${productId.trim()}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const product = await response.json();
        const images = (product.images || []).map((img: any) => ({
          id: img.id,
          url: img.url,
          name: `${product.title || 'Ürün'} - Görsel`,
          isMain: img.isMain,
        }));
        setProductImages(images);
      }
    } catch {
      // API erişilemiyorsa demo görseller göster
      setProductImages([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Dosya yükleme alanı */}
      <div className="p-3">
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
            ${dragOver ? 'border-primary bg-primary/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}`}
          onClick={triggerFileUpload}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <Loader2 size={28} className="mx-auto text-primary animate-spin mb-2" />
          ) : (
            <Upload size={28} className="mx-auto text-slate-400 mb-2" />
          )}
          <p className="text-sm font-medium text-slate-300">
            {dragOver ? 'Bırakın...' : 'Görsel Yükle'}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Sürükle & Bırak veya Tıkla</p>
          <p className="text-[10px] text-slate-600 mt-0.5">PNG, JPG, WebP, SVG</p>
        </div>
      </div>

      {/* URL ile ekleme */}
      <div className="px-3 pb-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">URL ile Ekle</h3>
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Link size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddFromURL()}
              placeholder="https://..."
              className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={handleAddFromURL}
            disabled={!urlInput.trim() || isLoading}
            className="px-3 py-2 bg-primary hover:bg-primary/80 disabled:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            Ekle
          </button>
        </div>
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* Pazaryeri ürün görselleri */}
      <div className="p-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Store size={12} />
          Pazaryeri Ürün Görselleri
        </h3>
        <div className="flex gap-1.5 mb-3">
          <div className="relative flex-1">
            <Package size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={productId}
              onChange={e => setProductId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchProductImages()}
              placeholder="Ürün ID girin..."
              className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={fetchProductImages}
            disabled={!productId.trim() || loadingProducts}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loadingProducts ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          </button>
        </div>

        {productImages.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {productImages.map(img => (
              <button
                key={img.id}
                onClick={() => addImageFromURL(img.url)}
                className="aspect-square rounded-lg overflow-hidden border border-slate-700 hover:border-primary/50 transition-all relative group"
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                {img.isMain && (
                  <span className="absolute top-1 right-1 px-1 py-0.5 bg-primary text-white text-[8px] font-bold rounded">
                    ANA
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ImageIcon size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        )}

        {productImages.length === 0 && productId && !loadingProducts && (
          <p className="text-[11px] text-slate-500 text-center py-3">
            Ürün görseli bulunamadı veya API erişilemiyor.
          </p>
        )}
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* Son yüklenenler */}
      {recentImages.length > 0 && (
        <div className="p-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Son Yüklenenler</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {recentImages.map(img => (
              <button
                key={img.id}
                onClick={() => addImageFromURL(img.url)}
                className="aspect-square rounded-lg overflow-hidden border border-slate-700 hover:border-primary/50 transition-all group"
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stok görselleri ipucu */}
      <div className="p-3 mt-auto">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            💡 <strong>İpucu:</strong> Ürünlerinizin pazaryeri görsellerini ID ile çekip doğrudan editörde düzenleyebilirsiniz. Düzenleme sonrası <strong>Dışa Aktar</strong> ile kaydedip tekrar platformlara yükleyebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
