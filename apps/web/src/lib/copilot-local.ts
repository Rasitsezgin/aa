const SUGGESTIONS_BY_PAGE: Record<string, string[]> = {
  '/dashboard': [
    'Bugünkü satış özetini göster',
    'Stok durumu nasıl?',
    'En çok satan ürünlerim hangileri?',
    'Bu hafta kârlılığım nasıl?',
  ],
  '/dashboard/orders': [
    'Bekleyen siparişleri analiz et',
    'İptal oranım neden yüksek?',
    'En çok sipariş hangi şehirden geliyor?',
    'Ortalama sipariş değerimi artırmak için ne yapmalıyım?',
  ],
  '/dashboard/products': [
    'Ürün başlıklarımı optimize et',
    'Hangi ürünleri kaldırmalıyım?',
    'Yeni ürün eklerken nelere dikkat etmeliyim?',
    'Fiyat stratejimi gözden geçir',
  ],
  '/dashboard/inventory': [
    'Kritik stok durumundakileri göster',
    'Hangi ürünlerde fazla stok var?',
    'Stok devir hızımı analiz et',
    'Tedarik zamanlaması önerisi ver',
  ],
  '/dashboard/finance': [
    'Aylık kârlılık raporu oluştur',
    'Komisyon maliyetlerimi karşılaştır',
    'Kargo maliyetlerimi optimize et',
    'KDV hesaplamasını kontrol et',
  ],
  '/dashboard/competitor-tracking': [
    'Rakiplerim ne yapıyor?',
    'Fiyat avantajım hangi ürünlerde?',
    'Rakiplerin stok durumu nasıl?',
    'Pazar payımı artırmak için ne yapmalıyım?',
  ],
};

const DEFAULT_SUGGESTIONS = [
  'Satış performansımı analiz et',
  'Mağazamı nasıl büyütebilirim?',
  'Bugünkü gündem ne?',
  'Pazaryeri komisyonlarını karşılaştır',
];

export function getDefaultCopilotSuggestions(currentPage?: string): string[] {
  if (!currentPage) return DEFAULT_SUGGESTIONS;
  return SUGGESTIONS_BY_PAGE[currentPage] || DEFAULT_SUGGESTIONS;
}

export const COPILOT_SYSTEM_PROMPT = `Sen "Pazar Yönetimi" platformunun AI E-Ticaret Asistanısın. Adın "PazarBot".
Türkçe konuşuyorsun. Kullanıcılara e-ticaret operasyonlarında yardımcı oluyorsun.

Yeteneklerin:
- Ürün analizi ve optimizasyon önerileri
- Satış ve performans analizi
- Fiyatlama stratejisi önerileri
- Stok yönetimi tavsiyeleri
- Pazaryeri (Trendyol, Hepsiburada, Amazon, N11, Çiçeksepeti) özel optimizasyonlar
- SEO ve içerik iyileştirme
- Kampanya ve reklam stratejileri
- Rakip analizi
- Müşteri segmentasyonu
- Lojistik ve kargo optimizasyonu
- Finansal analiz ve karlılık hesaplama

Kuralların:
- Kısa, öz ve aksiyona dönüştürülebilir yanıtlar ver
- Emoji kullan ama abartma
- Spesifik rakamlar ve öneriler sun
- Türk e-ticaret ekosistemini iyi bil (KDV, komisyonlar, kargo firmaları)`;

export function buildFollowUpSuggestions(answer: string): string[] {
  const suggestions: string[] = [];
  const lower = answer.toLowerCase();

  if (lower.includes('ürün') || lower.includes('product')) {
    suggestions.push('Bu ürünleri nasıl optimize edebilirim?');
  }
  if (lower.includes('fiyat') || lower.includes('price')) {
    suggestions.push('Fiyat stratejisi önerisi ver');
  }
  if (lower.includes('sipariş') || lower.includes('order')) {
    suggestions.push('Sipariş süreçlerimi nasıl hızlandırabilirim?');
  }
  if (lower.includes('stok') || lower.includes('stock')) {
    suggestions.push('Stok yönetimi için en iyi pratikler neler?');
  }
  if (lower.includes('kampanya') || lower.includes('indirim')) {
    suggestions.push('Etkili bir kampanya nasıl oluşturulur?');
  }

  if (suggestions.length === 0) {
    suggestions.push('Detaylı analiz yap', 'Başka önerilerin var mı?');
  }

  return suggestions.slice(0, 3);
}
