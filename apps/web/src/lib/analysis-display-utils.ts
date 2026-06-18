export type UiStoreProduct = {
  name: string;
  price: number;
  rating: number;
  reviews: number;
  stockStatus: boolean;
  images: string[];
  imageUrl?: string;
};

export function mapApiProductsToUi(
  products: Array<Record<string, unknown>> = [],
): UiStoreProduct[] {
  return products.map((p) => {
    const images = Array.isArray(p.images)
      ? (p.images as string[]).filter(Boolean)
      : p.imageUrl
        ? [String(p.imageUrl)]
        : [];
    const stockFromFlag = p.stockStatus;
    const stockFromNumber = typeof p.stock === 'number' ? p.stock > 0 : undefined;
    const stockStatus =
      stockFromFlag === false
        ? false
        : stockFromFlag === true
          ? true
          : stockFromNumber ?? true;

    return {
      name: String(p.name || p.title || 'Ürün'),
      price: Number(p.price) || 0,
      rating: Number(p.rating) || 0,
      reviews: Number(p.reviews ?? p.reviewCount) || 0,
      stockStatus,
      images,
      imageUrl: images[0],
    };
  });
}

export function formatMetricDisplay(
  value: unknown,
  source?: string | null,
  formatter?: (n: number) => string,
): string {
  if (source === 'not_available' || source === 'Yok') return '--';
  if (value === undefined || value === null || value === '') return '--';
  if (typeof value === 'string') {
    if (value === 'Veri yok') return '--';
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value === 0 && source === 'not_available') return '--';
    return formatter ? formatter(value) : String(value);
  }
  return '--';
}

export function stockStatusLabel(inStock: boolean): {
  label: string;
  className: string;
} {
  if (inStock) {
    return {
      label: 'Stokta',
      className:
        'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',
    };
  }
  return {
    label: 'Tükendi',
    className: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  };
}

type SeoRecommendation = {
  title: string;
  impact: 'Yüksek' | 'Orta' | 'Düşük';
  desc: string;
  iconKey: 'title' | 'image' | 'price' | 'stock' | 'reviews' | 'ok';
};

export function deriveSeoRecommendations(
  metrics?: {
    titleOptimization?: number;
    imageOptimization?: number;
    priceCompetitiveness?: number;
    stockHealth?: number;
    rating?: number;
    totalReviews?: number;
  } | null,
  productCount = 0,
): SeoRecommendation[] {
  if (!metrics || productCount === 0) return [];

  const recs: SeoRecommendation[] = [];

  if ((metrics.titleOptimization ?? 100) < 70) {
    recs.push({
      title: 'Ürün başlıklarını optimize et',
      impact: (metrics.titleOptimization ?? 0) < 50 ? 'Yüksek' : 'Orta',
      desc: `Başlık optimizasyon skoru %${metrics.titleOptimization ?? 0}. Anahtar kelimeleri başlığın ilk 60 karakterine taşıyın.`,
      iconKey: 'title',
    });
  }

  if ((metrics.imageOptimization ?? 100) < 80) {
    recs.push({
      title: 'Ürün görsellerini tamamlayın',
      impact: (metrics.imageOptimization ?? 0) < 50 ? 'Yüksek' : 'Orta',
      desc: `Görsel skoru %${metrics.imageOptimization ?? 0}. Görselsiz ürünler dönüşümü düşürür.`,
      iconKey: 'image',
    });
  }

  if ((metrics.priceCompetitiveness ?? 100) < 90) {
    recs.push({
      title: 'Fiyatlandırmayı gözden geçirin',
      impact: 'Orta',
      desc: `Fiyat verisi skoru %${metrics.priceCompetitiveness ?? 0}. Eksik veya sıfır fiyatlı ürünleri güncelleyin.`,
      iconKey: 'price',
    });
  }

  if ((metrics.stockHealth ?? 100) < 100) {
    recs.push({
      title: 'Stok durumunu kontrol edin',
      impact: (metrics.stockHealth ?? 0) < 70 ? 'Yüksek' : 'Orta',
      desc: `Stok sağlığı %${metrics.stockHealth ?? 0}. Tükenen ürünleri yeniden listeleyin.`,
      iconKey: 'stock',
    });
  }

  if ((metrics.totalReviews ?? 0) < 10 && productCount > 0) {
    recs.push({
      title: 'Değerlendirme sayısını artırın',
      impact: 'Orta',
      desc: `Örneklenen ${productCount} üründe toplam ${metrics.totalReviews ?? 0} değerlendirme var.`,
      iconKey: 'reviews',
    });
  }

  if (recs.length === 0) {
    recs.push({
      title: 'Temel SEO metrikleri iyi durumda',
      impact: 'Düşük',
      desc: `Mağaza puanı ${metrics.rating ?? '--'}/5. Mevcut başlık, görsel ve stok performansını koruyun.`,
      iconKey: 'ok',
    });
  }

  return recs.slice(0, 5);
}
