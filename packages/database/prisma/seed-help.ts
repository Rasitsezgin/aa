import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

const HELP_CENTER_ID = 'help-center-main';

const sections = [
  { id: 'help-sec-baslangic', slug: 'baslangic', name: 'Başlangıç', description: 'İlk kurulum ve hesap ayarları', order: 1 },
  { id: 'help-sec-entegrasyon', slug: 'entegrasyonlar', name: 'Entegrasyonlar', description: 'Pazaryeri bağlantıları', order: 2 },
  { id: 'help-sec-operasyon', slug: 'operasyon', name: 'Operasyon', description: 'Stok, sipariş ve fiyat yönetimi', order: 3 },
];

const articles = [
  {
    slug: 'pazaryonetimi-ilk-kurulum',
    sectionId: 'help-sec-baslangic',
    title: 'Pazaryonetimi İlk Kurulum Rehberi',
    summary: 'Hesap oluşturma, mağaza ekleme ve ilk senkronizasyon adımları.',
    content: `## Hesap Oluşturma\n\n1. pazaryonetimi.com/signup adresinden ücretsiz hesap açın.\n2. E-posta doğrulamasını tamamlayın.\n3. İşletme bilgilerinizi girin.\n\n## İlk Mağaza Bağlantısı\n\nDashboard > Entegrasyonlar menüsünden pazaryerinizi seçin ve API bilgilerinizi girin.\n\n## İlk Senkronizasyon\n\nBağlantı sonrası ürün ve stok verileriniz otomatik çekilir. İlk senkron 5-15 dakika sürebilir.`,
    keywords: ['kurulum', 'başlangıç', 'hesap'],
    isFeatured: true,
  },
  {
    slug: 'trendyol-entegrasyonu-nasil-yapilir',
    sectionId: 'help-sec-entegrasyon',
    title: 'Trendyol Entegrasyonu Nasıl Yapılır?',
    summary: 'Trendyol satıcı paneli API bilgileri ile Pazaryonetimi bağlantısı.',
    content: `## Gerekli Bilgiler\n\n- Satıcı ID\n- API Key\n- API Secret\n\n## Adımlar\n\n1. Trendyol Satıcı Paneli > Entegrasyon Bilgileri bölümüne gidin.\n2. Yeni API anahtarı oluşturun.\n3. Pazaryonetimi dashboard'da Trendyol entegrasyonunu seçin.\n4. Bilgileri kaydedin ve bağlantıyı test edin.\n\n## Sık Sorunlar\n\nAPI anahtarı hatalıysa entegrasyon "bağlantı başarısız" döner. Anahtarın aktif olduğundan emin olun.`,
    keywords: ['trendyol', 'entegrasyon', 'api'],
    isFeatured: true,
  },
  {
    slug: 'hepsiburada-api-baglantisi',
    sectionId: 'help-sec-entegrasyon',
    title: 'Hepsiburada API Bağlantısı',
    summary: 'Hepsiburada merchant API ile ürün ve sipariş senkronizasyonu.',
    content: `## Hepsiburada Merchant API\n\nHepsiburada satıcı panelinden Merchant ID ve servis anahtarınızı alın.\n\n## Kurulum\n\n1. Dashboard > Entegrasyonlar > Hepsiburada\n2. Merchant bilgilerini girin\n3. Ürün eşleştirmesini tamamlayın\n\nSiparişler her 5 dakikada otomatik çekilir.`,
    keywords: ['hepsiburada', 'api', 'merchant'],
    isPinned: true,
  },
  {
    slug: 'amazon-turkiye-baglantisi',
    sectionId: 'help-sec-entegrasyon',
    title: 'Amazon Türkiye Satıcı Hesabı Bağlantısı',
    summary: 'Amazon SP-API ile Türkiye mağazanızı bağlayın.',
    content: `## SP-API Gereksinimleri\n\nAmazon Seller Central'da Professional satıcı hesabı ve SP-API erişimi gerekir.\n\n## Bağlantı Adımları\n\n1. Developer uygulaması oluşturun veya mevcut uygulamayı kullanın.\n2. LWA kimlik bilgilerini Pazaryonetimi'ne girin.\n3. Mağaza yetkilendirmesini tamamlayın.`,
    keywords: ['amazon', 'sp-api', 'türkiye'],
  },
  {
    slug: 'coklu-kanal-stok-senkronizasyonu',
    sectionId: 'help-sec-operasyon',
    title: 'Çoklu Kanal Stok Senkronizasyonu',
    summary: 'Birden fazla pazaryerinde stokların otomatik güncellenmesi.',
    content: `## Nasıl Çalışır?\n\nAna stok kaynağınız (ERP, Shopify veya Pazaryonetimi deposu) değiştiğinde tüm bağlı kanallara stok push edilir.\n\n## Ayarlar\n\n- Stok eşiği: Kritik stok altında ürünü otomatik pasife al\n- Rezerv stok: Her kanal için ayrı rezerv tanımlayın\n- Senkron sıklığı: Gerçek zamanlı veya 5 dk aralık`,
    keywords: ['stok', 'senkronizasyon', 'çoklu kanal'],
    isFeatured: true,
  },
  {
    slug: 'siparis-yonetimi-ve-kargo',
    sectionId: 'help-sec-operasyon',
    title: 'Sipariş Yönetimi ve Kargo Entegrasyonu',
    summary: 'Sipariş akışı, kargo etiketi ve takip numarası gönderimi.',
    content: `## Sipariş Akışı\n\nYeni siparişler dashboard'da anlık görünür. Onay, hazırlama ve kargolama aşamalarını tek panelden yönetin.\n\n## Kargo\n\nDesteklenen kargo firmalarına otomatik etiket oluşturma ve pazaryerine takip no bildirimi yapılır.`,
    keywords: ['sipariş', 'kargo', 'lojistik'],
  },
  {
    slug: 'fiyatlandirma-kurallari',
    sectionId: 'help-sec-operasyon',
    title: 'Dinamik Fiyatlandırma Kuralları',
    summary: 'Komisyon, kargo ve marj hesabıyla otomatik fiyat güncelleme.',
    content: `## Fiyat Kuralı Oluşturma\n\n1. Ürün grubu veya kategori seçin\n2. Maliyet + marj + komisyon formülünü tanımlayın\n3. Kanal bazlı fiyat farkı ekleyin\n\nKurallar saatlik veya günlük çalışacak şekilde zamanlanabilir.`,
    keywords: ['fiyat', 'marj', 'komisyon'],
  },
  {
    slug: 'iki-faktorlu-dogrulama',
    sectionId: 'help-sec-baslangic',
    title: 'İki Faktörlü Doğrulama (2FA)',
    summary: 'Hesap güvenliği için 2FA kurulumu.',
    content: `## 2FA Etkinleştirme\n\nAyarlar > Güvenlik > İki Faktörlü Doğrulama bölümünden authenticator uygulaması ile QR kod tarayın.\n\nYedek kodları güvenli bir yerde saklayın.`,
    keywords: ['güvenlik', '2fa', 'hesap'],
  },
];

function toHtml(markdown: string): string {
  return markdown
    .split('\n\n')
    .map((block) => {
      if (block.startsWith('## ')) {
        return `<h2>${block.slice(3)}</h2>`;
      }
      if (block.match(/^\d+\./m)) {
        const items = block.split('\n').filter((l) => /^\d+\./.test(l));
        return `<ol>${items.map((i) => `<li>${i.replace(/^\d+\.\s*/, '')}</li>`).join('')}</ol>`;
      }
      if (block.startsWith('- ')) {
        const items = block.split('\n').filter((l) => l.startsWith('- '));
        return `<ul>${items.map((i) => `<li>${i.slice(2)}</li>`).join('')}</ul>`;
      }
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');
}

async function main() {
  console.log('📚 Yardım merkezi seed başlıyor...\n');

  await prisma.forumHelpCenter.upsert({
    where: { slug: 'destek' },
    update: { name: 'Pazaryonetimi Destek', description: 'Resmi yardım ve dokümantasyon merkezi' },
    create: {
      id: HELP_CENTER_ID,
      name: 'Pazaryonetimi Destek',
      slug: 'destek',
      description: 'Resmi yardım ve dokümantasyon merkezi',
      isPublic: true,
      allowFeedback: true,
    },
  });

  for (const section of sections) {
    await prisma.forumHelpSection.upsert({
      where: { helpCenterId_slug: { helpCenterId: HELP_CENTER_ID, slug: section.slug } },
      update: {
        name: section.name,
        description: section.description,
        displayOrder: section.order,
        isActive: true,
      },
      create: {
        id: section.id,
        helpCenterId: HELP_CENTER_ID,
        name: section.name,
        slug: section.slug,
        description: section.description,
        displayOrder: section.order,
        isActive: true,
      },
    });
  }

  const now = new Date();
  for (const article of articles) {
    const html = toHtml(article.content);
    await prisma.forumHelpArticle.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        summary: article.summary,
        content: article.content,
        contentHtml: html,
        status: 'PUBLISHED',
        isFeatured: article.isFeatured ?? false,
        isPinned: article.isPinned ?? false,
        keywords: article.keywords,
        publishedAt: now,
        metaTitle: `${article.title} | Pazaryonetimi Destek`,
        metaDescription: article.summary,
      },
      create: {
        sectionId: article.sectionId,
        slug: article.slug,
        title: article.title,
        summary: article.summary,
        content: article.content,
        contentHtml: html,
        status: 'PUBLISHED',
        authorId: 'system',
        isFeatured: article.isFeatured ?? false,
        isPinned: article.isPinned ?? false,
        keywords: article.keywords,
        publishedAt: now,
        metaTitle: `${article.title} | Pazaryonetimi Destek`,
        metaDescription: article.summary,
      },
    });
  }

  console.log(`✅ ${sections.length} bölüm, ${articles.length} makale oluşturuldu`);
}

main()
  .catch((e) => {
    console.error('❌ Help seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
