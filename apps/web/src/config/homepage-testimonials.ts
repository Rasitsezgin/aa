export interface HomepageTestimonial {
    id: string;
    name: string;
    title: string;
    content: string;
    rating: number;
    avatarUrl: string | null;
    marketplace?: string;
}

export const HOMEPAGE_TESTIMONIALS: HomepageTestimonial[] = [
    {
        id: '1',
        name: 'Ayşe Yılmaz',
        title: 'Kurucu, ModaBütik · Trendyol & Hepsiburada',
        content: 'Dört pazaryerinde ayrı stok tutuyorduk, sürekli çifte satış riski vardı. Pazaryonetimi ile stok 200ms içinde senkron oluyor; günlük operasyon süremiz 4 saatten 30 dakikaya indi.',
        rating: 5,
        avatarUrl: null,
        marketplace: 'Trendyol',
    },
    {
        id: '2',
        name: 'Caner Demir',
        title: 'Operasyon Müdürü, TeknoMarket',
        content: 'Siparişler tek listede toplanıyor, Aras entegrasyonuyla etiket basımı otomatik. Kargo sürecinde yaşadığımız gecikmeler neredeyse sıfırlandı.',
        rating: 5,
        avatarUrl: null,
        marketplace: 'Amazon',
    },
    {
        id: '3',
        name: 'Zeynep Kaya',
        title: 'E-ticaret Yöneticisi, OrganicToys',
        content: 'Excel tablolarını bıraktık. Stok uyarıları ve sipariş bildirimleri anlık geliyor; ekibim artık satışa odaklanıyor, paneller arasında koşturmuyor.',
        rating: 5,
        avatarUrl: null,
        marketplace: 'N11',
    },
    {
        id: '4',
        name: 'Burak Öz',
        title: 'CEO, GamerZone',
        content: 'Trendyol ve Etsy\'yi tek panelden yönetiyoruz. Kurulum 2 dakika sürdü, 14 günlük deneme döneminde tüm kanalları bağladık. Destek ekibi gerçekten hızlı.',
        rating: 5,
        avatarUrl: null,
        marketplace: 'Etsy',
    },
    {
        id: '5',
        name: 'Merve Çelik',
        title: 'Kurucu, BeautyBox',
        content: 'KVKK uyumlu altyapı ve Türkçe destek bizim için kritikti. Sipariş, stok ve kargo tek ekranda; iade oranımız %2\'nin altına düştü.',
        rating: 5,
        avatarUrl: null,
        marketplace: 'Hepsiburada',
    },
    {
        id: '6',
        name: 'Emre Akın',
        title: 'Power Seller, EvYaşam Plus',
        content: '6 pazaryerinde 12.000 SKU yönetiyoruz. Toplu stok güncellemesi ve otomatik sipariş aktarımı olmadan bu ölçeği kaldıramazdık.',
        rating: 5,
        avatarUrl: null,
        marketplace: 'Shopify',
    },
];
