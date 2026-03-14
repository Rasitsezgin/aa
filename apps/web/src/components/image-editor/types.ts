// ─── Görsel Editör Tip Tanımları ────────────────────────

export type EditorTool =
  | 'select' | 'hand' | 'draw' | 'text'
  | 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star'
  | 'polygon' | 'eraser';

export type PanelType =
  | 'templates' | 'text' | 'elements' | 'images' | 'filters' | 'export'
  | 'backgrounds' | 'stickers' | 'frames'
  | null;

export interface CanvasPreset {
  name: string;
  width: number;
  height: number;
  category: 'marketplace' | 'social' | 'custom';
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  // Pazaryeri boyutları
  { name: 'Trendyol', width: 800, height: 800, category: 'marketplace' },
  { name: 'Hepsiburada', width: 800, height: 800, category: 'marketplace' },
  { name: 'Amazon', width: 2000, height: 2000, category: 'marketplace' },
  { name: 'N11', width: 800, height: 800, category: 'marketplace' },
  { name: 'Çiçeksepeti', width: 800, height: 800, category: 'marketplace' },
  { name: 'Etsy', width: 2000, height: 2000, category: 'marketplace' },
  // Sosyal medya boyutları
  { name: 'Instagram Post', width: 1080, height: 1080, category: 'social' },
  { name: 'Instagram Story', width: 1080, height: 1920, category: 'social' },
  { name: 'Instagram Reels', width: 1080, height: 1920, category: 'social' },
  { name: 'Facebook Post', width: 1200, height: 630, category: 'social' },
  { name: 'Facebook Cover', width: 820, height: 312, category: 'social' },
  { name: 'Twitter/X Post', width: 1200, height: 675, category: 'social' },
  { name: 'YouTube Thumbnail', width: 1280, height: 720, category: 'social' },
  { name: 'LinkedIn Post', width: 1200, height: 627, category: 'social' },
  { name: 'Pinterest Pin', width: 1000, height: 1500, category: 'social' },
  { name: 'TikTok Video', width: 1080, height: 1920, category: 'social' },
  // Özel boyutlar
  { name: 'HD (1920×1080)', width: 1920, height: 1080, category: 'custom' },
  { name: '4K (3840×2160)', width: 3840, height: 2160, category: 'custom' },
  { name: 'A4 Dikey (300dpi)', width: 2480, height: 3508, category: 'custom' },
  { name: 'A4 Yatay (300dpi)', width: 3508, height: 2480, category: 'custom' },
  { name: 'Kare (1000×1000)', width: 1000, height: 1000, category: 'custom' },
];

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality: number;
  scale: number;
}

export interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  hueRotation: number;
}

export const DEFAULT_FILTERS: FilterSettings = {
  brightness: 0, contrast: 0, saturation: 0, blur: 0,
  grayscale: false, sepia: false, invert: false, hueRotation: 0,
};

export interface FilterPreset {
  name: string;
  id: string;
  settings: Partial<FilterSettings>;
}

export const FILTER_PRESETS: FilterPreset[] = [
  { name: 'Orijinal', id: 'original', settings: {} },
  { name: 'Parlak', id: 'bright', settings: { brightness: 0.3, contrast: 0.1 } },
  { name: 'Sıcak', id: 'warm', settings: { brightness: 0.1, saturation: 0.3, hueRotation: -15 } },
  { name: 'Soğuk', id: 'cool', settings: { saturation: -0.1, hueRotation: 15 } },
  { name: 'Vintage', id: 'vintage', settings: { brightness: -0.1, contrast: 0.2, saturation: -0.3, sepia: true } },
  { name: 'Dramatik', id: 'dramatic', settings: { brightness: -0.15, contrast: 0.5, saturation: 0.3 } },
  { name: 'Siyah Beyaz', id: 'bw', settings: { grayscale: true } },
  { name: 'Sepya', id: 'sepia', settings: { sepia: true, saturation: -0.2 } },
  { name: 'Canlı', id: 'vivid', settings: { saturation: 0.5, contrast: 0.2, brightness: 0.1 } },
  { name: 'Mat', id: 'matte', settings: { contrast: -0.2, brightness: 0.1, saturation: -0.1 } },
  { name: 'Negatif', id: 'negative', settings: { invert: true } },
  { name: 'Retro', id: 'retro', settings: { sepia: true, brightness: 0.1, contrast: 0.3, saturation: -0.2 } },
  { name: 'Gün Batımı', id: 'sunset', settings: { brightness: 0.1, saturation: 0.4, hueRotation: -25 } },
  { name: 'Gece', id: 'night', settings: { brightness: -0.3, contrast: 0.2, saturation: -0.2, hueRotation: 20 } },
];

export const FONT_LIST = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
  'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Palatino',
  'Garamond', 'Tahoma', 'Lucida Console', 'Century Gothic', 'Futura',
  'Gill Sans', 'Franklin Gothic', 'Rockwell', 'Cambria', 'Calibri',
];

export const COLOR_PALETTE = [
  '#000000', '#1a1a1a', '#333333', '#555555', '#777777', '#999999', '#BBBBBB', '#DDDDDD', '#F5F5F5', '#FFFFFF',
  '#FF0000', '#FF4444', '#FF6B6B', '#E53E3E', '#C53030', '#9B2C2C',
  '#FF8C00', '#FF6B35', '#F6AD55', '#ED8936', '#DD6B20', '#C05621',
  '#FFD700', '#F7C948', '#F6E05E', '#ECC94B', '#D69E2E', '#B7791F',
  '#00FF00', '#48BB78', '#68D391', '#38A169', '#2F855A', '#276749',
  '#00CED1', '#38B2AC', '#4FD1C5', '#319795', '#2C7A7B', '#234E52',
  '#0000FF', '#4299E1', '#63B3ED', '#3182CE', '#2B6CB0', '#2C5282',
  '#8B00FF', '#9F7AEA', '#B794F4', '#805AD5', '#6B46C1', '#553C9A',
  '#FF00FF', '#ED64A6', '#F687B3', '#D53F8C', '#B83280', '#97266D',
];

export interface LayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
}

export interface EditorHistoryEntry {
  json: string;
  timestamp: number;
}

export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  altText?: string;
}

// ─── Gelişmiş Şablon Sistemi ────────────────────────────

export interface TemplateElement {
  type: 'rect' | 'circle' | 'text' | 'triangle' | 'line' | 'polygon' | 'path' | 'ellipse';
  props: Record<string, any>;
}

export interface AdvancedTemplate {
  id: string;
  name: string;
  description: string;
  category: 'e-commerce' | 'social-media' | 'marketplace' | 'promotion' | 'branding' | 'seasonal';
  tags: string[];
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  elements: TemplateElement[];
  thumbnail?: string;
}

// ─── Gradient & Arka Plan Tanımları ─────────────────────

export interface GradientStop {
  offset: number;
  color: string;
}

export interface GradientDef {
  id: string;
  name: string;
  type: 'linear' | 'radial';
  angle?: number;
  stops: GradientStop[];
}

export const GRADIENT_PRESETS: GradientDef[] = [
  { id: 'sunset', name: 'Gün Batımı', type: 'linear', angle: 135, stops: [{ offset: 0, color: '#ff6b35' }, { offset: 0.5, color: '#f7c948' }, { offset: 1, color: '#ff4081' }] },
  { id: 'ocean', name: 'Okyanus', type: 'linear', angle: 180, stops: [{ offset: 0, color: '#667eea' }, { offset: 1, color: '#764ba2' }] },
  { id: 'forest', name: 'Orman', type: 'linear', angle: 120, stops: [{ offset: 0, color: '#11998e' }, { offset: 1, color: '#38ef7d' }] },
  { id: 'fire', name: 'Ateş', type: 'linear', angle: 45, stops: [{ offset: 0, color: '#f12711' }, { offset: 1, color: '#f5af19' }] },
  { id: 'royal', name: 'Kraliyet', type: 'linear', angle: 135, stops: [{ offset: 0, color: '#141e30' }, { offset: 1, color: '#243b55' }] },
  { id: 'candy', name: 'Şeker', type: 'linear', angle: 90, stops: [{ offset: 0, color: '#ff6a88' }, { offset: 0.5, color: '#ff99ac' }, { offset: 1, color: '#fcb69f' }] },
  { id: 'aurora', name: 'Aurora', type: 'linear', angle: 60, stops: [{ offset: 0, color: '#a8edea' }, { offset: 1, color: '#fed6e3' }] },
  { id: 'midnight', name: 'Gece Yarısı', type: 'linear', angle: 180, stops: [{ offset: 0, color: '#0f0c29' }, { offset: 0.5, color: '#302b63' }, { offset: 1, color: '#24243e' }] },
  { id: 'neon', name: 'Neon', type: 'linear', angle: 135, stops: [{ offset: 0, color: '#00f260' }, { offset: 1, color: '#0575e6' }] },
  { id: 'peach', name: 'Şeftali', type: 'linear', angle: 90, stops: [{ offset: 0, color: '#ffecd2' }, { offset: 1, color: '#fcb69f' }] },
  { id: 'cosmic', name: 'Kozmik', type: 'radial', stops: [{ offset: 0, color: '#ff00cc' }, { offset: 1, color: '#333399' }] },
  { id: 'lavender', name: 'Lavanta', type: 'linear', angle: 135, stops: [{ offset: 0, color: '#e0c3fc' }, { offset: 1, color: '#8ec5fc' }] },
  { id: 'gold', name: 'Altın', type: 'linear', angle: 45, stops: [{ offset: 0, color: '#f7971e' }, { offset: 1, color: '#ffd200' }] },
  { id: 'steel', name: 'Çelik', type: 'linear', angle: 180, stops: [{ offset: 0, color: '#485563' }, { offset: 1, color: '#29323c' }] },
  { id: 'spring', name: 'Bahar', type: 'linear', angle: 90, stops: [{ offset: 0, color: '#c6ea8d' }, { offset: 1, color: '#fe90af' }] },
  { id: 'ice', name: 'Buz', type: 'linear', angle: 135, stops: [{ offset: 0, color: '#e6e9f0' }, { offset: 1, color: '#eef1f5' }] },
  { id: 'berry', name: 'Böğürtlen', type: 'linear', angle: 135, stops: [{ offset: 0, color: '#8e2de2' }, { offset: 1, color: '#4a00e0' }] },
  { id: 'emerald', name: 'Zümrüt', type: 'linear', angle: 120, stops: [{ offset: 0, color: '#43e97b' }, { offset: 1, color: '#38f9d7' }] },
  { id: 'rose-gold', name: 'Rose Gold', type: 'linear', angle: 135, stops: [{ offset: 0, color: '#f4c4f3' }, { offset: 1, color: '#fc67fa' }] },
  { id: 'charcoal', name: 'Kömür', type: 'linear', angle: 180, stops: [{ offset: 0, color: '#373b44' }, { offset: 1, color: '#4286f4' }] },
];

export interface PatternDef {
  id: string;
  name: string;
  type: 'dots' | 'stripes' | 'grid' | 'diagonal' | 'zigzag' | 'waves' | 'checkerboard' | 'diamond' | 'hexagon' | 'cross';
  color: string;
  backgroundColor: string;
  scale: number;
}

export const PATTERN_PRESETS: PatternDef[] = [
  { id: 'dots-light', name: 'Noktalar (Açık)', type: 'dots', color: '#e2e8f0', backgroundColor: '#ffffff', scale: 1 },
  { id: 'dots-dark', name: 'Noktalar (Koyu)', type: 'dots', color: '#4a5568', backgroundColor: '#1a202c', scale: 1 },
  { id: 'stripes-blue', name: 'Çizgiler (Mavi)', type: 'stripes', color: '#bee3f8', backgroundColor: '#ffffff', scale: 1 },
  { id: 'grid-gray', name: 'Izgara (Gri)', type: 'grid', color: '#e2e8f0', backgroundColor: '#ffffff', scale: 1 },
  { id: 'diagonal-red', name: 'Diyagonal (Kırmızı)', type: 'diagonal', color: '#fed7d7', backgroundColor: '#ffffff', scale: 1 },
  { id: 'zigzag-yellow', name: 'Zikzak (Sarı)', type: 'zigzag', color: '#fefcbf', backgroundColor: '#ffffff', scale: 1 },
  { id: 'checkerboard', name: 'Satranç', type: 'checkerboard', color: '#e2e8f0', backgroundColor: '#ffffff', scale: 1 },
  { id: 'diamond-purple', name: 'Baklava (Mor)', type: 'diamond', color: '#e9d8fd', backgroundColor: '#ffffff', scale: 1 },
  { id: 'waves-teal', name: 'Dalgalar (Turkuaz)', type: 'waves', color: '#b2f5ea', backgroundColor: '#ffffff', scale: 1 },
  { id: 'cross-pink', name: 'Artı (Pembe)', type: 'cross', color: '#fed7e2', backgroundColor: '#ffffff', scale: 1 },
];

// ─── Sticker Tanımları ──────────────────────────────────

export interface StickerCategory {
  id: string;
  name: string;
  icon: string;
  stickers: StickerDef[];
}

export interface StickerDef {
  id: string;
  name: string;
  type: 'svg' | 'emoji' | 'badge';
  content: string;
  color?: string;
  bgColor?: string;
}

// ─── Çerçeve Tanımları ──────────────────────────────────

export interface FrameDef {
  id: string;
  name: string;
  type: 'border' | 'polaroid' | 'device' | 'decorative' | 'shadow' | 'rounded';
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  padding?: number;
  shadowBlur?: number;
  shadowColor?: string;
}

export const FRAME_PRESETS: FrameDef[] = [
  { id: 'thin-black', name: 'İnce Siyah', type: 'border', borderWidth: 2, borderColor: '#000000' },
  { id: 'thick-white', name: 'Kalın Beyaz', type: 'border', borderWidth: 12, borderColor: '#ffffff' },
  { id: 'gold-frame', name: 'Altın Çerçeve', type: 'border', borderWidth: 8, borderColor: '#d4a017', borderRadius: 0 },
  { id: 'silver-frame', name: 'Gümüş Çerçeve', type: 'border', borderWidth: 8, borderColor: '#c0c0c0' },
  { id: 'double-line', name: 'Çift Çizgi', type: 'border', borderWidth: 4, borderColor: '#333333', padding: 6 },
  { id: 'polaroid', name: 'Polaroid', type: 'polaroid', padding: 16, borderWidth: 0, borderColor: '#ffffff' },
  { id: 'polaroid-tilted', name: 'Eğik Polaroid', type: 'polaroid', padding: 16, borderWidth: 0, borderColor: '#ffffff' },
  { id: 'rounded-sm', name: 'Yuvarlatılmış (Küçük)', type: 'rounded', borderRadius: 12, borderWidth: 0 },
  { id: 'rounded-lg', name: 'Yuvarlatılmış (Büyük)', type: 'rounded', borderRadius: 24, borderWidth: 0 },
  { id: 'circle-clip', name: 'Daire Kırpma', type: 'rounded', borderRadius: 9999, borderWidth: 0 },
  { id: 'shadow-soft', name: 'Yumuşak Gölge', type: 'shadow', shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.3)' },
  { id: 'shadow-hard', name: 'Sert Gölge', type: 'shadow', shadowBlur: 0, shadowColor: 'rgba(0,0,0,0.5)' },
  { id: 'neon-glow', name: 'Neon Işık', type: 'shadow', shadowBlur: 30, shadowColor: 'rgba(59,130,246,0.7)' },
  { id: 'dashed', name: 'Kesik Çizgi', type: 'decorative', borderWidth: 3, borderColor: '#666666' },
  { id: 'dotted', name: 'Noktalı', type: 'decorative', borderWidth: 3, borderColor: '#666666' },
  { id: 'phone-mockup', name: 'Telefon Mockup', type: 'device', borderWidth: 12, borderColor: '#1a1a1a', borderRadius: 40 },
  { id: 'laptop-mockup', name: 'Laptop Mockup', type: 'device', borderWidth: 8, borderColor: '#333333', borderRadius: 8 },
  { id: 'tablet-mockup', name: 'Tablet Mockup', type: 'device', borderWidth: 10, borderColor: '#222222', borderRadius: 16 },
];

// ─── Metin Efektleri ────────────────────────────────────

export interface TextEffect {
  id: string;
  name: string;
  shadow?: { color: string; blur: number; offsetX: number; offsetY: number };
  stroke?: { color: string; width: number };
  fill?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  opacity?: number;
}

export const TEXT_EFFECTS: TextEffect[] = [
  { id: 'none', name: 'Normal' },
  { id: 'shadow', name: 'Gölgeli', shadow: { color: 'rgba(0,0,0,0.5)', blur: 4, offsetX: 2, offsetY: 2 } },
  { id: 'soft-shadow', name: 'Yumuşak Gölge', shadow: { color: 'rgba(0,0,0,0.3)', blur: 10, offsetX: 0, offsetY: 4 } },
  { id: 'hard-shadow', name: 'Sert Gölge', shadow: { color: '#000000', blur: 0, offsetX: 3, offsetY: 3 } },
  { id: 'neon-blue', name: 'Neon Mavi', shadow: { color: '#3b82f6', blur: 15, offsetX: 0, offsetY: 0 } },
  { id: 'neon-green', name: 'Neon Yeşil', shadow: { color: '#22c55e', blur: 15, offsetX: 0, offsetY: 0 } },
  { id: 'neon-pink', name: 'Neon Pembe', shadow: { color: '#ec4899', blur: 15, offsetX: 0, offsetY: 0 } },
  { id: 'outline-white', name: 'Beyaz Kenarlık', stroke: { color: '#ffffff', width: 2 } },
  { id: 'outline-black', name: 'Siyah Kenarlık', stroke: { color: '#000000', width: 2 } },
  { id: 'outline-thick', name: 'Kalın Kenarlık', stroke: { color: '#000000', width: 4 } },
  { id: '3d-effect', name: '3D Efekt', shadow: { color: 'rgba(0,0,0,0.6)', blur: 0, offsetX: 4, offsetY: 4 } },
  { id: 'emboss', name: 'Kabartma', shadow: { color: 'rgba(255,255,255,0.5)', blur: 1, offsetX: -1, offsetY: -1 } },
  { id: 'retro', name: 'Retro', shadow: { color: '#ff6b35', blur: 0, offsetX: 3, offsetY: 3 }, stroke: { color: '#1a1a1a', width: 1 } },
  { id: 'fire-glow', name: 'Ateş Işığı', shadow: { color: '#f97316', blur: 20, offsetX: 0, offsetY: 0 } },
  { id: 'ice-glow', name: 'Buz Işığı', shadow: { color: '#06b6d4', blur: 20, offsetX: 0, offsetY: 0 } },
];
