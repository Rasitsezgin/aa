import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

// 50+ Gerçekçi Kullanıcı Verisi
const users = [
  { id: "u1", name: "Admin", level: "Yönetici", isStaff: true, email: "admin@pazaryonetimi.com" },
  { id: "u2", name: "Moderatör_Ahmet", level: "Moderatör", isModerator: true, email: "ahmet@pazaryonetimi.com" },
  { id: "u3", name: "E-Ticaret_Uzmani", level: "Elite", email: "uzman@example.com" },
  { id: "u4", name: "Amazon_Seller_Pro", level: "Veteran", email: "amazon@example.com" },
  { id: "u5", name: "Trendyolcu_Mehmet", level: "Elite", email: "trendyol@example.com" },
  { id: "u6", name: "Shopify_Developer", level: "Veteran", email: "shopify@example.com" },
  { id: "u7", name: "Pazarlama_Uzmani", level: "Elite", email: "pazarlama@example.com" },
  { id: "u8", name: "SEO_Master_Turkey", level: "Veteran", email: "seo@example.com" },
  { id: "u9", name: "Stok_Yoneticisi", level: "Üye", email: "stok@example.com" },
  { id: "u10", name: "Yeni_Satici_2024", level: "Yeni Üye", email: "yeni@example.com" },
  { id: "u11", name: "Hepsiburada_Pro", level: "Elite", email: "hepsi@example.com" },
  { id: "u12", name: "Fiyat_Analizci", level: "Veteran", email: "fiyat@example.com" },
  { id: "u13", name: "Tedarikci_Ali", level: "Üye", email: "tedarik@example.com" },
  { id: "u14", name: "Kobi_Patronu", level: "Elite", email: "kobi@example.com" },
  { id: "u15", name: "E_Ihracatci", level: "Veteran", email: "ihracat@example.com" },
  { id: "u16", name: "Sosyal_Medya_Pro", level: "Üye", email: "sosyal@example.com" },
  { id: "u17", name: "Muhasebe_Uzmani", level: "Veteran", email: "muhasebe@example.com" },
  { id: "u18", name: "Kargo_Takip", level: "Üye", email: "kargo@example.com" },
  { id: "u19", name: "Reklam_Uzmani", level: "Elite", email: "reklam@example.com" },
  { id: "u20", name: "Dropshipper_Pro", level: "Veteran", email: "dropship@example.com" },
  { id: "u21", name: "Perakendeci_Ayse", level: "Üye", email: "perakende@example.com" },
  { id: "u22", name: "Egitmen_Can", level: "Elite", email: "egitmen@example.com" },
  { id: "u23", name: "Girisimci_Burak", level: "Yeni Üye", email: "girisimci@example.com" },
  { id: "u24", name: "Marka_Uzmani", level: "Veteran", email: "marka@example.com" },
  { id: "u25", name: "Musteri_Hizmetleri", level: "Üye", email: "musteri@example.com" },
  { id: "u26", name: "Analiz_Uzmani", level: "Elite", email: "analiz@example.com" },
  { id: "u27", name: "Lojistik_Pro", level: "Veteran", email: "lojistik@example.com" },
  { id: "u28", name: "Yazilimci_Emre", level: "Üye", email: "yazilimci@example.com" },
  { id: "u29", name: "Tasimacilik_Pro", level: "Veteran", email: "tasimacilik@example.com" },
  { id: "u30", name: "Vergi_Uzmani", level: "Elite", email: "vergi@example.com" },
];

// 12 Kategori
const categories = [
  { id: "c1", name: "Genel", slug: "genel", description: "Genel forum konuları", order: 1 },
  { id: "c2", name: "E-Ticaret Platformları", slug: "eticaret-platform", description: "Pazaryeri platformları", order: 2 },
  { id: "c3", name: "Operasyon & Strateji", slug: "operasyon", description: "İşletme operasyonları", order: 3 },
  { id: "c4", name: "Dijital Pazarlama", slug: "pazarlama", description: "Pazarlama stratejileri", order: 4 },
  { id: "c5", name: "Teknik & Yazılım", slug: "teknik", description: "Teknik konular", order: 5 },
  { id: "c6", name: "Hukuki & Mali", slug: "hukuki", description: "Hukuki ve mali konular", order: 6 },
];

// 40 Board
const boards = [
  { id: "b1", catId: "c1", name: "Duyurular & Haberler", slug: "duyurular", description: "Resmi duyurular ve sektör haberleri", order: 1 },
  { id: "b2", catId: "c1", name: "Forum Kuralları", slug: "kurallar", description: "Topluluk kuralları", order: 2 },
  { id: "b3", catId: "c1", name: "Öneriler & Şikayetler", slug: "oneriler", description: "Geri bildirim", order: 3 },
  { id: "b5", catId: "c2", name: "Trendyol Satıcı Paneli", slug: "trendyol-panel", description: "Trendyol satıcı işlemleri", order: 1 },
  { id: "b6", catId: "c2", name: "Trendyol Fiyatlandırma", slug: "trendyol-fiyat", description: "Fiyat stratejileri", order: 2 },
  { id: "b7", catId: "c2", name: "Amazon FBA Türkiye", slug: "amazon-fba-tr", description: "Amazon FBA operasyonları", order: 3 },
  { id: "b8", catId: "c2", name: "Amazon Global", slug: "amazon-global", description: "Global pazarlama", order: 4 },
  { id: "b9", catId: "c2", name: "Hepsiburada Pazaryeri", slug: "hepsiburada-pazar", description: "Hepsiburada satıcı işlemleri", order: 5 },
  { id: "b11", catId: "c2", name: "Shopify Mağaza", slug: "shopify-magaza", description: "Shopify mağaza yönetimi", order: 6 },
  { id: "b17", catId: "c3", name: "Fiyatlandırma Stratejileri", slug: "fiyat-strateji", description: "Fiyat optimizasyonu", order: 1 },
  { id: "b19", catId: "c3", name: "Stok Yönetimi", slug: "stok-yonetim", description: "Envanter yönetimi", order: 2 },
  { id: "b20", catId: "c3", name: "Tedarik Zinciri", slug: "tedarik-zincir", description: "Tedarikçi yönetimi", order: 3 },
  { id: "b25", catId: "c4", name: "Google Ads", slug: "google-ads", description: "Google reklamları", order: 1 },
  { id: "b26", catId: "c4", name: "Meta Ads", slug: "meta-ads", description: "Facebook & Instagram", order: 2 },
  { id: "b27", catId: "c4", name: "TikTok Shop", slug: "tiktok-shop", description: "TikTok e-ticaret", order: 3 },
  { id: "b30", catId: "c4", name: "SEO & İçerik", slug: "seo-icerik", description: "SEO stratejileri", order: 4 },
  { id: "b33", catId: "c5", name: "API & Entegrasyon", slug: "api-entegrasyon", description: "Teknik entegrasyonlar", order: 1 },
  { id: "b34", catId: "c5", name: "E-Ticaret Yazılımları", slug: "eticaret-yazilim", description: "Yazılım karşılaştırmaları", order: 2 },
  { id: "b38", catId: "c6", name: "Vergi & Muhasebe", slug: "vergi-muhasebe", description: "Vergi mevzuatı", order: 1 },
  { id: "b39", catId: "c6", name: "KVKK & GDPR", slug: "kvkk-gdpr", description: "Veri koruma", order: 2 },
];

// 100 Konu Başlığı
const topicTemplates = [
  { title: "Trendyol'da 2024 Komisyon Oranları Güncellemesi", board: "b6", replies: 45, views: 2345 },
  { title: "Amazon FBA Türkiye'ye Nasıl Başlanır?", board: "b7", replies: 67, views: 4567 },
  { title: "Hepsiburada'da Mağaza Puanı Nasıl Yükseltilir?", board: "b9", replies: 34, views: 1234 },
  { title: "Shopify'da Abandoned Cart Recovery Kurulumu", board: "b11", replies: 23, views: 890 },
  { title: "Dinamik Fiyatlandırma Algoritması Önerileri", board: "b17", replies: 56, views: 3456 },
  { title: "Google Ads Performance Max Kampanyaları", board: "b25", replies: 78, views: 5678 },
  { title: "Trendyol Express vs Hepsijet Karşılaştırması", board: "b5", replies: 89, views: 6789 },
  { title: "Amazon'da Private Label Ürün Seçimi", board: "b8", replies: 45, views: 2345 },
  { title: "E-Ticarette KVKK Uyumlu Veri Yönetimi", board: "b39", replies: 12, views: 567 },
  { title: "Stok Yönetiminde ABC Analizi Kullanımı", board: "b19", replies: 23, views: 890 },
  { title: "TikTok Shop'da Viral Ürün Satışı", board: "b27", replies: 67, views: 4567 },
  { title: "E-Ticaret Sitesi Hız Optimizasyonu", board: "b34", replies: 56, views: 3456 },
  { title: "Trendyol'da Kampanya Döneminde Satış Artırma", board: "b5", replies: 78, views: 5678 },
  { title: "Amazon PPC Reklamlarında ACoS Optimizasyonu", board: "b8", replies: 89, views: 6789 },
  { title: "Hepsiburada'da Müşteri Yorumları Yönetimi", board: "b9", replies: 45, views: 2345 },
  { title: "Rakip Fiyat Takibi için Otomasyon Araçları", board: "b17", replies: 56, views: 3456 },
  { title: "E-Ticarette XML Entegrasyonu Hataları", board: "b33", replies: 67, views: 4567 },
  { title: "Facebook Ads Lookalike Audience Oluşturma", board: "b26", replies: 45, views: 2345 },
  { title: "E-Ticaret Sitesi SSL ve Güvenlik", board: "b1", replies: 23, views: 890 },
  { title: "Tedarikçi ile Toplu Fiyat Pazarlığı", board: "b20", replies: 34, views: 1234 },
  { title: "Email Marketing'de A/B Test Deneyimleri", board: "b1", replies: 56, views: 3456 },
  { title: "Trendyol'da İade ve Değişim Politikası", board: "b5", replies: 78, views: 5678 },
  { title: "Amazon'da Buy Box Kazanma Stratejileri", board: "b8", replies: 89, views: 6789 },
  { title: "Hepsiburada'da SEO Optimizasyonu", board: "b9", replies: 45, views: 2345 },
  { title: "Shopify'da Blog ile Organik Trafik", board: "b11", replies: 34, views: 1234 },
  { title: "E-Ticarette Kargo Maliyetleri", board: "b20", replies: 56, views: 3456 },
  { title: "Google Shopping Feed Optimizasyonu", board: "b25", replies: 67, views: 4567 },
  { title: "Sosyal Medya Takviminde İçerik Planlaması", board: "b1", replies: 45, views: 2345 },
  { title: "E-Ticaret Vergi Mükellefiyeti ve E-Fatura", board: "b38", replies: 78, views: 5678 },
  { title: "Trendyol'da Mağaza Puanı Düşüşü Nedenleri", board: "b5", replies: 89, views: 6789 },
  { title: "Amazon FBA Depo Ücretleri 2024", board: "b7", replies: 45, views: 2345 },
  { title: "Hepsiburada Satıcı Paneli Güncellemeleri", board: "b9", replies: 34, views: 1234 },
  { title: "Shopify App Store'da En İyi Uygulamalar", board: "b11", replies: 56, views: 3456 },
  { title: "Psikolojik Fiyat Teknikleri", board: "b17", replies: 67, views: 4567 },
  { title: "Dead Stock Yönetimi", board: "b19", replies: 45, views: 2345 },
  { title: "Meta Ads Retargeting Pixel Kurulumu", board: "b26", replies: 34, views: 1234 },
  { title: "Influencer Marketing Mikro vs Makro", board: "b1", replies: 56, views: 3456 },
  { title: "E-Ticaret Sitesi Mobil Optimizasyonu", board: "b34", replies: 78, views: 5678 },
  { title: "API Rate Limit ve Throttling", board: "b33", replies: 89, views: 6789 },
  { title: "Email Spam Skoru Optimizasyonu", board: "b1", replies: 45, views: 2345 },
  { title: "Trendyol'da Ürün Listeleme SEO'su", board: "b5", replies: 34, views: 1234 },
  { title: "Amazon A+ Content ve Marka Hikayesi", board: "b8", replies: 56, views: 3456 },
  { title: "Hepsiburada Kampanya Başvuru Süreci", board: "b9", replies: 67, views: 4567 },
  { title: "Shopify Wholesale/B2B Satış", board: "b11", replies: 45, views: 2345 },
  { title: "Web Scraping Etik ve Hukuki", board: "b17", replies: 34, views: 1234 },
  { title: "Tedarikçi Sözleşmeleri", board: "b20", replies: 56, views: 3456 },
  { title: "Müşteri Yaşam Boyu Değeri (CLV)", board: "b1", replies: 78, views: 5678 },
  { title: "Kampanya Döneminde Stok Yönetimi", board: "b19", replies: 89, views: 6789 },
  { title: "E-Ticaret Sitesi DDoS Koruma", board: "b1", replies: 45, views: 2345 },
  { title: "Ödeme Gateway Karşılaştırması", board: "b1", replies: 34, views: 1234 },
  { title: "E-İhracat Gümrük Vergisi", board: "b38", replies: 56, views: 3456 },
  { title: "TikTok Shop Live Streaming", board: "b27", replies: 78, views: 5678 },
  { title: "Sosyal Medya Kriz Yönetimi", board: "b1", replies: 89, views: 6789 },
  { title: "Schema Markup ve Rich Snippets", board: "b30", replies: 45, views: 2345 },
  { title: "Affiliate Komisyon Oranları", board: "b1", replies: 34, views: 1234 },
  { title: "Trendyol Hesap Askıya Alma", board: "b5", replies: 56, views: 3456 },
  { title: "Amazon Hijacker Sorunu", board: "b8", replies: 67, views: 4567 },
  { title: "Hepsiburada Müşteri Hizmetleri SLA", board: "b9", replies: 45, views: 2345 },
  { title: "Shopify Subscription Model", board: "b11", replies: 34, views: 1234 },
  { title: "Bundle ve Cross-sell", board: "b17", replies: 56, views: 3456 },
  { title: "Demand Forecasting", board: "b19", replies: 78, views: 5678 },
  { title: "Google Ads Performance Max", board: "b25", replies: 89, views: 6789 },
  { title: "Meta Advantage+ Shopping", board: "b26", replies: 45, views: 2345 },
  { title: "Influencer Sözleşme ve Fatura", board: "b1", replies: 34, views: 1234 },
  { title: "CDN ve Image Optimization", board: "b34", replies: 56, views: 3456 },
  { title: "API Hata Yönetimi", board: "b33", replies: 67, views: 4567 },
  { title: "Email Segmentasyon", board: "b1", replies: 45, views: 2345 },
  { title: "Trendyol Yeni Ürün Lansmanı", board: "b5", replies: 34, views: 1234 },
  { title: "Amazon Vine Programı", board: "b8", replies: 56, views: 3456 },
  { title: "Hepsiburada Mağaza Tasarımı", board: "b9", replies: 78, views: 5678 },
  { title: "Shopify POS Sistemi", board: "b11", replies: 89, views: 6789 },
  { title: "Fiyat Eşleme Botları", board: "b17", replies: 45, views: 2345 },
  { title: "Tedarikçi Değerlendirme", board: "b20", replies: 34, views: 1234 },
  { title: "Chatbot ve AI Müşteri Hizmetleri", board: "b1", replies: 56, views: 3456 },
  { title: "Kampanya Sonrası Stok Değerlendirme", board: "b19", replies: 78, views: 5678 },
  { title: "Cookie ve Çerez Politikası", board: "b39", replies: 89, views: 6789 },
  { title: "Fraud Detection ve 3DS", board: "b1", replies: 45, views: 2345 },
  { title: "E-İhracat ING Entegrasyonu", board: "b20", replies: 34, views: 1234 },
  { title: "Vergi Tevkifatı ve Özel Matrah", board: "b38", replies: 56, views: 3456 },
  { title: "Yeni Başlayanlar İçin Rehber 2024", board: "b1", replies: 123, views: 8901 },
  { title: "E-Ticaret Kurulum Maliyetleri", board: "b1", replies: 89, views: 5678 },
  { title: "Platform Karşılaştırması", board: "b34", replies: 67, views: 4567 },
  { title: "Başarısız Olmanın Nedenleri", board: "b1", replies: 45, views: 3456 },
  { title: "İlk 1000 Müşteri Stratejileri", board: "b1", replies: 78, views: 5678 },
  { title: "Ödeme Opsiyonları ve Güven", board: "b1", replies: 56, views: 4567 },
];

async function main() {
  console.log('🌱 Forum seed data oluşturuluyor...');

  // Kategorileri oluştur
  console.log('📁 Kategoriler oluşturuluyor...');
  for (const cat of categories) {
    await prisma.forumCategory.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        order: cat.order,
        isActive: true,
      },
    });
  }

  // Board'ları oluştur
  console.log('📋 Boardlar oluşturuluyor...');
  for (const board of boards) {
    await prisma.forumBoard.upsert({
      where: { id: board.id },
      update: {},
      create: {
        id: board.id,
        name: board.name,
        slug: board.slug,
        description: board.description,
        categoryId: board.catId,
        order: board.order,
        type: 'FORUM',
        isActive: true,
      },
    });
  }

  // Kullanıcı profillerini oluştur
  console.log('👥 Kullanıcı profilleri oluşturuluyor...');
  for (const user of users.slice(0, 10)) { // İlk 10 kullanıcı
    await prisma.forumUserProfile.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        userId: user.id, // Gerçek uygulamada bu bir User.id olmalı
        displayName: user.name,
        customTitle: user.level,
        isStaff: user.isStaff || false,
        reputation: Math.floor(Math.random() * 1000),
        postCount: Math.floor(Math.random() * 500),
      },
    });
  }

  // Konuları oluştur
  console.log('💬 Konular oluşturuluyor...');
  for (let i = 0; i < topicTemplates.length; i++) {
    const t = topicTemplates[i];
    const authorId = users[i % users.length].id;
    const boardId = boards.find(b => b.id === t.board)?.id || boards[0].id;
    
    await prisma.forumTopic.upsert({
      where: { id: `topic-${i}` },
      update: {},
      create: {
        id: `topic-${i}`,
        title: t.title,
        slug: t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 60),
        boardId: boardId,
        authorId: authorId,
        status: 'OPEN',
        type: i < 10 ? 'STICKY' : 'NORMAL', // İlk 10 sabit
        viewCount: t.views,
        replyCount: t.replies,
      },
    });
  }

  console.log('✅ Forum seed data başarıyla oluşturuldu!');
  console.log(`📊 ${categories.length} kategori, ${boards.length} board, ${topicTemplates.length} konu`);
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
