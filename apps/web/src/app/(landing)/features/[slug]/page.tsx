import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FeatureDetailView from '@/components/pages/FeatureDetailView';
import {
    Brain, Package, DollarSign, BarChart3, Zap, Layers,
    Rocket, Wand2, Target, TrendingUp, Users, Box,
    Bell, RefreshCw, Shield, Eye, FileText, Star,
    Truck, Settings, Clock, Globe, Cpu
} from 'lucide-react';

interface Feature {
    title: string;
    heroTitle: string;
    heroSubtitle: string;
    gradient: string;
    icon: React.ElementType;
    stats: { label: string; value: string }[];
    features: FeatureItem[];
    benefits: string[];
    testimonial?: {
        quote: string;
        author: string;
        company: string;
        avatar: string;
    };
    faq: { q: string; a: string }[];
}

interface FeatureItem {
    title: string;
    description: string;
    icon: React.ElementType;
}

// ─── Feature Definitions ──────────────────────────────
const features: Record<string, Feature> = {
    ai: {
        title: 'Yapay Zeka',
        heroTitle: 'Yapay Zeka ile\nE-Ticaretin Geleceği',
        heroSubtitle: 'Ürünlerinizi optimize eden, trendleri öngören ve satışlarınızı artıran akıllı asistanlarınızla tanışın.',
        gradient: 'from-purple-600 via-pink-600 to-rose-600',
        icon: Brain,
        stats: [
            { label: 'Görünürlük Artışı', value: '+%45' },
            { label: 'Tahmin Doğruluğu', value: '%92' },
            { label: 'Verimlilik Kazanımı', value: '4x' },
            { label: 'Dönüşüm Oranı', value: '+%35' },
        ],
        features: [
            { title: 'AI SEO Optimizasyonu', description: 'Yapay zeka, ürün başlıklarınızı ve açıklamalarınızı otomatik olarak optimize eder. Arama sonuçlarında en üst sıraya çıkın.', icon: Wand2 },
            { title: 'Akıllı Fiyat Önerileri', description: 'Rakip fiyatlarını, talep değişimlerini ve marjlarınızı analiz ederek en karlı fiyatı gerçek zamanlı önerir.', icon: Target },
            { title: 'Trend Tahmini', description: 'Pazar trendlerini önceden tahmin ederek stok ve fiyat stratejinizi haftalar öncesinden planlayın.', icon: TrendingUp },
            { title: 'Müşteri Davranış Analizi', description: 'Müşteri segmentasyonu ve satın alma kalıplarını AI ile analiz ederek kişiselleştirilmiş teklifler sunun.', icon: Users },
            { title: 'Otomatik İçerik Üretimi', description: 'Saniyeler içinde yüzlerce ürün için SEO uyumlu, ikna edici açıklamalar ve özellik listeleri oluşturun.', icon: Rocket },
            { title: 'Görsel Analiz & Etiketleme', description: 'Ürün görsellerinizi analiz ederek otomatik kategori ve özellik etiketleri atayın.', icon: Eye },
        ],
        benefits: [
            'SEO çalışmalarında %90 zaman tasarrufu',
            'Trendleri kaçırmadan erken stok planlama',
            'Düşük tıklanma oranlarını AI ile iyileştirme',
            'Karlılık odaklı dinamik fiyat yönetimi',
        ],
        testimonial: {
            quote: 'AI asistanın önerdiği başlık değişikliklerinden sonra organik trafiğimiz iki katına çıktı. İnanılmaz bir verimlilik.',
            author: 'Selim Akın',
            company: 'TrendElektronik',
            avatar: 'SA',
        },
        faq: [
            { q: 'AI önerilerini onaylamadan uygulanıyor mu?', a: 'Hayır, tüm AI önerilerini önce panelinizde görürsünüz. Onayladıktan sonra tüm pazaryerlerinde güncellenir.' },
            { q: 'Hangi dilleri destekliyor?', a: 'Şu an Türkçe ve İngilizce dillerinde tam kapsamlı içerik üretimi ve analizi desteklenmektedir.' },
            { q: 'Trend tahminleri ne kadar geriye dönük veriye ihtiyaç duyar?', a: 'En az 3 aylık satış verisiyle %80+ doğruluk sağlanır, veri arttıkça doğruluk oranı yükselir.' },
        ],
    },
    inventory: {
        title: 'Stok Yönetimi',
        heroTitle: 'Hatasız ve Akıllı\nStok Yönetimi',
        heroSubtitle: 'Tüm pazaryerlerinde anlık senkronizasyon. Stoksuz kalmaya ve hatalı gönderimlere son verin.',
        gradient: 'from-orange-600 via-cyan-600 to-teal-600',
        icon: Package,
        stats: [
            { label: 'Stok Tutarlılığı', value: '%99.9' },
            { label: 'Kayıp Oranı', value: '-%85' },
            { label: 'Senkron Hızı', value: '< 2sn' },
            { label: 'Depo Kapasitesi', value: '∞' },
        ],
        features: [
            { title: 'Çoklu Depo Yönetimi', description: 'Fiziksel depolarınızı ve sanal stoklarınızı tek ekrandan yönetin. Depolar arası transferi otomatikleştirin.', icon: Box },
            { title: 'Kritik Stok Uyarıları', description: 'Belirlediğiniz eşik değerlerin altına düşen ürünler için anında mobil ve e-posta bildirimi alın.', icon: Bell },
            { title: 'Otomatik Sipariş Yönetimi', description: 'Stok azaldığında önceden tanımlı tedarikçilerinize otomatik sipariş formu oluşturun ve iletin.', icon: RefreshCw },
            { title: 'Barkod & SKU Sistemi', description: 'Gelişmiş varyant ve barkod yönetimi ile her bir ürünü lokasyon bazlı takip edin.', icon: Layers },
            { title: 'Rezerv Stok Ayırma', description: 'Kampanyalar veya özel satış kanalları için belirli miktarda stoğu otomatik rezerve edin.', icon: Shield },
            { title: 'İade Stok Kontrolü', description: 'İade gelen ürünlerin kalite kontrol süreçlerini ve tekrar satışa açılma durumlarını takip edin.', icon: RefreshCw },
        ],
        benefits: [
            'Pazaryerleri arası stok çakışmalarına son',
            'Depo sayımı ve kontrolünde %70 hızlanma',
            'Kritik stok uyarısıyla satış kaybını önleme',
            'Hatalı ürün gönderim oranında dramatik düşüş',
        ],
        testimonial: {
            quote: '3 farklı depomuz ve 15 satış kanalımız var. Pazaryonetimi öncesi stok tutturmak imkansızdı, şimdi her şey tıkır tıkır işliyor.',
            author: 'Murat Erdem',
            company: 'LojistikPark',
            avatar: 'ME',
        },
        faq: [
            { q: 'Fiziksel mağaza stoğuyla entegre olur mu?', a: 'Evet, mağaza ERP veya POS sisteminizle API üzerinden konuşarak fiziksel stoğu da senkronize edebiliriz.' },
            { q: 'Hatalı stok gönderiminde sistem ne yapıyor?', a: 'Sistem her siparişte stoğu anlık dondurur ve tüm kanallara 2 saniye içinde güncelleme gönderir.' },
            { q: 'Sınırsız depo ekleyebilir miyim?', a: 'Evet, paket özelliklerinize göre sınırsız sayıda fiziksel veya sanal depo tanımlayabilirsiniz.' },
        ],
    },
    pricing: {
        title: 'Fiyatlandırma',
        heroTitle: 'Rekabette Her Zaman\nEn Önde Olun',
        heroSubtitle: 'Dinamik fiyatlandırma motoru ile kar marjınızı koruyun, rakiplerinizin hareketlerine anında yanıt verin.',
        gradient: 'from-orange-600 via-amber-600 to-yellow-600',
        icon: DollarSign,
        stats: [
            { label: 'Kar Artışı', value: '+%28' },
            { label: 'İşlem Sayısı', value: '5M+/Ay' },
            { label: 'Rakip Takibi', value: '7/24' },
            { label: 'Güncelleme', value: 'Anlık' },
        ],
        features: [
            { title: 'Dinamik Fiyatlandırma', description: 'Belirlediğiniz kurallara göre (en ucuz ol, rakibin %1 altında kal vb.) fiyatları otomatik güncelleyin.', icon: DollarSign },
            { title: 'Marj Koruma Sistemi', description: 'Maliyet, komisyon ve kargo giderlerini belirleyin; sistem asla minimum kar marjınızın altına inmez.', icon: Shield },
            { title: 'Kampanya Yönetimi', description: 'Pazaryeri kampanyalarına tek tıkla katılım sağlayın ve kampanya süresince fiyatları optimize edin.', icon: Zap },
            { title: 'Rakip Analiz Raporu', description: 'Rakiplerinizin fiyat geçmişini, stok durumlarını ve bypass oranlarını detaylı dökümanlarla inceleyin.', icon: Eye },
            { title: 'Buybox Takibi', description: 'Amazon ve Trendyol gibi pazaryerlerinde Buybox durumunuzu anlık izleyin ve Buybox için savaşın.', icon: Target },
            { title: 'Psikolojik Fiyatlandırma', description: 'Sonu .99 veya .90 ile biten fiyatlandırma kurallarını tüm ürünlerinize otomatik uygulayın.', icon: TrendingUp },
        ],
        benefits: [
            'Manuel fiyat güncelleme yükünden %100 kurtulun',
            'Kar marjınızı kurallarla güvence altına alın',
            'Rakipler indirim yaptığında saniyeler içinde yanıt verin',
            'Kargo ve komisyon değişimlerini fiyata anlık yansıtın',
        ],
        faq: [
            { q: 'Fiyat güncellemeleri ne kadar hızlı?', a: 'Sistem rakipleri sürekli tarar ve değişiklik olduğunda ortalama 15 saniye içinde yeni fiyatı gönderir.' },
            { q: 'Komisyon oranlarını sistem biliyor mu?', a: 'Evet, kategori bazlı pazaryeri komisyonları sistemde güncel tutulur ve hesaplamaya dahil edilir.' },
            { q: 'Hatalı bir fiyat girilirse koruma var mı?', a: 'Evet, her ürün için "Minimum Fiyat" sınırı tanımlarsınız. Sistem asla bu fiyatın altına inmez.' },
        ],
    },
    analytics: {
        title: 'Analitik',
        heroTitle: 'Veriye Dayalı\nKararlar Alın',
        heroSubtitle: 'Satışlarınızı, karlılığınızı ve müşteri davranışlarını detaylı grafiklerle analiz edin. Tahminlere değil, verilere güvenin.',
        gradient: 'from-orange-600 via-amber-600 to-violet-600',
        icon: BarChart3,
        stats: [
            { label: 'Metrik Sayısı', value: '50+' },
            { label: 'Raporlama', value: 'Anlık' },
            { label: 'Kar Analizi', value: 'Net' },
            { label: 'Export', value: 'Tek Tık' },
        ],
        features: [
            { title: 'Gelişmiş Dashboard', description: 'Tüm pazaryeri satışlarını, iadeleri ve net kazancınızı merkezi bir ekranda görselleştirin.', icon: BarChart3 },
            { title: 'Karlılık Analizi', description: 'Ürün bazlı net kar analizi. Reklam maliyetleri ve operasyonel giderleri düşerek gerçek karınızı görün.', icon: DollarSign },
            { title: 'Ürün Performans Skoru', description: 'Hangi ürünlerin parladığını, hangilerinin stoğu işgal ettiğini AI skorlarıyla belirleyin.', icon: Star },
            { title: 'Müşteri Kohort Analizi', description: 'Müşteri sadakatini ve tekrar satın alma oranlarını zaman çizelgesi üzerinde inceleyin.', icon: Users },
            { title: 'Otomatik Raporlama', description: 'Haftalık veya aylık performans raporlarınızın otomatik olarak e-posta kutunuza gelmesini sağlayın.', icon: FileText },
            { title: 'Pazar Payı Takibi', description: 'Kategorinizdeki pazar payınızı ve rakiplerinize göre konumunuzu verilerle izleyin.', icon: Globe },
        ],
        benefits: [
            'Karmaşık Excel dosyalarından kurtulun',
            'Zarar eden ürünleri anında tespit edin',
            'En karlı satış kanallarınızı belirleyin',
            'Gelecek ayın satışlarını verilerle öngörün',
        ],
        testimonial: {
            quote: 'Daha önce brüt satışa bakıyorduk, Pazaryonetimi\'nin net kar analiziyle aslında bazı ürünlerde zarar ettiğimizi anladık ve rotayı değiştirdik.',
            author: 'Caner Öz',
            company: 'KitchenMaster',
            avatar: 'CÖ',
        },
        faq: [
            { q: 'Geçmiş verilerimi çekebilir miyim?', a: 'Evet, pazaryeri bağlantısı yapıldığında son 2 yıla kadar olan sipariş geçmişinizi çekip analiz ediyoruz.' },
            { q: 'Kendi özel raporlarımı oluşturabilir miyim?', a: 'Evet, "Özel Rapor Sihirbazı" ile istediğiniz metrikleri seçerek kendi raporlarınızı kurgulayabilirsiniz.' },
            { q: 'Veriler ne kadar güncel?', a: 'Satış verileri pazaryerinden anlık (real-time) veya maksimum 5 dakika gecikmeyle çekilir.' },
        ],
    },
    automation: {
        title: 'Otomasyon',
        heroTitle: 'Operasyonunuz\nKendi Kendini Yönetsin',
        heroSubtitle: 'Sipariş onayı, faturalandırma ve kargo süreçlerini otomatikleştirin. Ekibiniz büyümeye odaklansın.',
        gradient: 'from-red-600 via-rose-600 to-pink-600',
        icon: Zap,
        stats: [
            { label: 'Otomasyon Oranı', value: '%95' },
            { label: 'Zaman Kazanımı', value: '30+ Sa/Ha' },
            { label: 'Hata Oranı', value: '-%99' },
            { label: 'Süreç Hızı', value: '10x' },
        ],
        features: [
            { title: 'Sipariş Otomasyonu', description: 'Gelen siparişleri otomatik onayla, depoya ilet ve hazırlık sürecini başlat.', icon: Truck },
            { title: 'Akıllı e-Fatura', description: 'Sipariş onaylandığı an faturayı kes, müşteriye gönder ve muhasebe sistemine işle.', icon: FileText },
            { title: 'Kargo Etiketi Üretimi', description: 'Toplu kargo barkodu dökümü. Pazaryeri kargo kodlarıyla tam entegre, hatasız etiketleme.', icon: Layers },
            { title: 'Kural Motoru', description: '"Eğer ürün X ise ve kenti Y ise şu kargoya ver" gibi sınırsız özel senaryo oluşturun.', icon: Settings },
            { title: 'Zamanlanmış Görevler', description: 'Fiyat güncellemeleri, depo sayımları ve stok kontrollerini gece saatlerine zamanlayın.', icon: Clock },
            { title: 'Otomatik Mesajlaşma', description: 'Müşterilere kargo takibi ve sipariş durumu hakkında otomatik bilgilendirme gönderin.', icon: Zap },
        ],
        benefits: [
            'Operasyonel personel maliyetlerinde %60 tasarruf',
            'Sipariş hazırlama süresinde rekor hızlanma',
            'Manuel veri girişinden kaynaklanan hatalara son',
            'Müşteri sorularına yanıt verme yükünde azalma',
        ],
        faq: [
            { q: 'Hangi muhasebe programlarıyla entegre?', a: 'Paraşüt, Logo, Mikro, Zirve dahil popüler tüm yerli muhasebe yazılımlarıyla entegredir.' },
            { q: 'Otomasyon kuralları ne kadar esnek?', a: 'Çok esnek! Ürün grubu, tutar, bölge, ağırlık gibi onlarca kriteri birleştirebilirsiniz.' },
            { q: 'Fatura tasarımı özelleştirilebilir mi?', a: 'Evet, kendi kurumsal fatura tasarımınızı sisteme yükleyip kullanabilirsiniz.' },
        ],
    },
    integration: {
        title: 'Entegrasyonlar',
        heroTitle: 'Tüm E-Ticaret\nEcosysteminiz Bağlı',
        heroSubtitle: 'Pazaryerleri, kargo firmaları, muhasebe yazılımları ve ERP\'ler tek bir merkezde. Sınırsız bağlantı gücü.',
        gradient: 'from-teal-600 via-emerald-600 to-green-600',
        icon: Globe,
        stats: [
            { label: 'Pazaryeri', value: '15+' },
            { label: 'Kargo Entegresi', value: '12+' },
            { label: 'Muhasebe/ERP', value: '10+' },
            { label: 'API Uptime', value: '%99.99' },
        ],
        features: [
            { title: 'Pazaryeri Entegrasyonu', description: 'Trendyol, Hepsiburada, Amazon, N11, Çiçeksepeti ve daha fazlasını tek tıkla bağlayın.', icon: Globe },
            { title: 'Kargo Entegrasyonu', description: 'Aras, Yurtiçi, MNG, Jetizz dahil tüm taşıyıcılarla API üzerinden tam konuşun.', icon: Truck },
            { title: 'Muhasebe Entegrasyonu', description: 'Ön muhasebe ve ERP sistemlerinizle stok ve finans verilerini çift yönlü eşleştirin.', icon: FileText },
            { title: 'Platform API & Webhook', description: 'Kendi yazılımlarınızı veya özel çözümlerinizi güçlü API yapımızla sisteme bağlayın.', icon: Cpu },
            { title: 'Excel Import/Export', description: 'Entegrasyonu olmayan sistemler için esnek Excel şablonlarıyla veri aktarımı yapın.', icon: FileText },
            { title: 'Global Pazaryerleri', description: 'Etsy, AliExpress ve Amazon Global ile yurt dışına açılma süreçlerini yönetin.', icon: Globe },
        ],
        benefits: [
            'Farklı paneller arasında sekmelerden kurtulun',
            'Yeni bir satış kanalına girmeyi dakikalara indirin',
            'Veri bütünlüğünü tüm sistemlerde koruyun',
            'Kendi özel çözümlerinizi platform üzerine inşa edin',
        ],
        testimonial: {
            quote: 'Yeni bir pazaryerine girmek bizim için haftalar alıyordu, Pazaryonetimi ile öğleden sonra satışa başlamış oluyoruz.',
            author: 'Deniz Kaya',
            company: 'GlobalRetail',
            avatar: 'DK',
        },
        faq: [
            { q: 'Kendi ERP sistemimizi bağlayabilir miyiz?', a: 'Evet, dokümante edilmiş API\'miz üzerinden veya özel geliştirme hizmetimizle ERP bağlantısı yapabiliriz.' },
            { q: 'Kurulumu siz mi yapıyorsunuz?', a: 'Temel kurulumları siz yapabilirsiniz ancak uzman ekibimiz her adımda ücretsiz canlı destek sunar.' },
            { q: 'Yeni pazaryerleri ne sıklıkla ekleniyor?', a: 'Pazardaki talebe göre ortalama her 3 ayda bir yeni bir büyük kanal entegrasyonu yayına alıyoruz.' },
        ],
    },
};

// ─── Static Params ────────────────────────────────────
export function generateStaticParams() {
    return Object.keys(features).map((slug) => ({ slug }));
}

// ─── Metadata ─────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const feature = features[slug];
    if (!feature) return { title: 'Sayfa Bulunamadı' };
    return {
        title: `${feature.title} Özelliği | Pazaryonetimi`,
        description: `${feature.title} özelliği ile e-ticaret süreçlerinizi nasıl optimize edeceğinizi öğrenin.`,
    };
}

function toIconName(icon: React.ElementType): string {
    if (typeof icon === 'string') return icon;
    const component = icon as { displayName?: string; name?: string };
    return component.displayName || component.name || 'Sparkles';
}

function serializeFeature(feature: Feature) {
    return {
        ...feature,
        icon: toIconName(feature.icon),
        features: feature.features.map((item) => ({
            ...item,
            icon: toIconName(item.icon),
        })),
    };
}

// ─── Page Component ───────────────────────────────────
export default async function FeatureDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const feature = features[slug];
    if (!feature) notFound();

    return <FeatureDetailView feature={serializeFeature(feature)} />;
}
