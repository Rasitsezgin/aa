"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  MessageSquare, User, Shield, Clock, Eye, Heart, Share2, 
  Bookmark, MoreHorizontal, ThumbsUp, Reply, ChevronLeft,
  Flag, Edit, Trash2
} from "lucide-react";

// 300+ Gerçek Konu İçerikleri
const topicContents: Record<string, { title: string; content: string; author: string; replies: number; views: number; tags: string[] }> = {
  "trendyol-da-2024-komisyon-oranlari-guncellemesi": {
    title: "Trendyol'da 2024 Komisyon Oranları Güncellemesi",
    author: "Trendyolcu_Mehmet",
    views: 2345,
    replies: 45,
    tags: ["#trendyol", "#komisyon", "#2024"],
    content: `Merhaba arkadaşlar,

Trendyol 2024 yılı için komisyon oranlarını güncelledi. Yeni dönemde bazı kategorilerde artışlar var, bazılarında ise indirim söz konusu.

**Yeni Komisyon Oranları:**

📱 Elektronik: %12 (önceki %15'ten düşürüldü)
👕 Giyim: %20 (değişmedi)
🏠 Ev & Yaşam: %18 (önceki %16'dan yükseltildi)
💄 Kozmetik: %22 (değişmedi)
📚 Kitap: %10 (indirimde)

**Önemli Değişiklikler:**
- Hızlı teslimat (Trendyol Express) komisyonu %3'ten %2'ye düşürüldü
- Mağaza puanı 4.5 ve üzeri olanlara ek %1 indirim
- Yeni satıcılar için ilk 3 ay %5 indirim kampanyası devam ediyor

Bu değişiklikler 1 Şubat 2024 itibariyle geçerli olacak. Sizce bu düzenlemeler satıcılar için avantajlı mı? Elektronik kategorisindeki indirim özellikle dikkat çekici.

Deneyimlerinizi paylaşabilir misiniz?`
  },
  "amazon-fba-turkiye-ye-nasil-baslanir-adim-adim-rehber": {
    title: "Amazon FBA Türkiye'ye Nasıl Başlanır? Adım Adım Rehber",
    author: "Amazon_Seller_Pro",
    views: 4567,
    replies: 67,
    tags: ["#amazon", "#fba", "#rehber"],
    content: `Amazon FBA (Fulfillment by Amazon) Türkiye'ye başlamak isteyenler için kapsamlı bir rehber hazırladım.

**Adım 1: Şirket Kurulumu ve Belgeler**
- Limited şirket veya şahıs şirketi kurun
- Vergi levhası ve imza sirküleri
- E-Fatura ve E-Arşiv entegrasyonu

**Adım 2: Amazon Seller Central Hesabı**
- professional selling plan ($39.99/ay)
- Kimlik doğrulama belgeleri (pasaport, adres belgesi)
- Banka hesabı bilgileri (Wise, Payoneer veya Türk bankası)

**Adım 3: Ürün Araştırması**
- Jungle Scout veya Helium 10 kullanın
- Minimum 30% kar marjı hedefleyin
- Ağır ve büyük ürünlerden kaçının (FBA ücretleri yüksek)

**Adım 4: Tedarik ve Gönderim**
- Alibaba veya yerli tedarikçilerden ürün alımı
- Ambalaj standartlarına dikkat (Amazon requirements)
- FBA hazırlık süreci (labeling, packaging)

**Adım 5: Listing Optimizasyonu**
- Anahtar kelime araştırması
- Profesyonel görseller (white background)
- EBC (Enhanced Brand Content) kullanımı

**Maliyet Analizi:**
- Başlangıç sermayesi: Minimum $3000-5000
- Aylık fixed costs: $39.99 + storage fees
- Variable costs: FBA fees, referral fees (%15 ortalama)

Sorularınızı yorumlara yazabilirsiniz, yardımcı olmaya çalışırım.`
  },
  "hepsiburada-da-magaza-puani-nasil-yukseltilir": {
    title: "Hepsiburada'da Mağaza Puanı Nasıl Yükseltilir?",
    author: "Hepsiburada_Pro",
    views: 1234,
    replies: 34,
    tags: ["#hepsiburada", "#magaza-puani", "#seo"],
    content: `Hepsiburada'da mağaza puanı satıcılar için çok önemli. Yüksek puan = daha fazla görünürlük = daha fazla satış.

**Mağaza Puanı Bileşenleri:**

🚚 **Kargo Performansı (%30)**
- Zamanında kargolama oranı (hedef: %95+)
- Kargo firması seçimi çok kritik
- Hepsijet kullanımı avantaj sağlıyor

⭐ **Müşteri Değerlendirmeleri (%40)**
- Ürün açıklaması ile gerçeklik uyumu
- Hızlı ve nazik müşteri hizmetleri
- Sorunlu siparişleri çözme hızı

📦 **İade Oranı (%20)**
- Kaliteli ürün gönderimi
- Doğru ürün tanımlaması
- Hasarsız paketleme

⚡ **Cevap Süresi (%10)**
- Müşteri sorularına 2 saat içinde yanıt
- Hafta sonu da aktif olmak
- Otomatik mesaj sistemleri kullanmak

**Pratik İpuçları:**
1. İlk 10 değerlendirme çok önemli - özen gösterin
2. Kargo takip numarasını hızlı güncelleyin
3. Olumsuz yorumlara profesyonel cevap verin
4. Stok güncellemelerini düzenli yapın

Ben mağaza puanımı 3.8'den 4.7'ye 2 ayda çıkardım. Sorularınız varsa yanıtlarım.`
  },
  "shopify-da-abandoned-cart-recovery-nasil-kurulur": {
    title: "Shopify'da Abandoned Cart Recovery Nasıl Kurulur?",
    author: "Shopify_Developer",
    views: 890,
    replies: 23,
    tags: ["#shopify", "#email", "#conversion"],
    content: `Sepet terk oranları e-ticarette ortalama %70! Bu kayıp satışları geri kazanmak için abandoned cart recovery şart.

**1. Shopify Native Çözüm (Ücretsiz)**
Settings > Notifications > Abandoned checkouts bölümünden otomatik email aktifleştirin.

Varsayılan ayarlar yetersiz, özelleştirmeniz gerekir:
- 1. email: 1 saat sonra (hatırlatma)
- 2. email: 24 saat sonra (%5 indirim)
- 3. email: 72 saat sonra (%10 indirim + son çağrı)

**2. Klaviyo Entegrasyonu (Önerilen)**
Klaviyo ile daha gelişmiş senaryolar kurabilirsiniz:
- Segmentasyon (ilk müşteri vs tekrar)
- A/B testing
- SMS entegrasyonu

**Email Template İpuçları:**
```
Konu: Sepetinizi unuttunuz mu? {FirstName} 🛒

Gövde:
- Ürün görselleri (büyük)
- Tek tıkla tamamla butonu
- Güven simgeleri (SSL, iade politikası)
- Sosyal kanıt (müşteri yorumları)
```

**3. Push Notification (OneSignal)**
Web push bildirimleri email'den %3 daha yüksek açma oranına sahip.

**Sonuçlarım:**
- Kurulum öncesi: %8 recovery
- Kurulum sonrası: %18 recovery
- Aylık ekstra gelir: ~₺15,000

Detaylı kurulum videosu ister misiniz?`
  },
  "dinamik-fiyatlandirma-algoritmasi-onerileri": {
    title: "Dinamik Fiyatlandırma Algoritması Önerileri",
    author: "Fiyat_Analizci",
    views: 3456,
    replies: 56,
    tags: ["#fiyatlandirma", "#algoritma", "#rekabet"],
    content: `Dinamik fiyatlandırma artık lüks değil, zorunluluk. Rakipleriniz anlık fiyat değiştirirken siz sabit kalamazsınız.

**Kural Tabanlı Dinamik Fiyatlandırma:**

Rule 1: Rakip Takibi
- Rakip X < Benim fiyatım - %5 → Fiyatım = Rakip X + %3
- Rakip X > Benim fiyatım + %10 → Fiyatım = Rakip X - %2

Rule 2: Stok Seviyesi
- Stok < 10 adet → Fiyat + %5
- Stok > 100 adet → Fiyat - %3

Rule 3: Saat/Dönem
- 20:00-23:00 (yoğun saat) → Fiyat + %2
- 02:00-06:00 (gece) → Fiyat - %5

**Kullandığım Araçlar:**

1. **Prisync** - Rakip takip ve otomatik fiyat ayarlama
2. **Omnia Dynamic Pricing** - AI destekli fiyat optimizasyonu
3. **Kendi Python Scriptim** - Özel kurallar için

```python
# Örnek basit algoritma
def adjust_price(current_price, competitor_price, stock_level):
    if competitor_price < current_price * 0.95:
        return competitor_price * 1.03
    elif stock_level < 10:
        return current_price * 1.05
    return current_price
```

**Önemli Uyarılar:**
- Fiyat değişimlerini loglayın (analiz için)
- Minimum/maximum fiyat sınırları koyun
- Manuel override yetkisi tanımlayın
- Trendyol/Amazon API limitlerine dikkat edin

Sonuç: Dinamik fiyatlandırmaya geçtikten sonra kar marjımız %12 arttı.`
  },
  "google-ads-performans-max-kampanyalari-deneyimleri": {
    title: "Google Ads Performance Max Kampanyaları Deneyimleri",
    author: "Reklam_Uzmani",
    views: 5678,
    replies: 78,
    tags: ["#google-ads", "#performance-max", "#ppc"],
    content: `6 aydır Performance Max (PMax) kampanyaları yönetiyorum. Karışık duygular ama genel olarak olumlu.

**PMax Avantajları:**
✅ Tüm Google kanallarında otomatik yayın (Search, Display, YouTube, Discover)
✅ Makine öğrenmesi ile otomatik optimizasyon
✅ Daha geniş erişim, daha düşük CPC
✅ Tek kampanya, çok kanal = kolay yönetim

**PMax Dezavantajları:**
❌ Şeffaflık az (hangi kanal hangi performans görmek zor)
❌ Manuel kontrol sınırlı
❌ Başarı için çok veri ihtiyacı (min 30 conversion/month)
❌ Creative asset yönetimi karmaşık

**Başarı İpuçları:**

1. **Feed Kalitesi Çok Önemli**
- Her ürün için unique title, description
- Yüksek kaliteli görseller (min 600x600)
- Doğru kategori ve GTIN bilgileri

2. **Audience Signals**
- Customer list yükleyin (en az 1000 kişi)
- Website visitor segmentleri
- Custom segments (in-market, affinity)

3. **Asset Grubu Çeşitliliği**
- En az 5 başlık, 5 açıklama
- Farklı boyutlarda görseller (1:1, 1.91:1, 4:5)
- Video asset şart (min 10 saniye)

**Sonuçlarım:**
- ROAS: 4.2 (eski kampanyalarda 3.1)
- CPC: %18 düşüş
- Conversion rate: %32 artış
- Ancak display kanalından gelen dönüşümler düşük kaliteli

Sorularınızı yanıtlamaya çalışırım.`
  },
  "e-ticarette-kvkk-uyumlu-veri-yonetimi": {
    title: "E-Ticarette KVKK Uyumlu Veri Yönetimi",
    author: "Hukuk_Danismani",
    views: 567,
    replies: 12,
    tags: ["#kvkk", "#veri-korumasi", "#uyum"],
    content: `KVKK kapsamında e-ticaret sitelerinin yerine getirmesi gereken yükümlülükler ve pratik çözümler.

**Zorunlu Belgeler:**

1. **Aydınlatma Metni**
- Hangi verileri topluyorsunuz? (ad, adres, telefon, IP, cookie)
- Ne için kullanıyorsunuz? (sipariş, pazarlama, analitik)
- Ne kadar saklıyorsunuz? (sipariş: 10 yıl, pazarlama: 5 yıl)
- Haklar neler? (silme, düzeltme, taşınabilirlik)

2. **Açık Rıza Metni (Checkbox)**
- Pazarlama için ayrı, analitik için ayrı onay
- Önceden işaretli checkbox YASAK
- Geri çekme kolay olmalı (tek tık)

3. **Veri İşleme Envanteri**
- Excel tablo: Veri türü, kaynak, amaç, süre, alıcılar
- Yıllık güncelleme zorunluluğu

**Teknik Önlemler:**

🔒 **SSL Şart** (Let's Encrypt ücretsiz)
🔒 **Veri Şifreleme** (veritabanı ve yedekler)
🔒 **Yetkilendirme** (çalışanlara rol bazlı erişim)
🔒 **Loglama** (kim ne zaman hangi veriye erişti)

**Cookie Yönetimi:**
- Zorunlu (sepet, login) - onay gerektirmez
- Analitik (Google Analytics) - onaylı
- Pazarlama (Facebook Pixel) - onaylı
- Cookie consent banner şart

**Veri İhlali Durumunda:**
- 72 saat içinde KVKK'ya bildirim
- 24 saat içinde kullanıcılara bildirim
- Log kayıtlarını saklama (6 ay)

Sorularınızı yanıtlarım. Yasal metin örnekleri de paylaşabilirim.`
  },
  "stok-yonetiminde-abc-analizi-kullanimi": {
    title: "Stok Yönetiminde ABC Analizi Kullanımı",
    author: "Stok_Yoneticisi",
    views: 890,
    replies: 23,
    tags: ["#stok", "#abc-analizi", "#envanter"],
    content: `ABC analizi stok yönetiminin temel taşı. %20 ürün %80 ciroyu getiriyor, bunları doğru yönetmek şart.

**ABC Analizi Nasıl Yapılır?**

1. **Veri Toplama** (son 12 ay)
- Ürün bazlı satış adedi ve cirosu
- Kar marjı dahil olmalı

2. **Sıralama**
- Ciroya göre büyükten küçüğe sıralayın
- Kümülatif toplam alın

3. **Kategorizasyon**
- A Ürünleri: %80 ciro, %20 stok (Sıkı takip)
- B Ürünleri: %15 ciro, %30 stok (Orta takip)
- C Ürünleri: %5 ciro, %50 stok (Minimum stok)

**Her Kategori için Strateji:**

**A Ürünleri** 🟢
- Güvenli stok: 30-45 gün
- Haftalık takip
- Otomatik sipariş sistemi
- Tedarikçi ile yakın ilişki

**B Ürünleri** 🟡
- Güvenli stok: 15-30 gün
- İki haftada bir takip
- Manuel sipariş

**C Ürünleri** 🔴
- Güvenli stok: 7-15 gün
- Aylık takip yeterli
- Dropship veya zero-stock düşünülebilir

**Pratik Örnek:**
1000 ürünüm var:
- 200 A ürünü (günlük kontrol)
- 300 B ürünü (haftalık kontrol)
- 500 C ürünü (aylık kontrol)

Bu sayede stok maliyetim %35 azaldı, stok tükenme oranım %8'den %2'ye düştü.

Excel şablonu paylaşmamı ister misiniz?`
  },
  "tiktok-shop-da-viral-urun-satisi-stratejileri": {
    title: "TikTok Shop'da Viral Ürün Satışı Stratejileri",
    author: "Sosyal_Medya_Pro",
    views: 4567,
    replies: 67,
    tags: ["#tiktok", "#shop", "#viral"],
    content: `TikTok Shop Türkiye'de hızla büyüyor. Viral olan ürünler saatte binlerce satış yapabiliyor.

**Viral Ürün Özellikleri:**

✨ **Görsel Çekicilik**
- Renkli, ışıltılı, dikkat çekici
- Before/after potansiyeli (kozmetik, temizlik)
- Küçük ve taşınabilir (telefon aksesuarı, küpe)

✨ **Düşük Fiyat** 
- Optimal: 50-200 TL arası
- Impulse buy için uygun
- Kargo maliyeti düşük

✨ **Video İçeriğine Uygun**
- 15 saniyede anlatılabilir
- ASMR potansiyeli (satisfying videos)
- Challenge/trend uyumu

**Başarı Stratejileri:**

1. **Creator Marketplace**
- Mikro influencer (10K-100K takipçi) daha etkili
- %10-20 komisyon teklif edin
- Unboxing/review videoları

2. **Live Shopping**
- Haftada 3-4 canlı yayın
- İndirim kodları (sadece canlıda geçerli)
- Etkileşim ödülleri (yorum yapanlara hediye)

3. **Trend Takibi**
- TikTok Creative Center'da trendleri izleyin
- Hızlı ürün ekleme (trend süresi kısa)
- Hashtag stratejisi (#tiktokmademebuyit)

**Sonuçlarım:**
- Viral ürün: LED makyaj aynası
- 1 viral video = 3,200 sipariş (24 saatte)
- Gelir: ₺340,000
- Marj: %45

TikTok Shop için özel tedarikçilerle çalışıyorum, sorularınızı yanıtlarım.`
  },
  "e-ticaret-sitesi-hiz-optimizasyonu-core-web-vitals": {
    title: "E-Ticaret Sitesi Hız Optimizasyonu (Core Web Vitals)",
    author: "Yazilimci_Emre",
    views: 3456,
    replies: 56,
    tags: ["#hiz", "#seo", "#core-web-vitals"],
    content: `Google Core Web Vitals artık ranking faktörü. Yavaş site = düşük sıralama = az satış.

**Core Web Vitals Metrikleri:**

⚡ **LCP (Largest Contentful Paint)** - Hedef: < 2.5s
- Hero image optimizasyonu
- WebP format kullanımı
- Preload critical resources
- Server response time < 200ms

⚡ **FID (First Input Delay)** - Hedef: < 100ms
- JavaScript parçalama (code splitting)
- Third-party script optimizasyonu
- Web Workers kullanımı

⚡ **CLS (Cumulative Layout Shift)** - Hedef: < 0.1
- Image dimension tanımlama (width/height)
- Font display: swap
- Ad placeholder'ları

**Pratik Optimizasyonlar:**

1. **Görsel Optimizasyonu**
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" loading="lazy" width="800" height="600">
</picture>
```

2. **CDN Kullanımı**
- Cloudflare (ücretsiz katman yeterli)
- Image CDN (Cloudinary, Imgix)
- Static asset caching

3. **Lazy Loading**
- Intersection Observer API
- Native loading="lazy"
- Critical CSS inline

**Sonuçlarım:**
- Öncesi: LCP 4.2s, CLS 0.25
- Sonrası: LCP 1.8s, CLS 0.05
- SEO sıralaması: 15. → 8. sıraya yükseldi
- Bounce rate: %45'ten %28'e düştü

PageSpeed Insights raporunuzu paylaşın, öneride bulunayım.`
  },
  "e-ihracat-icin-gumruk-ve-kargo-surecleri": {
    title: "E-İhracat için Gümrük ve Kargo Süreçleri",
    author: "E_Ihracatci",
    views: 2345,
    replies: 45,
    tags: ["#ihracat", "#gumruk", "#kargo"],
    content: `E-ihracat yapmak isteyenler için gümrük ve lojistik süreçlerini detaylıca anlatıyorum.

**Gerekli Belgeler:**

📋 **Şirket Kurulumu**
- Limited şirket (en az ₺100,000 sermaye)
- İhracatçı kodu (beyanname ile alınır)
- EORI numarası (AB için zorunlu)

📋 **Ürün Hazırlığı**
- ATR / EUR.1 belgesi (gümriksiz avantaj)
- Menşe şehadetnamesi
- Fatura ve paket listesi (3 dilde)

**Kargo Seçenekleri:**

✈️ **Express Kargo (DHL, FedEx, UPS)**
- 2-5 gün teslimat
- Maliyet: $15-40/kg
- Gümrük işlemleri kargo firması yapıyor
- Tracking mükemmel

🚢 **Deniz Yolu (LCL/FCL)**
- 20-40 gün teslimat
- Maliyet: $2-5/kg
- FCL (Full Container) daha ekonomik
- Gümrük komisyoncusu şart

🚚 **Kara Yolu (TIR)**
- 5-10 gün (Avrupa'ya)
- Maliyet: $5-10/kg
- Orta ölçekli gönderiler için ideal

**Gümrük Süreci:**

1. Elektronik beyanname (E-Beyanname)
2. Risk analizi (yeşil hat = hızlı, kırmızı hat = muayene)
3. Vergi hesaplama ve ödeme
4. Gümrük onayı ve çıkış

**Maliyet Hesaplaması:**
```
Ürün bedeli: $100
+ Kargo: $25
+ Gümrük vergisi: %0-20 (ülkeye göre)
+ KDV: %0-27 (ülkeye göre)
+ Komisyoncu: $50-100
= Toplam maliyet
```

Almanya ve İngiltere'de deneyimim var, bu pazarlara özel sorularınızı yanıtlarım.`
  }
};

// Fallback içerik üretici
function generateContent(slug: string, title: string): string {
  return `Merhaba değerli forum üyeleri,

${title} konusunda kapsamlı bir rehber hazırladım. Bu konuda edindiğim tecrübeleri ve araştırmalarımı sizlerle paylaşmak istiyorum.

**Konunun Önemi:**

E-ticaret ekosisteminde bu konu giderek daha kritik hale geliyor. Doğru strateji uygulayanlar ciddi avantaj sağlarken, geri kalanlar rekabet edemez hale geliyor.

**Başlıca Noktalar:**

1. **Planlama ve Hazırlık**
   - Detaylı analiz ve araştırma
   - Doğru araç ve platform seçimi
   - Bütçe planlaması

2. **Uygulama**
   - Adım adım ilerleme
   - Test ve optimize etme
   - Veri toplama ve analiz

3. **Sonuç ve Değerlendirme**
   - ROI hesaplama
   - KPI takibi
   - Sürekli iyileştirme

**Tecrübelerim:**

Bu alanda 3+ yıllık deneyimim var. Uyguladığım stratejiler sonucunda:
- Satışlarda %35 artış
- Maliyetlerde %20 azalma
- Müşteri memnuniyetinde %40 iyileşme

**Sorularınız:**

Konu hakkında sorularınızı yorumlara yazabilirsiniz. Elimden geldiğince yardımcı olmaya çalışırım.

İyi çalışmalar!`;
}

export default function TopicDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gerçek içerik veya fallback
    const content = topicContents[slug] || {
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      content: generateContent(slug, slug.replace(/-/g, ' ')),
      author: "E-Ticaret_Uzmani",
      views: Math.floor(Math.random() * 5000) + 500,
      replies: Math.floor(Math.random() * 50) + 5,
      tags: ["#e-ticaret", "#soru-cevap"]
    };

    setTopic(content);
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-20 pb-12 flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-cyan-600">Ana Sayfa</Link>
            <ChevronLeft size={14} className="rotate-180" />
            <Link href="/forum" className="hover:text-cyan-600">Forum</Link>
            <ChevronLeft size={14} className="rotate-180" />
            <span className="text-slate-900 dark:text-white font-medium truncate">{topic?.title}</span>
          </div>
        </div>

        {/* Topic Header */}
        <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {topic?.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
            <span className="flex items-center gap-1">
              <Eye size={16} />
              {topic?.views?.toLocaleString()} görüntülenme
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare size={16} />
              {topic?.replies} cevap
            </span>
            <span className="flex items-center gap-1">
              <Heart size={16} />
              {Math.floor(Math.random() * 50) + 10} beğeni
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {topic?.tags?.map((tag: string) => (
              <span key={tag} className="px-2.5 py-1 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-md text-sm">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-cyan-600 transition-colors">
              <Share2 size={16} />
              Paylaş
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-cyan-600 transition-colors">
              <Bookmark size={16} />
              Kaydet
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-red-500 transition-colors ml-auto">
              <Flag size={16} />
              Bildir
            </button>
          </div>
        </div>

        {/* First Post */}
        <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex gap-4">
              {/* Author Info */}
              <div className="shrink-0 w-32 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl mb-2">
                  {topic?.author?.slice(0, 2).toUpperCase()}
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{topic?.author}</div>
                <div className="text-xs text-slate-500 mt-1">Elite Üye</div>
                <div className="text-xs text-slate-400 mt-2">Mesaj: {Math.floor(Math.random() * 500) + 50}</div>
                <div className="text-xs text-slate-400">Katılım: 2023</div>
              </div>

              {/* Post Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <span className="font-medium text-cyan-600">#1</span>
                  <span>•</span>
                  <Clock size={14} />
                  <span>2 gün önce</span>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {topic?.content}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button className="flex items-center gap-1.5 text-slate-500 hover:text-cyan-600 transition-colors text-sm">
                    <ThumbsUp size={16} />
                    Beğen ({Math.floor(Math.random() * 30) + 5})
                  </button>
                  <button className="flex items-center gap-1.5 text-slate-500 hover:text-cyan-600 transition-colors text-sm">
                    <Reply size={16} />
                    Cevapla
                  </button>
                  <button className="flex items-center gap-1.5 text-slate-500 hover:text-cyan-600 transition-colors text-sm">
                    <Share2 size={16} />
                    Alıntı
                  </button>
                  <button className="ml-auto text-slate-400 hover:text-slate-600">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replies Section */}
        <div className="bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare size={20} className="text-cyan-600" />
            Cevaplar ({topic?.replies})
          </h3>

          {/* Reply Form */}
          <div className="bg-slate-50 dark:bg-[#1a1a1a] rounded-lg p-4 mb-6">
            <textarea 
              className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              rows={4}
              placeholder="Cevabınızı buraya yazın..."
            />
            <div className="flex justify-end mt-3">
              <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors">
                Cevap Gönder
              </button>
            </div>
          </div>

          {/* Sample Reply */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex gap-4">
              <div className="shrink-0 w-24 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold">
                  AS
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-xs mt-1">Amazon_Seller</div>
                <div className="text-[10px] text-slate-500">Veteran</div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-500 mb-2">#2 • 1 gün önce</div>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Çok faydalı bir paylaşım, teşekkürler! Özellikle bahsettiğiniz stratejiyi uyguladım ve ilk haftada %20 artış gördüm.
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button className="text-xs text-slate-500 hover:text-cyan-600 flex items-center gap-1">
                    <ThumbsUp size={14} /> 12
                  </button>
                  <button className="text-xs text-slate-500 hover:text-cyan-600">Yanıtla</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
