import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SolutionDetailView from '@/components/pages/SolutionDetailView';

// ─── Solution Definitions ─────────────────────────────
const solutions: Record<string, {
    title: string;
    metaTitle: string;
    metaDescription: string;
    heroTitle: string;
    heroSubtitle: string;
    gradient: string;
    icon: string;
    stats: { label: string; value: string }[];
    features: { title: string; description: string; icon: string }[];
    benefits: string[];
    testimonial?: { quote: string; author: string; company: string; avatar: string };
    faq: { q: string; a: string }[];
}> = {
    moda: {
        title: 'Moda & Tekstil',
        metaTitle: 'Moda & Tekstil Çözümleri | Pazaryonetimi',
        metaDescription: 'Moda sektörüne özel varyant, beden ve renk yönetimi. Trendyol, Hepsiburada entegrasyonu ile tekstil e-ticaretinizi büyütün.',
        heroTitle: 'Moda & Tekstil\nE-ticaretinde Devrim',
        heroSubtitle: 'Varyant, beden ve renk kombinasyonlarını tek merkezden yönetin. Sezon planlaması ve stok optimizasyonu ile kayıpları minimuma indirin.',
        gradient: 'from-pink-600 via-rose-600 to-red-600',
        icon: '👗',
        stats: [
            { label: 'Varyant Desteği', value: '∞' },
            { label: 'SKU Yönetimi', value: '100K+' },
            { label: 'Stok Doğruluğu', value: '%99.8' },
            { label: 'Dönüşüm Artışı', value: '%45' },
        ],
        features: [
            { title: 'Beden & Renk Matrisi', description: 'Sınırsız varyant kombinasyonu oluşturun. XS-5XL beden aralığı, renk kodları ve ürün görselleri otomatik eşleşsin.', icon: '📐' },
            { title: 'Sezon Yönetimi', description: 'İlkbahar/Yaz ve Sonbahar/Kış koleksiyonlarınızı planlayın. Sezon sonu indirimleri otomatik uygulansın.', icon: '🗓️' },
            { title: 'Görsel Optimizasyonu', description: 'Ürün fotoğraflarınızı her pazaryerinin formatına otomatik uyarlayın. Manken, flatlay ve detay görselleri ayrı yönetin.', icon: '📸' },
            { title: 'İade & Değişim', description: 'Beden değişimi ve iade süreçlerini otomatikleştirin. Müşteri memnuniyetini artırın, operasyonel yükü azaltın.', icon: '🔄' },
            { title: 'Trend Analizi', description: 'AI destekli trend tahminleri ile hangi ürünlerin popüler olacağını önceden bilin. Stok planlamasını optimize edin.', icon: '📈' },
            { title: 'Çoklu Pazaryeri Listele', description: 'Tek tıkla Trendyol, Hepsiburada, N11 ve Amazon\'da ürünlerinizi listeleyin. Fiyat ve stok otomatik senkronize olsun.', icon: '🌐' },
        ],
        benefits: [
            'Varyant yönetiminde %80 zaman tasarrufu',
            'Stok tutarsızlığında %95 azalma',
            'Sezon sonu fire oranlarında %60 düşüş',
            'Ürün listeleme süresinde %70 kısalma',
            'İade süreçlerinde %50 hızlanma',
        ],
        testimonial: {
            quote: 'Pazaryonetimi ile 5000+ SKU\'yu tek panelden yönetiyoruz. Beden ve renk varyantları artık sorun olmaktan çıktı.',
            author: 'Ayşe Yılmaz',
            company: 'ModaLine Tekstil',
            avatar: 'AY',
        },
        faq: [
            { q: 'Kaç farklı beden ve renk kombinasyonu destekleniyor?', a: 'Sınırsız varyant kombinasyonu oluşturabilirsiniz. Sistem, beden-renk matrisi ile otomatik SKU üretir.' },
            { q: 'Sezon yönetimi nasıl çalışıyor?', a: 'Koleksiyonlarınızı tarih aralığına göre gruplayabilir, sezon sonu indirimlerini otomatik planlayabilirsiniz.' },
            { q: 'Görsel boyutları otomatik ayarlanıyor mu?', a: 'Evet! Her pazaryerinin gerektirdiği boyut ve formata göre otomatik resize ve crop yapılır.' },
        ],
    },
    elektronik: {
        title: 'Elektronik',
        metaTitle: 'Elektronik Çözümleri | Pazaryonetimi',
        metaDescription: 'Elektronik ürün satışına özel garanti takibi, seri numara yönetimi ve teknik özellik listeleme çözümleri.',
        heroTitle: 'Elektronik Ürün\nSatışında Mükemmellik',
        heroSubtitle: 'Garanti belgesi, seri numara takibi ve teknik özellik yönetimi ile elektronik e-ticaretinizi profesyonelleştirin.',
        gradient: 'from-blue-600 via-cyan-600 to-teal-600',
        icon: '💻',
        stats: [
            { label: 'Garanti Takibi', value: 'Otomatik' },
            { label: 'Seri No Yönetimi', value: 'Tam' },
            { label: 'Müşteri Memnuniyeti', value: '%98' },
            { label: 'İade Azalması', value: '%35' },
        ],
        features: [
            { title: 'Garanti Belgesi Yönetimi', description: 'Her ürüne otomatik garanti belgesi atayın. Garanti süreleri takip edilsin, müşteriye otomatik bildirim gitsin.', icon: '🛡️' },
            { title: 'Seri Numara Takibi', description: 'Her ürünün seri numarasını kaydedin. IMEI, MAC adresi gibi tanımlayıcıları sipariş ile eşleştirin.', icon: '🔢' },
            { title: 'Teknik Özellik Şablonları', description: 'Her kategori için önceden tanımlı teknik özellik şablonları. RAM, işlemci, ekran boyutu gibi alanlar otomatik dolsun.', icon: '📋' },
            { title: 'Uyumluluk Kontrolü', description: 'Aksesuar ve yedek parça uyumluluk matrisi. Müşterilere doğru ürün önerileri sunun.', icon: '🔗' },
            { title: 'Fiyat İzleme', description: 'Rakip fiyatlarını gerçek zamanlı takip edin. Dinamik fiyatlandırma ile rekabet avantajı sağlayın.', icon: '💰' },
            { title: 'Teknik Destek Entegrasyonu', description: 'Ürün bazlı teknik destek talepleri yönetin. SSS ve troubleshooting rehberlerini ürüne bağlayın.', icon: '🎧' },
        ],
        benefits: [
            'Garanti süreç yönetiminde %90 otomasyon',
            'Seri no takibi ile sahtecilik önleme',
            'Teknik özellik listeleme süresinde %75 kısalma',
            'Uyumlu aksesuar önerileriyle cross-sell %40 artış',
            'Teknik destek taleplerine %60 daha hızlı yanıt',
        ],
        faq: [
            { q: 'Garanti takip sistemi nasıl çalışıyor?', a: 'Her satış sonrası otomatik garanti kaydı oluşturulur. Bitiş tarihi yaklaşınca müşteriye bildirim gider.' },
            { q: 'Seri numara yönetimi hangi pazaryerlerini destekliyor?', a: 'Trendyol, Hepsiburada, Amazon ve N11 dahil tüm entegre pazaryerlerinde seri no eşleştirmesi yapılır.' },
            { q: 'Teknik özellik şablonları özelleştirilebilir mi?', a: 'Evet, her kategori için kendi şablonunuzu oluşturabilir veya hazır şablonları düzenleyebilirsiniz.' },
        ],
    },
    kozmetik: {
        title: 'Kozmetik',
        metaTitle: 'Kozmetik Çözümleri | Pazaryonetimi',
        metaDescription: 'Kozmetik sektörüne özel SKT takibi, parti numarası yönetimi ve içerik bilgisi listeleme çözümleri.',
        heroTitle: 'Kozmetik & Güzellik\nSektörüne Özel Çözümler',
        heroSubtitle: 'Son kullanma tarihi, parti numarası ve INCI içerik listesi yönetimi ile kozmetik e-ticaretinizi güvenli ve verimli hale getirin.',
        gradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
        icon: '💄',
        stats: [
            { label: 'SKT Takibi', value: 'Otomatik' },
            { label: 'Parti Yönetimi', value: 'FIFO' },
            { label: 'Düzenleyici Uyum', value: '%100' },
            { label: 'Fire Azalması', value: '%70' },
        ],
        features: [
            { title: 'Son Kullanma Tarihi (SKT)', description: 'Her parti için SKT takibi yapın. Süresi yaklaşan ürünleri otomatik öne çıkarın veya indrime alın.', icon: '📅' },
            { title: 'Parti Numarası Yönetimi', description: 'Lot/batch takibi ile hangi partiden kaç ürün kaldığını bilin. Kalite sorunlarında hızlı geri çağırma yapın.', icon: '🏷️' },
            { title: 'INCI İçerik Listesi', description: 'Kozmetik ürünlerinizin içerik bilgilerini uluslararası INCI standardına uygun listeleyin.', icon: '🧪' },
            { title: 'Alerjen Uyarıları', description: 'Ürünlerdeki alerjen maddeleri otomatik etiketleyin. Yasal uyumluluk sağlayın.', icon: '⚠️' },
            { title: 'FIFO Stok Yönetimi', description: 'İlk giren ilk çıkar prensibi ile en eski stokların önce satılmasını sağlayın. Fire oranını minimuma indirin.', icon: '📦' },
            { title: 'Sertifika Yönetimi', description: 'Vegan, cruelty-free, organik gibi sertifikalarınızı ürünlere bağlayın. Güven odaklı satış yapın.', icon: '✅' },
        ],
        benefits: [
            'SKT öncesi ürün eritmede %85 başarı',
            'Parti takibi ile geri çağırma süresinde %90 kısalma',
            'Düzenleyici cezalardan tam koruma',
            'FIFO ile fire oranında %70 düşüş',
            'Sertifika gösterimi ile dönüşüm oranında %25 artış',
        ],
        faq: [
            { q: 'SKT yaklaşan ürünler için otomatik indirim uygulanabilir mi?', a: 'Evet, belirli gün kala otomatik fiyat düşürme veya kampanya oluşturma kuralları tanımlayabilirsiniz.' },
            { q: 'INCI listesi nasıl ekleniyor?', a: 'Ürün bilgilerine özel bir alan olarak eklenir ve tüm pazaryerlerinde otomatik gösterilir.' },
            { q: 'Parti takibi tüm pazaryerlerinde çalışıyor mu?', a: 'Evet, depo yönetim sistemiyle entegre çalışır ve hangi pazaryerine hangi parti gönderildiği takip edilir.' },
        ],
    },
    gida: {
        title: 'Gıda',
        metaTitle: 'Gıda Çözümleri | Pazaryonetimi',
        metaDescription: 'Gıda sektörüne özel soğuk zincir takibi, FIFO stok yönetimi ve besin değeri listeleme çözümleri.',
        heroTitle: 'Gıda E-ticaretinde\nGüvenli Çözümler',
        heroSubtitle: 'Soğuk zincir takibi, FIFO envanter yönetimi ve besin değeri bilgileri ile gıda e-ticaretinizi güvenli ve verimli yönetin.',
        gradient: 'from-green-600 via-emerald-600 to-teal-600',
        icon: '🍎',
        stats: [
            { label: 'Soğuk Zincir', value: 'IoT Entegre' },
            { label: 'FIFO Yönetimi', value: 'Otomatik' },
            { label: 'Gıda Güvenliği', value: '%100' },
            { label: 'İsraf Azalması', value: '%65' },
        ],
        features: [
            { title: 'Soğuk Zincir Takibi', description: 'IoT sensörleri ile depo ve kargo sıcaklığını gerçek zamanlı izleyin. Sapma olduğunda anında alarm alın.', icon: '🌡️' },
            { title: 'FIFO Envanter', description: 'İlk giren ilk çıkar prensibi ile raf ömrü en kısa ürünlerin öncelikli satılmasını garanti edin.', icon: '📦' },
            { title: 'Besin Değeri Bilgisi', description: 'Kalori, protein, yağ gibi besin değerlerini ürün sayfalarında otomatik gösterin.', icon: '🥗' },
            { title: 'Alerjen Yönetimi', description: 'Gluten, laktoz, fıstık gibi alerjen bilgilerini belirgin şekilde etiketleyin.', icon: '🏷️' },
            { title: 'Kargo Optimizasyonu', description: 'Soğuk zincir kargo firmalarıyla entegrasyon. Teslimat süresini gıda güvenliğine göre optimize edin.', icon: '🚚' },
            { title: 'Düzenleyici Uyum', description: 'Tarım Bakanlığı ve gıda güvenliği yönetmeliklerine uygunluk kontrolü.', icon: '📋' },
        ],
        benefits: [
            'Gıda israfında %65 azalma',
            'Soğuk zincir kırılması sıfır tolerans',
            'Yasal uyumluluk için otomatik kontrol',
            'Kargo süresinde %30 iyileştirme',
            'Müşteri güveninde %40 artış',
        ],
        faq: [
            { q: 'Soğuk zincir takibi hangi sensörleri destekliyor?', a: 'Bluetooth, WiFi ve LoRa tabanlı IoT sıcaklık sensörleri desteklenmektedir. Popüler marka entegrasyonları hazırdır.' },
            { q: 'FIFO sistemi otomatik mi çalışıyor?', a: 'Evet, parti girişi yapıldığında sistem otomatik olarak tarihe göre sıralama yapar ve öncelikli satışı yönlendirir.' },
            { q: 'Besin değeri bilgileri nereden alınıyor?', a: 'Manuel giriş yapabilir veya barkod tarama ile veritabanından otomatik çekebilirsiniz.' },
        ],
    },
    dropshipping: {
        title: 'Dropshipping',
        metaTitle: 'Dropshipping Çözümleri | Pazaryonetimi',
        metaDescription: 'Dropshipping iş modeline özel tedarikçi entegrasyonu, otomatik sipariş yönlendirme ve stok senkronizasyonu.',
        heroTitle: 'Dropshipping İçin\nUçtan Uca Çözüm',
        heroSubtitle: 'Tedarikçi entegrasyonu, otomatik sipariş yönlendirme ve gerçek zamanlı stok senkronizasyonu ile dropshipping operasyonunuzu otomatikleştirin.',
        gradient: 'from-orange-600 via-amber-600 to-yellow-600',
        icon: '🚀',
        stats: [
            { label: 'Tedarikçi Entegrasyonu', value: '200+' },
            { label: 'Sipariş Otomasyonu', value: '%100' },
            { label: 'Stok Güncelleme', value: 'Anlık' },
            { label: 'Kâr Artışı', value: '%55' },
        ],
        features: [
            { title: 'Tedarikçi Portalı', description: 'Tedarikçilerinizi sisteme davet edin. Ürün, stok ve fiyat bilgilerini otomatik çekin.', icon: '🤝' },
            { title: 'Otomatik Sipariş Yönlendirme', description: 'Müşteri siparişi geldiğinde otomatik olarak tedarikçiye iletilsin. Manuel işlem sıfır.', icon: '🔄' },
            { title: 'Kar Marjı Hesaplama', description: 'Tedarikçi maliyeti, kargo ve komisyonları otomatik hesaplayın. Net kar marjınızı anlık görün.', icon: '💰' },
            { title: 'Çoklu Tedarikçi', description: 'Aynı ürün için birden fazla tedarikçi tanımlayın. En uygun fiyat ve stok durumuna göre otomatik yönlendirme.', icon: '🏭' },
            { title: 'Kargo Takip Senkronizasyonu', description: 'Tedarikçiden gelen kargo takip numarasını otomatik olarak müşteriye ve pazaryerine iletin.', icon: '📍' },
            { title: 'Performans Analizi', description: 'Tedarikçi bazında teslimat süresi, kalite ve iade oranlarını analiz edin.', icon: '📊' },
        ],
        benefits: [
            'Sipariş işleme süresinde %95 otomasyon',
            'Stok tutarsızlığında %99 azalma',
            'Çoklu tedarikçi ile %30 maliyet optimizasyonu',
            'Kargo takip aktarımında %100 otomasyon',
            'Tedarikçi iletişiminde %80 zaman tasarrufu',
        ],
        faq: [
            { q: 'Tedarikçi entegrasyonu nasıl yapılıyor?', a: 'API, XML feed veya manuel portal üzerinden. Tedarikçinize özel portal oluşturabilirsiniz.' },
            { q: 'Sipariş otomatik mı yönlendiriliyor?', a: 'Evet, kurallara göre (en ucuz, en hızlı, stokta olan) otomatik tedarikçi seçimi ve sipariş iletimi yapılır.' },
            { q: 'Birden fazla tedarikçi ile çalışabilir miyim?', a: 'Evet, aynı ürün için sınırsız tedarikçi tanımlayabilir ve otomatik yönlendirme kuralları belirleyebilirsiniz.' },
        ],
    },
    brand: {
        title: 'Marka Satıcısı',
        metaTitle: 'Marka Satıcısı Çözümleri | Pazaryonetimi',
        metaDescription: 'Tek marka çok kanal stratejisi ile markanızı tüm pazaryerlerinde tutarlı şekilde yönetin.',
        heroTitle: 'Markanızı Her Kanalda\nTutarlı Yönetin',
        heroSubtitle: 'Marka bütünlüğünüzü koruyarak tüm pazaryerlerinde aynı kalite ve tutarlılıkta satış yapın. Çok kanallı marka stratejinizi güçlendirin.',
        gradient: 'from-amber-600 via-orange-600 to-red-600',
        icon: '🏅',
        stats: [
            { label: 'Kanal Desteği', value: '15+' },
            { label: 'Marka Tutarlılığı', value: '%100' },
            { label: 'Satış Artışı', value: '%60' },
            { label: 'Marka Bilinirliği', value: '3x' },
        ],
        features: [
            { title: 'Marka Kılavuzu Yönetimi', description: 'Logo, renk paleti, tipografi ve ton kurallarınızı tanımlayın. Tüm listelerde tutarlılık sağlayın.', icon: '🎨' },
            { title: 'İçerik Senkronizasyonu', description: 'Ürün açıklamaları, görseller ve A+ içerikleri tek merkezden yönetin. Tüm kanallara otomatik dağıtın.', icon: '📝' },
            { title: 'Fiyat Tutarlılığı', description: 'MAP (Minimum Advertised Price) politikanızı tüm kanallarda otomatik uygulayın.', icon: '💎' },
            { title: 'Yetkisiz Satıcı Tespiti', description: 'Markanızı izinsiz satan kişileri tespit edin. Otomatik uyarı ve raporlama sistemi.', icon: '🔍' },
            { title: 'Kampanya Koordinasyonu', description: 'Tüm kanallarda eşzamanlı kampanya başlatın. Tutarlı indirim ve promosyon yönetimi.', icon: '📢' },
            { title: 'Marka Performans Raporu', description: 'Kanal bazında marka performansı, bilinirlik ve satış verilerini tek dashboard\'da görün.', icon: '📊' },
        ],
        benefits: [
            'Çok kanallı içerik yönetiminde %85 zaman tasarrufu',
            'Fiyat tutarlılığında %100 kontrol',
            'Yetkisiz satıcı tespitinde %90 başarı',
            'Kampanya koordinasyonunda %70 hızlanma',
            'Marka bilinirliğinde 3x artış',
        ],
        faq: [
            { q: 'MAP politikası nasıl uygulanıyor?', a: 'Minimum fiyat kurallarını tanımlarsınız, sistem tüm kanallarda otomatik kontrol eder ve ihlallerde uyarır.' },
            { q: 'Yetkisiz satıcılar nasıl tespit ediliyor?', a: 'AI destekli tarama ile pazaryerlerinde markanızı satan yetkisiz satıcılar otomatik tespit edilir.' },
            { q: 'A+ içerik tüm pazaryerlerinde destekleniyor mu?', a: 'Amazon A+, Trendyol Rich Content ve Hepsiburada Enhanced gibi formatlara otomatik uyarlama yapılır.' },
        ],
    },
    wholesale: {
        title: 'Toptancı',
        metaTitle: 'Toptancı Çözümleri | Pazaryonetimi',
        metaDescription: 'B2B ve B2C satışı birlikte yönetin. Toptan fiyatlandırma, bayi yönetimi ve hacim bazlı indirim çözümleri.',
        heroTitle: 'B2B ve B2C\nBirlikte Yönetin',
        heroSubtitle: 'Toptan ve perakende satışınızı tek platformdan yönetin. Bayi portali, hacim indirimleri ve farklı fiyat listeleri ile toptancılığınızı dijitalleştirin.',
        gradient: 'from-teal-600 via-cyan-600 to-blue-600',
        icon: '🏭',
        stats: [
            { label: 'Fiyat Listesi', value: 'Sınırsız' },
            { label: 'Bayi Yönetimi', value: 'Tam' },
            { label: 'Sipariş Artışı', value: '%75' },
            { label: 'Operasyon Verimliliği', value: '2x' },
        ],
        features: [
            { title: 'Çoklu Fiyat Listesi', description: 'Perakende, toptan, bayi ve özel müşteri fiyat listeleri oluşturun. Otomatik fiyat hesaplama.', icon: '📊' },
            { title: 'Bayi Portalı', description: 'Bayilerinize özel sipariş portali. Stok görüntüleme, sipariş verme ve cari hesap takibi.', icon: '🏪' },
            { title: 'Hacim İndirimleri', description: 'Miktar bazlı kademeli indirim kuralları. 10+ adet %5, 100+ adet %15 gibi otomatik hesaplama.', icon: '📈' },
            { title: 'Teklif Yönetimi', description: 'Müşterilerinize özel teklif hazırlayın. Onay akışı ve takip sistemi.', icon: '📄' },
            { title: 'Cari Hesap', description: 'Bayi ve müşteri bazında cari hesap takibi. Borç-alacak, vade ve ödeme planları.', icon: '💳' },
            { title: 'Minimum Sipariş Tutarı', description: 'Kanal ve müşteri segmentine göre minimum sipariş tutarı veya adeti belirleyin.', icon: '🎯' },
        ],
        benefits: [
            'B2B ve B2C stok yönetiminde tam entegrasyon',
            'Bayi sipariş sürecinde %80 otomasyon',
            'Fiyat yönetiminde %90 zaman tasarrufu',
            'Cari hesap takibinde %100 doğruluk',
            'Teklif sürecinde %60 hızlanma',
        ],
        faq: [
            { q: 'B2B ve B2C stokları ayrı mı yönetiliyor?', a: 'Hayır, tek stok havuzundan her iki kanal beslenir. Kanal bazında stok ayırma kuralları tanımlayabilirsiniz.' },
            { q: 'Bayi portalı mobil uyumlu mu?', a: 'Evet, bayileriniz mobil cihazlardan sipariş verebilir, stok kontrol edebilir ve cari hesaplarını görebilir.' },
            { q: 'Hacim indirimleri otomatik mi uygulanıyor?', a: 'Evet, tanımlanan kurallara göre sepetteki miktar arttıkça indirimler otomatik hesaplanır.' },
        ],
    },
    startup: {
        title: 'Girişimciler',
        metaTitle: 'Girişimci Çözümleri | Pazaryonetimi',
        metaDescription: 'E-ticarete yeni başlayanlar için kolay kurulum, hazır şablonlar ve 7/24 destek.',
        heroTitle: 'Sıfırdan Başlayın,\nHızla Büyüyün',
        heroSubtitle: 'Karmaşık sistemlerle uğraşmadan, kolay kurulum ve kullanım ile e-ticaret dünyasına güçlü bir giriş yapın.',
        gradient: 'from-blue-500 via-cyan-500 to-teal-500',
        icon: '🚀',
        stats: [
            { label: 'Kurulum Süresi', value: '1 Gün' },
            { label: 'Başlangıç Maliyeti', value: '₺0' },
            { label: 'Yeni Girişimci', value: '5K+' },
            { label: 'Destek', value: '7/24' },
        ],
        features: [
            { title: 'Tek Tıkla Bağlantı', description: 'Pazaryeri hesaplarınızı şifrenizle saniyeler içinde bağlayın, ürünlerinizi anında çekin.', icon: '🔌' },
            { title: 'Hazır Ürün Şablonları', description: 'Kategorinize özel hazır başlık ve açıklama şablonlarıyla ürünlerinizi profesyonelce listeleyin.', icon: '📝' },
            { title: 'Otomatik Fiyatlandırma', description: 'Sizin yerinize kar marjınızı hesaplayan başlangıç seviyesi dinamik fiyatlandırma araçları.', icon: '💰' },
            { title: 'Ücretsiz Eğitimler', description: 'E-ticaret akademimiz ile satışlarınızı artırmanın yollarını uzmanlardan öğrenin.', icon: '🎓' },
            { title: 'Kolay Kargo Çözümü', description: 'Anlaşmalı kargo fiyatlarımızdan yararlanın, ek maliyetlerden kurtulun.', icon: '🚚' },
            { title: 'Mobil Uygulama', description: 'Siparişlerinizi ve stoklarınızı her yerden takip edin, anlık bildirim alın.', icon: '📱' },
        ],
        benefits: [
            'E-ticarete başlama bariyerlerini ortadan kaldırın',
            'Minimum bütçeyle maksimum verim alın',
            'Teknik bilgi gerekmeden profesyonel yönetim',
            'Büyüme aşamasında kesintisiz destek',
        ],
        faq: [
            { q: 'Ücretli pakete ne zaman geçmeliyim?', a: 'Hacminiz arttığında ve otomasyon ihtiyacınız yoğunlaştığında dilediğiniz zaman paket yükseltebilirsiniz.' },
            { q: 'Kredi kartı girmek zorunda mıyım?', a: 'Hayır, 14 günlük deneme süresi için kredi kartı bilgileriniz gerekmez.' },
            { q: 'Daha önce hiç e-ticaret yapmadım, yardım eder misiniz?', a: 'Kesinlikle! Başlangıç rehberlerimiz ve destek ekibimiz yolun her adımında yanınızda.' },
        ],
    },
    sme: {
        title: 'KOBİ\'ler',
        metaTitle: 'KOBİ Çözümleri | Pazaryonetimi',
        metaDescription: 'Büyüyen işletmeler için çoklu kanal yönetimi, gelişmiş analitik ve AI destekli otomasyon.',
        heroTitle: 'Operasyonunuzu\nÖlçeklendirin',
        heroSubtitle: 'Satış kanallarınızı artırırken operasyonel yükünüzü azaltın. Veriye dayalı büyüme stratejileri geliştirin.',
        gradient: 'from-purple-500 via-pink-500 to-rose-500',
        icon: '📈',
        stats: [
            { label: 'Verimlilik Artışı', value: '%40' },
            { label: 'Pazaryeri Sayısı', value: '15+' },
            { label: 'Aktif KOBİ', value: '10K+' },
            { label: 'Kar Artışı', value: '+%25' },
        ],
        features: [
            { title: 'Çoklu Kanal Yönetimi', description: 'Tüm pazaryerlerini tek bir merkezden, tam senkronize şekilde yönetin.', icon: '🌐' },
            { title: 'Gelişmiş Stok Takibi', description: 'Depolar arası transfer, rezerv stok ve lot takibi ile envanterinizi kusursuz yönetin.', icon: '📦' },
            { title: 'AI Fiyat Önerileri', description: 'Yapay zeka ile pazar dinamiklerini takip edin, her zaman en karlı fiyatta kalın.', icon: '🤖' },
            { title: 'Rakip Analiz Araçları', description: 'Rakiplerinizin performansını izleyin, stratejik hamlelerinizi verilere dayandırın.', icon: '🔍' },
            { title: 'Özel Rapor Modülü', description: 'İşletmenizin ihtiyacı olan KPI\'ları içeren özel performans dashboardları oluşturun.', icon: '📊' },
            { title: 'API ve Webhook', description: 'Kendi e-ticaret sitenizi veya yerel muhasebe yazılımınızı sisteme entegre edin.', icon: '⚙️' },
        ],
        benefits: [
            'Manuel işlem hatalarını sıfıra indirin',
            'Personel zamanını stratejik işlere yönlendirin',
            'Daha fazla kanalda, daha az eforla satış yapın',
            'Karlılık odaklı büyüme sağlayın',
        ],
        faq: [
            { q: 'Pazaryeri limitleri var mı?', a: 'KOBİ paketlerimizde Türkiye\'deki tüm popüler pazaryerlerini bağlayabilirsiniz.' },
            { q: 'Eğitim veriyor musunuz?', a: 'Evet, ekibinize özel platform kullanım eğitimleri ve danışmanlık hizmeti sunuyoruz.' },
            { q: 'Veri güvenliği nasıl sağlanıyor?', a: 'Tüm verileriniz banka seviyesinde şifreleme ve yedekleme sistemleriyle korunmaktadır.' },
        ],
    },
    enterprise: {
        title: 'Kurumsal',
        metaTitle: 'Kurumsal E-Ticaret Çözümleri | Pazaryonetimi',
        metaDescription: 'Büyük operasyonlar için özel sunucu, SLA garantisi ve dedike hesap yöneticisi.',
        heroTitle: 'Global Operasyonlar İçin\nEnterprise Gücü',
        heroSubtitle: 'Milyonlarca SKU, sınırsız trafik ve en yüksek güvenlik standartları. Büyük ölçekli işletmelerin güvenilir teknoloji ortağı.',
        gradient: 'from-slate-800 via-slate-900 to-black',
        icon: '🏢',
        stats: [
            { label: 'Uptime SLA', value: '%99.99' },
            { label: 'Premium Destek', value: '7/24' },
            { label: 'İşlenen SKU', value: '50M+' },
            { label: 'Tepki Süresi', value: '< 15dk' },
        ],
        features: [
            { title: 'Özel Sunucu Altyapısı', description: 'Size özel tahsis edilmiş, yüksek performanslı ve izole sunucu mimarisi.', icon: '🖥️' },
            { title: 'SSO & IAM Entegrasyonu', description: 'Kurumsal kimlik yönetim sistemlerinizle (Okta, Azure AD vb.) tam entegrasyon.', icon: '🔒' },
            { title: 'Özel AI Model Eğitimi', description: 'Kendi verilerinizle eğitilmiş, size özel yapay zeka ve tahmin modelleri.', icon: '🧠' },
            { title: 'SLA Garantili Destek', description: 'Kritik durumlar için taahhüt edilmiş müdahale ve çözüm süreleri.', icon: '📜' },
            { title: 'Dedicated Manager', description: 'Sadece sizin projenizle ilgilenen uzman hesap yöneticisi ve teknik ekip.', icon: '👤' },
            { title: 'Özel API Limitleri', description: 'Yüksek hacimli veri akışları için özelleştirilmiş limitsiz API erişimi.', icon: '🚀' },
        ],
        benefits: [
            'Karmaşık süreçlerde tam kontrol ve görünürlük',
            'En yüksek seviye siber güvenlik ve yasal uyum',
            'Ölçeklenebilir, kesintisiz teknolojik altyapı',
            'Dijital dönüşüm süreçlerinde stratejik partnerlik',
        ],
        faq: [
            { q: 'Gümrük ve yurt dışı entegrasyonları dahil mi?', a: 'Evet, global pazaryerleri ve gümrükleme sistemleriyle özel entegrasyonlar sağlıyoruz.' },
            { q: 'Eski verilerimizi nasıl taşıyacağız?', a: 'Kurumsal geçiş ekibimiz tüm veri göçü (migration) sürecini sizin için yönetir.' },
            { q: 'Yerinde (On-premise) kurulum mümkün mü?', a: 'Belirli şartlar altında hibrit veya on-premise kurulum seçenekleri sunabiliyoruz.' },
        ],
    },
};

// ─── Static Params ────────────────────────────────────
export function generateStaticParams() {
    return Object.keys(solutions).map((slug) => ({ slug }));
}

// ─── Metadata ─────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const solution = solutions[slug];
    if (!solution) return { title: 'Sayfa Bulunamadı' };
    return {
        title: solution.metaTitle,
        description: solution.metaDescription,
    };
}

// ─── Page Component ───────────────────────────────────
export default async function SolutionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const solution = solutions[slug];
    if (!solution) notFound();

    return <SolutionDetailView solution={solution} />;
}
