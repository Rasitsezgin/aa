"use client";

import React, { useState } from 'react';
import { useEditor } from '../EditorContext';
import { Search, X } from 'lucide-react';

interface StickerCategoryDef {
  id: string;
  name: string;
  icon: string;
  stickers: { id: string; emoji: string; name: string }[];
}

const STICKER_CATEGORIES: StickerCategoryDef[] = [
  {
    id: 'ecommerce',
    name: 'E-Ticaret',
    icon: '🛒',
    stickers: [
      { id: 's1', emoji: '🛒', name: 'Sepet' },
      { id: 's2', emoji: '🛍️', name: 'Alışveriş' },
      { id: 's3', emoji: '📦', name: 'Paket' },
      { id: 's4', emoji: '🏷️', name: 'Etiket' },
      { id: 's5', emoji: '💳', name: 'Kart' },
      { id: 's6', emoji: '🧾', name: 'Fatura' },
      { id: 's7', emoji: '🔖', name: 'Yer im' },
      { id: 's8', emoji: '💰', name: 'Para' },
      { id: 's9', emoji: '💎', name: 'Elmas' },
      { id: 's10', emoji: '🎁', name: 'Hediye' },
      { id: 's11', emoji: '🏪', name: 'Mağaza' },
      { id: 's12', emoji: '🏬', name: 'AVM' },
      { id: 's13', emoji: '💸', name: 'Uçan Para' },
      { id: 's14', emoji: '🤑', name: 'Kazanç' },
      { id: 's15', emoji: '📊', name: 'Grafik' },
      { id: 's16', emoji: '📈', name: 'Yükseliş' },
    ],
  },
  {
    id: 'badges',
    name: 'Rozetler & Etiketler',
    icon: '🏅',
    stickers: [
      { id: 'b1', emoji: '⭐', name: 'Yıldız' },
      { id: 'b2', emoji: '🌟', name: 'Parlak Yıldız' },
      { id: 'b3', emoji: '✨', name: 'Parıltı' },
      { id: 'b4', emoji: '🏅', name: 'Madalya' },
      { id: 'b5', emoji: '🥇', name: 'Altın' },
      { id: 'b6', emoji: '🥈', name: 'Gümüş' },
      { id: 'b7', emoji: '🥉', name: 'Bronz' },
      { id: 'b8', emoji: '🏆', name: 'Kupa' },
      { id: 'b9', emoji: '👑', name: 'Taç' },
      { id: 'b10', emoji: '🎖️', name: 'Rozet' },
      { id: 'b11', emoji: '🔥', name: 'Ateş' },
      { id: 'b12', emoji: '💯', name: 'Yüz' },
      { id: 'b13', emoji: '✅', name: 'Onay' },
      { id: 'b14', emoji: '❌', name: 'Çarpı' },
      { id: 'b15', emoji: '🆕', name: 'Yeni' },
      { id: 'b16', emoji: '🆓', name: 'Ücretsiz' },
    ],
  },
  {
    id: 'shipping',
    name: 'Kargo & Teslimat',
    icon: '🚚',
    stickers: [
      { id: 'sh1', emoji: '🚚', name: 'Kamyon' },
      { id: 'sh2', emoji: '📮', name: 'Posta' },
      { id: 'sh3', emoji: '✈️', name: 'Uçak' },
      { id: 'sh4', emoji: '🚀', name: 'Roket' },
      { id: 'sh5', emoji: '📬', name: 'Kutu' },
      { id: 'sh6', emoji: '📪', name: 'Posta Kutusu' },
      { id: 'sh7', emoji: '🏠', name: 'Ev' },
      { id: 'sh8', emoji: '📍', name: 'Konum' },
      { id: 'sh9', emoji: '🗺️', name: 'Harita' },
      { id: 'sh10', emoji: '⏰', name: 'Saat' },
      { id: 'sh11', emoji: '⏱️', name: 'Kronometre' },
      { id: 'sh12', emoji: '📅', name: 'Takvim' },
    ],
  },
  {
    id: 'social',
    name: 'Sosyal Medya',
    icon: '📱',
    stickers: [
      { id: 'so1', emoji: '❤️', name: 'Kalp' },
      { id: 'so2', emoji: '👍', name: 'Başparmak' },
      { id: 'so3', emoji: '💬', name: 'Yorum' },
      { id: 'so4', emoji: '🔔', name: 'Bildirim' },
      { id: 'so5', emoji: '📱', name: 'Telefon' },
      { id: 'so6', emoji: '💻', name: 'Laptop' },
      { id: 'so7', emoji: '📸', name: 'Kamera' },
      { id: 'so8', emoji: '🎥', name: 'Video' },
      { id: 'so9', emoji: '🔗', name: 'Link' },
      { id: 'so10', emoji: '📲', name: 'İndirme' },
      { id: 'so11', emoji: '👆', name: 'Yukarı' },
      { id: 'so12', emoji: '👇', name: 'Aşağı' },
      { id: 'so13', emoji: '👈', name: 'Sol' },
      { id: 'so14', emoji: '👉', name: 'Sağ' },
      { id: 'so15', emoji: '🔄', name: 'Paylaş' },
      { id: 'so16', emoji: '💡', name: 'Fikir' },
    ],
  },
  {
    id: 'emojis',
    name: 'Yüz İfadeleri',
    icon: '😀',
    stickers: [
      { id: 'e1', emoji: '😀', name: 'Gülümseme' },
      { id: 'e2', emoji: '😍', name: 'Aşık' },
      { id: 'e3', emoji: '🤩', name: 'Hayran' },
      { id: 'e4', emoji: '😎', name: 'Havalı' },
      { id: 'e5', emoji: '🥳', name: 'Kutlama' },
      { id: 'e6', emoji: '😱', name: 'Şaşkın' },
      { id: 'e7', emoji: '🤔', name: 'Düşünceli' },
      { id: 'e8', emoji: '🤫', name: 'Sessiz' },
      { id: 'e9', emoji: '😮', name: 'Şok' },
      { id: 'e10', emoji: '🤯', name: 'Beyin Patla' },
      { id: 'e11', emoji: '👏', name: 'Alkış' },
      { id: 'e12', emoji: '🙌', name: 'Eller' },
      { id: 'e13', emoji: '💪', name: 'Güçlü' },
      { id: 'e14', emoji: '🎉', name: 'Konfeti' },
      { id: 'e15', emoji: '🎊', name: 'Şerit' },
      { id: 'e16', emoji: '🥰', name: 'Sevgi' },
    ],
  },
  {
    id: 'food',
    name: 'Yiyecek & İçecek',
    icon: '🍕',
    stickers: [
      { id: 'f1', emoji: '☕', name: 'Kahve' },
      { id: 'f2', emoji: '🍕', name: 'Pizza' },
      { id: 'f3', emoji: '🍔', name: 'Burger' },
      { id: 'f4', emoji: '🍰', name: 'Pasta' },
      { id: 'f5', emoji: '🍫', name: 'Çikolata' },
      { id: 'f6', emoji: '🍦', name: 'Dondurma' },
      { id: 'f7', emoji: '🧁', name: 'Cupcake' },
      { id: 'f8', emoji: '🍩', name: 'Donut' },
      { id: 'f9', emoji: '🍷', name: 'Şarap' },
      { id: 'f10', emoji: '🥂', name: 'Kadeh' },
      { id: 'f11', emoji: '☕', name: 'Çay' },
      { id: 'f12', emoji: '🧃', name: 'Meyve Suyu' },
    ],
  },
  {
    id: 'nature',
    name: 'Doğa & Mevsim',
    icon: '🌸',
    stickers: [
      { id: 'n1', emoji: '🌸', name: 'Kiraz Çiçeği' },
      { id: 'n2', emoji: '🌺', name: 'Çiçek' },
      { id: 'n3', emoji: '🌻', name: 'Ayçiçeği' },
      { id: 'n4', emoji: '🍁', name: 'Yaprak' },
      { id: 'n5', emoji: '❄️', name: 'Kar' },
      { id: 'n6', emoji: '☀️', name: 'Güneş' },
      { id: 'n7', emoji: '🌙', name: 'Ay' },
      { id: 'n8', emoji: '⭐', name: 'Yıldız' },
      { id: 'n9', emoji: '🌈', name: 'Gökkuşağı' },
      { id: 'n10', emoji: '🌊', name: 'Dalga' },
      { id: 'n11', emoji: '🌴', name: 'Palmiye' },
      { id: 'n12', emoji: '🎄', name: 'Çam' },
    ],
  },
  {
    id: 'arrows',
    name: 'Oklar & İşaretler',
    icon: '➡️',
    stickers: [
      { id: 'a1', emoji: '➡️', name: 'Sağ Ok' },
      { id: 'a2', emoji: '⬅️', name: 'Sol Ok' },
      { id: 'a3', emoji: '⬆️', name: 'Yukarı Ok' },
      { id: 'a4', emoji: '⬇️', name: 'Aşağı Ok' },
      { id: 'a5', emoji: '↗️', name: 'Sağ Üst' },
      { id: 'a6', emoji: '↘️', name: 'Sağ Alt' },
      { id: 'a7', emoji: '◀️', name: 'Geri' },
      { id: 'a8', emoji: '▶️', name: 'İleri' },
      { id: 'a9', emoji: '⏩', name: 'Hızlı' },
      { id: 'a10', emoji: '🔴', name: 'Kırmızı' },
      { id: 'a11', emoji: '🟢', name: 'Yeşil' },
      { id: 'a12', emoji: '🔵', name: 'Mavi' },
      { id: 'a13', emoji: '🟡', name: 'Sarı' },
      { id: 'a14', emoji: '⚡', name: 'Şimşek' },
      { id: 'a15', emoji: '💥', name: 'Patlama' },
      { id: 'a16', emoji: '🎯', name: 'Hedef' },
    ],
  },
];

// Hazır etiket şablonları (rozet + metin kombinasyonu)
const BADGE_STICKERS = [
  { id: 'badge-sale', text: '%İNDİRİM', bgColor: '#ef4444', textColor: '#ffffff', shape: 'circle' },
  { id: 'badge-new', text: 'YENİ', bgColor: '#22c55e', textColor: '#ffffff', shape: 'circle' },
  { id: 'badge-hot', text: 'ÇOK SATAN', bgColor: '#f59e0b', textColor: '#ffffff', shape: 'circle' },
  { id: 'badge-limited', text: 'SINIRLI', bgColor: '#8b5cf6', textColor: '#ffffff', shape: 'circle' },
  { id: 'badge-free-ship', text: 'ÜCRETSİZ\nKARGO', bgColor: '#06b6d4', textColor: '#ffffff', shape: 'circle' },
  { id: 'badge-campaign', text: 'KAMPANYA', bgColor: '#ec4899', textColor: '#ffffff', shape: 'circle' },
  { id: 'badge-best', text: 'EN İYİ\nFİYAT', bgColor: '#3b82f6', textColor: '#ffffff', shape: 'circle' },
  { id: 'badge-guarantee', text: 'GARANTİ', bgColor: '#059669', textColor: '#ffffff', shape: 'circle' },
  { id: 'badge-percent10', text: '%10', bgColor: '#ef4444', textColor: '#ffffff', shape: 'rect' },
  { id: 'badge-percent20', text: '%20', bgColor: '#ef4444', textColor: '#ffffff', shape: 'rect' },
  { id: 'badge-percent30', text: '%30', bgColor: '#ef4444', textColor: '#ffffff', shape: 'rect' },
  { id: 'badge-percent50', text: '%50', bgColor: '#ef4444', textColor: '#ffffff', shape: 'rect' },
  { id: 'badge-percent70', text: '%70', bgColor: '#ef4444', textColor: '#ffffff', shape: 'rect' },
  { id: 'badge-kargo', text: '🚚 Kargo Bedava', bgColor: '#22c55e', textColor: '#ffffff', shape: 'pill' },
  { id: 'badge-fast', text: '⚡ Hızlı Teslimat', bgColor: '#f59e0b', textColor: '#ffffff', shape: 'pill' },
  { id: 'badge-safe', text: '🛡️ Güvenli Alışveriş', bgColor: '#3b82f6', textColor: '#ffffff', shape: 'pill' },
];

export default function StickersPanel() {
  const { addText, addShape } = useEditor();
  const [activeCategory, setActiveCategory] = useState('ecommerce');
  const [searchQuery, setSearchQuery] = useState('');
  const [stickerSize, setStickerSize] = useState(48);

  const handleAddSticker = (emoji: string) => {
    addText(emoji, {
      fontSize: stickerSize,
      textAlign: 'center',
      width: stickerSize + 20,
    });
  };

  const handleAddBadge = (badge: typeof BADGE_STICKERS[0]) => {
    if (badge.shape === 'circle') {
      addShape('circle', {
        radius: 50,
        fill: badge.bgColor,
        strokeWidth: 3,
        stroke: '#ffffff',
        shadow: { color: 'rgba(0,0,0,0.3)', blur: 10, offsetX: 2, offsetY: 2 },
      });
      setTimeout(() => {
        addText(badge.text, {
          fontSize: 16,
          fontWeight: 'bold',
          fill: badge.textColor,
          textAlign: 'center',
          width: 90,
        });
      }, 80);
    } else if (badge.shape === 'rect') {
      addShape('rectangle', {
        width: 100,
        height: 100,
        fill: badge.bgColor,
        rx: 12,
        ry: 12,
        shadow: { color: 'rgba(0,0,0,0.2)', blur: 8, offsetX: 2, offsetY: 2 },
      });
      setTimeout(() => {
        addText(badge.text, {
          fontSize: 36,
          fontWeight: 'bold',
          fill: badge.textColor,
          textAlign: 'center',
          width: 90,
        });
      }, 80);
    } else {
      // pill
      addShape('rectangle', {
        width: 220,
        height: 44,
        fill: badge.bgColor,
        rx: 22,
        ry: 22,
        shadow: { color: 'rgba(0,0,0,0.2)', blur: 8, offsetX: 1, offsetY: 2 },
      });
      setTimeout(() => {
        addText(badge.text, {
          fontSize: 16,
          fontWeight: 'bold',
          fill: badge.textColor,
          textAlign: 'center',
          width: 210,
        });
      }, 80);
    }
  };

  const currentCategory = STICKER_CATEGORIES.find(c => c.id === activeCategory);

  const filteredStickers = searchQuery
    ? STICKER_CATEGORIES.flatMap(cat =>
        cat.stickers.filter(s =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.emoji.includes(searchQuery)
        )
      )
    : currentCategory?.stickers || [];

  return (
    <div className="flex flex-col h-full">
      {/* Arama */}
      <div className="p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Sticker ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Boyut */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-slate-500">Boyut</label>
          <input
            type="range"
            min={24}
            max={120}
            step={4}
            value={stickerSize}
            onChange={e => setStickerSize(parseInt(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-[10px] text-slate-400 w-8 text-right">{stickerSize}px</span>
        </div>
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* E-ticaret Rozetleri */}
      <div className="px-3 py-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">E-Ticaret Rozetleri</h3>
        <div className="grid grid-cols-4 gap-1.5">
          {BADGE_STICKERS.map(badge => (
            <button
              key={badge.id}
              onClick={() => handleAddBadge(badge)}
              className="flex flex-col items-center gap-1 p-1.5 rounded-lg border border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              title={badge.text.replace('\n', ' ')}
            >
              <div
                className={`w-10 h-6 flex items-center justify-center text-white text-[7px] font-bold leading-tight text-center
                  ${badge.shape === 'circle' ? 'rounded-full w-8 h-8' : badge.shape === 'pill' ? 'rounded-full w-full' : 'rounded'}`}
                style={{ backgroundColor: badge.bgColor }}
              >
                {badge.text.replace('\n', ' ').substring(0, 10)}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-700 mx-3" />

      {/* Kategori Tabs */}
      {!searchQuery && (
        <div className="px-3 py-2">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {STICKER_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors shrink-0
                  ${activeCategory === cat.id
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
      )}

      {/* Sticker Grid */}
      <div className="flex-1 overflow-y-auto px-3 py-1">
        <div className="grid grid-cols-5 gap-1.5">
          {filteredStickers.map(sticker => (
            <button
              key={sticker.id}
              onClick={() => handleAddSticker(sticker.emoji)}
              className="flex flex-col items-center gap-0.5 p-2 rounded-lg border border-slate-700/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              title={sticker.name}
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">{sticker.emoji}</span>
              <span className="text-[8px] text-slate-500 group-hover:text-slate-300 truncate w-full text-center">{sticker.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
