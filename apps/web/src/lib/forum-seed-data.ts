// Forum Static In-Memory Fallback Dataset (Auto-generated from seed-forum.ts)
// Ensures 100% rich topic, post, board and user rendering even when DB is unseeded.

export interface ForumUserSeed {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  customTitle: string;
  groupId: string;
  isStaff?: boolean;
  isModerator?: boolean;
  reputation: number;
  postCount: number;
  topicCount: number;
  level: number;
  levelTitle: string;
  avatarUrl: string;
  signature?: string;
  about?: string;
}

export interface ForumCategorySeed {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  order: number;
}

export interface ForumBoardSeed {
  id: string;
  catId: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  order: number;
}

export interface ForumPostSeed {
  authorId: string;
  content: string;
  isBestAnswer?: boolean;
}

export interface ForumTopicSeed {
  id: string;
  title: string;
  slug: string;
  boardId: string;
  authorId: string;
  type: 'NORMAL' | 'STICKY' | 'ANNOUNCEMENT' | 'SOLVED' | 'POLL';
  status: 'OPEN' | 'CLOSED' | 'SOLVED';
  viewCount: number;
  tags: { name: string; slug: string; color?: string }[];
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
  };
  posts: ForumPostSeed[];
}

const userGroups = [
  { id: 'grp-admin', name: 'Yönetici', title: 'Sistem Yöneticisi', color: '#ef4444', icon: 'Shield', isStaff: true, isModerator: true, order: 1 },
  { id: 'grp-mod', name: 'Moderatör', title: 'Topluluk Moderatörü', color: '#3b82f6', icon: 'ShieldCheck', isStaff: true, isModerator: true, order: 2 },
  { id: 'grp-elite', name: 'Platin Satıcı', title: 'Platin Satıcı', color: '#f59e0b', icon: 'Crown', isStaff: false, isModerator: false, order: 3 },
  { id: 'grp-veteran', name: 'Kıdemli Satıcı', title: 'Kıdemli Satıcı', color: '#8b5cf6', icon: 'Award', isStaff: false, isModerator: false, order: 4 },
  { id: 'grp-member', name: 'Satıcı', title: 'Onaylı Satıcı', color: '#10b981', icon: 'UserCheck', isStaff: false, isModerator: false, order: 5 },
];

// ============================================================================
// 2. 24 GERÇEKÇİ KULLANICI PROFİLİ (FARKLI KATEGORİ VE UZMANLIKLAR)
// ============================================================================
const forumUsers = [
  {
    id: 'u_admin',
    email: 'admin@pazaryonetimi.com',
    firstName: 'Pazaryonetimi',
    lastName: 'Yönetim',
    displayName: 'Pazaryonetimi Yönetim',
    customTitle: 'Resmi Destek & Yönetim',
    groupId: 'grp-admin',
    isStaff: true,
    reputation: 5200,
    postCount: 1420,
    topicCount: 45,
    level: 10,
    levelTitle: 'E-Ticaret Gurusu',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    signature: '🚀 Pazaryonetimi.com Resmi Ekibi | Tüm Pazaryerleri Tek Panelde',
    about: 'Pazaryonetimi.com platform yöneticisi ve baş mimarı.',
  },
  {
    id: 'u_mod_ahmet',
    email: 'ahmet.yilmaz@pazaryonetimi.com',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    displayName: 'Ahmet Yılmaz',
    customTitle: 'Kıdemli Moderatör',
    groupId: 'grp-mod',
    isStaff: true,
    isModerator: true,
    reputation: 3840,
    postCount: 980,
    topicCount: 28,
    level: 9,
    levelTitle: 'Elmas Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    signature: '🛡️ Topluluk kurallarına uyalım | 8 yıllık e-ticaret danışmanı',
    about: 'Pazaryeri entegrasyonları ve operasyon süreçlerinde 8 yıllık tecrübe.',
  },
  {
    id: 'u_trendyol_pro',
    email: 'burak.ozkan@sellerpro.com',
    firstName: 'Burak',
    lastName: 'Özkan',
    displayName: 'Burak Özkan (Trendyol Pro)',
    customTitle: 'Trendyol Platin Satıcı',
    groupId: 'grp-elite',
    reputation: 2950,
    postCount: 710,
    topicCount: 22,
    level: 8,
    levelTitle: 'Platin Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    signature: '📦 Ayda 15.000+ kargo | Moda & Tekstil Kategorisi Lideri',
    about: 'Trendyol, Hepsiburada ve Amazon TR üzerinde ayda 15.000 üzerinde sipariş yönetiyorum.',
  },
  {
    id: 'u_amazon_fba_lead',
    email: 'can.gumus@fbamaster.com',
    firstName: 'Can',
    lastName: 'Gümüş',
    displayName: 'Can Gümüş (FBA Lead)',
    customTitle: 'Amazon US & EU Lead',
    groupId: 'grp-elite',
    reputation: 3410,
    postCount: 840,
    topicCount: 31,
    level: 9,
    levelTitle: 'Elmas Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    signature: '🌍 Amazon ABD & Almanya Private Label Uzmanı | 7 Figure Seller',
    about: 'Amazon FBA, Brand Registry, PPC ve Amerika şirket kurulum danışmanı.',
  },
  {
    id: 'u_mali_musavir',
    email: 'kemal.tekin@vergidanismani.com',
    firstName: 'Kemal',
    lastName: 'Tekin',
    displayName: 'Kemal Tekin (SMMM)',
    customTitle: 'E-Ticaret Mali Müşaviri',
    groupId: 'grp-veteran',
    reputation: 4120,
    postCount: 960,
    topicCount: 19,
    level: 9,
    levelTitle: 'Elmas Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    signature: '💼 E-Ticaret Vergi Hukuku, Genç Girişimci & ETGB KDV İadesi Uzmanı',
    about: 'E-ticaret şirketleri için vergi planlaması, mikro ihracat ve e-fatura süreçleri.',
  },
  {
    id: 'u_hepsiburada_uzman',
    email: 'selin.aydin@hepsipartner.com',
    firstName: 'Selin',
    lastName: 'Aydın',
    displayName: 'Selin Aydın',
    customTitle: 'Hepsiburada Danışmanı',
    groupId: 'grp-veteran',
    reputation: 2240,
    postCount: 460,
    topicCount: 14,
    level: 7,
    levelTitle: 'Altın Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    signature: '⭐ Hepsiburada HepsiPartner & HepsiJet Entegrasyon Mentoru',
    about: 'Ev & Mutfak kategorisinde Hepsiburada ve Çiçeksepeti pazar danışmanlığı.',
  },
  {
    id: 'u_dev_emre',
    email: 'emre.yildiz@devhub.com',
    firstName: 'Emre',
    lastName: 'Yıldız',
    displayName: 'Emre Yıldız (API & Entegrasyon)',
    customTitle: 'Yazılım & ERP Mimarı',
    groupId: 'grp-veteran',
    reputation: 2780,
    postCount: 590,
    topicCount: 17,
    level: 8,
    levelTitle: 'Platin Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    signature: '⚡ REST API, Webhook, Logo / Mikro / Netsis Köprüleri',
    about: 'Pazaryonetimi API, Python, Node.js ve ERP entegrasyon geliştiricisi.',
  },
  {
    id: 'u_seo_elif',
    email: 'elif.demir@seomaster.com',
    firstName: 'Elif',
    lastName: 'Demir',
    displayName: 'Elif Demir (E-Ticaret SEO)',
    customTitle: 'SEO & İçerik Stratejisti',
    groupId: 'grp-veteran',
    reputation: 2100,
    postCount: 430,
    topicCount: 15,
    level: 7,
    levelTitle: 'Altın Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    signature: '🔍 Pazaryeri İçi Arama Motoru SEO & Dönüşüm Oranı Optimizasyonu (CRO)',
    about: 'Ürün başlıkları, attribute optimizasyonu ve Google Ads feed uzmanı.',
  },
  {
    id: 'u_lojistik_mert',
    email: 'mert.karaca@lojistikpro.com',
    firstName: 'Mert',
    lastName: 'Karaca',
    displayName: 'Mert Karaca (Lojistik)',
    customTitle: 'Depo & Lojistik Yöneticisi',
    groupId: 'grp-veteran',
    reputation: 2450,
    postCount: 520,
    topicCount: 16,
    level: 7,
    levelTitle: 'Altın Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    signature: '🚚 3 Depo, 40.000 SKU Yönetimi | Kargo Desi & Hasar Tutanak Çözümleri',
    about: 'Envanter yönetimi, kargo barem anlaşmaları ve depo süreçleri uzmanı.',
  },
  {
    id: 'u_etsy_zeynep',
    email: 'zeynep.kaya@handcrafted.com',
    firstName: 'Zeynep',
    lastName: 'Kaya',
    displayName: 'Zeynep Kaya (Etsy Star)',
    customTitle: 'Etsy Star Seller',
    groupId: 'grp-member',
    reputation: 1890,
    postCount: 350,
    topicCount: 12,
    level: 6,
    levelTitle: 'Gümüş Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    signature: '✨ El Yapımı Ahşap & Deri | 4 Yıldır Etsy Global Satıcısı',
    about: 'Etsy SEO, kargo entegrasyonu ve yurtdışı müşteri ilişkileri.',
  },
  {
    id: 'u_ads_serkan',
    email: 'serkan.aktas@growthads.com',
    firstName: 'Serkan',
    lastName: 'Aktaş',
    displayName: 'Serkan Aktaş (Ads Uzmanı)',
    customTitle: 'Performance Marketing Lead',
    groupId: 'grp-veteran',
    reputation: 2590,
    postCount: 610,
    topicCount: 18,
    level: 8,
    levelTitle: 'Platin Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    signature: '🎯 Google PMax & Meta Katalog Reklamları | Aylık 2M+ TL Bütçe Yönetimi',
    about: 'Pazaryeri ve D2C markaları için performans pazarlaması ve ROAS artırma.',
  },
  {
    id: 'u_hukuk_avukat',
    email: 'melike.sen@ticarethukuku.com',
    firstName: 'Melike',
    lastName: 'Şen',
    displayName: 'Av. Melike Şen',
    customTitle: 'E-Ticaret Hukuk Müşaviri',
    groupId: 'grp-veteran',
    reputation: 3350,
    postCount: 670,
    topicCount: 15,
    level: 8,
    levelTitle: 'Platin Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    signature: '⚖️ Marka Tescili, Telif İhlalleri & Tüketici Hakem Heyeti Danışmanlığı',
    about: 'E-ticaret hukuku, mesafeli satış sözleşmeleri ve marka koruma davaları.',
  },
  {
    id: 'u_dropship_baris',
    email: 'baris.celik@xmldeposu.com',
    firstName: 'Barış',
    lastName: 'Çelik',
    displayName: 'Barış Çelik (XML & Tedarik)',
    customTitle: 'Kıdemli Satıcı',
    groupId: 'grp-member',
    reputation: 1720,
    postCount: 380,
    topicCount: 11,
    level: 6,
    levelTitle: 'Gümüş Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    signature: '🔄 12 XML Kaynağı ile Çoklu Kanal Satışı | Otomasyon Tutkunu',
    about: 'XML entegrasyonları, toptan tedarik ve dropshipping stratejileri.',
  },
  {
    id: 'u_kobi_ayse',
    email: 'ayse.koc@evveyasam.com',
    firstName: 'Ayşe',
    lastName: 'Koç',
    displayName: 'Ayşe Koç',
    customTitle: 'KOBİ Mağaza Sahibi',
    groupId: 'grp-member',
    reputation: 1520,
    postCount: 290,
    topicCount: 9,
    level: 5,
    levelTitle: 'Bronz Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?w=150&auto=format&fit=crop&q=80',
    signature: '🏡 Ev, Yaşam & Dekorasyon Üreticisi | Kendi Markasıyla Büyüyen KOBİ',
    about: 'Bursa İnegöl merkezli ev tekstili üreticisi ve pazaryeri satıcısı.',
  },
  {
    id: 'u_tiktok_derya',
    email: 'derya.dogan@viralsales.com',
    firstName: 'Derya',
    lastName: 'Doğan',
    displayName: 'Derya Doğan (TikTok Commerce)',
    customTitle: 'Sosyal Ticaret Uzmanı',
    groupId: 'grp-member',
    reputation: 1980,
    postCount: 410,
    topicCount: 13,
    level: 6,
    levelTitle: 'Gümüş Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    signature: '📱 TikTok Shop, Canlı Yayın Satışları & Influencer Affiliate Ağı',
    about: 'Viral video üretimi, canlı yayın satışı ve sosyal ticaret kurguları.',
  },
  {
    id: 'u_yeni_satici_tolga',
    email: 'tolga.arslan@yenieticaret.com',
    firstName: 'Tolga',
    lastName: 'Arslan',
    displayName: 'Tolga Arslan',
    customTitle: 'Yeni Girişimci',
    groupId: 'grp-member',
    reputation: 340,
    postCount: 55,
    topicCount: 4,
    level: 2,
    levelTitle: 'Yeni Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
    signature: '🌱 İlk 100 siparişini yeni tamamlayan heyecanlı e-ticaret girişimcisi',
    about: 'Oto aksesuar ve telefon aksesuarları üzerine yeni mağaza açtım.',
  },
  {
    id: 'u_petshop_murat',
    email: 'murat.cetin@pethavuzu.com',
    firstName: 'Murat',
    lastName: 'Çetin',
    displayName: 'Murat Çetin (Petshop)',
    customTitle: 'Evcil Hayvan Kategorisi Lideri',
    groupId: 'grp-elite',
    reputation: 2650,
    postCount: 540,
    topicCount: 16,
    level: 8,
    levelTitle: 'Platin Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    signature: '🐾 Kedi & Köpek Maması, Aksesuar | Ayda 8.000+ Kargo',
    about: 'Petshop kategorisinde 6 yıldır pazaryerlerinde ve kendi web sitemizde satış yapıyoruz.',
  },
  {
    id: 'u_kozmetik_yasemin',
    email: 'yasemin.ersoy@dogalbakim.com',
    firstName: 'Yasemin',
    lastName: 'Ersoy',
    displayName: 'Yasemin Ersoy (Kozmetik)',
    customTitle: 'Kozmetik & Bakım Satıcısı',
    groupId: 'grp-veteran',
    reputation: 2380,
    postCount: 470,
    topicCount: 15,
    level: 7,
    levelTitle: 'Altın Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    signature: '🌿 ÜTS Kayıtlı Doğal Kozmetik & Cilt Bakım Ürünleri',
    about: 'Sağlık Bakanlığı ÜTS kayıtlı kozmetik üreticisi ve pazaryeri mağaza yöneticisi.',
  },
  {
    id: 'u_oto_hakan',
    email: 'hakan.bulut@otoyedekparca.com',
    firstName: 'Hakan',
    lastName: 'Bulut',
    displayName: 'Hakan Bulut (Oto Aksesuar)',
    customTitle: 'Otomotiv & Yedek Parça Lead',
    groupId: 'grp-elite',
    reputation: 3100,
    postCount: 720,
    topicCount: 20,
    level: 9,
    levelTitle: 'Elmas Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    signature: '🚗 25.000 Araç Uyumlu Yedek Parça & Oto Aksesuar Yönetimi',
    about: 'Oto yedek parça uyumluluk tabloları ve hızlı kargo operasyonları.',
  },
  {
    id: 'u_elektronik_volkan',
    email: 'volkan.simsek@techpazar.com',
    firstName: 'Volkan',
    lastName: 'Şimşek',
    displayName: 'Volkan Şimşek (Elektronik)',
    customTitle: 'Elektronik & Bilişim Satıcısı',
    groupId: 'grp-veteran',
    reputation: 2890,
    postCount: 630,
    topicCount: 18,
    level: 8,
    levelTitle: 'Platin Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    signature: '💻 Akıllı Cihazlar, Telefon Aksesuarları & Gaming Ekipmanları',
    about: 'Elektronik ürünlerde IMEI takibi, seri numaralı faturalandırma ve servis süreçleri.',
  },
  {
    id: 'u_annebebek_gizem',
    email: 'gizem.yurt@bebekdunyasi.com',
    firstName: 'Gizem',
    lastName: 'Yurt',
    displayName: 'Gizem Yurt (Anne & Bebek)',
    customTitle: 'Anne & Bebek Kategorisi Uzmanı',
    groupId: 'grp-member',
    reputation: 1670,
    postCount: 320,
    topicCount: 10,
    level: 6,
    levelTitle: 'Gümüş Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?w=150&auto=format&fit=crop&q=80',
    signature: '👶 Bebek Tekstili, Oyuncak & Güvenlik Ürünleri Üreticisi',
    about: 'Organik pamuk bebek giyim ve pazaryeri kampanya yönetimi.',
  },
  {
    id: 'u_taki_buse',
    email: 'buse.karahan@silverdesign.com',
    firstName: 'Buse',
    lastName: 'Karahan',
    displayName: 'Buse Karahan (Takı & Aksesuar)',
    customTitle: 'Gümüş & Takı Tasarımcısı',
    groupId: 'grp-member',
    reputation: 1780,
    postCount: 360,
    topicCount: 11,
    level: 6,
    levelTitle: 'Gümüş Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    signature: '💍 925 Ayar Gümüş & Özel Tasarım Takı | Trendyol & Etsy Satıcısı',
    about: 'Kişiselleştirilmiş takı, hediye kutulama ve yüksek dönüşümlü görsel çekimi.',
  },
  {
    id: 'u_ayakkabi_serdar',
    email: 'serdar.ozturk@deripabuclar.com',
    firstName: 'Serdar',
    lastName: 'Öztürk',
    displayName: 'Serdar Öztürk (Ayakkabı)',
    customTitle: 'Ayakkabı & Çanta İmalatçısı',
    groupId: 'grp-elite',
    reputation: 2790,
    postCount: 580,
    topicCount: 19,
    level: 8,
    levelTitle: 'Platin Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    signature: '👞 Hakiki Deri Ayakkabı & Çanta İmalatı | Gedikpaşa / İstanbul',
    about: 'Ayakkabı varyant yönetimi, kalıp uyarıları ve iade oranı düşürme stratejileri.',
  },
  {
    id: 'u_bahce_oguz',
    email: 'oguz.tan@hirdavatmarket.com',
    firstName: 'Oğuz',
    lastName: 'Tan',
    displayName: 'Oğuz Tan (Hırdavat & Bahçe)',
    customTitle: 'Hırdavat & Yapı Market Satıcısı',
    groupId: 'grp-veteran',
    reputation: 2150,
    postCount: 440,
    topicCount: 14,
    level: 7,
    levelTitle: 'Altın Satıcı',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    signature: '🔨 Bahçe Aletleri, Elektrikli El Aletleri & Ağır Desi Kargo Uzmanı',
    about: 'Büyük hacimli hırdavat ürünlerinde paletli kargo ve ambar lojistiği.',
  }
];

// ============================================================================
// 3. 7 ANA KATEGORİ
// ============================================================================
const categories = [
  { id: 'c1', name: 'Genel & Duyurular', slug: 'genel', description: 'Platform duyuruları, topluluk kuralları, rehberler ve genel tanışma alanı.', color: 'blue', order: 1 },
  { id: 'c2', name: 'Türkiye Pazaryerleri', slug: 'turkiye-pazaryerleri', description: 'Trendyol, Hepsiburada, Amazon TR, N11, Çiçeksepeti ve PttAVM satıcı operasyonları.', color: 'orange', order: 2 },
  { id: 'c3', name: 'Global Pazaryerleri & E-İhracat', slug: 'global-ve-e-ihracat', description: 'Amazon US/EU FBA, Etsy, eBay, Mikro İhracat (ETGB) ve yurtdışı pazarlama.', color: 'indigo', order: 3 },
  { id: 'c4', name: 'Operasyon, Fiyatlandırma & Stok', slug: 'operasyon-ve-stok', description: 'Dinamik repricer, çoklu depo yönetimi, kargo lojistiği, XML ve tedarik zinciri.', color: 'emerald', order: 4 },
  { id: 'c5', name: 'Dijital Pazarlama & Satış Artırma', slug: 'pazarlama-ve-seo', description: 'Google PMax, Meta katalog reklamları, TikTok Shop, influencer pazarlaması ve SEO.', color: 'purple', order: 5 },
  { id: 'c6', name: 'Teknik, Yazılım & Entegrasyonlar', slug: 'teknik-ve-yazilim', description: 'Pazaryonetimi REST API, Webhook, ERP muhasebe köprüleri ve AI otomasyonları.', color: 'cyan', order: 6 },
  { id: 'c7', name: 'Mali, Hukuki & Muhasebe', slug: 'mali-ve-hukuki', description: 'E-Ticaret vergi mevzuatı, e-Fatura, marka tescili, telif hakları ve KVKK süreçleri.', color: 'amber', order: 7 },
];

// ============================================================================
// 4. 24 FORUM BOARD (BÖLÜM)
// ============================================================================
const boards = [
  { id: 'b1', catId: 'c1', name: 'Duyurular & Güncellemeler', slug: 'duyurular', description: 'Pazaryonetimi resmi platform duyuruları ve e-ticaret sektör haberleri.', color: 'blue', order: 1 },
  { id: 'b2', catId: 'c1', name: 'Forum Kuralları & Rehberler', slug: 'kurallar', description: 'Topluluk kuralları, rütbe puanlama sistemi ve güvenli ticaret yönergeleri.', color: 'slate', order: 2 },
  { id: 'b3', catId: 'c1', name: 'Tanışma & Topluluk', slug: 'tanisma', description: 'Yeni katılan satıcıların tanışma alanı, mağaza hikayeleri ve networking.', color: 'teal', order: 3 },
  { id: 'b4', catId: 'c1', name: 'Öneriler & İstekler', slug: 'oneriler', description: 'Platform için yeni özellik talepleri, modül önerileri ve kullanıcı geri bildirimleri.', color: 'amber', order: 4 },
  { id: 'b5', catId: 'c2', name: 'Trendyol Satıcı Paneli & Buybox', slug: 'trendyol-panel', description: 'Trendyol Buybox algoritması, flaş indirimler, satıcı puanı ve listeleme ipuçları.', color: 'orange', order: 1 },
  { id: 'b6', catId: 'c2', name: 'Trendyol Komisyon & Fiyatlandırma', slug: 'trendyol-fiyat', description: 'Kategori komisyon oranları, barem ve ceza kuralları, kâr hesaplama.', color: 'orange', order: 2 },
  { id: 'b7', catId: 'c2', name: 'Hepsiburada & HepsiPartner', slug: 'hepsiburada-pazar', description: 'Hepsiburada mağaza yönetimi, HepsiJet kargo ve satıcı performans metrikleri.', color: 'orange', order: 3 },
  { id: 'b8', catId: 'c2', name: 'N11, Çiçeksepeti & PttAVM', slug: 'n11-ciceksepeti', description: 'N11 Pro Mağaza, Çiçeksepeti Pazaryeri, PttAVM ve Pazarama operasyonları.', color: 'red', order: 4 },
  { id: 'b9', catId: 'c3', name: 'Amazon Türkiye & SP-API', slug: 'amazon-fba-tr', description: 'Amazon TR FBA lojistik süreçleri, Buybox ve SP-API entegrasyon deneyimleri.', color: 'yellow', order: 1 },
  { id: 'b10', catId: 'c3', name: 'Amazon Global (US, EU, UK)', slug: 'amazon-global', description: 'Amerika ve Avrupa FBA, Brand Registry, PPC reklamları ve Private Label satış.', color: 'indigo', order: 2 },
  { id: 'b11', catId: 'c3', name: 'Etsy & Vintage / Handmade', slug: 'etsy-magaza', description: 'Etsy SEO, el yapımı ürün listeleme, uluslararası kargo ve suspend çözümleri.', color: 'orange', order: 3 },
  { id: 'b12', catId: 'c3', name: 'Mikro İhracat & ETGB Gümrük', slug: 'mikro-ihracat', description: 'ETGB ile hızlı mikro ihracat, KDV iadesi, navlun ve gümrük beyannameleri.', color: 'blue', order: 4 },
  { id: 'b13', catId: 'c4', name: 'Dinamik Fiyatlandırma & Repricer', slug: 'fiyat-strateji', description: 'Otomatik rakip fiyat takibi, minimum kâr korumalı dinamik fiyatlandırma.', color: 'emerald', order: 1 },
  { id: 'b14', catId: 'c4', name: 'Envanter & Çoklu Depo Yönetimi', slug: 'stok-yonetim', description: 'Çoklu depo senkronizasyonu, kritik stok uyarıları, varyant ve barkodlama.', color: 'green', order: 2 },
  { id: 'b15', catId: 'c4', name: 'Kargo, Lojistik & İade Yönetimi', slug: 'kargo-lojistik', description: 'Desi optimizasyonu, hasarlı iade tutanakları, kargo anlaşmaları ve SLA yönetimi.', color: 'blue', order: 3 },
  { id: 'b16', catId: 'c4', name: 'Tedarik Zinciri & XML Dropshipping', slug: 'tedarik-zincir', description: 'XML entegrasyonları, toptancılar, fason üretim ve tedarikçi anlaşmaları.', color: 'teal', order: 4 },
  { id: 'b17', catId: 'c5', name: 'Google Ads & Merchant Center', slug: 'google-ads', description: 'Google Alışveriş, Performance Max kampanyaları, Feed optimizasyonu ve ROAS artırma.', color: 'blue', order: 1 },
  { id: 'b18', catId: 'c5', name: 'Meta (Facebook & IG) Reklamları', slug: 'meta-ads', description: 'Dinamik ürün katalog reklamları, Dönüşümler API (CAPI) ve piksel kurulumları.', color: 'purple', order: 2 },
  { id: 'b19', catId: 'c5', name: 'TikTok Shop & Influencer Satışları', slug: 'tiktok-shop', description: 'TikTok Shop, canlı yayın satışı, viral içerik kurguları ve affiliate ortaklıkları.', color: 'pink', order: 3 },
  { id: 'b20', catId: 'c5', name: 'E-Ticaret SEO & Ürün Açıklamaları', slug: 'seo-icerik', description: 'Pazaryeri içi arama SEO’su, anahtar kelime yerleşimi ve zengin ürün açıklamaları.', color: 'violet', order: 4 },
  { id: 'b21', catId: 'c6', name: 'Pazaryonetimi REST API & Webhook', slug: 'api-entegrasyon', description: 'Geliştirici dökümantasyonu, Webhook entegrasyonları ve özel yazılım çözümleri.', color: 'cyan', order: 1 },
  { id: 'b22', catId: 'c6', name: 'ERP & Muhasebe Entegrasyonu', slug: 'erp-muhasebe', description: 'Logo, Mikro, Netsis, Paraşüt, BizimHesap otomatik sipariş ve fatura köprüleri.', color: 'sky', order: 2 },
  { id: 'b23', catId: 'c6', name: 'E-Ticaret Altyapıları & AI Araçları', slug: 'eticaret-yazilim', description: 'Shopify, WooCommerce, İkas karşılaştırmaları ve yapay zeka içerik araçları.', color: 'indigo', order: 3 },
  { id: 'b24', catId: 'c7', name: 'E-Ticaret Vergi, E-Fatura & KDV', slug: 'vergi-muhasebe', description: 'Genç Girişimci istisnası, e-Fatura/e-Arşiv, KDV tevkifatı ve stopaj rehberleri.', color: 'amber', order: 1 },
  { id: 'b25', catId: 'c7', name: 'KVKK, Marka Tescili & Tüketici Hakları', slug: 'kvkk-hukuk', description: 'TÜRKPATENT marka tescili, taklit ürün koruması ve Tüketici Hakem Heyeti süreçleri.', color: 'red', order: 2 },
];

// ============================================================================
// 5. 55+ KAPSAMLI FORUM KONUSU & DETAYLI TARTIŞMALAR
// ============================================================================
interface SeedPostInput {
  authorId: string;
  content: string;
  isBestAnswer?: boolean;
}

interface SeedTopicInput {
  id: string;
  title: string;
  slug: string;
  boardId: string;
  authorId: string;
  type: 'NORMAL' | 'STICKY' | 'ANNOUNCEMENT' | 'SOLVED' | 'POLL';
  status: 'OPEN' | 'CLOSED' | 'SOLVED';
  viewCount: number;
  tags: { name: string; slug: string; color?: string }[];
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
  };
  posts: SeedPostInput[];
}

const detailedTopics: SeedTopicInput[] = [
  // --- BÖLÜM 1: DUYURULAR (b1) ---
  {
    id: 'topic-1',
    title: 'Pazaryonetimi 2025 Yıllık E-Ticaret Trendleri ve Satıcı Başarı Raporu',
    slug: 'pazaryonetimi-2025-yillik-e-ticaret-trendleri-ve-satici-basari-raporu',
    boardId: 'b1',
    authorId: 'u_admin',
    type: 'STICKY',
    status: 'OPEN',
    viewCount: 14500,
    tags: [
      { name: 'trendler', slug: 'trendler', color: 'blue' },
      { name: '2025', slug: '2025', color: 'purple' },
      { name: 'rapor', slug: 'rapor', color: 'emerald' },
      { name: 'analiz', slug: 'analiz', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_admin',
        content: `### Türkiye ve Global Pazaryerleri 2025 Satıcı Trendleri Raporu

Pazaryonetimi platformundaki 10.000'den fazla aktif mağazanın anonim verileriyle hazırlanan yıllık büyüme raporu özeti:

#### Öne Çıkan Başlıklar:
* **En Çok Büyüyen Kategoriler:**
  1. Evcil Hayvan Ürünleri (+%115)
  2. Oto Bakım & Aksesuar (+%92)
  3. Ev & Mutfak Düzenleme (+%78)
  4. Doğal Kozmetik & Kişisel Bakım (+%65)
* **Otomasyonun Gücü:** Dinamik Repricer ve Çoklu Depo Entegrasyonu kullanan satıcılar, manuel yöneten satıcılara kıyasla **%42 daha yüksek kâr marjı** elde etti.
* **E-İhracatın Payı:** Mikro ihracat yapan mağazaların ortalama sipariş başı kârlılığı Türkiye içi satışlara kıyasla **3.2 kat** daha yüksek gerçekleşti.

Tüm satıcılarımıza bol kazançlı ve başarılı bir yıl dileriz!`,
      },
      {
        authorId: 'u_trendyol_pro',
        content: `Rapor için emeği geçenlere teşekkürler. Çok kanallı satış ve otomasyon gerçekten fark yaratıyor. 2025'te hedefimiz mikro ihracat payımızı %40'a çıkarmak.`,
      },
      {
        authorId: 'u_mod_ahmet',
        content: `Yeni yılda tüm üyelerimizle birlikte büyümeye ve forumumuzda tecrübeleri paylaşmaya devam edeceğiz!`,
      }
    ]
  },
  {
    id: 'topic-2',
    title: 'Ticaret Bakanlığı 2025 E-Ticaret Yasa ve Lisans Düzenlemeleri Özeti',
    slug: 'ticaret-bakanligi-2025-e-ticaret-yasa-ve-lisans-duzenlemeleri-ozeti',
    boardId: 'b1',
    authorId: 'u_hukuk_avukat',
    type: 'ANNOUNCEMENT',
    status: 'OPEN',
    viewCount: 8900,
    tags: [
      { name: 'mevzuat', slug: 'mevzuat', color: 'red' },
      { name: 'bakanlik', slug: 'bakanlik', color: 'blue' },
      { name: 'hukuk', slug: 'hukuk', color: 'purple' }
    ],
    posts: [
      {
        authorId: 'u_hukuk_avukat',
        content: `### 6563 Sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun Güncellemeleri

Ticaret Bakanlığı'nın pazaryerleri ve satıcılar için getirdiği yeni yükümlülükler:

1. **ETBİS Doğrulaması:** Tüm satıcıların ETBİS (Elektronik Ticaret Bilgi Sistemi) kaydı ve vergi levhası eşleşmesi zorunlu hale geldi.
2. **Haksız Fiyat Değerlendirme Kurulu:** Fahiş fiyat artışları ve stokçuluk denetimleri yapay zeka botlarıyla otomatik taranıyor.
3. **Pazaryeri Aracılık Sözleşmeleri:** Pazaryerleri satıcı komisyonlarını tek taraflı olarak 30 günden önce değiştiremeyecek.`,
      },
      {
        authorId: 'u_mali_musavir',
        content: `Avukat Hanım'a teşekkürler. Özellikle ETBİS doğrulaması eksik olan satıcıların pazaryeri ödemelerine bloke konulabiliyor, mutlaka profilinizin doğrulanmış olduğunu kontrol edin.`,
      }
    ]
  },

  // --- BÖLÜM 2: KURALLAR (b2) ---
  {
    id: 'topic-3',
    title: 'Pazaryonetimi Topluluk Kuralları, Rütbeler ve Rozet Kazanma Sistemi',
    slug: 'pazaryonetimi-topluluk-kurallari-rutbeler-ve-rozet-kazanma-sistemi',
    boardId: 'b2',
    authorId: 'u_admin',
    type: 'STICKY',
    status: 'OPEN',
    viewCount: 12800,
    tags: [
      { name: 'kurallar', slug: 'kurallar', color: 'red' },
      { name: 'rutbeler', slug: 'rutbeler', color: 'yellow' },
      { name: 'rozetler', slug: 'rozetler', color: 'blue' },
      { name: 'topluluk', slug: 'topluluk', color: 'green' }
    ],
    posts: [
      {
        authorId: 'u_admin',
        content: `### Pazaryonetimi Topluluk Kuralları ve Seviye Sistemi

Forumumuz, e-ticaret satıcılarının bilgi ve deneyimlerini özgürce, saygı çerçevesinde paylaşabileceği profesyonel bir ekosistemdir.

#### 1. Temel Kurallar:
* Reklam, izinsiz komisyonlu affiliate linki ve spam paylaşımlar yasaktır.
* Diğer satıcılara veya markalara hakaret ve karalama içeren ifadeler kullanılamaz.
* Sorun yaşayan satıcılara yapıcı ve çözüm odaklı yanıtlar verilmelidir.

#### 2. Seviye ve Rütbe Puanlama Sistemi:
* **Yeni Satıcı (Seviye 1-3):** 0 - 500 XP
* **Bronz Satıcı (Seviye 4-5):** 500 - 1.500 XP
* **Gümüş Satıcı (Seviye 6):** 1.500 - 3.000 XP
* **Altın Satıcı (Seviye 7):** 3.000 - 5.000 XP
* **Platin Satıcı (Seviye 8):** 5.000 - 8.000 XP
* **Elmas Satıcı (Seviye 9):** 8.000 - 12.000 XP
* **E-Ticaret Gurusu (Seviye 10):** 12.000+ XP

Konu açarak, kaliteli yanıtlar vererek ve topluluk tarafından "En İyi Cevap" seçilerek itibar puanı kazanabilirsiniz.`,
      },
      {
        authorId: 'u_mod_ahmet',
        content: `Moderatör ekibi olarak forum düzenini 7/24 takip ediyoruz. Kurallara uyan, bilgi paylaşan tüm değerli üyelerimize teşekkür ederiz.`,
      }
    ]
  },
  {
    id: 'topic-4',
    title: 'E-Ticarette Güvenli Ticaret: Ortaklık, Bayilik ve Fason Üretim Anlaşmalarında Dikkat Edilecekler',
    slug: 'e-ticarette-guvenli-ticaret-ortaklik-bayilik-ve-fason-uretim-anlasmalarinda-dikkat-edilecekler',
    boardId: 'b2',
    authorId: 'u_mod_ahmet',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 4320,
    tags: [
      { name: 'guvenlik', slug: 'guvenlik', color: 'emerald' },
      { name: 'sozlesme', slug: 'sozlesme', color: 'blue' },
      { name: 'bayilik', slug: 'bayilik', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_mod_ahmet',
        content: `### Satıcılar Arası Güvenli Ticaret İlkeleri

Forumda veya dışarıda tanıştığınız tedarikçi ve iş ortaklarıyla çalışırken:
* Asla yazılı sözleşme ve fatura olmadan peşin avans ödemesi yapmayın.
* Fason üretimde numune onay protokolü imzalamadan seri üretime geçmeyin.
* Marka yetkili satıcılık belgesini (Authorization Letter) mutlaka noter veya ıslak imzalı talep edin.`,
      },
      {
        authorId: 'u_hukuk_avukat',
        content: `Sözleşmelerde "Gizlilik ve Rekabet Yasağı" (NDA) maddelerinin bulunması, tasarımınızın veya müşteri portföyünüzün çalınmasını önler.`,
      }
    ]
  },

  // --- BÖLÜM 3: TANIŞMA (b3) ---
  {
    id: 'topic-5',
    title: 'Yeni Başlayanlar İçin 0\'dan 100.000 TL Aylık Ciroya Ulaşma Yol Haritası',
    slug: 'yeni-baslayanlar-icin-0-dan-100-000-tl-aylik-ciroya-ulasma-yol-haritasi',
    boardId: 'b3',
    authorId: 'u_trendyol_pro',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 9870,
    tags: [
      { name: 'tanisma', slug: 'tanisma', color: 'teal' },
      { name: 'yenisatici', slug: 'yenisatici', color: 'green' },
      { name: 'rehber', slug: 'rehber', color: 'blue' },
      { name: 'ciro', slug: 'ciro', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_trendyol_pro',
        content: `### 90 Günlük E-Ticaret Büyüme Planı

E-ticarete yeni adım atan bir girişimcinin ilk 3 ayda izlemesi gereken en verimli yol haritası:

* **1 - 30. Gün (Temel & Ürün):** Şahıs şirketi kuruluşu (Genç girişimci), niş ve hafif (düşük desi) 5-10 ürün seçimi, profesyonel beyaz fon görsel çekimleri.
* **31 - 60. Gün (Pazaryeri & Puan):** Trendyol ve Hepsiburada mağaza açılışı, ilk siparişlerde hızlı teslimat ile 9.8 satıcı puanına oturma, ilk 20 organik yorumu toplama.
* **61 - 90. Gün (Otomasyon & Reklam):** Pazaryonetimi entegrasyonu ile otomatik stok senkronizasyonu, Dinamik Repricer ile Buybox hakimiyeti ve günlük 150-200 TL hedefli sponsorlu ürün reklamları.

Başarı tesadüf değil, doğru süreç yönetimidir!`,
      },
      {
        authorId: 'u_yeni_satici_tolga',
        content: `Bu rehber benim gibi yeni başlayanlar için pusula niteliğinde oldu. 2. ayımdayım ve 60. gün hedeflerini tamamladım. Ciro hedefime hızla yaklaşıyorum.`,
      }
    ]
  },
  {
    id: 'topic-6',
    title: 'Kendi Markasıyla Büyüyen KOBİ\'ler: Başarı ve Başarısızlık Hikayeleri',
    slug: 'kendi-markasiyla-buyuyen-kobi-ler-basari-ve-basarisizlik-hikayeleri',
    boardId: 'b3',
    authorId: 'u_kobi_ayse',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 6540,
    tags: [
      { name: 'kobi', slug: 'kobi', color: 'purple' },
      { name: 'markalasma', slug: 'markalasma', color: 'pink' },
      { name: 'tecrube', slug: 'tecrube', color: 'emerald' }
    ],
    posts: [
      {
        authorId: 'u_kobi_ayse',
        content: `### Bursa İnegöl'den E-Ticarete Açılan Bir Ev Tekstili Markasının 3 Yıllık Yolculuğu

Merhaba arkadaşlar! 3 yıl önce küçük bir atölyede 2 dikiş makinesiyle başladık. İlk yıl başkasının markasını satarken komisyon ve fiyat savaşları yüzünden neredeyse batıyorduk.

Dönüm noktamız: **Kendi markamızı tescillemek** ve özel tasarım kutularda 2'li nevresim bundle setleri satmak oldu. Bugün 12 çalışanımız ve aylık 6.000 siparişimiz var. Herkese tavsiyem kendi markanıza yatırım yapmanızdır!`,
      },
      {
        authorId: 'u_taki_buse',
        content: `Ayşe Hanım hikayeniz inanılmaz ilham verici. Biz de gümüş takıda fason satışı bırakıp kendi logolu kutularımıza geçtikten sonra müşteri sadakatimiz %300 arttı.`,
      }
    ]
  },

  // --- BÖLÜM 4: ÖNERİLER & GERİ BİLDİRİM (b4) ---
  {
    id: 'topic-7',
    title: 'Pazaryonetimi Platformu Yeni Özellik İstekleri ve 2025 Yol Haritası (Geri Bildirim)',
    slug: 'pazaryonetimi-platformu-yeni-ozellik-istekleri-ve-2025-yol-haritasi-geri-bildirim',
    boardId: 'b4',
    authorId: 'u_admin',
    type: 'STICKY',
    status: 'OPEN',
    viewCount: 10450,
    tags: [
      { name: 'duyuru', slug: 'duyuru', color: 'blue' },
      { name: 'yolharitasi', slug: 'yolharitasi', color: 'purple' },
      { name: 'guncelleme', slug: 'guncelleme', color: 'green' },
      { name: 'feedback', slug: 'feedback', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_admin',
        content: `### Değerli Pazaryonetimi Topluluğu,

Platformumuzu satıcılarımızın gerçek saha ihtiyaçlarına göre geliştirmeye devam ediyoruz. Son sürümde yayınlanan ve 2025 ilk yarıyılında gelecek özellikler:

#### Son Eklenen Özellikler:
* ✅ **AI Destekli Ürün Açıklaması Sihirbazı:** Tek tıkla SEO uyumlu ürün açıklamaları ve etiketler.
* ✅ **Gelişmiş Çoklu Para Birimli Dinamik Repricer:** Döviz kuru dalgalanmalarına karşı anlık taban fiyat koruması.
* ✅ **Kargo Desi ve Fatura Denetim Raporu:** Kargo firmalarının faturada fazla kestiği desileri otomatik tespit eden denetim ekranı.

#### 2025 Q1 - Q2 Yol Haritası:
* ⏳ **Mobil Uygulama (iOS & Android):** Anlık sipariş bildirimleri ve kritik stok uyarıları.
* ⏳ **Otomatik İade İtiraz Asistanı:** Hasarlı/sahte iadeler için otomatik video ve tutanak itiraz paketi hazırlama.
* ⏳ **Gümrük ETGB ve KDV İade Sihirbazı:** Mikro ihracat evraklarının tek tıkla Gelir İdaresi Başkanlığı formatına dönüştürülmesi.

Görmek istediğiniz tüm özellikleri bu başlık altında paylaşabilirsiniz!`,
      },
      {
        authorId: 'u_trendyol_pro',
        content: `Kargo desi denetim raporu tek kelimeyle hayat kurtardı. Geçen ay kargo firmasının faturamıza 3 desi yerine 6 desi yazdığı 140 paketi sistem otomatik yakaladı ve 18.000 TL fatura iadesi aldık! Emeğinize sağlık.`,
      },
      {
        authorId: 'u_etsy_zeynep',
        content: `Mobil uygulamanın gelmesini sabırsızlıkla bekliyoruz! Özellikle yurtdışı siparişlerinde telefon bildiriminden anında siparişi onaylayıp kargo fişi çıkarabilmek harika olacak.`,
      }
    ]
  },

  // --- BÖLÜM 5: TRENDYOL BUYBOX & PANEL (b5) ---
  {
    id: 'topic-8',
    title: 'Trendyol Buybox Algoritması Nasıl Çalışır? 1. Sıraya Çıkma Taktikleri',
    slug: 'trendyol-buybox-algoritmasi-nasil-calisir-1-siraya-cikma-taktikleri',
    boardId: 'b5',
    authorId: 'u_mod_ahmet',
    type: 'STICKY',
    status: 'SOLVED',
    viewCount: 8420,
    tags: [
      { name: 'buybox', slug: 'buybox', color: 'orange' },
      { name: 'trendyol', slug: 'trendyol', color: 'orange' },
      { name: 'algoritma', slug: 'algoritma', color: 'purple' },
      { name: 'saticipuani', slug: 'saticipuani', color: 'green' }
    ],
    posts: [
      {
        authorId: 'u_mod_ahmet',
        content: `### Trendyol'da Buybox Kazanmanın Matematiği ve Algoritma Ağırlıkları

Trendyol'da aynı barkod/ürün altında birden fazla satıcı olduğunda, sepete ekle butonuna sahip olan satıcı satışların **%88'inden fazlasını** alır. Peki Buybox sadece en ucuz fiyat mıdır? Kesinlikle HAYIR!

#### Algoritma Skor Dağılımı (Tahmini Veri):
1. **Fiyat Avantajı (%45 Ağırlık):** En dip fiyatta olmak avantajdır ancak tek başına yetmez.
2. **Satıcı Puanı (%25 Ağırlık):** Satıcı puanınız 9.5 üzerindeyse, 2-3 TL daha pahalı olsanız dahi Buybox'ı elinizde tutabilirsiniz.
3. **Kargoya Verme Süresi & Hızlı Teslimat (%20 Ağırlık):** "Bugün Kargoda" veya "24 Saatte Kargoda" rozeti 5 TL'ye kadar fiyat farkını tolare eder.
4. **İptal & Tedarik Edememe Oranı (%10 Ağırlık):** Son 30 gündeki tedarik başarısızlığı puanı düşürür.

Buybox kazanmak için uyguladığımız canlı stratejileri tartışalım.`,
      },
      {
        authorId: 'u_trendyol_pro',
        content: `Ahmet Bey'in puanlama analizi son derece doğru. Kendi mağazamızda test ettik:

Satıcı puanımız **9.8** iken, rakibimiz **8.7** puandaydı. Rakip fiyatı 299 TL'ye indirdiğinde biz 305 TL'de kalmamıza rağmen Buybox bizde kaldı! Çünkü sistem hızlı teslimat ve yüksek müşteri memnuniyeti sunan mağazayı koruyor.

**Öneri:** Fiyat savaşında kuruş kuruş inmek yerine Pazaryonetimi'nin Dinamik Repricer aracını kurun. Rakip fiyat düşürdüğünde sistem otomatik olarak izin verdiğiniz taban fiyata kadar eşitlesin, rakip stok bitirince anında eski karlı fiyata yükseltsin.`,
        isBestAnswer: true,
      },
      {
        authorId: 'u_yeni_satici_tolga',
        content: `Çok aydınlatıcı oldu, teşekkürler! Yeni açılan bir mağaza olarak satıcı puanımız henüz oluşmadığı için Buybox'ta geride kalıyoruz. İlk etapta ne yapmamızı önerirsiniz?`,
      },
      {
        authorId: 'u_mod_ahmet',
        content: `@Tolga Arslan ilk 20-30 siparişte gelen siparişleri aynı gün içinde kargoya verin ve paketin içine nazik bir teşekkür kartı ekleyin. Puanınız 9.5 üzerine oturduğunda Buybox hakimiyetiniz hızla artacaktır.`,
      }
    ]
  },
  {
    id: 'topic-9',
    title: 'Trendyol Flaş İndirimler ve Süper Fırsat Kampanyalarına Katılım Şartları',
    slug: 'trendyol-flas-indirimler-ve-super-firsat-kampanyalarina-katilim-sartlari',
    boardId: 'b5',
    authorId: 'u_trendyol_pro',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 7120,
    tags: [
      { name: 'trendyol', slug: 'trendyol', color: 'orange' },
      { name: 'flasindirim', slug: 'flasindirim', color: 'red' },
      { name: 'kampanya', slug: 'kampanya', color: 'yellow' }
    ],
    posts: [
      {
        authorId: 'u_trendyol_pro',
        content: `### Flaş İndirim (Flash Deal) Süreçlerinde Dikkat Edilmesi Gereken 5 Kural

Trendyol Flaş İndirimleri 3 saatlik periyotlarda anasayfada en üstte gösterilir ve 3 saatte normalde 1 haftada yapılan ciroyu getirebilir.

1. **Son 30 Günün En Düşük Fiyatı:** Ürününüz son 30 günde satıldığı en dip fiyatın en az %5 altına inmelidir.
2. **Kritik Stok Taahhüdü:** Flaş indirime girdiğiniz stoğu asla başka pazaryerinde satışa açmayın! Stok biterse ceza puanı yazılır. Pazaryonetimi'nin "Kampanya Stok Kilidi" özelliğini kullanın.
3. **Kargo SLA Hazırlığı:** Flaş indirimden çıkacak 500 paketi aynı gün teslim edebilmek için koli ve ambalajlarınızı önceden hazır edin.`,
      },
      {
        authorId: 'u_oto_hakan',
        content: `Flaş indirime girmeden önce koli bantlarını ve fatura kağıtlarını stoklamak çok önemli. Bizim ilk flaş indirimimizde koli bittiği için gece açık ambalajcı aramak zorunda kalmıştık!`,
      }
    ]
  },

  // --- BÖLÜM 6: TRENDYOL KOMİSYON & FİYAT (b6) ---
  {
    id: 'topic-10',
    title: 'Trendyol 2024 - 2025 Komisyon Oranları, Baremler ve Kargo Fiyatlandırması Kılavuzu',
    slug: 'trendyol-2024-2025-komisyon-oranlari-baremler-ve-kargo-fiyatlandirmasi-kilavuzu',
    boardId: 'b6',
    authorId: 'u_trendyol_pro',
    type: 'STICKY',
    status: 'OPEN',
    viewCount: 16840,
    tags: [
      { name: 'trendyol', slug: 'trendyol', color: 'orange' },
      { name: 'komisyon', slug: 'komisyon', color: 'red' },
      { name: 'barem', slug: 'barem', color: 'blue' },
      { name: 'kargo', slug: 'kargo', color: 'green' }
    ],
    posts: [
      {
        authorId: 'u_trendyol_pro',
        content: `### Trendyol Satıcıları İçin Güncel Maliyet ve Komisyon Tablosu

Değerli satıcı arkadaşlar, pazaryeri satışlarında kârlılığı koruyabilmek için Trendyol'un güncel komisyon ve kargo barem yapısını çok iyi hesaplamamız gerekiyor. Bu başlık altında kategori bazlı net oranları ve hesaplama formüllerini paylaşıyorum.

#### 1. Kategori Bazlı Ortalama Komisyon Oranları (KDV Dahil)
* **Giyim & Ayakkabı:** %20 - %23
* **Elektronik & Küçük Ev Aletleri:** %8 - %14
* **Kozmetik & Kişisel Bakım:** %17 - %20
* **Ev & Yaşam / Dekorasyon:** %16 - %21
* **Oto Aksesuar:** %15 - %18
* **Anne & Bebek:** %13 - %18

#### 2. Kargo Barem Sistemi ve Kesintiler
* **0 - 150 TL arası siparişler:** Kargo ücretinin tamamı veya barem farkı satıcı tarafından karşılanır (Yaklaşık 38 TL - 48 TL + KDV).
* **150 TL üzeri siparişler:** Standart anlaşmalı kargo barem tarifesi uygulanır.
* **Trendyol Express (TEX):** 1-2 desi için ortalama 42.50 TL + KDV civarındadır.

> **💡 Profesyonel İpucu:** 140 TL bandındaki ürünlerinizi 155 TL'ye çıkarıp 15 TL kupon tanımladığınızda, hem kargo barem avantajı yakalarsınız hem de listelemede 'Kuponlu Ürün' rozetiyle tıklama oranınızı %35 artırırsınız!

Net kâr hesaplama formülü:
\`\`\`text
Net Kâr = Satış Fiyatı - (Alış Maliyeti + Komisyon + Kargo + Ambalaj + Pazaryeri Hizmet Bedeli + Stopaj/KDV Farkı)
\`\`\`

Sorularınız ve kategori bazlı özel hesaplamalar için alta yazabilirsiniz!`,
      },
      {
        authorId: 'u_mali_musavir',
        content: `Burak Bey çok güzel özetlemişsiniz. Mali müşavir gözüyle bir ekleme yapmak isterim:

Trendyol her ay başında **"Pazaryeri Hizmet Faturası"** ve **"Kargo Faturası"** keser. Bu faturaların KDV'si %20'dir ve 2 No'lu KDV beyannamesinde değil, doğrudan 1 No'lu KDV beyannamenizde **İndirilecek KDV** olarak mahsup edilir.`,
      },
      {
        authorId: 'u_kobi_ayse',
        content: `Harika bir rehber olmuş elinize sağlık. Biz ev tekstilinde 150 TL baremi yüzünden çok zorlanıyorduk. Ürünleri 2'li paket (bundle) haline getirip 220 TL'ye çektik, hem kargo maliyetimiz birim başına düştü hem de sipariş başı net kârımız %40 arttı.`,
      }
    ]
  },
  {
    id: 'topic-11',
    title: 'Trendyol Ceza Bedelleri ve Tedarik Edememe İptallerinden Korunma Yolları',
    slug: 'trendyol-ceza-bedelleri-ve-tedarik-edememe-iptallerinden-korunma-yollari',
    boardId: 'b6',
    authorId: 'u_mod_ahmet',
    type: 'NORMAL',
    status: 'SOLVED',
    viewCount: 5430,
    tags: [
      { name: 'ceza', slug: 'ceza', color: 'red' },
      { name: 'trendyol', slug: 'trendyol', color: 'orange' },
      { name: 'tedarik', slug: 'tedarik', color: 'blue' }
    ],
    posts: [
      {
        authorId: 'u_mod_ahmet',
        content: `### Tedarik Edememe (Out of Stock) Cezaları Nasıl Hesaplanır?

Trendyol'da satılan bir ürünü stokta olmadığı için satıcı taraflı iptal ederseniz:
* Ürün satış fiyatının **%25'i kadar (Minimum 50 TL, Maksimum 300 TL)** cezai işlem uygulanır.
* Satıcı puanınızdan tek seferde -0.5 puan düşülür.

**Çözüm:** Pazaryonetimi panelindeki "Otomatik Kritik Stok Kilidi" özelliğini açın. Ürün stoğu 1 kaldığında sistem ürünü tüm pazaryerlerinde anında satışa kapatarak çift satış riskini sıfırlar.`,
      },
      {
        authorId: 'u_elektronik_volkan',
        content: `Bu kural sayesinde son 6 ayda sıfır ceza ile ilerliyoruz. Özellikle birden fazla pazaryerinde aynı anda satılan yüksek tutarlı elektronik ürünlerde hayat kurtarıyor.`,
        isBestAnswer: true,
      }
    ]
  },

  // --- BÖLÜM 7: HEPSİBURADA (b7) ---
  {
    id: 'topic-12',
    title: 'Hepsiburada Mağaza Puanı Yükseltme ve HepsiJet Entegrasyonu İpuçları',
    slug: 'hepsiburada-magaza-puani-yukseltme-ve-hepsijet-entegrasyonu-ipuclari',
    boardId: 'b7',
    authorId: 'u_hepsiburada_uzman',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 6230,
    tags: [
      { name: 'hepsiburada', slug: 'hepsiburada', color: 'orange' },
      { name: 'hepsijet', slug: 'hepsijet', color: 'blue' },
      { name: 'saticipuani', slug: 'saticipuani', color: 'green' }
    ],
    posts: [
      {
        authorId: 'u_hepsiburada_uzman',
        content: `### Hepsiburada Satıcı Performansı ve HepsiJet Avantajları

Hepsiburada algoritmasında mağaza puanınız **9.6'nın altına düştüğünde** listeleme sıralamasında ciddi kayıplar yaşarsınız. Puanı 9.9 seviyesinde tutmak için kritik kontrol listesi:

1. **SLA (Kargoya Verme Süresi):** Tanımladığınız kargolama gününü asla aşmayın. Saat 16:00'ya kadar gelen siparişleri aynı gün çıkarmak mağazanıza ek +0.3 puan kazandırır.
2. **HepsiJet Entegrasyonu:** Bulunduğunuz bölgede HepsiJet kapıdan alım varsa mutlaka entegre olun. HepsiJet ile gönderilen ürünler arama sonuçlarında "Yarın Kapında" filtresiyle %40 daha fazla görünürlük alır.
3. **Müşteri Soruları (Q&A):** Müşteri sorularını 30 dakika içinde cevaplamak puanı doğrudan etkiler.`,
      },
      {
        authorId: 'u_petshop_murat',
        content: `HepsiJet ile mama gönderimlerimizde teslimat hızı 24 saatin altına indi. Müşteri yorumlarımızda kargo hızı övüldükçe satışlarımız 2 katına çıktı.`,
      }
    ]
  },

  // --- BÖLÜM 8: N11, ÇİÇEKSEPETİ & PTTAVM (b8) ---
  {
    id: 'topic-13',
    title: 'N11 Pro ve Çiçeksepeti Pazaryerinde Satışları Artırma Taktikleri',
    slug: 'n11-pro-ve-ciceksepeti-pazaryerinde-satislari-artirma-taktikleri',
    boardId: 'b8',
    authorId: 'u_hepsiburada_uzman',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 4980,
    tags: [
      { name: 'n11', slug: 'n11', color: 'red' },
      { name: 'ciceksepeti', slug: 'ciceksepeti', color: 'pink' },
      { name: 'pazaryeri', slug: 'pazaryeri', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_hepsiburada_uzman',
        content: `### Alternatif Pazaryerlerinde Yüksek Kârlılık Yakalama

Trendyol ve Hepsiburada dışındaki pazaryerleri doğru stratejiyle toplam cironuzun %30'unu oluşturabilir.

* **N11 Kupon Kampanyaları:** N11 kullanıcıları kupon odaklıdır. Mağaza takip kuponu tanımlamak geri dönüş oranını %25 artırır.
* **Çiçeksepeti Extra:** Hediyelik ve kişiselleştirilebilir ürünlerde aynı gün kargo rozeti satışı 3 katına çıkarır.`,
      },
      {
        authorId: 'u_taki_buse',
        content: `Çiçeksepeti'nde hediye paketi ve özel not kartı seçeneği ekledikten sonra sipariş adedimiz 4 katına çıktı. Niş hediyelik ürünler için harika bir pazar.`,
      }
    ]
  },

  // --- BÖLÜM 9: AMAZON TR & SP-API (b9) ---
  {
    id: 'topic-14',
    title: 'Amazon Türkiye SP-API ve FBA Depo Kabul Süreçlerinde Dikkat Edilmesi Gerekenler',
    slug: 'amazon-turkiye-sp-api-ve-fba-depo-kabul-sreclerinde-dikkat-edilmesi-gerekenler',
    boardId: 'b9',
    authorId: 'u_amazon_fba_lead',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 5410,
    tags: [
      { name: 'amazontr', slug: 'amazontr', color: 'yellow' },
      { name: 'fba', slug: 'fba', color: 'indigo' },
      { name: 'tuzladeposu', slug: 'tuzladeposu', color: 'blue' }
    ],
    posts: [
      {
        authorId: 'u_amazon_fba_lead',
        content: `### Amazon Türkiye Tuzla Lojistik Merkezi (IST2) Sevk Prosedürleri

Amazon TR FBA kullanırken koli kabulünün hızlı yapılması için:
1. **FNSKU Barkod:** Ürün orijinal barkodunun üzerine FNSKU etiketi yapıştırılmalı, eski barkod tamamen kapatılmalıdır.
2. **Koli Ağırlık Sınırı:** Standart FBA kolisi 23 kg'ı geçmemelidir. 15 kg üzeri kolilere "Heavy Package" uyarısı yapıştırılmalıdır.
3. **Carrier Central Randevusu:** Taşıyıcı kargo firması Amazon Carrier Central üzerinden mutlaka teslim randevusu almalıdır.`,
      },
      {
        authorId: 'u_elektronik_volkan',
        content: `FBA'ya geçtikten sonra Prime rozeti sayesinde Buybox alma oranımız %92'ye çıktı ve kargo paketleme operasyonundan tamamen kurtulduk.`,
      }
    ]
  },

  // --- BÖLÜM 10: AMAZON GLOBAL (b10) ---
  {
    id: 'topic-15',
    title: 'Amazon FBA ABD (Amazon.com) Başlangıç Rehberi: Şirket Kurulumundan İlk Sevkiyata',
    slug: 'amazon-fba-abd-amazon-com-baslangic-rehberi-sirket-kurulumundan-ilk-sevkiyata',
    boardId: 'b10',
    authorId: 'u_amazon_fba_lead',
    type: 'ANNOUNCEMENT',
    status: 'OPEN',
    viewCount: 19540,
    tags: [
      { name: 'amazonfba', slug: 'amazonfba', color: 'indigo' },
      { name: 'amerika', slug: 'amerika', color: 'blue' },
      { name: 'llc', slug: 'llc', color: 'emerald' },
      { name: 'e-ihracat', slug: 'e-ihracat', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_amazon_fba_lead',
        content: `### Amazon Amerika (FBA) ile Dolar Kazanmak İsteyenler İçin Eksiksiz Yol Haritası

Türkiye'den Amerika Amazon (Amazon.com) pazarına açılmak isteyen tüm üretici ve satıcılar için 2025 yılı güncel prosedürlerini adım adım derledim.

#### Adım 1: Şirket ve Banka Yapısı
* **Amerika LLC Şirket Kurulumu:** Wyoming veya Delaware eyaletinde Registered Agent aracılığıyla tek ortaklı LLC (Single-Member LLC) açılması önerilir.
* **EIN Numarası:** IRS üzerinden Vergi Kimlik Numarası (EIN) alınır (15-25 gün).
* **Banka Hesabı:** Mercury Bank, Relay Financial veya Wise Business üzerinden kurumsal USD hesabı açılır.

#### Adım 2: Amazon Professional Seller Hesabı Açılışı
* Bireysel hesap yerine aylık 39.99$ olan Professional plan seçilmelidir (Buybox ve reklam için şarttır).
* Video mülakat doğrulaması için kimlik ve şirket evrakları hazır bulundurulmalıdır.

#### Adım 3: GS1 Barkod ve Brand Registry
* Amazon sadece **GS1 tescilli UPC/EAN** barkodlarını kabul eder.
* ABD Patent Ofisi (USPTO) üzerinden marka başvurusu yaparak **Amazon Brand Registry** alınır. Bu sayede A+ Content, Brand Store ve Video Reklam hakları açılır.

#### Adım 4: FBA Lojistik ve Gönderim (Shipment Workflow)
* Türkiye'den DDP (Gümrük Vergileri Ödenmiş) olarak hava kargo veya parsiyel deniz yoluyla Amazon FBA depolarına (ONT8, GYR3, IND9 vb.) sevk yapılır.
* 800$ altı mikro kargolarda Section 321 gümrük muafiyetinden faydalanılabilir.

Sorularınızı bu başlık altından yanıtlamaktan memnuniyet duyarım!`,
      },
      {
        authorId: 'u_dropship_baris',
        content: `Deniz yolu taşımacılığında ortalama süreler şu an nasıl Can Bey? Parsiyel (LCL) yüklemelerde gümrük çekimi ne kadar sürüyor?`,
      },
      {
        authorId: 'u_amazon_fba_lead',
        content: `@Barış Çelik Ambarlı limanından Los Angeles limanına deniz navlunu yaklaşık 30-35 gün sürüyor. Gümrük ve depoya teslimle 45 günü baz almalısınız.`,
      }
    ]
  },
  {
    id: 'topic-16',
    title: 'Amazon PPC Reklamlarında ACoS\'u %18\'e Düşürme: Exact, Phrase ve Auto Kampanyalar',
    slug: 'amazon-ppc-reklamlarinda-acos-u-18-e-dusurme-exact-phrase-ve-auto-kampanyalar',
    boardId: 'b10',
    authorId: 'u_amazon_fba_lead',
    type: 'NORMAL',
    status: 'SOLVED',
    viewCount: 7890,
    tags: [
      { name: 'amazonppc', slug: 'amazonppc', color: 'indigo' },
      { name: 'acos', slug: 'acos', color: 'emerald' },
      { name: 'reklam', slug: 'reklam', color: 'blue' }
    ],
    posts: [
      {
        authorId: 'u_amazon_fba_lead',
        content: `### Reklam Bütçesini Korumak: 3 Kademeli PPC Hunisi (Funnel)

Amazon'da karlı reklam yönetiminin altın kuralı:
1. **Auto Kampanya (Keşif):** Düşük teklifle arama terimi keşfi yapın.
2. **Search Term Raporu İncelemesi:** Son 14 günde 2'den fazla sipariş getiren kelimeleri çıkarın.
3. **Exact Kampanyaya Taşıma (Skalalama):** Bu kelimeleri Exact eşleşmeli ana PPC kampanyanıza taşıyıp Auto kampanyada negatif yapın.

Bu döngüyle ACoS oranınız %45'ten %18 seviyelerine geriler.`,
      },
      {
        authorId: 'u_ads_serkan',
        content: `Exact eşleşmeli kelimelerde Top of Search (Arama Sayfasının Başı) için %40 bid çarpanı eklemek dönüşüm oranını muazzam artırıyor.`,
        isBestAnswer: true,
      }
    ]
  },

  // --- BÖLÜM 11: ETSY (b11) ---
  {
    id: 'topic-17',
    title: 'Etsy\'de Mağaza Suspend Edilmeden Satış Yapma ve Star Seller Olma Yolları',
    slug: 'etsy-de-magaza-suspend-edilmeden-satis-yapma-ve-star-seller-olma-yollari',
    boardId: 'b11',
    authorId: 'u_etsy_zeynep',
    type: 'NORMAL',
    status: 'SOLVED',
    viewCount: 8670,
    tags: [
      { name: 'etsy', slug: 'etsy', color: 'orange' },
      { name: 'starseller', slug: 'starseller', color: 'yellow' },
      { name: 'suspend', slug: 'suspend', color: 'red' },
      { name: 'e-ihracat', slug: 'e-ihracat', color: 'blue' }
    ],
    posts: [
      {
        authorId: 'u_etsy_zeynep',
        content: `### Etsy Botlarına Yakalanmadan Mağaza Büyütme Taktikleri

Etsy son 1 yılda yeni açılan mağazalara karşı çok katı bir yapay zeka denetimi uyguluyor. Birçok satıcı ilk 3 gün içinde "Account Suspended" şoku yaşıyor. İşte dikkat etmeniz gereken altın kurallar:

1. **IP ve Cihaz Temizliği:** Daha önce Etsy'de kapanmış bir hesapla aynı internet bağlantısından veya tarayıcıdan kesinlikle yeni hesap açmayın.
2. **Telif Hakkı (Trademark / Copyright):** Başlıklarda ve taglerde Disney, Marvel, Nike, Harry Potter gibi tescilli marka isimlerini ASLA kullanmayın. Otomatik botlar anında hesabı kilitler.
3. **Üretim Videosu Ekleyin:** El yapımı (Handmade) olduğunu kanıtlamak için ürün hazırlık sürecinizi gösteren 15 saniyelik bir üretim videosunu mağazanıza yükleyin.
4. **Takip Numaralı Kargo:** Gönderilerinizi mutlaka geçerli takip numarası olan taşıyıcılarla (PTS, Navlungo, ShipEntegra, FedEx) gönderin.

Star Seller rozeti için mesajlara 24 saat içinde dönüş oranı %95, kargo zamanlaması %95 ve 5 yıldız oranı %95 olmalıdır.`,
      },
      {
        authorId: 'u_hukuk_avukat',
        content: `Zeynep Hanım'ın telif uyarısı çok kritik. ABD'de DMCA (Digital Millennium Copyright Act) kapsamında açılan marka davalarında hesaplardaki bakiyelere dahi bloke konulabiliyor. Özgün tasarım ve tescilsiz jenerik kelimelerle ilerlemek en güvenli yoldur.`,
      },
      {
        authorId: 'u_etsy_zeynep',
        content: `Avukat Hanım'a katkısı için teşekkürler. Eğer haksız yere suspend edildiğinizi düşünüyorsanız Etsy Appeal (İtiraz) formuna atölye fotoğraflarınızı, vergi levhanızı ve ürün üretim aşaması videolarınızı ekleyerek başvurduğunuzda %80 ihtimalle hesap 48 saatte açılıyor.`,
        isBestAnswer: true,
      }
    ]
  },

  // 7. Dinamik Fiyatlandırma & Repricer (b13)
  {
    id: 'topic-7',
    title: 'Dinamik Fiyatlandırma & Otomatik Repricer ile Rakipleri Gece Geçme Stratejileri',
    slug: 'dinamik-fiyatlandirma-otomatik-repricer-ile-rakipleri-gece-gecme-stratejileri',
    boardId: 'b13',
    authorId: 'u_dev_emre',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 6180,
    tags: [
      { name: 'repricer', slug: 'repricer', color: 'emerald' },
      { name: 'fiyat-stratejisi', slug: 'fiyat-stratejisi', color: 'blue' },
      { name: 'otomasyon', slug: 'otomasyon', color: 'purple' },
      { name: 'kar-marji', slug: 'kar-marji', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_dev_emre',
        content: `### Fiyat Savaşlarında Kârı Korumak: Akıllı Repricer Kuralları

Manuel olarak gün içinde yüzlerce ürünün rakip fiyatını kontrol edip güncellemek imkansızdır. Dinamik Repricer motoru kurarken uygulamanız gereken 3 temel kural:

#### 1. Taban Fiyat (Floor Price) Koruması
Asla taban fiyat belirlemeden repricer çalıştırmayın. Taban fiyat = \`Alış Fiyatı + Kargo + Komisyon + Minimum %15 Net Kâr\`. Rakip zararına satsa dahi botunuz taban fiyatın altına inmemelidir.

#### 2. Tavan Fiyata Geri Çekilme (Ceiling Rule)
Rakip satıcının stoğu tükendiğinde veya gece saatlerinde rekabet azaldığında, repricer fiyatınızı otomatik olarak maksimum karlı fiyata yükseltmelidir.

#### 3. Kuruş Kırma Kuralı (Penny Dropping)
Rakibin 1 TL altına inmek yerine sadece 0.10 TL altına inmek piyasa fiyatını aşağıya çekmeden Buybox'ı almanızı sağlar.

Pazaryonetimi paneli üzerinden kurduğunuz repricer stratejilerini paylaşabilirsiniz!`,
      },
      {
        authorId: 'u_trendyol_pro',
        content: `Emre Bey'in "Tavan Fiyat" kuralı bize her ay binlerce lira ekstra kâr bırakıyor. Özellikle gece 02:00 ile 07:00 arasında rakiplerin stokları bittiğinde sistem fiyatı otomatik %25 yukarı çekiyor ve sabah uyandığımızda yüksek karlı siparişlerle karşılaşıyoruz.`,
      },
      {
        authorId: 'u_dropship_baris',
        content: `Pazaryonetimi repricer'ında döviz kurları (USD/EUR) değiştikçe taban fiyatın otomatik güncellenmesi özelliği var mı?`,
      },
      {
        authorId: 'u_dev_emre',
        content: `@Barış Çelik Evet, döviz endeksli ürün maliyeti tanımladığınızda Merkez Bankası canlı kur verisiyle taban fiyatınız anlık olarak yeniden hesaplanır. Kur yükseldiğinde zarar etme riskiniz tamamen ortadan kalkar.`,
      }
    ]
  },

  // 8. Google Ads & Performance Max (b17)
  {
    id: 'topic-8',
    title: 'Google Performance Max (PMax) ile ROAS\'ı %400\'den %900\'e Çıkarma Deneyimi',
    slug: 'google-performance-max-pmax-ile-roas-i-400-den-900-e-cikarma-deneyimi',
    boardId: 'b17',
    authorId: 'u_ads_serkan',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 7890,
    tags: [
      { name: 'googleads', slug: 'googleads', color: 'blue' },
      { name: 'pmax', slug: 'pmax', color: 'purple' },
      { name: 'roas', slug: 'roas', color: 'green' },
      { name: 'merchantcenter', slug: 'merchantcenter', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_ads_serkan',
        content: `### Google Alışveriş ve Performance Max Kampanyalarında ROAS Optimizasyonu

Kendi e-ticaret sitesi veya pazaryeri mağazası için Google Ads çalıştıran satıcılar için uyguladığımız ve ROAS değerini 4.5x'ten 9.2x'e yükselten stratejiler:

1. **Merchant Center Feed Başlık Optimizasyonu:**
   * Kötü Başlık: \`Erkek Deri Ceket\`
   * İyi Başlık: \`Hakiki Kuzu Derisi Erkek Siyah Biker Deri Ceket - Su Geçirmez Slim Fit\`
   * Google arama algoritmaları anahtar kelimeleri başlığın ilk 70 karakterinden çeker.

2. **Zombi Ürünlerin Ayrıştırılması:**
   * Kampanyanızdaki 1000 ürünün %80'i bütçe harcayıp satış getirmiyor olabilir.
   * Özel etiket (Custom Label) kullanarak çok satan "Hero" ürünleri ayrı bir PMax kampanyasında yüksek bütçeyle toplayın.

3. **Negatif Anahtar Kelime Listesi:**
   * Google Destek ekibine form doldurarak PMax kampanyanıza marka içi arama terimleri için negatif anahtar kelime ekletin. Bu sayede bütçeniz çöp aramalara gitmez.`,
      },
      {
        authorId: 'u_seo_elif',
        content: `Serkan Bey harika bilgiler. Feed optimizasyonunda \`product_type\` hiyerarşisini (Örn: Giyim > Erkek > Dış Giyim > Ceketler) eksiksiz doldurmak da Google'ın hedef kitle eşleşmesini %50 hızlandırıyor.`,
      },
      {
        authorId: 'u_kobi_ayse',
        content: `Özel etiketleme yöntemini uyguladıktan sonra günlük bütçemizi yarıya düşürmemize rağmen sipariş adetlerimiz arttı. Paylaşım için teşekkürler!`,
      }
    ]
  },

  // 9. Mikro İhracat ETGB KDV İadesi (STICKY, b12)
  {
    id: 'topic-9',
    title: 'Mikro İhracat (ETGB) ile KDV İadesi Nasıl Alınır? Adım Adım Süreç',
    slug: 'mikro-ihracat-etgb-ile-kdv-iadesi-nasil-alinir-adim-adim-surec',
    boardId: 'b12',
    authorId: 'u_mali_musavir',
    type: 'STICKY',
    status: 'OPEN',
    viewCount: 8910,
    tags: [
      { name: 'mikro-ihracat', slug: 'mikro-ihracat', color: 'blue' },
      { name: 'etgb', slug: 'etgb', color: 'emerald' },
      { name: 'kdv-iadesi', slug: 'kdv-iadesi', color: 'red' },
      { name: 'gumruk', slug: 'gumruk', color: 'purple' }
    ],
    posts: [
      {
        authorId: 'u_mali_musavir',
        content: `### 15.000 € Altı Yurtdışı Gönderilerde ETGB ile KDV İadesi Alma Rehberi

Etsy, Amazon Global veya kendi web sitenizden yurtdışına mikro ihracat yapıyorsanız, sattığınız ürünlerin üretim/tedarik aşamasında ödediğiniz KDV'yi devletten nakden veya vergi borçlarınıza mahsuben geri alabilirsiniz.

#### Mikro İhracat Şartları:
* Gönderi ağırlığı 300 kg'ı geçmemelidir.
* Fatura tutarı 15.000 Euro'yu (yaklaşık 16.500 USD) aşmamalıdır.
* Taşıma yetkili hızlı kargo operatörleri (DHL, FedEx, UPS, PTS, PTT vb.) tarafından yapılmalıdır.

#### İade Alma Adımları:
1. İhracat faturanızı **KDV'siz (%0)** ve yabancı para biriminde e-Arşiv / e-Fatura olarak kesin.
2. Taşıyıcı firmadan onaylı **ETGB (Elektronik Ticaret Gümrük Beyannamesi)** dökümünü ve VEDOP sorgu numarasını talep edin.
3. Mali müşaviriniz ilgili ayın KDV beyannamesinde "İstisnalar" tablosundan 301 kodu (Mal İhracatı) ile bildirimi yapar.
4. İnteraktif Vergi Dairesi üzerinden İhracat KDV İade Talep Dilekçesi verilir.

KDV iadesi ortalama 30-45 gün içinde banka hesabınıza yatar veya SGK/Vergi borçlarınıza mahsup edilir.`,
      },
      {
        authorId: 'u_amazon_fba_lead',
        content: `Kemal Bey, Amazon ABD FBA depolarına gönderdiğimiz toplu koliler için de mikro ihracat KDV iadesi alabiliyor muyuz?`,
      },
      {
        authorId: 'u_mali_musavir',
        content: `@Can Gümüş Evet! Koli bedeli 15.000 Euro altındaysa ve proforma/fatura ABD'deki alıcı şirketiniz veya Amazon adına düzenlendiyse, ETGB belgesiyle KDV iadesi eksiksiz alınabilir. Yıllık ciroda %15-%20 ekstra kâr marjı demektir.`,
      }
    ]
  },

  // 10. Pazaryonetimi REST API & Webhook (b21)
  {
    id: 'topic-10',
    title: 'Pazaryonetimi REST API ve Webhook Kullanarak Özel ERP Köprüsü Kurmak',
    slug: 'pazaryonetimi-rest-api-ve-webhook-kullanarak-ozel-erp-koprusu-kurmak',
    boardId: 'b21',
    authorId: 'u_dev_emre',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 4560,
    tags: [
      { name: 'api', slug: 'api', color: 'cyan' },
      { name: 'webhook', slug: 'webhook', color: 'blue' },
      { name: 'developer', slug: 'developer', color: 'purple' },
      { name: 'erp', slug: 'erp', color: 'emerald' }
    ],
    posts: [
      {
        authorId: 'u_dev_emre',
        content: `### Geliştiriciler İçin Pazaryonetimi API & Webhook Entegrasyon Mimarisi

Kendi şirket içi yazılımınız veya özel ERP sisteminiz ile Pazaryonetimi arasındaki gerçek zamanlı çift yönlü veri akışını bu örneklerle kolayca kurabilirsiniz.

#### 1. Webhook Dinleme (\`order.created\`)
Pazaryerinden yeni bir sipariş geldiğinde sistem saniyeler içinde belirlediğiniz Webhook URL'ine POST isteği gönderir:

\`\`\`json
{
  "event": "order.created",
  "data": {
    "orderId": "ORD-2025-99812",
    "marketplace": "TRENDYOL",
    "customer": { "name": "Ahmet Yılmaz", "city": "İstanbul" },
    "items": [
      { "sku": "DR-CKT-01", "barcode": "868000123456", "quantity": 1, "price": 1450.00 }
    ],
    "totalAmount": 1450.00,
    "createdAt": "2025-02-20T10:15:00Z"
  }
}
\`\`\`

#### 2. Stok Güncelleme API Çağrısı (\`POST /api/v1/inventory/sync\`)
\`\`\`typescript
const response = await fetch('https://api.pazaryonetimi.com/v1/inventory/sync', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sku: 'DR-CKT-01',
    stock: 45,
    warehouses: [{ warehouseId: 'wh-main', stock: 45 }]
  })
});
\`\`\`

Bu istek çalıştığında tüm bağlı pazaryerlerindeki (Trendyol, Hepsiburada, Amazon vb.) stok miktarı 3 saniye içinde senkronize edilir.`,
      },
      {
        authorId: 'u_mod_ahmet',
        content: `Harika dökümantasyon Emre Bey. Rate limit değerleri hakkında bilgi verebilir misiniz?`,
      },
      {
        authorId: 'u_dev_emre',
        content: `@Ahmet Yılmaz Standart API planında dakikada 180 istek, Enterprise API paketinde ise dakikada 1200 isteğe kadar desteklenmektedir. Ayrıca toplu güncelleme için \`/api/v1/inventory/bulk-sync\` endpoint'i ile tek seferde 500 ürün güncellenebilmektedir.`,
      }
    ]
  },

  // 11. İade ve Hasarlı Ürün İtiraz Süreçleri (SOLVED, b15)
  {
    id: 'topic-11',
    title: 'Pazaryeri Ürün İadelerinde \'Kullanılmış / Hasarlı Ürün\' İtirazı ve Tutanak Süreci',
    slug: 'pazaryeri-urun-iadelerinde-kullanilmis-hasarli-urun-itirazi-ve-tutanak-sureci',
    boardId: 'b15',
    authorId: 'u_lojistik_mert',
    type: 'NORMAL',
    status: 'SOLVED',
    viewCount: 6730,
    tags: [
      { name: 'iade', slug: 'iade', color: 'red' },
      { name: 'kargo', slug: 'kargo', color: 'blue' },
      { name: 'hasartutanagi', slug: 'hasartutanagi', color: 'orange' },
      { name: 'tazmin', slug: 'tazmin', color: 'green' }
    ],
    posts: [
      {
        authorId: 'u_lojistik_mert',
        content: `### Kötü Niyetli İadelere Karşı Satıcı Hakları ve Tazmin Alma Formülü

E-ticarette satıcıların en büyük maliyet kalemlerinden biri haksız iadelerdir (Müşterinin eski ürününü göndermesi, parfüm sıkıp kullanıp geri göndermesi veya kargoda kırılan ürünler).

#### Yapılması Gereken 4 Kritik Adım:
1. **Paket Açılış Masası Kamerası:** İade paketlerini açtığınız masanın üzerine sabit bir güvenlik kamerası koyun. Barkod ve ürün net görünecek şekilde açılış videosu kaydedin.
2. **Kargo Desi ve Etiket Fotoğrafı:** İade kolisinin üzerindeki takip barkodu, müşteri adı ve ambalaj durumunu fotoğraflayın.
3. **48 Saat Kuralı:** İade kargo size ulaştığı andan itibaren en geç 48 saat içinde pazaryeri paneli üzerinden "İadeye İtiraz Et" butonuna tıklayıp video/fotoğrafları yükleyin.
4. **Hasar Tespit Tutanağı:** Ürün kargo kaynaklı kırılmışsa kargo kuryesi teslim ederken "Durum Tespit Tutanağı" tutturun.

Bu adımları izlediğinizde Trendyol Satıcı Koruma Fonu veya Hepsiburada güvencesi ile ürün bedelini %90 oranında tahsil edebilirsiniz.`,
      },
      {
        authorId: 'u_kobi_ayse',
        content: `Mert Bey çok teşekkürler. Geçen hafta müşterimiz giyilmiş ve yıkanmış elbiseyi iade göndermişti. Kamera kaydı ve etiket fotoğraflarıyla itiraz ettik, Trendyol 24 saat içinde iadeyi reddetti ve ürün bedelini hesabımıza yatırdı. Kamera sistemi masrafını ilk haftada çıkardı!`,
        isBestAnswer: true,
      },
      {
        authorId: 'u_hukuk_avukat',
        content: `Mert Bey'in belirttiği gibi Tüketici Kanunu 15. maddesi gereğince hijyen bandı açılmış, kullanılmış veya tekrar satılabilirlik özelliğini yitirmiş ürünlerde tüketicinin cayma hakkı bulunmamaktadır. Somut delil (kamera kaydı) sunulduğunda Tüketici Hakem Heyeti dahi satıcı lehine karar verir.`,
      }
    ]
  },

  // 12. Meta CAPI & Katalog Reklamları (b18)
  {
    id: 'topic-12',
    title: 'Meta (Instagram & Facebook) Katalog Reklamlarında Advantage+ ve CAPI Kurulumu',
    slug: 'meta-instagram-facebook-katalog-reklamlarinda-advantage-ve-capi-kurulumu',
    boardId: 'b18',
    authorId: 'u_ads_serkan',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 5420,
    tags: [
      { name: 'metaads', slug: 'metaads', color: 'purple' },
      { name: 'instagram', slug: 'instagram', color: 'pink' },
      { name: 'capi', slug: 'capi', color: 'blue' },
      { name: 'katalog', slug: 'katalog', color: 'emerald' }
    ],
    posts: [
      {
        authorId: 'u_ads_serkan',
        content: `### Meta Advantage+ ve Sunucu Taraflı Dönüşümler API (CAPI) ile Reklam Performansı

iOS 14.5 ve Safari çerez engellemelerinden sonra sadece tarayıcı pikseliyle reklam vermek bütçenizin %40'ının boşa gitmesine neden olur. Çözüm: **Conversions API (CAPI)**.

#### Avantajlar:
* Satın alma (Purchase) verisi doğrudan sunucudan Meta'ya iletilir, çerez engelleyicilere takılmaz.
* Olay Eşleşme Kalitesi (Event Match Quality) skoru 8.5/10 üzerine çıkar.
* Advantage+ Alışveriş Kampanyaları (ASC) algoritması en doğru alıcı kitleyi çok daha hızlı bulur.

Pazaryonetimi ürün feed URL'inizi Meta Ticaret Yöneticisi'ne (Commerce Manager) bağlayarak saatlik otomatik stok ve fiyat güncellemeli dinamik ürün reklamlarını (DPA) aktif edebilirsiniz.`,
      },
      {
        authorId: 'u_tiktok_derya',
        content: `Serkan Bey, dinamik katalog reklamlarında video formatında ürün gösterimleri fotoğraf formatına göre %60 daha yüksek tıklama alıyor. Meta katalog içine kısa ürün reels videoları eklemeyi de şiddetle öneririm.`,
      }
    ]
  },

  // 13. XML Dropshipping ve Stok Güvenliği (b16)
  {
    id: 'topic-13',
    title: 'E-Ticarette XML Dropshipping: Güvenilir Tedarikçi Seçimi ve Stok Patlamalarını Önleme',
    slug: 'e-ticarette-xml-dropshipping-guvenilir-tedarikci-secimi-ve-stok-patlamalarini-onleme',
    boardId: 'b16',
    authorId: 'u_dropship_baris',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 6340,
    tags: [
      { name: 'dropshipping', slug: 'dropshipping', color: 'teal' },
      { name: 'xml', slug: 'xml', color: 'blue' },
      { name: 'tedarik', slug: 'tedarik', color: 'orange' },
      { name: 'stok', slug: 'stok', color: 'green' }
    ],
    posts: [
      {
        authorId: 'u_dropship_baris',
        content: `### XML Dropshipping Yaparken Mağazanızı Kapatılmaktan Kurtaracak Kurallar

Sermayesiz e-ticaret yapmak isteyenlerin ilk tercihi XML bayiliği oluyor. Ancak kalitesiz XML tedarikçileri yüzünden satıcılar tedarik edememe cezalarıyla karşı karşıya kalabiliyor.

#### Güvenilir Tedarikçide Aranan Şartlar:
1. **Stok Güncelleme Sıklığı:** XML linkindeki stoklar en geç 15 dakikada bir güncellenmelidir.
2. **Kargo Hızı:** Gelen siparişi aynı gün veya en geç 24 saatte kargolamalıdır.
3. **Fatura Entegrasyonu:** Müşteri adına kesilen e-faturayı koliye koyabilmelidir.

> **⚠️ En Önemli Kural (Buffer Stock):** Pazaryonetimi panelinde "Stok 3 ve altındaysa pazaryerinde stoğu 0 yap" kuralını aktif edin. Bu kural sayesinde tedarikçide son kalan ürünün başkasına satılması sonucu sipariş iptal cezasından kurtulursunuz.`,
      },
      {
        authorId: 'u_yeni_satici_tolga',
        content: `Geçen ay stok 1 görünen ürün satıldı fakat tedarikçide kalmamıştı. Trendyol'dan tedarik edememe cezası yemiştim. "Buffer Stock" kuralını kurdum, artık kafam çok rahat. Çok teşekkürler Barış Bey.`,
      }
    ]
  },

  // 14. Marka Tescili & TPE Rehberi (STICKY, b25)
  {
    id: 'topic-14',
    title: 'Marka Tescili Olmadan Pazaryerinde Satış Yapmanın Riskleri ve TÜRKPATENT Tescil Rehberi',
    slug: 'marka-tescili-olmadan-pazaryerinde-satis-yapmanin-riskleri-ve-turkpatent-tescil-rehberi',
    boardId: 'b25',
    authorId: 'u_hukuk_avukat',
    type: 'STICKY',
    status: 'OPEN',
    viewCount: 7120,
    tags: [
      { name: 'markatescil', slug: 'markatescil', color: 'red' },
      { name: 'turkpatent', slug: 'turkpatent', color: 'blue' },
      { name: 'hukuk', slug: 'hukuk', color: 'purple' },
      { name: 'buybox', slug: 'buybox', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_hukuk_avukat',
        content: `### Neden Kendi Markanızı Tescillemelisiniz?

Pazaryerlerinde binlerce lira harcayıp reklam vererek 5 yıldızlı yüzlerce yorum aldığınız bir ürün listesine, ertesi gün başka bir satıcı girip sahte/muadil ürün satarak listenizi ele geçirebilir (Hijacking).

#### Marka Tescilinin Sağladığı Yasal Haklar:
1. **Listenin Kilitlenmesi:** Marka tescil belgenizi Trendyol, Amazon ve Hepsiburada'ya yüklediğinizde, sizin izniniz olmadan hiç kimse barkodunuza veya ürün sayfanıza satıcı olarak eklenemez.
2. **Tazminat Davası:** Markanızı taklit eden satıcılara karşı Savcılık kanalıyla ürün toplatma ve Ticaret Mahkemelerinde maddi/manevi tazminat davası açma hakkınız doğar.
3. **35. Sınıf Tescil:** E-ticaret mağaza isimleri için özellikle 35. sınıf (Mağazacılık ve internet üzerinden satış hizmetleri) tescili alınmalıdır.

TÜRKPATENT başvuru süreci yaklaşık 4-6 ay sürmektedir. Başvuru yapıldığı andan itibaren başvuru koruma numarası oluşur.`,
      },
      {
        authorId: 'u_trendyol_pro',
        content: `Avukat Hanım'ın dediği başımıza geldi. 4.8 puanlı ürünümüze bir satıcı girip kalitesiz kumaş yollayınca ürün puanı 3 günde 4.1'e düştü. Marka tescil belgemizi ibraz edip ihlal bildirimi yaptık, Trendyol satıcıyı 2 saat içinde listeden attı. Marka tescili bir masraf değil, işletmenin sigortasıdır.`,
      }
    ]
  },

  // 15. TikTok Shop & Canlı Yayın Satışları (b19)
  {
    id: 'topic-15',
    title: 'TikTok Shop ve Canlı Yayın Satışlarında 1 Saatte 500 Sipariş Alma Taktikleri',
    slug: 'tiktok-shop-ve-canli-yayin-satislarinda-1-saatte-500-siparis-alma-taktikleri',
    boardId: 'b19',
    authorId: 'u_tiktok_derya',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 6890,
    tags: [
      { name: 'tiktokshop', slug: 'tiktokshop', color: 'pink' },
      { name: 'canliyayin', slug: 'canliyayin', color: 'purple' },
      { name: 'viralsatis', slug: 'viralsatis', color: 'red' },
      { name: 'influencer', slug: 'influencer', color: 'blue' }
    ],
    posts: [
      {
        authorId: 'u_tiktok_derya',
        content: `### Canlı Yayın Ticareti (Live Stream Commerce) İpuçları

Sosyal medyada sadece video paylaşmak artık yetmiyor. Canlı yayında anlık satış kurgusu 2025'in en büyük büyüme kanalı.

#### Başarılı Canlı Yayın Formülü:
* **Flaş Geri Sayım:** "Sadece bu canlı yayına özel ilk 50 kişiye 199 TL!" kurgusu FOMO (Fırsatı kaçırma korkusu) yaratır.
* **Ürün Sabitleme (Pinning):** Anlatılan ürünü ekranda sabitleyin ve sepet butonunu sürekli canlı tutun.
* **Hızlı Koli Hazırlama Canlı Şovu:** Yayının bir köşesinde sipariş verenlerin kargo paketini canlı canlı hazırlayıp ismini okumak izleyici etkileşimini ve güveni tavan yaptırır.`,
      },
      {
        authorId: 'u_kobi_ayse',
        content: `Derya Hanım'ın tavsiyesiyle geçen pazar akşamı 2 saatlik canlı yayın yaptık. Normalde 3 günde aldığımız siparişi 2 saatte aldık! Canlı koli hazırlama şovu izleyicilerin çok hoşuna gitti.`,
      }
    ]
  },

  // 16. Çoklu Depo ve Barkodlama (b14)
  {
    id: 'topic-16',
    title: 'Çoklu Depo Yönetimi: Şube Depo + Ana Depo + FBA Stoklarını Tek Merkezden Yönetmek',
    slug: 'coklu-depo-yonetimi-sube-depo-ana-depo-fba-stoklarini-tek-merkezden-yonetmek',
    boardId: 'b14',
    authorId: 'u_lojistik_mert',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 4980,
    tags: [
      { name: 'depo', slug: 'depo', color: 'green' },
      { name: 'envanter', slug: 'envanter', color: 'emerald' },
      { name: 'barkod', slug: 'barkod', color: 'blue' },
      { name: 'stok', slug: 'stok', color: 'teal' }
    ],
    posts: [
      {
        authorId: 'u_lojistik_mert',
        content: `### Çoklu Lokasyonlu Depo Mimarisinde Sıfır Hata Stratejisi

Eğer hem İstanbul ana deponuz, hem şube veya tedarikçi deponuz, hem de Amazon FBA depolarınız varsa, sipariş geldiğinde hangi depodan düşmesi gerektiğini otomatik kurallarla belirlemelisiniz.

* **Depo Önceliklendirme:** İstanbul siparişlerinde öncelik İstanbul Ana Depo, Ege bölgesi siparişlerinde İzmir Depo seçilir (Kargo maliyeti ve teslim süresi düşer).
* **El Terminali Barkod Okutma:** Sipariş toplanırken barkod okutulmadan kargo poşetine girmesine izin vermeyen sistem yanlış ürün gönderim oranını **%0.01'e** düşürür.`,
      },
      {
        authorId: 'u_dev_emre',
        content: `Pazaryonetimi Çoklu Depo modülünde deponun anlık stok seviyesine göre siparişi en yakın depoya yönlendiren akıllı rota motoru aktiftir.`,
      }
    ]
  },

  // 17. E-Ticaret Altyapı Karşılaştırması (POLL, b23)
  {
    id: 'topic-17',
    title: 'Shopify vs WooCommerce vs İkas vs Ticimax: 2025 E-Ticaret Altyapı Karşılaştırması',
    slug: 'shopify-vs-woocommerce-vs-ikas-vs-ticimax-2025-e-ticaret-altyapi-karsilastirmasi',
    boardId: 'b23',
    authorId: 'u_dev_emre',
    type: 'POLL',
    status: 'OPEN',
    viewCount: 8920,
    tags: [
      { name: 'shopify', slug: 'shopify', color: 'green' },
      { name: 'woocommerce', slug: 'woocommerce', color: 'purple' },
      { name: 'ikas', slug: 'ikas', color: 'blue' },
      { name: 'altyapi', slug: 'altyapi', color: 'orange' }
    ],
    poll: {
      question: 'Kendi e-ticaret siteniz için en çok tercih ettiğiniz altyapı hangisi?',
      options: [
        { text: 'Shopify (Global & Stabil)', votes: 145 },
        { text: 'İkas (Hızlı & Yerli)', votes: 112 },
        { text: 'WooCommerce (Açık Kaynak & Esnek)', votes: 78 },
        { text: 'Ticimax / IdeaSoft (Pazaryeri Entegreli)', votes: 54 }
      ]
    },
    posts: [
      {
        authorId: 'u_dev_emre',
        content: `### Kendi E-Ticaret Sitenizi Kurarken Hangi Altyapıyı Seçmelisiniz?

Pazaryerlerinin yüksek komisyonlarından bağımsız olarak kendi markasını büyütmek isteyen satıcılar için 4 popüler altyapıyı karşılaştırdık:

| Kriter | Shopify | İkas | WooCommerce | Ticimax |
| :--- | :--- | :--- | :--- | :--- |
| **Kurulum Kolaylığı** | Çok Yüksek | Çok Yüksek | Orta (Teknik Bilgi) | Yüksek |
| **Site Açılış Hızı** | 90+ | 95+ | 70-85 (Sunucuya bağlı) | 80-90 |
| **Yurtdışı Satış / Çoklu Dil** | Mükemmel | Çok İyi | İyi (Eklentiyle) | Orta |
| **Aylık / Yıllık Maliyet** | $39/ay + Komisyon | Yıllık Sabit TL | Sadece Sunucu ($10/ay) | Yıllık Paket TL |
| **Pazaryonetimi Uyumu** | Tam Entegre | Tam Entegre | Tam Entegre | Tam Entegre |

Ankete katılmayı ve tecrübelerinizi paylaşmayı unutmayın!`,
      },
      {
        authorId: 'u_ads_serkan',
        content: `Google ve Meta reklamlarında site hızı dönüşüm oranını doğrudan etkiliyor. Shopify ve İkas'ın CDN altyapısı sayesinde mobil sayfa açılışları 1.5 saniyenin altında kalıyor, bu da reklam bütçesinden maksimum verim almayı sağlıyor.`,
      },
      {
        authorId: 'u_trendyol_pro',
        content: `Biz global satışlar için Shopify, Türkiye D2C sitemiz için İkas kullanıyoruz. Pazaryonetimi paneli üzerinden hem pazaryerlerimizin hem de web sitelerimizin stoğunu tek havuzdan yönetiyoruz.`,
      }
    ]
  },

  // 18. Pazaryonetimi Yol Haritası ve Feedback (STICKY, ANNOUNCEMENT, b4)
  {
    id: 'topic-18',
    title: 'Pazaryonetimi Platformu Yeni Özellik İstekleri ve 2025 Yol Haritası (Geri Bildirim)',
    slug: 'pazaryonetimi-platformu-yeni-ozellik-istekleri-ve-2025-yol-haritasi-geri-bildirim',
    boardId: 'b4',
    authorId: 'u_admin',
    type: 'STICKY',
    status: 'OPEN',
    viewCount: 10450,
    tags: [
      { name: 'duyuru', slug: 'duyuru', color: 'blue' },
      { name: 'yolharitasi', slug: 'yolharitasi', color: 'purple' },
      { name: 'guncelleme', slug: 'guncelleme', color: 'green' },
      { name: 'feedback', slug: 'feedback', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_admin',
        content: `### Değerli Pazaryonetimi Topluluğu,

Platformumuzu satıcılarımızın gerçek saha ihtiyaçlarına göre geliştirmeye devam ediyoruz. Son sürümde yayınlanan ve 2025 ilk yarıyılında gelecek özellikler:

#### Son Eklenen Özellikler:
* ✅ **AI Destekli Ürün Açıklaması Sihirbazı:** Tek tıkla SEO uyumlu ürün açıklamaları ve etiketler.
* ✅ **Gelişmiş Çoklu Para Birimli Dinamik Repricer:** Döviz kuru dalgalanmalarına karşı anlık taban fiyat koruması.
* ✅ **Kargo Desi ve Fatura Denetim Raporu:** Kargo firmalarının faturada fazla kestiği desileri otomatik tespit eden denetim ekranı.

#### 2025 Q1 - Q2 Yol Haritası:
* ⏳ **Mobil Uygulama (iOS & Android):** Anlık sipariş bildirimleri ve kritik stok uyarıları.
* ⏳ **Otomatik İade İtiraz Asistanı:** Hasarlı/sahte iadeler için otomatik video ve tutanak itiraz paketi hazırlama.
* ⏳ **Gümrük ETGB ve KDV İade Sihirbazı:** Mikro ihracat evraklarının tek tıkla Gelir İdaresi Başkanlığı formatına dönüştürülmesi.

Görmek istediğiniz tüm özellikleri bu başlık altında paylaşabilirsiniz!`,
      },
      {
        authorId: 'u_trendyol_pro',
        content: `Kargo desi denetim raporu tek kelimeyle hayat kurtardı. Geçen ay kargo firmasının faturamıza 3 desi yerine 6 desi yazdığı 140 paketi sistem otomatik yakaladı ve 18.000 TL fatura iadesi aldık! Emeğinize sağlık.`,
      },
      {
        authorId: 'u_etsy_zeynep',
        content: `Mobil uygulamanın gelmesini sabırsızlıkla bekliyoruz! Özellikle yurtdışı siparişlerinde telefon bildiriminden anında siparişi onaylayıp kargo fişi çıkarabilmek harika olacak.`,
      }
    ]
  },

  // 19. Kargo Firmaları Karşılaştırma Anketi (POLL, b15)
  {
    id: 'topic-19',
    title: 'En Çok Tercih Ettiğiniz Kargo Firması Hangisi? (Fiyat / Hız / Hasar Oranı)',
    slug: 'en-cok-tercih-ettiginiz-kargo-firmasi-hangisi-fiyat-hiz-hasar-orani',
    boardId: 'b15',
    authorId: 'u_lojistik_mert',
    type: 'POLL',
    status: 'OPEN',
    viewCount: 7650,
    tags: [
      { name: 'kargo', slug: 'kargo', color: 'blue' },
      { name: 'anket', slug: 'anket', color: 'purple' },
      { name: 'lojistik', slug: 'lojistik', color: 'emerald' }
    ],
    poll: {
      question: 'Pazaryeri ve e-ticaret gönderilerinizde en memnun kaldığınız kargo şirketi hangisi?',
      options: [
        { text: 'Trendyol Express (Hızlı & Düşük Hasar)', votes: 198 },
        { text: 'HepsiJet (Zamanında Teslimat)', votes: 142 },
        { text: 'Yurtiçi Kargo (Geniş Ağ & Güvenilirlik)', votes: 115 },
        { text: 'Aras / Sürat / MNG Kargo (Fiyat Avantajı)', votes: 68 },
        { text: 'PTT Kargo (Kırsal & Mikro İhracat)', votes: 34 }
      ]
    },
    posts: [
      {
        authorId: 'u_lojistik_mert',
        content: `### E-Ticarette Kargo Firması Seçimi ve Tazmin Deneyimleri

Kargo performansı satıcı puanınızı ve iade oranınızı doğrudan belirler. Ankete katılarak bölgenizdeki tecrübeleri paylaşabilirsiniz.`,
      },
      {
        authorId: 'u_kobi_ayse',
        content: `Marmara ve Ege bölgesinde Trendyol Express ve HepsiJet teslimat süresinde rakipsiz. Kırılacak ürünlerde hasar oranımız diğer kargolara göre %70 daha düşük.`,
      }
    ]
  },

  // 20. Topluluk Kuralları ve Rütbeler (STICKY, ANNOUNCEMENT, b2)
  {
    id: 'topic-20',
    title: 'Pazaryonetimi Topluluk Kuralları, Rütbeler ve Rozet Kazanma Sistemi',
    slug: 'pazaryonetimi-topluluk-kurallari-rutbeler-ve-rozet-kazanma-sistemi',
    boardId: 'b2',
    authorId: 'u_admin',
    type: 'STICKY',
    status: 'OPEN',
    viewCount: 12800,
    tags: [
      { name: 'kurallar', slug: 'kurallar', color: 'red' },
      { name: 'rutbeler', slug: 'rutbeler', color: 'yellow' },
      { name: 'rozetler', slug: 'rozetler', color: 'blue' },
      { name: 'topluluk', slug: 'topluluk', color: 'green' }
    ],
    posts: [
      {
        authorId: 'u_admin',
        content: `### Pazaryonetimi Topluluk Kuralları ve Seviye Sistemi

Forumumuz, e-ticaret satıcılarının bilgi ve deneyimlerini özgürce, saygı çerçevesinde paylaşabileceği profesyonel bir ekosistemdir.

#### 1. Temel Kurallar:
* Reklam, izinsiz komisyonlu affiliate linki ve spam paylaşımlar yasaktır.
* Diğer satıcılara veya markalara hakaret ve karalama içeren ifadeler kullanılamaz.
* Sorun yaşayan satıcılara yapıcı ve çözüm odaklı yanıtlar verilmelidir.

#### 2. Seviye ve Rütbe Puanlama Sistemi:
* **Yeni Satıcı (Seviye 1-3):** 0 - 500 XP
* **Bronz Satıcı (Seviye 4-5):** 500 - 1.500 XP
* **Gümüş Satıcı (Seviye 6):** 1.500 - 3.000 XP
* **Altın Satıcı (Seviye 7):** 3.000 - 5.000 XP
* **Platin Satıcı (Seviye 8):** 5.000 - 8.000 XP
* **Elmas Satıcı (Seviye 9):** 8.000 - 12.000 XP
* **E-Ticaret Gurusu (Seviye 10):** 12.000+ XP

Konu açarak, kaliteli yanıtlar vererek ve topluluk tarafından "En İyi Cevap" seçilerek itibar puanı kazanabilirsiniz.`,
      },
      {
        authorId: 'u_mod_ahmet',
        content: `Moderatör ekibi olarak forum düzenini 7/24 takip ediyoruz. Kurallara uyan, bilgi paylaşan tüm değerli üyelerimize teşekkür ederiz.`,
      }
    ]
  },

  // 21. E-Ticaret SEO & Ürün Başlıkları (b20)
  {
    id: 'topic-21',
    title: 'E-Ticaret SEO: Trendyol ve Hepsiburada İçi Arama Motoru Optimizasyonu',
    slug: 'e-ticaret-seo-trendyol-ve-hepsiburada-ici-arama-motoru-optimizasyonu',
    boardId: 'b20',
    authorId: 'u_seo_elif',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 6540,
    tags: [
      { name: 'seo', slug: 'seo', color: 'violet' },
      { name: 'anahtarkelime', slug: 'anahtarkelime', color: 'purple' },
      { name: 'aramaalgoritmasi', slug: 'aramaalgoritmasi', color: 'blue' }
    ],
    posts: [
      {
        authorId: 'u_seo_elif',
        content: `### Pazaryeri İçi Arama Motorlarında İlk Sayfaya Çıkma Formülü

Pazaryeri arama algoritmaları (Trendyol Search Engine, Amazon A9/Cosmo) ürünlerinizi nasıl tarar?

#### Altın Başlık Şablonu:
\`[Marka] + [Ana Ürün Adı / Model] + [En Belirgin Özellik] + [Materyal / Kumaş] + [Renk / Beden / Paket Adedi]\`

* **Örnek:** \`Bella Casa Çift Kişilik Nevresim Takımı - %100 Pamuk Saten Çizgili Antrasit (200x220 cm)\`

#### Attribute (Özellik) Doldurmanın Gücü:
Müşteriler sol taraftaki filtrelerden "Pamuklu", "Antrasit", "Çift Kişilik" filtrelerini seçtiğinde, ürün özelliklerinde bu alanlar boş olan ürünler **arama sonuçlarından tamamen elenir**. Pazaryonetimi'ndeki otomatik attribute doldurucu ile bu alanları %100 doldurun.`,
      },
      {
        authorId: 'u_kobi_ayse',
        content: `Elif Hanım'ın başlık formülünü uyguladıktan sonra organik gösterimlerimiz 3 katına çıktı. Özellikle filtreleme özelliklerini eksiksiz girmek arama trafiğini inanılmaz artırıyor.`,
      }
    ]
  },

  // 22. Logo & Mikro Muhasebe Entegrasyonu (SOLVED, b22)
  {
    id: 'topic-22',
    title: 'Logo Tiger / Go3 ve Mikro v16 Muhasebe Entegrasyonu Deneyimleri',
    slug: 'logo-tiger-go3-ve-mikro-v16-muhasebe-entegrasyonu-deneyimleri',
    boardId: 'b22',
    authorId: 'u_dev_emre',
    type: 'NORMAL',
    status: 'SOLVED',
    viewCount: 4890,
    tags: [
      { name: 'logo', slug: 'logo', color: 'sky' },
      { name: 'mikro', slug: 'mikro', color: 'blue' },
      { name: 'erp', slug: 'erp', color: 'emerald' },
      { name: 'muhasebe', slug: 'muhasebe', color: 'purple' }
    ],
    posts: [
      {
        authorId: 'u_dev_emre',
        content: `### Logo ve Mikro ERP Kullanan Satıcılar İçin Otomatik Fatura ve Stok Köprüsü

Günde 100+ sipariş alan işletmelerin siparişleri elle ERP'ye girmesi zaman kaybı ve fatura hatalarına neden olur.

Pazaryonetimi ERP Connector ile:
1. Pazaryerinden gelen sipariş için otomatik Cari Kart açılır (TC Kimlik / Vergi No ile).
2. Satış faturası e-Arşiv / e-Fatura olarak Logo/Mikro'da anında oluşturulur.
3. İade irsaliyeleri depoya ulaştığı anda muhasebe kaydına ters kayıt olarak işlenir.
4. KDV oranları (%1, %10, %20) kategori bazında hatasız eşleşir.`,
      },
      {
        authorId: 'u_mali_musavir',
        content: `ERP entegrasyonu sayesinde ay sonu pazaryeri mutabakatları dakikalar içinde tamamlanıyor. Fatura numarası ile pazaryeri sipariş numarasının eşleşmesi vergi denetimlerinde tam koruma sağlıyor.`,
        isBestAnswer: true,
      }
    ]
  },

  // 23. N11 & Çiçeksepeti Satış Artırma (b8)
  {
    id: 'topic-23',
    title: 'N11 Pro ve Çiçeksepeti Pazaryerinde Satışları Artırma Taktikleri',
    slug: 'n11-pro-ve-ciceksepeti-pazaryerinde-satislari-artirma-taktikleri',
    boardId: 'b8',
    authorId: 'u_hepsiburada_uzman',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 3980,
    tags: [
      { name: 'n11', slug: 'n11', color: 'red' },
      { name: 'ciceksepeti', slug: 'ciceksepeti', color: 'pink' },
      { name: 'pazaryeri', slug: 'pazaryeri', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_hepsiburada_uzman',
        content: `### N11 ve Çiçeksepeti Ekosisteminde Öne Çıkma Stratejileri

Trendyol ve Hepsiburada dışındaki pazaryerleri doğru stratejiyle toplam cironuzun %30'unu oluşturabilir.

* **N11 Kupon ve Uçan Kupon Kampanyaları:** N11 kullanıcıları kupon odaklıdır. Mağaza takip kuponu tanımlamak geri dönüş oranını %25 artırır.
* **Çiçeksepeti Aynı Gün Teslimat:** Çiçeksepeti Extra pazarında hediye ve kişiselleştirilebilir ürünlerde aynı gün kargo rozeti satışları 3 katına çıkarır.`,
      },
      {
        authorId: 'u_dropship_baris',
        content: `Çiçeksepeti'nde kategori onay süreleri eskisine göre çok daha hızlandı. Özellikle hediyelik eşya ve takı kategorisinde rekabet Trendyol'a göre daha sakin ve kâr marjları daha tatmin edici.`,
      }
    ]
  },

  // 24. Desi Optimizasyonu & Kargo Maliyetleri (b15)
  {
    id: 'topic-24',
    title: 'Kargo Maliyetlerini Düşürme Sanatı: Desi Optimizasyonu ve Özel Koli Tasarımı',
    slug: 'kargo-maliyetlerini-dusurme-sanati-desi-optimizasyonu-ve-ozel-koli-tasarimi',
    boardId: 'b15',
    authorId: 'u_lojistik_mert',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 5820,
    tags: [
      { name: 'kargo', slug: 'kargo', color: 'blue' },
      { name: 'desi', slug: 'desi', color: 'green' },
      { name: 'paketleme', slug: 'paketleme', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_lojistik_mert',
        content: `### 1 Desi Fark Yılda 150.000 TL Kâr Demektir!

Ayda 5.000 kargo çıkaran bir mağaza için 1 desilik tasarrufun yıllık getirisi:
\`\`\`text
5.000 kargo x 2.50 TL desi farkı x 12 ay = 150.000 TL NET TASARRUF!
\`\`\`

#### Desi Düşürme Taktikleri:
1. Standart hazır kutu yerine ürün boyutuna tam oturan kilitli özel e-ticaret kutusu yaptırın.
2. Ağır patpat poşetler yerine hafif petek dolgu kağıdı (Honeycomb paper) kullanın.
3. Tekstil ürünlerinde vakumlu poşetleme yaparak 4 desilik ürünü 1.5 desiye indirin.`,
      },
      {
        authorId: 'u_kobi_ayse',
        content: `Tekstil ürünlerimizde vakum makinesine geçtik, ortalama 3.5 desi çıkan yorgan ve battaniyeler 1.8 desiye düştü. Kargo faturamız bir ayda %30 hafifledi! Kesinlikle tavsiye ederim.`,
      }
    ]
  },

  // 25. Almanya & Avrupa LUCID ve OSS (STICKY, b12)
  {
    id: 'topic-25',
    title: 'Almanya ve Avrupa\'ya E-İhracat: VAT, OSS ve LUCID Ambalaj Lisansı Zorunluluğu',
    slug: 'almanya-ve-avrupa-ya-e-ihracat-vat-oss-ve-lucid-ambalaj-lisansi-zorunlulugu',
    boardId: 'b12',
    authorId: 'u_amazon_fba_lead',
    type: 'STICKY',
    status: 'OPEN',
    viewCount: 6410,
    tags: [
      { name: 'almanya', slug: 'almanya', color: 'yellow' },
      { name: 'avrupa', slug: 'avrupa', color: 'blue' },
      { name: 'lucid', slug: 'lucid', color: 'emerald' },
      { name: 'e-ihracat', slug: 'e-ihracat', color: 'purple' }
    ],
    posts: [
      {
        authorId: 'u_amazon_fba_lead',
        content: `### Avrupa Birliği ve Almanya Satışlarında Yasal Uyumluluk Kılavuzu

Amazon.de, Etsy veya kendi sitenizden Almanya'ya kargo gönderiyorsanız **LUCID Ambalaj Yasası** kaydı yaptırmanız zorunludur.

* **LUCID Kaydı:** ZSVR portalından ücretsiz kayıt olunur ve Lizenzero gibi lisans sağlayıcılarından yıllık ambalaj kotası (karton, plastik) satın alınır. Kayıt numarası Amazon ve Etsy'ye girilmezse mağaza Almanya satışına kapatılır.
* **One Stop Shop (OSS):** Avrupa Birliği içinde yıllık 10.000 € üzerinde satış yapıyorsanız tüm AB ülkelerinin KDV'sini tek bir beyanname ile OSS üzerinden beyan edebilirsiniz.`,
      },
      {
        authorId: 'u_mali_musavir',
        content: `Can Bey çok doğru belirtmiş. LUCID lisansı yıllık sadece 30-40 Euro civarındadır ve lisanssız satış yapmanın cezası 200.000 Euro'ya kadar çıkabilmektedir. İhmal edilmemelidir.`,
      }
    ]
  },

  // 26. 0'dan 100K Ciroya Yol Haritası (b3)
  {
    id: 'topic-26',
    title: 'Yeni Başlayanlar İçin 0\'dan 100.000 TL Aylık Ciroya Ulaşma Yol Haritası',
    slug: 'yeni-baslayanlar-icin-0-dan-100-000-tl-aylik-ciroya-ulasma-yol-haritasi',
    boardId: 'b3',
    authorId: 'u_trendyol_pro',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 9870,
    tags: [
      { name: 'tanisma', slug: 'tanisma', color: 'teal' },
      { name: 'yenisatici', slug: 'yenisatici', color: 'green' },
      { name: 'rehber', slug: 'rehber', color: 'blue' },
      { name: 'ciro', slug: 'ciro', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_trendyol_pro',
        content: `### 90 Günlük E-Ticaret Büyüme Planı

E-ticarete yeni adım atan bir girişimcinin ilk 3 ayda izlemesi gereken en verimli yol haritası:

* **1 - 30. Gün (Temel & Ürün):** Şahıs şirketi kuruluşu (Genç girişimci), niş ve hafif (düşük desi) 5-10 ürün seçimi, profesyonel beyaz fon görsel çekimleri.
* **31 - 60. Gün (Pazaryeri & Puan):** Trendyol ve Hepsiburada mağaza açılışı, ilk siparişlerde hızlı teslimat ile 9.8 satıcı puanına oturma, ilk 20 organik yorumu toplama.
* **61 - 90. Gün (Otomasyon & Reklam):** Pazaryonetimi entegrasyonu ile otomatik stok senkronizasyonu, Dinamik Repricer ile Buybox hakimiyeti ve günlük 150-200 TL hedefli sponsorlu ürün reklamları.

Başarı tesadüf değil, doğru süreç yönetimidir!`,
      },
      {
        authorId: 'u_yeni_satici_tolga',
        content: `Bu rehber benim gibi yeni başlayanlar için pusula niteliğinde oldu. 2. ayımdayım ve 60. gün hedeflerini tamamladım. Ciro hedefime hızla yaklaşıyorum.`,
      }
    ]
  },

  // 27. AI Destekli Ürün Açıklaması ve Görsel (b23)
  {
    id: 'topic-27',
    title: 'Yapay Zeka (AI) ile SEO Uyumlu Ürün Açıklaması ve Görsel Oluşturma Kılavuzu',
    slug: 'yapay-zeka-ai-ile-seo-uyumlu-urun-aciklamasi-ve-gorsel-olusturma-kilavuzu',
    boardId: 'b23',
    authorId: 'u_seo_elif',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 5740,
    tags: [
      { name: 'yapayzeka', slug: 'yapayzeka', color: 'indigo' },
      { name: 'ai', slug: 'ai', color: 'purple' },
      { name: 'urunaciklamasi', slug: 'urunaciklamasi', color: 'blue' }
    ],
    posts: [
      {
        authorId: 'u_seo_elif',
        content: `### 100 Ürünün SEO Açıklamasını 5 Dakikada Hazırlamak

Yapay zeka modellerini pazaryeri algoritmalarına uyumlu hale getirmek için kullandığımız prompt yapısı:

\`\`\`text
Rol: Türkiye e-ticaret pazaryerleri için uzman SEO içerik yazarı.
Ürün: Termos Çelik 500ml Çift Katmanlı Sızdırmaz
Hedef Kitle: Kampçılar, öğrenciler, ofis çalışanları
İstenen Format:
1. Çarpıcı 1 cümlelik giriş
2. 5 maddelik madde imli teknik özellikler (Kullanım kolaylığı, yalıtım süresi)
3. 3 adet sıkça sorulan soru ve cevabı
4. 5 adet yüksek hacimli arama anahtar kelimesi
\`\`\`

Pazaryonetimi'nin dahili AI modülü bu yapıyı tek tıkla toplu olarak tüm ürünlerinize uyguluyor.`,
      },
      {
        authorId: 'u_dropship_baris',
        content: `Tedarikçiden gelen ham ve eksik ürün açıklamalarını AI aracıyla zenginleştirdikten sonra ürünlerimizin aramalardaki sıralaması çok hızlı yükseldi.`,
      }
    ]
  },

  // 28. Olumsuz Yorumları 5 Yıldıza Çevirme (SOLVED, b7)
  {
    id: 'topic-28',
    title: 'E-Ticarette Müşteri İletişimi ve Olumsuz Yorumları 5 Yıldıza Çevirme Rehberi',
    slug: 'e-ticarette-musteri-iletisimi-ve-olumsuz-yorumlari-5-yildiza-cevirme-rehberi',
    boardId: 'b7',
    authorId: 'u_hepsiburada_uzman',
    type: 'NORMAL',
    status: 'SOLVED',
    viewCount: 4950,
    tags: [
      { name: 'musterimemnuniyeti', slug: 'musterimemnuniyeti', color: 'green' },
      { name: 'yorum', slug: 'yorum', color: 'yellow' },
      { name: 'puan', slug: 'puan', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_hepsiburada_uzman',
        content: `### 1 Yıldızlı Yorumları Telafi Etme Sanatı

Kargoda hasar gören veya müşterinin beklentisini karşılamayan bir ürün için gelen 1 yıldızlı yorum satışı anında %50 düşürebilir.

#### İyileştirme Adımları:
1. Müşteriye derhal pazaryeri mesajlaşma paneli üzerinden nazik bir özür mesajı iletin.
2. "Ürünü iade etmekle uğraşmayın, adınıza yeni ve kontrol edilmiş ürünü ücretsiz kargoladık" yaklaşımı müşteriyi şaşırtır.
3. Sorun çözüldükten sonra "Memnun kaldıysanız yorumunuzu güncellemeniz bizi çok mutlu eder" ricasında bulunun.

Bu yöntemle olumsuz yorumların **%65'i 5 yıldıza dönüştürülmektedir**.`,
      },
      {
        authorId: 'u_kobi_ayse',
        content: `Geçen ay kırık fincan giden müşteriye anında yenisini hediye kahve paketiyle gönderdik. Müşteri 1 yıldızlı yorumunu silip "Böyle ilgili bir satıcı görmedim, 10 yıldız olsa verirdim" diye güncelledi. Müşteri memnuniyeti en iyi reklamdır!`,
        isBestAnswer: true,
      }
    ]
  },

  // 29. Ürün Fotoğraf Çekimi & İnfografik (b20)
  {
    id: 'topic-29',
    title: 'Pazaryerlerinde Ürün Fotoğrafı Çekimi ve Görsel Optimizasyonu Rehberi',
    slug: 'pazaryerlerinde-urun-fotografi-cekimi-ve-gorsel-optimizasyonu-rehberi',
    boardId: 'b20',
    authorId: 'u_seo_elif',
    type: 'NORMAL',
    status: 'OPEN',
    viewCount: 5210,
    tags: [
      { name: 'fotograf', slug: 'fotograf', color: 'violet' },
      { name: 'gorsel', slug: 'gorsel', color: 'pink' },
      { name: 'donusum', slug: 'donusum', color: 'blue' }
    ],
    posts: [
      {
        authorId: 'u_seo_elif',
        content: `### Telefonla Stüdyo Kalitesinde Ürün Görseli Çekme İpuçları

Pazaryerinde müşteriler ürüne dokunamaz, ürünü görseline bakarak satın alır.

#### Başarılı Görsel Seti (Minimum 5 Görsel):
1. **Ana Görsel:** %100 saf beyaz fon (#FFFFFF), ürün kareyi %85 oranında doldurmalı, gölgesiz ve net.
2. **Ölçü / Boyut İnfografiği:** Ürünün eni, boyu ve hacmini gösteren ok işaretli infografik.
3. **Kullanım Alanı (Lifestyle):** Ürünü gerçek hayat ortamında gösteren fotoğraf.
4. **Detay / Kumaş / Dikiş Yakın Çekimi:** Kalite hissini aktaran makro çekim.
5. **Paket İçeriği Görseli:** Müşterinin eline ne geçeceğini net gösteren görsel.`,
      },
      {
        authorId: 'u_yeni_satici_tolga',
        content: `İnfografik görsel ekledikten sonra "Beden / Boyut küçük geldi" gerekçeli iadelerimiz neredeyse sıfıra indi. Harika bir tespit!`,
      }
    ]
  },

  // 30. 2025 E-Ticaret Raporu & Trendler (STICKY, ANNOUNCEMENT, b1)
  {
    id: 'topic-30',
    title: 'Pazaryonetimi 2025 Yıllık E-Ticaret Trendleri ve Satıcı Başarı Raporu',
    slug: 'pazaryonetimi-2025-yillik-e-ticaret-trendleri-ve-satici-basari-raporu',
    boardId: 'b1',
    authorId: 'u_admin',
    type: 'STICKY',
    status: 'OPEN',
    viewCount: 14500,
    tags: [
      { name: 'trendler', slug: 'trendler', color: 'blue' },
      { name: '2025', slug: '2025', color: 'purple' },
      { name: 'rapor', slug: 'rapor', color: 'emerald' },
      { name: 'analiz', slug: 'analiz', color: 'orange' }
    ],
    posts: [
      {
        authorId: 'u_admin',
        content: `### Türkiye ve Global Pazaryerleri 2025 Satıcı Trendleri Raporu

Pazaryonetimi platformundaki 10.000'den fazla aktif mağazanın anonim verileriyle hazırlanan yıllık büyüme raporu özeti:

#### Öne Çıkan Başlıklar:
* **En Çok Büyüyen Kategoriler:**
  1. Evcil Hayvan Ürünleri (+%115)
  2. Oto Bakım & Aksesuar (+%92)
  3. Ev & Mutfak Düzenleme (+%78)
  4. Doğal Kozmetik & Kişisel Bakım (+%65)
* **Otomasyonun Gücü:** Dinamik Repricer ve Çoklu Depo Entegrasyonu kullanan satıcılar, manuel yöneten satıcılara kıyasla **%42 daha yüksek kâr marjı** elde etti.
* **E-İhracatın Payı:** Mikro ihracat yapan mağazaların ortalama sipariş başı kârlılığı Türkiye içi satışlara kıyasla **3.2 kat** daha yüksek gerçekleşti.

Tüm satıcılarımıza bol kazançlı ve başarılı bir yıl dileriz!`,
      },
      {
        authorId: 'u_trendyol_pro',
        content: `Rapor için emeği geçenlere teşekkürler. Çok kanallı satış ve otomasyon gerçekten fark yaratıyor. 2025'te hedefimiz mikro ihracat payımızı %40'a çıkarmak.`,
      },
      {
        authorId: 'u_mod_ahmet',
        content: `Yeni yılda tüm üyelerimizle birlikte büyümeye ve forumumuzda tecrübeleri paylaşmaya devam edeceğiz!`,
      }
    ]
  }
];

// ============================================================================
// 6. MAIN SEED FONKSİYONU
// ============================================================================

export const FORUM_USER_GROUPS = userGroups;
export const FORUM_USERS = forumUsers;
export const FORUM_CATEGORIES = categories;
export const FORUM_BOARDS = boards;
export const FORUM_DETAILED_TOPICS = detailedTopics;

// Lookup Maps for high performance O(1) retrieval
export const FORUM_USERS_MAP = new Map<string, ForumUserSeed>(
  forumUsers.map((u) => [u.id, u])
);

export const FORUM_BOARDS_MAP = new Map<string, ForumBoardSeed>(
  boards.map((b) => [b.id, b])
);

export const FORUM_BOARDS_BY_SLUG = new Map<string, ForumBoardSeed>(
  boards.map((b) => [b.slug, b])
);

export const FORUM_CATEGORIES_MAP = new Map<string, ForumCategorySeed>(
  categories.map((c) => [c.id, c])
);

export const FORUM_TOPICS_BY_SLUG = new Map<string, ForumTopicSeed>(
  detailedTopics.map((t) => [t.slug, t])
);

export const FORUM_TOPICS_BY_ID = new Map<string, ForumTopicSeed>(
  detailedTopics.map((t) => [t.id, t])
);
