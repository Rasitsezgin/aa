import type { AdvancedTemplate } from '../types';

// ─── E-Ticaret Şablonları ───────────────────────────────

const ecommerceTemplates: AdvancedTemplate[] = [
  {
    id: 'product-showcase-pro',
    name: 'Profesyonel Ürün Vitrin',
    description: 'Temiz ve modern ürün gösterim şablonu',
    category: 'e-commerce',
    tags: ['ürün', 'vitrin', 'temiz', 'minimal'],
    canvasWidth: 800,
    canvasHeight: 800,
    backgroundColor: '#f8fafc',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 800, height: 800, fill: '#f8fafc' } },
      { type: 'rect', props: { left: 0, top: 0, width: 800, height: 6, fill: '#3b82f6' } },
      { type: 'rect', props: { left: 40, top: 620, width: 720, height: 140, fill: '#ffffff', rx: 16, ry: 16, shadow: { color: 'rgba(0,0,0,0.08)', blur: 20, offsetX: 0, offsetY: 4 } } },
      { type: 'text', props: { text: 'ÜRÜN ADI', left: 70, top: 640, fontSize: 28, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1e293b' } },
      { type: 'text', props: { text: 'Premium kalite ürün açıklaması', left: 70, top: 680, fontSize: 16, fontFamily: 'Arial', fill: '#64748b' } },
      { type: 'text', props: { text: '₺299,99', left: 570, top: 648, fontSize: 32, fontFamily: 'Arial', fontWeight: 'bold', fill: '#3b82f6' } },
      { type: 'rect', props: { left: 570, top: 692, width: 160, height: 40, fill: '#3b82f6', rx: 8, ry: 8 } },
      { type: 'text', props: { text: 'SATIN AL', left: 596, top: 700, fontSize: 16, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'circle', props: { left: 620, top: 30, radius: 45, fill: '#ef4444' } },
      { type: 'text', props: { text: '%25\nİNDİRİM', left: 628, top: 42, fontSize: 14, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', width: 74 } },
    ],
  },
  {
    id: 'mega-sale-banner',
    name: 'Mega İndirim Banner',
    description: 'Dikkat çekici büyük indirim görseli',
    category: 'promotion',
    tags: ['indirim', 'kampanya', 'dikkat çekici', 'banner'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#dc2626',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#dc2626' } },
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#b91c1c', opacity: 0.4 } },
      // Dekoratif köşe şeritleri
      { type: 'rect', props: { left: -100, top: 200, width: 600, height: 60, fill: '#fbbf24', angle: -45 } },
      { type: 'rect', props: { left: 580, top: 820, width: 600, height: 60, fill: '#fbbf24', angle: -45 } },
      // Ana metin bloğu
      { type: 'rect', props: { left: 90, top: 180, width: 900, height: 720, fill: 'rgba(0,0,0,0.2)', rx: 30, ry: 30 } },
      { type: 'text', props: { text: 'MEGA', left: 140, top: 220, fontSize: 120, fontFamily: 'Impact', fontWeight: 'bold', fill: '#fbbf24', charSpacing: 200 } },
      { type: 'text', props: { text: 'İNDİRİM', left: 140, top: 340, fontSize: 100, fontFamily: 'Impact', fontWeight: 'bold', fill: '#ffffff', charSpacing: 160 } },
      { type: 'text', props: { text: '%70\'e varan', left: 200, top: 470, fontSize: 48, fontFamily: 'Arial', fontWeight: 'bold', fill: '#fbbf24' } },
      { type: 'text', props: { text: 'İNDİRİM FIRSATI', left: 200, top: 530, fontSize: 48, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'rect', props: { left: 240, top: 630, width: 600, height: 70, fill: '#fbbf24', rx: 35, ry: 35 } },
      { type: 'text', props: { text: 'HEMEN ALIŞVERİŞE BAŞLA', left: 290, top: 644, fontSize: 26, fontFamily: 'Arial', fontWeight: 'bold', fill: '#991b1b' } },
      { type: 'text', props: { text: 'Fırsat sınırlı sürelidir!', left: 370, top: 730, fontSize: 20, fontFamily: 'Arial', fill: '#fecaca' } },
      // Dekoratif yıldızlar
      { type: 'text', props: { text: '★', left: 100, top: 100, fontSize: 40, fill: '#fbbf24', opacity: 0.6 } },
      { type: 'text', props: { text: '★', left: 900, top: 140, fontSize: 30, fill: '#fbbf24', opacity: 0.4 } },
      { type: 'text', props: { text: '★', left: 950, top: 60, fontSize: 50, fill: '#fbbf24', opacity: 0.5 } },
    ],
  },
  {
    id: 'product-catalog',
    name: 'Ürün Kataloğu',
    description: '4 ürün kutucuklu katalog tasarımı',
    category: 'e-commerce',
    tags: ['katalog', 'grid', 'çoklu ürün'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#ffffff',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#ffffff' } },
      // Üst başlık
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 120, fill: '#1e293b' } },
      { type: 'text', props: { text: 'YENİ SEZON KOLEKSİYONU', left: 240, top: 35, fontSize: 36, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff', charSpacing: 100 } },
      { type: 'rect', props: { left: 340, top: 85, width: 400, height: 3, fill: '#f59e0b' } },
      // 4 ürün kutusu
      { type: 'rect', props: { left: 40, top: 150, width: 480, height: 400, fill: '#f1f5f9', rx: 12, ry: 12 } },
      { type: 'rect', props: { left: 560, top: 150, width: 480, height: 400, fill: '#f1f5f9', rx: 12, ry: 12 } },
      { type: 'rect', props: { left: 40, top: 580, width: 480, height: 400, fill: '#f1f5f9', rx: 12, ry: 12 } },
      { type: 'rect', props: { left: 560, top: 580, width: 480, height: 400, fill: '#f1f5f9', rx: 12, ry: 12 } },
      // Ürün etiketleri
      { type: 'text', props: { text: 'Ürün 1', left: 80, top: 500, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#334155' } },
      { type: 'text', props: { text: '₺149,99', left: 380, top: 502, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#3b82f6' } },
      { type: 'text', props: { text: 'Ürün 2', left: 600, top: 500, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#334155' } },
      { type: 'text', props: { text: '₺199,99', left: 900, top: 502, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#3b82f6' } },
      { type: 'text', props: { text: 'Ürün 3', left: 80, top: 930, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#334155' } },
      { type: 'text', props: { text: '₺249,99', left: 380, top: 932, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#3b82f6' } },
      { type: 'text', props: { text: 'Ürün 4', left: 600, top: 930, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#334155' } },
      { type: 'text', props: { text: '₺299,99', left: 900, top: 932, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#3b82f6' } },
      // Alt bilgi
      { type: 'rect', props: { left: 0, top: 1010, width: 1080, height: 70, fill: '#1e293b' } },
      { type: 'text', props: { text: 'www.magazaniz.com  |  Ücretsiz Kargo', left: 300, top: 1025, fontSize: 20, fontFamily: 'Arial', fill: '#94a3b8' } },
    ],
  },
  {
    id: 'flash-sale',
    name: 'Flash İndirim',
    description: 'Aciliyet hissi veren kısa süreli kampanya',
    category: 'promotion',
    tags: ['flash', 'acil', 'geri sayım', 'hızlı'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#0f172a',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#0f172a' } },
      // Zigzag şerit
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 8, fill: '#f59e0b' } },
      { type: 'rect', props: { left: 0, top: 1072, width: 1080, height: 8, fill: '#f59e0b' } },
      // Flash ikon
      { type: 'text', props: { text: '⚡', left: 440, top: 80, fontSize: 120, fill: '#f59e0b' } },
      { type: 'text', props: { text: 'FLASH', left: 260, top: 230, fontSize: 100, fontFamily: 'Impact', fontWeight: 'bold', fill: '#f59e0b', charSpacing: 200 } },
      { type: 'text', props: { text: 'İNDİRİM', left: 220, top: 340, fontSize: 90, fontFamily: 'Impact', fontWeight: 'bold', fill: '#ffffff', charSpacing: 100 } },
      // Geri sayım kutuları
      { type: 'rect', props: { left: 170, top: 480, width: 160, height: 120, fill: '#1e293b', rx: 16, ry: 16, stroke: '#f59e0b', strokeWidth: 2 } },
      { type: 'text', props: { text: '02', left: 200, top: 495, fontSize: 60, fontFamily: 'Arial', fontWeight: 'bold', fill: '#f59e0b' } },
      { type: 'text', props: { text: 'SAAT', left: 218, top: 570, fontSize: 14, fontFamily: 'Arial', fill: '#94a3b8' } },
      { type: 'rect', props: { left: 390, top: 480, width: 160, height: 120, fill: '#1e293b', rx: 16, ry: 16, stroke: '#f59e0b', strokeWidth: 2 } },
      { type: 'text', props: { text: '45', left: 420, top: 495, fontSize: 60, fontFamily: 'Arial', fontWeight: 'bold', fill: '#f59e0b' } },
      { type: 'text', props: { text: 'DAKİKA', left: 424, top: 570, fontSize: 14, fontFamily: 'Arial', fill: '#94a3b8' } },
      { type: 'rect', props: { left: 610, top: 480, width: 160, height: 120, fill: '#1e293b', rx: 16, ry: 16, stroke: '#f59e0b', strokeWidth: 2 } },
      { type: 'text', props: { text: '30', left: 646, top: 495, fontSize: 60, fontFamily: 'Arial', fontWeight: 'bold', fill: '#f59e0b' } },
      { type: 'text', props: { text: 'SANİYE', left: 650, top: 570, fontSize: 14, fontFamily: 'Arial', fill: '#94a3b8' } },
      // Ayırıcı
      { type: 'text', props: { text: ':', left: 348, top: 500, fontSize: 50, fontFamily: 'Arial', fontWeight: 'bold', fill: '#f59e0b' } },
      { type: 'text', props: { text: ':', left: 568, top: 500, fontSize: 50, fontFamily: 'Arial', fontWeight: 'bold', fill: '#f59e0b' } },
      // CTA
      { type: 'rect', props: { left: 290, top: 680, width: 500, height: 70, fill: '#f59e0b', rx: 35, ry: 35 } },
      { type: 'text', props: { text: 'FIRSATI KAÇIRMA!', left: 370, top: 694, fontSize: 28, fontFamily: 'Arial', fontWeight: 'bold', fill: '#0f172a' } },
      { type: 'text', props: { text: '%80\'e varan indirimler sizi bekliyor', left: 320, top: 790, fontSize: 22, fontFamily: 'Arial', fill: '#64748b' } },
    ],
  },
  {
    id: 'free-shipping',
    name: 'Ücretsiz Kargo Kampanyası',
    description: 'Kargosu bedava kampanya görseli',
    category: 'promotion',
    tags: ['kargo', 'ücretsiz', 'bedava', 'kampanya'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#ecfdf5',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#ecfdf5' } },
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 200, fill: '#059669' } },
      { type: 'text', props: { text: '🚚', left: 460, top: 20, fontSize: 80 } },
      { type: 'text', props: { text: 'ÜCRETSİZ KARGO', left: 240, top: 120, fontSize: 44, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff', charSpacing: 100 } },
      { type: 'rect', props: { left: 100, top: 260, width: 880, height: 500, fill: '#ffffff', rx: 24, ry: 24, shadow: { color: 'rgba(0,0,0,0.08)', blur: 30, offsetX: 0, offsetY: 8 } } },
      { type: 'text', props: { text: 'TÜM SİPARİŞLERDE', left: 220, top: 310, fontSize: 36, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1e293b' } },
      { type: 'text', props: { text: 'KARGO BEDAVA', left: 230, top: 370, fontSize: 56, fontFamily: 'Arial', fontWeight: 'bold', fill: '#059669' } },
      { type: 'rect', props: { left: 200, top: 460, width: 680, height: 3, fill: '#d1fae5' } },
      { type: 'text', props: { text: '✓ Hızlı teslimat', left: 250, top: 490, fontSize: 24, fontFamily: 'Arial', fill: '#334155' } },
      { type: 'text', props: { text: '✓ Güvenli paketleme', left: 250, top: 535, fontSize: 24, fontFamily: 'Arial', fill: '#334155' } },
      { type: 'text', props: { text: '✓ Kapıda ödeme seçeneği', left: 250, top: 580, fontSize: 24, fontFamily: 'Arial', fill: '#334155' } },
      { type: 'text', props: { text: '✓ Kolay iade', left: 250, top: 625, fontSize: 24, fontFamily: 'Arial', fill: '#334155' } },
      { type: 'rect', props: { left: 290, top: 830, width: 500, height: 60, fill: '#059669', rx: 30, ry: 30 } },
      { type: 'text', props: { text: 'ALIŞVERİŞE BAŞLA', left: 380, top: 846, fontSize: 24, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'text', props: { text: 'Kampanya 31 Aralık\'a kadar geçerlidir.', left: 330, top: 920, fontSize: 16, fontFamily: 'Arial', fill: '#94a3b8' } },
    ],
  },
  {
    id: 'compare-products',
    name: 'Ürün Karşılaştırma',
    description: 'VS düzenli ürün karşılaştırma',
    category: 'e-commerce',
    tags: ['karşılaştırma', 'vs', 'ürün'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#0f172a',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#0f172a' } },
      // Sol ürün
      { type: 'rect', props: { left: 40, top: 120, width: 460, height: 840, fill: '#1e293b', rx: 20, ry: 20 } },
      { type: 'rect', props: { left: 80, top: 160, width: 380, height: 380, fill: '#334155', rx: 12, ry: 12 } },
      { type: 'text', props: { text: 'Ürün A', left: 180, top: 580, fontSize: 32, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'text', props: { text: '₺499,99', left: 170, top: 640, fontSize: 36, fontFamily: 'Arial', fontWeight: 'bold', fill: '#3b82f6' } },
      { type: 'text', props: { text: '★★★★★', left: 150, top: 700, fontSize: 28, fill: '#f59e0b' } },
      { type: 'text', props: { text: '✓ Özellik 1\n✓ Özellik 2\n✓ Özellik 3', left: 100, top: 760, fontSize: 18, fontFamily: 'Arial', fill: '#94a3b8', lineHeight: 1.6 } },
      // VS rozeti
      { type: 'circle', props: { left: 480, top: 480, radius: 50, fill: '#ef4444', shadow: { color: 'rgba(239,68,68,0.4)', blur: 20, offsetX: 0, offsetY: 0 } } },
      { type: 'text', props: { text: 'VS', left: 498, top: 496, fontSize: 36, fontFamily: 'Impact', fontWeight: 'bold', fill: '#ffffff' } },
      // Sağ ürün
      { type: 'rect', props: { left: 580, top: 120, width: 460, height: 840, fill: '#1e293b', rx: 20, ry: 20 } },
      { type: 'rect', props: { left: 620, top: 160, width: 380, height: 380, fill: '#334155', rx: 12, ry: 12 } },
      { type: 'text', props: { text: 'Ürün B', left: 720, top: 580, fontSize: 32, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'text', props: { text: '₺399,99', left: 710, top: 640, fontSize: 36, fontFamily: 'Arial', fontWeight: 'bold', fill: '#22c55e' } },
      { type: 'text', props: { text: '★★★★☆', left: 690, top: 700, fontSize: 28, fill: '#f59e0b' } },
      { type: 'text', props: { text: '✓ Özellik 1\n✓ Özellik 2\n✗ Özellik 3', left: 640, top: 760, fontSize: 18, fontFamily: 'Arial', fill: '#94a3b8', lineHeight: 1.6 } },
      // Başlık
      { type: 'text', props: { text: 'HANGİSİNİ SEÇMELİ?', left: 260, top: 40, fontSize: 44, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff', charSpacing: 80 } },
    ],
  },
  {
    id: 'bundle-offer',
    name: 'Paket Teklif',
    description: '3 ürünlü avantajlı paket',
    category: 'promotion',
    tags: ['paket', 'combo', 'avantaj', 'teklif'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#4f46e5',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#4f46e5' } },
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#3730a3', opacity: 0.5 } },
      { type: 'text', props: { text: 'SÜPER PAKET', left: 240, top: 50, fontSize: 56, fontFamily: 'Impact', fontWeight: 'bold', fill: '#ffffff', charSpacing: 120 } },
      { type: 'text', props: { text: 'TEKLİF', left: 370, top: 120, fontSize: 48, fontFamily: 'Impact', fontWeight: 'bold', fill: '#fbbf24', charSpacing: 80 } },
      // 3 ürün kutusu
      { type: 'rect', props: { left: 50, top: 220, width: 300, height: 350, fill: 'rgba(255,255,255,0.1)', rx: 16, ry: 16, stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 } },
      { type: 'text', props: { text: '📦', left: 150, top: 260, fontSize: 60 } },
      { type: 'text', props: { text: 'Ürün 1', left: 140, top: 360, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'text', props: { text: '₺199', left: 150, top: 400, fontSize: 24, fontFamily: 'Arial', fill: '#c7d2fe' } },
      { type: 'rect', props: { left: 390, top: 220, width: 300, height: 350, fill: 'rgba(255,255,255,0.1)', rx: 16, ry: 16, stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 } },
      { type: 'text', props: { text: '📦', left: 490, top: 260, fontSize: 60 } },
      { type: 'text', props: { text: 'Ürün 2', left: 480, top: 360, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'text', props: { text: '₺249', left: 490, top: 400, fontSize: 24, fontFamily: 'Arial', fill: '#c7d2fe' } },
      { type: 'rect', props: { left: 730, top: 220, width: 300, height: 350, fill: 'rgba(255,255,255,0.1)', rx: 16, ry: 16, stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 } },
      { type: 'text', props: { text: '📦', left: 830, top: 260, fontSize: 60 } },
      { type: 'text', props: { text: 'Ürün 3', left: 820, top: 360, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'text', props: { text: '₺299', left: 830, top: 400, fontSize: 24, fontFamily: 'Arial', fill: '#c7d2fe' } },
      // Artı işaretleri
      { type: 'text', props: { text: '+', left: 364, top: 350, fontSize: 48, fontFamily: 'Arial', fontWeight: 'bold', fill: '#fbbf24' } },
      { type: 'text', props: { text: '+', left: 704, top: 350, fontSize: 48, fontFamily: 'Arial', fontWeight: 'bold', fill: '#fbbf24' } },
      // Toplam fiyat
      { type: 'rect', props: { left: 140, top: 640, width: 800, height: 200, fill: 'rgba(0,0,0,0.3)', rx: 20, ry: 20 } },
      { type: 'text', props: { text: 'Ayrı ayrı: ₺747', left: 350, top: 660, fontSize: 24, fontFamily: 'Arial', fill: '#94a3b8', textDecoration: 'line-through' } },
      { type: 'text', props: { text: 'PAKET FİYATI', left: 370, top: 710, fontSize: 28, fontFamily: 'Arial', fontWeight: 'bold', fill: '#fbbf24' } },
      { type: 'text', props: { text: '₺499,99', left: 350, top: 755, fontSize: 56, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      // Alt CTA
      { type: 'rect', props: { left: 290, top: 900, width: 500, height: 65, fill: '#fbbf24', rx: 32, ry: 32 } },
      { type: 'text', props: { text: 'PAKETİ SATIN AL', left: 385, top: 916, fontSize: 26, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1e1b4b' } },
      { type: 'text', props: { text: '%33 TASARRUF', left: 420, top: 990, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#22c55e' } },
    ],
  },
  {
    id: 'customer-review',
    name: 'Müşteri Yorumu',
    description: 'Müşteri değerlendirmesi paylaşım kartı',
    category: 'e-commerce',
    tags: ['yorum', 'değerlendirme', 'müşteri', 'review'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#ffffff',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#ffffff' } },
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 8, fill: '#f59e0b' } },
      // Tırnak işareti
      { type: 'text', props: { text: '"', left: 80, top: 50, fontSize: 200, fontFamily: 'Georgia', fill: '#f59e0b', opacity: 0.3 } },
      // Yorum metni
      { type: 'text', props: { text: 'Bu ürünü kullanmaya başladığımdan beri\nçok memnunum. Kalitesi muhteşem,\nteslimat hızlı ve paketleme özenli.', left: 100, top: 250, fontSize: 32, fontFamily: 'Georgia', fontStyle: 'italic', fill: '#1e293b', lineHeight: 1.6, width: 880 } },
      // Yıldızlar
      { type: 'text', props: { text: '★★★★★', left: 100, top: 510, fontSize: 40, fill: '#f59e0b' } },
      // Çizgi
      { type: 'rect', props: { left: 100, top: 590, width: 100, height: 4, fill: '#f59e0b' } },
      // Müşteri bilgisi
      { type: 'text', props: { text: 'Ahmet Y.', left: 100, top: 620, fontSize: 28, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1e293b' } },
      { type: 'text', props: { text: 'Doğrulanmış Alıcı', left: 100, top: 660, fontSize: 18, fontFamily: 'Arial', fill: '#22c55e' } },
      // Ürün kutusu
      { type: 'rect', props: { left: 60, top: 740, width: 960, height: 200, fill: '#f8fafc', rx: 16, ry: 16, stroke: '#e2e8f0', strokeWidth: 1 } },
      { type: 'rect', props: { left: 90, top: 770, width: 140, height: 140, fill: '#e2e8f0', rx: 8, ry: 8 } },
      { type: 'text', props: { text: 'Ürün Adı Buraya', left: 260, top: 790, fontSize: 24, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1e293b' } },
      { type: 'text', props: { text: 'Ürün açıklaması kısa metin...', left: 260, top: 830, fontSize: 18, fontFamily: 'Arial', fill: '#64748b' } },
      { type: 'text', props: { text: '₺349,99', left: 260, top: 870, fontSize: 28, fontFamily: 'Arial', fontWeight: 'bold', fill: '#3b82f6' } },
      { type: 'rect', props: { left: 750, top: 830, width: 240, height: 50, fill: '#3b82f6', rx: 8, ry: 8 } },
      { type: 'text', props: { text: 'SATIN AL', left: 810, top: 842, fontSize: 20, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      // Alt marka
      { type: 'text', props: { text: 'Markanız', left: 460, top: 980, fontSize: 24, fontFamily: 'Arial', fontWeight: 'bold', fill: '#94a3b8' } },
    ],
  },
  {
    id: 'new-arrival',
    name: 'Yeni Ürün Duyurusu',
    description: 'Yeni ürün lansmanı görseli',
    category: 'e-commerce',
    tags: ['yeni', 'lansman', 'duyuru'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#0f172a',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#0f172a' } },
      // Dekoratif arka plan çizgileri
      { type: 'rect', props: { left: 0, top: 200, width: 1080, height: 1, fill: 'rgba(59,130,246,0.1)' } },
      { type: 'rect', props: { left: 0, top: 400, width: 1080, height: 1, fill: 'rgba(59,130,246,0.1)' } },
      { type: 'rect', props: { left: 0, top: 600, width: 1080, height: 1, fill: 'rgba(59,130,246,0.1)' } },
      { type: 'rect', props: { left: 0, top: 800, width: 1080, height: 1, fill: 'rgba(59,130,246,0.1)' } },
      // YENİ badge
      { type: 'rect', props: { left: 380, top: 60, width: 320, height: 50, fill: '#22c55e', rx: 25, ry: 25 } },
      { type: 'text', props: { text: '✨ YENİ ÜRÜN ✨', left: 415, top: 70, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      // Ana ürün alanı
      { type: 'rect', props: { left: 140, top: 160, width: 800, height: 500, fill: '#1e293b', rx: 24, ry: 24 } },
      { type: 'text', props: { text: 'ÜRÜN\nGÖRSELİ', left: 430, top: 360, fontSize: 36, fontFamily: 'Arial', fontWeight: 'bold', fill: '#334155', textAlign: 'center', width: 220 } },
      // Ürün bilgileri
      { type: 'text', props: { text: 'Yeni Sezon', left: 140, top: 700, fontSize: 22, fontFamily: 'Arial', fill: '#3b82f6' } },
      { type: 'text', props: { text: 'Ürün Adını Yazın', left: 140, top: 740, fontSize: 44, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'text', props: { text: 'Ürün açıklaması buraya yazılacak. Kısa ve etkileyici.', left: 140, top: 800, fontSize: 20, fontFamily: 'Arial', fill: '#94a3b8', width: 600 } },
      { type: 'text', props: { text: '₺599,99', left: 140, top: 870, fontSize: 48, fontFamily: 'Arial', fontWeight: 'bold', fill: '#22c55e' } },
      { type: 'rect', props: { left: 140, top: 940, width: 300, height: 60, fill: '#3b82f6', rx: 12, ry: 12 } },
      { type: 'text', props: { text: 'ŞİMDİ KEŞFEDİN', left: 190, top: 954, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      // Garanti rozetleri
      { type: 'text', props: { text: '🛡️ 2 Yıl Garanti', left: 640, top: 870, fontSize: 18, fontFamily: 'Arial', fill: '#94a3b8' } },
      { type: 'text', props: { text: '🚚 Ücretsiz Kargo', left: 640, top: 905, fontSize: 18, fontFamily: 'Arial', fill: '#94a3b8' } },
      { type: 'text', props: { text: '↩️ Kolay İade', left: 640, top: 940, fontSize: 18, fontFamily: 'Arial', fill: '#94a3b8' } },
    ],
  },
];

// ─── Sosyal Medya Şablonları ─────────────────────────────

const socialMediaTemplates: AdvancedTemplate[] = [
  {
    id: 'instagram-story-promo',
    name: 'Story Promosyon',
    description: 'Instagram/TikTok story formatında promosyon',
    category: 'social-media',
    tags: ['story', 'instagram', 'tiktok', 'dikey'],
    canvasWidth: 1080,
    canvasHeight: 1920,
    backgroundColor: '#581c87',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1920, fill: '#581c87' } },
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1920, fill: '#7c3aed', opacity: 0.5 } },
      // Üst dekorasyon
      { type: 'circle', props: { left: -50, top: -80, radius: 200, fill: '#a855f7', opacity: 0.3 } },
      { type: 'circle', props: { left: 850, top: -50, radius: 150, fill: '#ec4899', opacity: 0.3 } },
      // Ana metin
      { type: 'text', props: { text: 'ÖZEL\nKAMPANYA', left: 80, top: 200, fontSize: 80, fontFamily: 'Impact', fontWeight: 'bold', fill: '#ffffff', lineHeight: 1.1, charSpacing: 80 } },
      { type: 'rect', props: { left: 80, top: 410, width: 200, height: 6, fill: '#fbbf24' } },
      { type: 'text', props: { text: 'Tüm ürünlerde geçerli', left: 80, top: 440, fontSize: 28, fontFamily: 'Arial', fill: '#e9d5ff' } },
      // Ürün kutusu
      { type: 'rect', props: { left: 60, top: 540, width: 960, height: 700, fill: 'rgba(255,255,255,0.1)', rx: 24, ry: 24 } },
      { type: 'text', props: { text: 'ÜRÜN GÖRSELİ', left: 370, top: 840, fontSize: 32, fontFamily: 'Arial', fill: '#a78bfa', textAlign: 'center', width: 340 } },
      // Fiyat bloğu
      { type: 'rect', props: { left: 60, top: 1300, width: 960, height: 250, fill: 'rgba(0,0,0,0.3)', rx: 20, ry: 20 } },
      { type: 'text', props: { text: '₺799', left: 160, top: 1320, fontSize: 32, fontFamily: 'Arial', fill: '#94a3b8', textDecoration: 'line-through' } },
      { type: 'text', props: { text: '₺399,99', left: 330, top: 1300, fontSize: 64, fontFamily: 'Arial', fontWeight: 'bold', fill: '#fbbf24' } },
      { type: 'text', props: { text: '%50 İNDİRİM', left: 380, top: 1390, fontSize: 32, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ef4444' } },
      { type: 'text', props: { text: 'Sınırlı stok ile!', left: 410, top: 1440, fontSize: 22, fontFamily: 'Arial', fill: '#d8b4fe' } },
      // CTA
      { type: 'rect', props: { left: 160, top: 1620, width: 760, height: 80, fill: '#fbbf24', rx: 40, ry: 40 } },
      { type: 'text', props: { text: 'ALIŞVERİŞE BAŞLA ➜', left: 310, top: 1638, fontSize: 30, fontFamily: 'Arial', fontWeight: 'bold', fill: '#581c87' } },
      // Swipe up
      { type: 'text', props: { text: '⬆', left: 500, top: 1760, fontSize: 40, fill: '#ffffff', opacity: 0.6 } },
      { type: 'text', props: { text: 'Yukarı kaydır', left: 430, top: 1820, fontSize: 20, fontFamily: 'Arial', fill: '#d8b4fe' } },
    ],
  },
  {
    id: 'instagram-carousel-cover',
    name: 'Carousel Kapak',
    description: 'Instagram carousel ilk slayt',
    category: 'social-media',
    tags: ['carousel', 'instagram', 'kapak'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#1e293b',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#1e293b' } },
      // Dekoratif arka plan
      { type: 'rect', props: { left: 0, top: 0, width: 540, height: 1080, fill: '#0f172a' } },
      { type: 'rect', props: { left: 535, top: 0, width: 10, height: 1080, fill: '#3b82f6' } },
      // Sol içerik
      { type: 'text', props: { text: '5', left: 100, top: 250, fontSize: 180, fontFamily: 'Impact', fontWeight: 'bold', fill: '#3b82f6' } },
      { type: 'text', props: { text: 'İPUCU', left: 100, top: 450, fontSize: 56, fontFamily: 'Impact', fontWeight: 'bold', fill: '#ffffff', charSpacing: 80 } },
      // Sağ içerik
      { type: 'text', props: { text: 'E-Ticarette\nSatışlarınızı\nArtırmanın\nYolları', left: 580, top: 240, fontSize: 42, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff', lineHeight: 1.3, width: 460 } },
      { type: 'rect', props: { left: 580, top: 530, width: 80, height: 4, fill: '#3b82f6' } },
      { type: 'text', props: { text: 'Kaydırarak okuyun →', left: 580, top: 560, fontSize: 20, fontFamily: 'Arial', fill: '#64748b' } },
      // Marka
      { type: 'text', props: { text: '@markaniz', left: 580, top: 920, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#3b82f6' } },
      { type: 'text', props: { text: 'Markanız', left: 580, top: 960, fontSize: 18, fontFamily: 'Arial', fill: '#64748b' } },
      // Sayfa göstergesi
      { type: 'circle', props: { left: 470, top: 1020, radius: 6, fill: '#3b82f6' } },
      { type: 'circle', props: { left: 500, top: 1020, radius: 6, fill: '#334155' } },
      { type: 'circle', props: { left: 530, top: 1020, radius: 6, fill: '#334155' } },
      { type: 'circle', props: { left: 560, top: 1020, radius: 6, fill: '#334155' } },
      { type: 'circle', props: { left: 590, top: 1020, radius: 6, fill: '#334155' } },
    ],
  },
  {
    id: 'youtube-thumbnail-bold',
    name: 'YouTube Thumbnail',
    description: 'Dikkat çekici YouTube küçük resmi',
    category: 'social-media',
    tags: ['youtube', 'thumbnail', 'dikkat çekici'],
    canvasWidth: 1280,
    canvasHeight: 720,
    backgroundColor: '#0f172a',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1280, height: 720, fill: '#0f172a' } },
      // Sol renkli alan
      { type: 'rect', props: { left: 0, top: 0, width: 640, height: 720, fill: '#dc2626' } },
      // Ana metin
      { type: 'text', props: { text: 'BU\nHATAYI\nYAPMA!', left: 50, top: 120, fontSize: 90, fontFamily: 'Impact', fontWeight: 'bold', fill: '#ffffff', lineHeight: 1, charSpacing: 40 } },
      // Sağ alan
      { type: 'rect', props: { left: 680, top: 60, width: 540, height: 600, fill: '#1e293b', rx: 20, ry: 20 } },
      { type: 'text', props: { text: 'GÖRSEL\nALANI', left: 860, top: 310, fontSize: 32, fontFamily: 'Arial', fill: '#334155', textAlign: 'center', width: 180 } },
      // Alt şerit
      { type: 'rect', props: { left: 0, top: 660, width: 1280, height: 60, fill: '#fbbf24' } },
      { type: 'text', props: { text: 'E-TİCARET HATALARI  |  Bölüm 1', left: 320, top: 672, fontSize: 28, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1e293b' } },
      // Emoji
      { type: 'text', props: { text: '😮', left: 560, top: 280, fontSize: 100 } },
    ],
  },
  {
    id: 'facebook-ad-clean',
    name: 'Facebook Reklam',
    description: 'Profesyonel Facebook reklam görseli',
    category: 'social-media',
    tags: ['facebook', 'reklam', 'ad', 'profesyonel'],
    canvasWidth: 1200,
    canvasHeight: 630,
    backgroundColor: '#ffffff',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1200, height: 630, fill: '#ffffff' } },
      { type: 'rect', props: { left: 0, top: 0, width: 1200, height: 6, fill: '#3b82f6' } },
      // Sol ürün alanı
      { type: 'rect', props: { left: 0, top: 0, width: 550, height: 630, fill: '#f1f5f9' } },
      { type: 'text', props: { text: 'ÜRÜN\nGÖRSELİ', left: 200, top: 280, fontSize: 28, fontFamily: 'Arial', fill: '#94a3b8', textAlign: 'center', width: 150 } },
      // Sağ içerik
      { type: 'text', props: { text: 'Marka Adı', left: 600, top: 60, fontSize: 18, fontFamily: 'Arial', fill: '#3b82f6', fontWeight: 'bold' } },
      { type: 'text', props: { text: 'Bu Fırsatı\nKaçırmayın!', left: 600, top: 110, fontSize: 48, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1e293b', lineHeight: 1.2 } },
      { type: 'text', props: { text: 'Ürün açıklaması burada yer alacak.\nKısa ve etkili bir açıklama yazın.', left: 600, top: 260, fontSize: 18, fontFamily: 'Arial', fill: '#64748b', lineHeight: 1.5 } },
      { type: 'text', props: { text: '₺199,99', left: 600, top: 370, fontSize: 44, fontFamily: 'Arial', fontWeight: 'bold', fill: '#3b82f6' } },
      { type: 'text', props: { text: '₺399,99', left: 820, top: 385, fontSize: 24, fontFamily: 'Arial', fill: '#94a3b8', textDecoration: 'line-through' } },
      // CTA
      { type: 'rect', props: { left: 600, top: 460, width: 360, height: 60, fill: '#3b82f6', rx: 8, ry: 8 } },
      { type: 'text', props: { text: 'Hemen İncele →', left: 690, top: 474, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'text', props: { text: '⚡ Sınırlı süre  |  🚚 Ücretsiz kargo', left: 600, top: 550, fontSize: 16, fontFamily: 'Arial', fill: '#94a3b8' } },
    ],
  },
  {
    id: 'linkedin-post',
    name: 'LinkedIn Gönderi',
    description: 'Profesyonel LinkedIn paylaşımı',
    category: 'social-media',
    tags: ['linkedin', 'profesyonel', 'iş'],
    canvasWidth: 1200,
    canvasHeight: 627,
    backgroundColor: '#ffffff',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1200, height: 627, fill: '#ffffff' } },
      { type: 'rect', props: { left: 0, top: 0, width: 1200, height: 627, fill: '#0a66c2', opacity: 0.05 } },
      { type: 'rect', props: { left: 0, top: 0, width: 8, height: 627, fill: '#0a66c2' } },
      // İçerik
      { type: 'text', props: { text: '💡', left: 60, top: 40, fontSize: 60 } },
      { type: 'text', props: { text: 'E-Ticaret\nBaşarısının\n3 Sırrı', left: 60, top: 130, fontSize: 52, fontFamily: 'Arial', fontWeight: 'bold', fill: '#0f172a', lineHeight: 1.2 } },
      { type: 'rect', props: { left: 60, top: 340, width: 80, height: 4, fill: '#0a66c2' } },
      { type: 'text', props: { text: '1. Doğru fiyatlandırma stratejisi\n2. Güçlü ürün görselleri\n3. Müşteri deneyimi odağı', left: 60, top: 370, fontSize: 22, fontFamily: 'Arial', fill: '#475569', lineHeight: 1.8 } },
      // Sağ dekorasyon
      { type: 'rect', props: { left: 800, top: 50, width: 350, height: 520, fill: '#f1f5f9', rx: 20, ry: 20 } },
      { type: 'text', props: { text: '📊', left: 920, top: 200, fontSize: 100 } },
      // Marka
      { type: 'text', props: { text: 'Markanız  •  @kullaniciadi', left: 60, top: 560, fontSize: 18, fontFamily: 'Arial', fill: '#0a66c2', fontWeight: 'bold' } },
    ],
  },
  {
    id: 'pinterest-pin',
    name: 'Pinterest Pin',
    description: 'Uzun formatlı Pinterest görseli',
    category: 'social-media',
    tags: ['pinterest', 'pin', 'dikey'],
    canvasWidth: 1000,
    canvasHeight: 1500,
    backgroundColor: '#fef9f0',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1000, height: 1500, fill: '#fef9f0' } },
      // Ürün görseli alanı
      { type: 'rect', props: { left: 40, top: 40, width: 920, height: 700, fill: '#f5ebe0', rx: 20, ry: 20 } },
      { type: 'text', props: { text: 'ÜRÜN GÖRSELİ', left: 380, top: 340, fontSize: 28, fontFamily: 'Arial', fill: '#c4a882' } },
      // İçerik
      { type: 'text', props: { text: 'Trend Ürün Başlığı Burada', left: 60, top: 790, fontSize: 42, fontFamily: 'Georgia', fontWeight: 'bold', fill: '#2d2013', width: 880 } },
      { type: 'text', props: { text: 'Ürün detayları ve açıklama burada yer alacak. Pinterest\'te dikkat çekici bir açıklama yazın.', left: 60, top: 880, fontSize: 22, fontFamily: 'Arial', fill: '#8b7355', width: 880, lineHeight: 1.5 } },
      { type: 'rect', props: { left: 60, top: 990, width: 60, height: 4, fill: '#c4a882' } },
      // Fiyat
      { type: 'text', props: { text: '₺249,99', left: 60, top: 1030, fontSize: 40, fontFamily: 'Arial', fontWeight: 'bold', fill: '#2d2013' } },
      { type: 'text', props: { text: '₺449,99', left: 300, top: 1045, fontSize: 24, fontFamily: 'Arial', fill: '#c4a882', textDecoration: 'line-through' } },
      // Özellikler
      { type: 'text', props: { text: '✦ Premium kalite malzeme', left: 60, top: 1120, fontSize: 20, fontFamily: 'Arial', fill: '#6b5b47' } },
      { type: 'text', props: { text: '✦ Ücretsiz kargo', left: 60, top: 1160, fontSize: 20, fontFamily: 'Arial', fill: '#6b5b47' } },
      { type: 'text', props: { text: '✦ 30 gün iade garantisi', left: 60, top: 1200, fontSize: 20, fontFamily: 'Arial', fill: '#6b5b47' } },
      // CTA
      { type: 'rect', props: { left: 60, top: 1290, width: 880, height: 70, fill: '#e85d4a', rx: 35, ry: 35 } },
      { type: 'text', props: { text: 'Hemen Satın Al ❤️', left: 340, top: 1306, fontSize: 26, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      // Marka
      { type: 'text', props: { text: 'MARKANIZ', left: 400, top: 1420, fontSize: 20, fontFamily: 'Arial', fontWeight: 'bold', fill: '#c4a882', charSpacing: 200 } },
    ],
  },
  {
    id: 'tiktok-product',
    name: 'TikTok Ürün Tanıtım',
    description: 'TikTok video thumbnail/kapak görseli',
    category: 'social-media',
    tags: ['tiktok', 'video', 'dikey', 'ürün'],
    canvasWidth: 1080,
    canvasHeight: 1920,
    backgroundColor: '#000000',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1920, fill: '#000000' } },
      // Neon efekt arka plan
      { type: 'circle', props: { left: 100, top: 300, radius: 300, fill: '#ec4899', opacity: 0.15 } },
      { type: 'circle', props: { left: 600, top: 800, radius: 400, fill: '#06b6d4', opacity: 0.12 } },
      { type: 'circle', props: { left: 200, top: 1400, radius: 350, fill: '#8b5cf6', opacity: 0.15 } },
      // Üst metin
      { type: 'text', props: { text: 'BU ÜRÜNÜ\nDENEMELİSİN! 🔥', left: 80, top: 150, fontSize: 72, fontFamily: 'Impact', fontWeight: 'bold', fill: '#ffffff', lineHeight: 1.1, shadow: { color: 'rgba(0,0,0,0.5)', blur: 10, offsetX: 0, offsetY: 4 } } },
      // Ürün alanı
      { type: 'rect', props: { left: 80, top: 500, width: 920, height: 700, fill: 'rgba(255,255,255,0.05)', rx: 24, ry: 24, stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 } },
      { type: 'text', props: { text: 'ÜRÜN GÖRSELİ', left: 390, top: 810, fontSize: 30, fontFamily: 'Arial', fill: 'rgba(255,255,255,0.2)' } },
      // Fiyat rozeti
      { type: 'circle', props: { left: 780, top: 1100, radius: 80, fill: '#ef4444', shadow: { color: 'rgba(239,68,68,0.4)', blur: 20, offsetX: 0, offsetY: 0 } } },
      { type: 'text', props: { text: '%40\nOFF', left: 800, top: 1120, fontSize: 24, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', width: 120 } },
      // Alt bilgi
      { type: 'text', props: { text: 'Ürün Adı Yazın', left: 80, top: 1340, fontSize: 44, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'text', props: { text: '₺299,99', left: 80, top: 1420, fontSize: 52, fontFamily: 'Arial', fontWeight: 'bold', fill: '#06b6d4' } },
      { type: 'text', props: { text: '₺499,99', left: 380, top: 1435, fontSize: 28, fontFamily: 'Arial', fill: '#6b7280', textDecoration: 'line-through' } },
      // CTA
      { type: 'rect', props: { left: 80, top: 1540, width: 920, height: 80, fill: '#ec4899', rx: 40, ry: 40 } },
      { type: 'text', props: { text: 'LİNK BİYOGRAFİDE ⬇️', left: 310, top: 1556, fontSize: 28, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      // Hashtag
      { type: 'text', props: { text: '#alışveriş #keşfet #indirim #trend', left: 200, top: 1700, fontSize: 20, fontFamily: 'Arial', fill: '#6b7280' } },
    ],
  },
];

// ─── Marketplace Şablonları ──────────────────────────────

const marketplaceTemplates: AdvancedTemplate[] = [
  {
    id: 'trendyol-product',
    name: 'Trendyol Ürün Görseli',
    description: 'Trendyol için optimize edilmiş ürün görseli',
    category: 'marketplace',
    tags: ['trendyol', 'ürün görseli', '800x800'],
    canvasWidth: 800,
    canvasHeight: 800,
    backgroundColor: '#ffffff',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 800, height: 800, fill: '#ffffff' } },
      // Üst çerçeve
      { type: 'rect', props: { left: 0, top: 0, width: 800, height: 4, fill: '#ff6000' } },
      // Ürün alanı
      { type: 'rect', props: { left: 60, top: 40, width: 680, height: 540, fill: '#fafafa', rx: 8, ry: 8 } },
      { type: 'text', props: { text: 'ÜRÜN GÖRSELİ', left: 300, top: 280, fontSize: 24, fontFamily: 'Arial', fill: '#d1d5db' } },
      // Alt bilgi
      { type: 'rect', props: { left: 0, top: 600, width: 800, height: 200, fill: '#fff7ed' } },
      { type: 'text', props: { text: 'Ürün Adı', left: 40, top: 620, fontSize: 26, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1e293b' } },
      { type: 'text', props: { text: 'Kısa ürün açıklaması...', left: 40, top: 660, fontSize: 16, fontFamily: 'Arial', fill: '#64748b' } },
      { type: 'text', props: { text: '₺199,99', left: 40, top: 710, fontSize: 36, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ff6000' } },
      // Kargo badge
      { type: 'rect', props: { left: 540, top: 710, width: 220, height: 36, fill: '#059669', rx: 6, ry: 6 } },
      { type: 'text', props: { text: '🚚 Ücretsiz Kargo', left: 556, top: 716, fontSize: 16, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      // Yıldız
      { type: 'text', props: { text: '★★★★★ (125)', left: 40, top: 760, fontSize: 16, fill: '#f59e0b' } },
    ],
  },
  {
    id: 'hepsiburada-product',
    name: 'Hepsiburada Ürün Görseli',
    description: 'Hepsiburada için optimize edilmiş görsel',
    category: 'marketplace',
    tags: ['hepsiburada', 'ürün görseli', '800x800'],
    canvasWidth: 800,
    canvasHeight: 800,
    backgroundColor: '#ffffff',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 800, height: 800, fill: '#ffffff' } },
      { type: 'rect', props: { left: 0, top: 0, width: 800, height: 4, fill: '#ff6600' } },
      { type: 'rect', props: { left: 60, top: 40, width: 680, height: 550, fill: '#f9fafb', rx: 8, ry: 8 } },
      { type: 'text', props: { text: 'ÜRÜN GÖRSELİ', left: 300, top: 280, fontSize: 24, fontFamily: 'Arial', fill: '#d1d5db' } },
      // HB stil alt bilgi
      { type: 'rect', props: { left: 0, top: 610, width: 800, height: 190, fill: '#fff4e6' } },
      { type: 'text', props: { text: 'Ürün Adı Buraya', left: 40, top: 625, fontSize: 24, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1a1a1a' } },
      { type: 'text', props: { text: '₺249,99', left: 40, top: 670, fontSize: 38, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ff6600' } },
      { type: 'text', props: { text: '₺449,99', left: 260, top: 682, fontSize: 22, fontFamily: 'Arial', fill: '#999', textDecoration: 'line-through' } },
      { type: 'rect', props: { left: 40, top: 730, width: 140, height: 32, fill: '#ff6600', rx: 4, ry: 4 } },
      { type: 'text', props: { text: '%44 İndirim', left: 54, top: 736, fontSize: 16, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'text', props: { text: '★★★★☆ 4.2 (89 Değerlendirme)', left: 40, top: 775, fontSize: 14, fill: '#666' } },
    ],
  },
  {
    id: 'amazon-product',
    name: 'Amazon Ürün Görseli',
    description: 'Amazon standardına uygun beyaz arka planlı ürün görseli',
    category: 'marketplace',
    tags: ['amazon', 'beyaz arka plan', '2000x2000'],
    canvasWidth: 2000,
    canvasHeight: 2000,
    backgroundColor: '#ffffff',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 2000, height: 2000, fill: '#ffffff' } },
      // Amazon'da ürün alanı genellikle beyaz arka plan
      { type: 'rect', props: { left: 200, top: 100, width: 1600, height: 1400, fill: '#fafafa', rx: 0, ry: 0 } },
      { type: 'text', props: { text: 'ÜRÜN GÖRSELİ\n(Beyaz arka plan)', left: 700, top: 700, fontSize: 48, fontFamily: 'Arial', fill: '#d1d5db', textAlign: 'center', width: 600 } },
      // Alt bilgi bandı
      { type: 'rect', props: { left: 0, top: 1600, width: 2000, height: 400, fill: '#f9f9f9' } },
      { type: 'text', props: { text: 'Ürün Adı', left: 100, top: 1640, fontSize: 52, fontFamily: 'Arial', fontWeight: 'bold', fill: '#0f1111' } },
      { type: 'text', props: { text: 'Marka adı - Premium kalite', left: 100, top: 1720, fontSize: 32, fontFamily: 'Arial', fill: '#565959' } },
      { type: 'text', props: { text: '⭐⭐⭐⭐⭐ (1,250)', left: 100, top: 1790, fontSize: 32, fill: '#c45500' } },
      { type: 'rect', props: { left: 1400, top: 1640, width: 480, height: 120, fill: '#febd69', rx: 12, ry: 12 } },
      { type: 'text', props: { text: 'Sepete Ekle', left: 1520, top: 1680, fontSize: 36, fontFamily: 'Arial', fontWeight: 'bold', fill: '#0f1111' } },
    ],
  },
  {
    id: 'n11-product',
    name: 'N11 Ürün Görseli',
    description: 'N11 pazaryeri ürün görseli',
    category: 'marketplace',
    tags: ['n11', 'ürün görseli', '800x800'],
    canvasWidth: 800,
    canvasHeight: 800,
    backgroundColor: '#ffffff',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 800, height: 800, fill: '#ffffff' } },
      { type: 'rect', props: { left: 0, top: 0, width: 800, height: 5, fill: '#7b2d8e' } },
      { type: 'rect', props: { left: 50, top: 40, width: 700, height: 520, fill: '#f5f5f5', rx: 8, ry: 8 } },
      { type: 'text', props: { text: 'ÜRÜN GÖRSELİ', left: 300, top: 270, fontSize: 24, fontFamily: 'Arial', fill: '#ccc' } },
      { type: 'rect', props: { left: 0, top: 580, width: 800, height: 220, fill: '#faf5fc' } },
      { type: 'text', props: { text: 'Ürün Adı', left: 40, top: 600, fontSize: 26, fontFamily: 'Arial', fontWeight: 'bold', fill: '#333' } },
      { type: 'text', props: { text: '₺179,99', left: 40, top: 650, fontSize: 38, fontFamily: 'Arial', fontWeight: 'bold', fill: '#7b2d8e' } },
      { type: 'rect', props: { left: 580, top: 650, width: 180, height: 40, fill: '#7b2d8e', rx: 8, ry: 8 } },
      { type: 'text', props: { text: 'SATIN AL', left: 614, top: 658, fontSize: 18, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'text', props: { text: '★★★★★ 4.8', left: 40, top: 720, fontSize: 18, fill: '#f59e0b' } },
      { type: 'text', props: { text: '· Ücretsiz Kargo', left: 200, top: 722, fontSize: 16, fontFamily: 'Arial', fill: '#059669' } },
    ],
  },
  {
    id: 'ciceksepeti-product',
    name: 'Çiçeksepeti Ürün Görseli',
    description: 'Çiçeksepeti tasarım şablonu',
    category: 'marketplace',
    tags: ['çiçeksepeti', 'hediye', 'ürün'],
    canvasWidth: 800,
    canvasHeight: 800,
    backgroundColor: '#fff5f5',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 800, height: 800, fill: '#fff5f5' } },
      { type: 'rect', props: { left: 0, top: 0, width: 800, height: 5, fill: '#e11d48' } },
      { type: 'rect', props: { left: 50, top: 40, width: 700, height: 480, fill: '#ffffff', rx: 16, ry: 16, shadow: { color: 'rgba(0,0,0,0.05)', blur: 15, offsetX: 0, offsetY: 4 } } },
      { type: 'text', props: { text: 'ÜRÜN GÖRSELİ', left: 300, top: 250, fontSize: 24, fontFamily: 'Arial', fill: '#d1d5db' } },
      // Alt alan
      { type: 'rect', props: { left: 30, top: 550, width: 740, height: 220, fill: '#ffffff', rx: 16, ry: 16, shadow: { color: 'rgba(0,0,0,0.05)', blur: 10, offsetX: 0, offsetY: 2 } } },
      { type: 'text', props: { text: '🎁', left: 50, top: 570, fontSize: 32 } },
      { type: 'text', props: { text: 'Hediye Ürün Adı', left: 100, top: 575, fontSize: 24, fontFamily: 'Arial', fontWeight: 'bold', fill: '#333' } },
      { type: 'text', props: { text: 'Özel günler için mükemmel hediye', left: 100, top: 610, fontSize: 16, fontFamily: 'Arial', fill: '#64748b' } },
      { type: 'text', props: { text: '₺299,99', left: 100, top: 660, fontSize: 36, fontFamily: 'Arial', fontWeight: 'bold', fill: '#e11d48' } },
      { type: 'rect', props: { left: 480, top: 660, width: 260, height: 50, fill: '#e11d48', rx: 25, ry: 25 } },
      { type: 'text', props: { text: '❤️ Sepete Ekle', left: 530, top: 672, fontSize: 20, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'text', props: { text: '✓ Aynı gün teslimat', left: 100, top: 720, fontSize: 14, fontFamily: 'Arial', fill: '#059669' } },
    ],
  },
  {
    id: 'etsy-product',
    name: 'Etsy Ürün Görseli',
    description: 'Etsy el yapımı ürün görseli',
    category: 'marketplace',
    tags: ['etsy', 'handmade', 'el yapımı'],
    canvasWidth: 2000,
    canvasHeight: 2000,
    backgroundColor: '#faf5ef',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 2000, height: 2000, fill: '#faf5ef' } },
      // Doğal görünüm
      { type: 'rect', props: { left: 100, top: 80, width: 1800, height: 1200, fill: '#ffffff', rx: 8, ry: 8 } },
      { type: 'text', props: { text: 'ÜRÜN GÖRSELİ', left: 750, top: 600, fontSize: 48, fontFamily: 'Georgia', fill: '#d1cbba' } },
      // Alt bilgi
      { type: 'rect', props: { left: 100, top: 1340, width: 1800, height: 560, fill: '#ffffff', rx: 12, ry: 12 } },
      { type: 'text', props: { text: '✦ HANDMADE ✦', left: 780, top: 1380, fontSize: 24, fontFamily: 'Georgia', fill: '#b8860b', charSpacing: 200 } },
      { type: 'text', props: { text: 'El Yapımı Ürün Adı', left: 200, top: 1460, fontSize: 48, fontFamily: 'Georgia', fontWeight: 'bold', fill: '#2d2013' } },
      { type: 'text', props: { text: 'Özenle hazırlanmış, benzersiz tasarım', left: 200, top: 1540, fontSize: 28, fontFamily: 'Georgia', fontStyle: 'italic', fill: '#8b7355' } },
      { type: 'rect', props: { left: 200, top: 1610, width: 100, height: 3, fill: '#b8860b' } },
      { type: 'text', props: { text: '$49.99', left: 200, top: 1650, fontSize: 52, fontFamily: 'Georgia', fontWeight: 'bold', fill: '#2d2013' } },
      { type: 'text', props: { text: '★★★★★ (234 reviews)', left: 200, top: 1740, fontSize: 24, fill: '#b8860b' } },
      { type: 'text', props: { text: '🌿 Eco-friendly materials  •  🎁 Gift wrapping available', left: 200, top: 1810, fontSize: 22, fontFamily: 'Arial', fill: '#6b5b47' } },
    ],
  },
];

// ─── Branding & Genel Şablonlar ─────────────────────────

const brandingTemplates: AdvancedTemplate[] = [
  {
    id: 'luxury-brand',
    name: 'Lüks Marka',
    description: 'Premium hissi veren lüks tasarım',
    category: 'branding',
    tags: ['lüks', 'premium', 'altın', 'siyah'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#0a0a0a',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#0a0a0a' } },
      // Altın çerçeve
      { type: 'rect', props: { left: 40, top: 40, width: 1000, height: 1000, fill: 'transparent', stroke: '#b8860b', strokeWidth: 2, rx: 0, ry: 0 } },
      { type: 'rect', props: { left: 55, top: 55, width: 970, height: 970, fill: 'transparent', stroke: '#b8860b', strokeWidth: 1 } },
      // Üst süsleme
      { type: 'rect', props: { left: 440, top: 100, width: 200, height: 2, fill: '#b8860b' } },
      { type: 'text', props: { text: '◆', left: 520, top: 76, fontSize: 24, fill: '#b8860b' } },
      // İçerik
      { type: 'text', props: { text: 'LUXURY', left: 260, top: 180, fontSize: 80, fontFamily: 'Georgia', fontWeight: 'bold', fill: '#b8860b', charSpacing: 300 } },
      { type: 'text', props: { text: 'COLLECTION', left: 220, top: 280, fontSize: 56, fontFamily: 'Georgia', fill: '#ffffff', charSpacing: 400 } },
      // Ürün alanı
      { type: 'rect', props: { left: 140, top: 400, width: 800, height: 350, fill: '#111', rx: 0, ry: 0 } },
      { type: 'text', props: { text: 'ÜRÜN', left: 470, top: 540, fontSize: 32, fontFamily: 'Georgia', fill: '#333' } },
      // Alt süsleme
      { type: 'rect', props: { left: 440, top: 810, width: 200, height: 2, fill: '#b8860b' } },
      { type: 'text', props: { text: 'EST. 2024', left: 440, top: 830, fontSize: 20, fontFamily: 'Georgia', fill: '#666', charSpacing: 300 } },
      { type: 'text', props: { text: 'MARKA ADI', left: 350, top: 880, fontSize: 36, fontFamily: 'Georgia', fontWeight: 'bold', fill: '#b8860b', charSpacing: 200 } },
    ],
  },
  {
    id: 'minimalist-clean',
    name: 'Minimalist Temiz',
    description: 'Sade ve modern minimalist tasarım',
    category: 'branding',
    tags: ['minimalist', 'sade', 'modern', 'temiz'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#ffffff',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#ffffff' } },
      // Tek ince çizgi
      { type: 'rect', props: { left: 100, top: 200, width: 1, height: 680, fill: '#e2e8f0' } },
      // İçerik
      { type: 'text', props: { text: 'Ürün Adı', left: 140, top: 300, fontSize: 48, fontFamily: 'Helvetica', fontWeight: 'bold', fill: '#1a1a1a' } },
      { type: 'text', props: { text: 'Kısa açıklama', left: 140, top: 370, fontSize: 22, fontFamily: 'Helvetica', fill: '#999999' } },
      { type: 'rect', props: { left: 140, top: 420, width: 60, height: 3, fill: '#1a1a1a' } },
      { type: 'text', props: { text: '₺199', left: 140, top: 460, fontSize: 56, fontFamily: 'Helvetica', fill: '#1a1a1a' } },
      // Sağ ürün alanı
      { type: 'rect', props: { left: 540, top: 100, width: 440, height: 880, fill: '#f9fafb', rx: 4, ry: 4 } },
      { type: 'text', props: { text: 'ÜRÜN', left: 720, top: 510, fontSize: 24, fontFamily: 'Helvetica', fill: '#e2e8f0' } },
    ],
  },
  {
    id: 'neon-dark',
    name: 'Neon Karanlık',
    description: 'Neon ışık efektli koyu tema',
    category: 'branding',
    tags: ['neon', 'karanlık', 'gece', 'glow'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#0a0a0a',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#0a0a0a' } },
      // Neon glow efektler
      { type: 'circle', props: { left: 100, top: 100, radius: 250, fill: '#ec4899', opacity: 0.08 } },
      { type: 'circle', props: { left: 700, top: 600, radius: 300, fill: '#06b6d4', opacity: 0.08 } },
      { type: 'circle', props: { left: 300, top: 700, radius: 200, fill: '#8b5cf6', opacity: 0.06 } },
      // Neon çerçeve
      { type: 'rect', props: { left: 60, top: 60, width: 960, height: 960, fill: 'transparent', stroke: '#ec4899', strokeWidth: 2, rx: 20, ry: 20, shadow: { color: '#ec4899', blur: 20, offsetX: 0, offsetY: 0 } } },
      // Metin
      { type: 'text', props: { text: 'PARLAK\nFİKİRLER', left: 120, top: 200, fontSize: 80, fontFamily: 'Impact', fontWeight: 'bold', fill: '#ffffff', lineHeight: 1.1, shadow: { color: '#ec4899', blur: 30, offsetX: 0, offsetY: 0 } } },
      // Ürün alanı
      { type: 'rect', props: { left: 120, top: 450, width: 840, height: 350, fill: 'rgba(255,255,255,0.03)', rx: 16, ry: 16, stroke: 'rgba(6,182,212,0.3)', strokeWidth: 1 } },
      { type: 'text', props: { text: 'ÜRÜN GÖRSELİ', left: 420, top: 590, fontSize: 28, fontFamily: 'Arial', fill: 'rgba(255,255,255,0.1)' } },
      // Alt metin
      { type: 'text', props: { text: '₺399,99', left: 120, top: 850, fontSize: 48, fontFamily: 'Arial', fontWeight: 'bold', fill: '#06b6d4', shadow: { color: '#06b6d4', blur: 20, offsetX: 0, offsetY: 0 } } },
      { type: 'rect', props: { left: 600, top: 850, width: 360, height: 56, fill: 'transparent', stroke: '#ec4899', strokeWidth: 2, rx: 28, ry: 28, shadow: { color: '#ec4899', blur: 15, offsetX: 0, offsetY: 0 } } },
      { type: 'text', props: { text: 'KEŞFET →', left: 700, top: 862, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ec4899' } },
    ],
  },
];

// ─── Sezonluk Şablonlar ─────────────────────────────────

const seasonalTemplates: AdvancedTemplate[] = [
  {
    id: 'black-friday',
    name: 'Black Friday',
    description: 'Kara Cuma indirim kampanyası',
    category: 'seasonal',
    tags: ['black friday', 'kara cuma', 'indirim'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#000000',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#000000' } },
      // Altın detaylar
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 8, fill: '#d4a017' } },
      { type: 'rect', props: { left: 0, top: 1072, width: 1080, height: 8, fill: '#d4a017' } },
      { type: 'rect', props: { left: 0, top: 0, width: 8, height: 1080, fill: '#d4a017' } },
      { type: 'rect', props: { left: 1072, top: 0, width: 8, height: 1080, fill: '#d4a017' } },
      // Metin
      { type: 'text', props: { text: 'BLACK', left: 120, top: 180, fontSize: 140, fontFamily: 'Impact', fontWeight: 'bold', fill: '#ffffff', charSpacing: 120 } },
      { type: 'text', props: { text: 'FRIDAY', left: 120, top: 320, fontSize: 140, fontFamily: 'Impact', fontWeight: 'bold', fill: '#d4a017', charSpacing: 120 } },
      { type: 'rect', props: { left: 120, top: 480, width: 840, height: 4, fill: '#d4a017' } },
      { type: 'text', props: { text: '%80\'e Varan İndirimler', left: 220, top: 520, fontSize: 44, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      // Ürün kutuları
      { type: 'rect', props: { left: 80, top: 620, width: 270, height: 200, fill: '#1a1a1a', rx: 12, ry: 12, stroke: '#d4a017', strokeWidth: 1 } },
      { type: 'text', props: { text: 'Ürün 1\n₺99', left: 140, top: 690, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', width: 150 } },
      { type: 'rect', props: { left: 405, top: 620, width: 270, height: 200, fill: '#1a1a1a', rx: 12, ry: 12, stroke: '#d4a017', strokeWidth: 1 } },
      { type: 'text', props: { text: 'Ürün 2\n₺149', left: 465, top: 690, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', width: 150 } },
      { type: 'rect', props: { left: 730, top: 620, width: 270, height: 200, fill: '#1a1a1a', rx: 12, ry: 12, stroke: '#d4a017', strokeWidth: 1 } },
      { type: 'text', props: { text: 'Ürün 3\n₺199', left: 790, top: 690, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', width: 150 } },
      // CTA
      { type: 'rect', props: { left: 240, top: 880, width: 600, height: 70, fill: '#d4a017', rx: 35, ry: 35 } },
      { type: 'text', props: { text: 'ALIŞVERİŞE BAŞLA', left: 370, top: 896, fontSize: 28, fontFamily: 'Arial', fontWeight: 'bold', fill: '#000000' } },
    ],
  },
  {
    id: 'valentines-day',
    name: 'Sevgililer Günü',
    description: '14 Şubat kampanya görseli',
    category: 'seasonal',
    tags: ['sevgililer günü', 'aşk', 'kırmızı', 'kalp'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#fce4ec',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#fce4ec' } },
      // Kalpler
      { type: 'text', props: { text: '❤️', left: 80, top: 60, fontSize: 50, opacity: 0.3 } },
      { type: 'text', props: { text: '❤️', left: 900, top: 120, fontSize: 70, opacity: 0.2 } },
      { type: 'text', props: { text: '❤️', left: 200, top: 900, fontSize: 40, opacity: 0.25 } },
      { type: 'text', props: { text: '❤️', left: 800, top: 850, fontSize: 60, opacity: 0.2 } },
      { type: 'text', props: { text: '💕', left: 500, top: 40, fontSize: 40, opacity: 0.3 } },
      // Ana içerik
      { type: 'rect', props: { left: 100, top: 200, width: 880, height: 680, fill: '#ffffff', rx: 24, ry: 24, shadow: { color: 'rgba(0,0,0,0.08)', blur: 30, offsetX: 0, offsetY: 8 } } },
      { type: 'text', props: { text: '❤️', left: 470, top: 240, fontSize: 80 } },
      { type: 'text', props: { text: 'SEVGİLİLER GÜNÜ', left: 200, top: 360, fontSize: 44, fontFamily: 'Georgia', fontWeight: 'bold', fill: '#e11d48', charSpacing: 60 } },
      { type: 'text', props: { text: 'ÖZEL KAMPANYA', left: 290, top: 420, fontSize: 32, fontFamily: 'Georgia', fill: '#9f1239' } },
      { type: 'rect', props: { left: 400, top: 480, width: 280, height: 3, fill: '#e11d48' } },
      { type: 'text', props: { text: '%30 İNDİRİM', left: 310, top: 520, fontSize: 56, fontFamily: 'Arial', fontWeight: 'bold', fill: '#e11d48' } },
      { type: 'text', props: { text: 'Sevdiklerinize özel hediyeler', left: 280, top: 600, fontSize: 22, fontFamily: 'Georgia', fontStyle: 'italic', fill: '#9f1239' } },
      { type: 'rect', props: { left: 300, top: 680, width: 480, height: 60, fill: '#e11d48', rx: 30, ry: 30 } },
      { type: 'text', props: { text: 'HEDİYELERİ KEŞFET', left: 380, top: 694, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'text', props: { text: 'Kod: LOVE30  |  14 Şubat\'a kadar', left: 310, top: 770, fontSize: 18, fontFamily: 'Arial', fill: '#f472b6' } },
    ],
  },
  {
    id: 'summer-sale',
    name: 'Yaz İndirimi',
    description: 'Yaz sezonu kampanya görseli',
    category: 'seasonal',
    tags: ['yaz', 'sezon', 'indirim', 'güneş'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#0ea5e9',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#0ea5e9' } },
      { type: 'rect', props: { left: 0, top: 700, width: 1080, height: 380, fill: '#0284c7' } },
      // Dalga efekti
      { type: 'ellipse', props: { left: -100, top: 640, rx: 700, ry: 80, fill: '#0284c7' } },
      { type: 'ellipse', props: { left: 400, top: 650, rx: 700, ry: 80, fill: '#0284c7' } },
      // Güneş
      { type: 'circle', props: { left: 780, top: 40, radius: 100, fill: '#fbbf24', shadow: { color: 'rgba(251,191,36,0.4)', blur: 40, offsetX: 0, offsetY: 0 } } },
      // Dekoratif
      { type: 'text', props: { text: '☀️', left: 100, top: 80, fontSize: 60 } },
      { type: 'text', props: { text: '🌊', left: 800, top: 300, fontSize: 50, opacity: 0.5 } },
      { type: 'text', props: { text: '🏖️', left: 60, top: 350, fontSize: 50, opacity: 0.5 } },
      // Ana metin
      { type: 'text', props: { text: 'YAZ', left: 130, top: 160, fontSize: 140, fontFamily: 'Impact', fontWeight: 'bold', fill: '#ffffff' } },
      { type: 'text', props: { text: 'İNDİRİMLERİ', left: 130, top: 300, fontSize: 80, fontFamily: 'Impact', fontWeight: 'bold', fill: '#fbbf24' } },
      { type: 'text', props: { text: '%60\'a Varan Fırsatlar', left: 130, top: 420, fontSize: 36, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ffffff' } },
      // Alt alan
      { type: 'rect', props: { left: 130, top: 540, width: 820, height: 180, fill: 'rgba(255,255,255,0.15)', rx: 20, ry: 20 } },
      { type: 'text', props: { text: 'Yaza özel koleksiyon, sınırlı süreli\nindirimlerle sizleri bekliyor!', left: 180, top: 570, fontSize: 24, fontFamily: 'Arial', fill: '#ffffff', lineHeight: 1.5 } },
      { type: 'rect', props: { left: 180, top: 780, width: 400, height: 60, fill: '#fbbf24', rx: 30, ry: 30 } },
      { type: 'text', props: { text: 'ALIŞVERİŞE BAŞLA', left: 270, top: 795, fontSize: 24, fontFamily: 'Arial', fontWeight: 'bold', fill: '#0c4a6e' } },
      { type: 'text', props: { text: '🔥 Son 3 gün!', left: 650, top: 798, fontSize: 22, fontFamily: 'Arial', fontWeight: 'bold', fill: '#fbbf24' } },
    ],
  },
  {
    id: 'new-year',
    name: 'Yeni Yıl Kampanyası',
    description: 'Yılbaşı özel kampanya görseli',
    category: 'seasonal',
    tags: ['yılbaşı', 'yeni yıl', 'kutlama'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#1a1a2e',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#1a1a2e' } },
      // Parıltılar
      { type: 'text', props: { text: '✨', left: 100, top: 100, fontSize: 30, opacity: 0.5 } },
      { type: 'text', props: { text: '✨', left: 400, top: 60, fontSize: 20, opacity: 0.3 } },
      { type: 'text', props: { text: '✨', left: 800, top: 150, fontSize: 25, opacity: 0.4 } },
      { type: 'text', props: { text: '✨', left: 200, top: 400, fontSize: 15, opacity: 0.3 } },
      { type: 'text', props: { text: '✨', left: 900, top: 500, fontSize: 20, opacity: 0.3 } },
      { type: 'text', props: { text: '🎄', left: 60, top: 800, fontSize: 60, opacity: 0.4 } },
      { type: 'text', props: { text: '🎁', left: 900, top: 820, fontSize: 50, opacity: 0.4 } },
      // Ana içerik
      { type: 'text', props: { text: '2025', left: 200, top: 150, fontSize: 160, fontFamily: 'Impact', fontWeight: 'bold', fill: '#d4a017', charSpacing: 80 } },
      { type: 'text', props: { text: 'YENİ YIL', left: 280, top: 330, fontSize: 60, fontFamily: 'Impact', fontWeight: 'bold', fill: '#ffffff', charSpacing: 100 } },
      { type: 'text', props: { text: 'KAMPANYASI', left: 230, top: 410, fontSize: 52, fontFamily: 'Impact', fontWeight: 'bold', fill: '#d4a017', charSpacing: 80 } },
      { type: 'rect', props: { left: 300, top: 490, width: 480, height: 3, fill: '#d4a017' } },
      { type: 'text', props: { text: '%50 İNDİRİM', left: 280, top: 530, fontSize: 64, fontFamily: 'Arial', fontWeight: 'bold', fill: '#ef4444' } },
      { type: 'text', props: { text: 'Tüm ürünlerde geçerli', left: 350, top: 610, fontSize: 24, fontFamily: 'Arial', fill: '#94a3b8' } },
      // CTA
      { type: 'rect', props: { left: 240, top: 700, width: 600, height: 70, fill: '#d4a017', rx: 35, ry: 35 } },
      { type: 'text', props: { text: 'FIRSATLARI KEŞFET', left: 370, top: 716, fontSize: 26, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1a1a2e' } },
      { type: 'text', props: { text: 'Kod: YILBASI50  •  31 Aralık\'a kadar', left: 310, top: 800, fontSize: 18, fontFamily: 'Arial', fill: '#64748b' } },
    ],
  },
  {
    id: 'ramadan-special',
    name: 'Ramazan Özel',
    description: 'Ramazan ayı özel kampanya',
    category: 'seasonal',
    tags: ['ramazan', 'bayram', 'özel'],
    canvasWidth: 1080,
    canvasHeight: 1080,
    backgroundColor: '#1a1a2e',
    elements: [
      { type: 'rect', props: { left: 0, top: 0, width: 1080, height: 1080, fill: '#1a1a2e' } },
      // Ay ve yıldız
      { type: 'text', props: { text: '🌙', left: 460, top: 60, fontSize: 80 } },
      { type: 'text', props: { text: '⭐', left: 350, top: 50, fontSize: 20, opacity: 0.5 } },
      { type: 'text', props: { text: '⭐', left: 660, top: 80, fontSize: 16, opacity: 0.4 } },
      { type: 'text', props: { text: '⭐', left: 280, top: 120, fontSize: 14, opacity: 0.3 } },
      // Dekoratif motif
      { type: 'rect', props: { left: 100, top: 200, width: 880, height: 680, fill: 'rgba(139,92,246,0.08)', rx: 24, ry: 24, stroke: '#d4a017', strokeWidth: 1 } },
      // İçerik
      { type: 'text', props: { text: 'RAMAZAN', left: 220, top: 250, fontSize: 72, fontFamily: 'Georgia', fontWeight: 'bold', fill: '#d4a017', charSpacing: 100 } },
      { type: 'text', props: { text: 'KAMPANYASI', left: 250, top: 340, fontSize: 48, fontFamily: 'Georgia', fill: '#ffffff', charSpacing: 80 } },
      { type: 'rect', props: { left: 380, top: 420, width: 320, height: 3, fill: '#d4a017' } },
      { type: 'text', props: { text: '%40\'a Varan İndirim', left: 290, top: 460, fontSize: 40, fontFamily: 'Arial', fontWeight: 'bold', fill: '#c084fc' } },
      { type: 'text', props: { text: 'Bereketli günlerin neşesiyle\nözel fırsatlar sizleri bekliyor', left: 250, top: 540, fontSize: 22, fontFamily: 'Georgia', fontStyle: 'italic', fill: '#a78bfa', lineHeight: 1.5, textAlign: 'center', width: 580 } },
      { type: 'rect', props: { left: 290, top: 660, width: 500, height: 65, fill: '#d4a017', rx: 32, ry: 32 } },
      { type: 'text', props: { text: 'KAMPANYAYI İNCELE', left: 380, top: 674, fontSize: 24, fontFamily: 'Arial', fontWeight: 'bold', fill: '#1a1a2e' } },
      // Alt dekorasyon
      { type: 'text', props: { text: '☪️', left: 500, top: 920, fontSize: 40, opacity: 0.3 } },
    ],
  },
];

// ─── Tüm Şablonlar ──────────────────────────────────────

export const ADVANCED_TEMPLATES: AdvancedTemplate[] = [
  ...ecommerceTemplates,
  ...socialMediaTemplates,
  ...marketplaceTemplates,
  ...brandingTemplates,
  ...seasonalTemplates,
];

export const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'Tümü', icon: '🎨' },
  { id: 'e-commerce', name: 'E-Ticaret', icon: '🛒' },
  { id: 'social-media', name: 'Sosyal Medya', icon: '📱' },
  { id: 'marketplace', name: 'Pazaryeri', icon: '🏪' },
  { id: 'promotion', name: 'Promosyon', icon: '🏷️' },
  { id: 'branding', name: 'Marka', icon: '✨' },
  { id: 'seasonal', name: 'Sezonluk', icon: '🗓️' },
];
