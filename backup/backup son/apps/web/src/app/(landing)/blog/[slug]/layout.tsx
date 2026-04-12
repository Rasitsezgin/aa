import type { Metadata } from 'next';

// Blog yazıları "use client" olduğu için metadata burada tanımlanır
// Gerçek uygulamada CMS'den gelen verilerle generateMetadata kullanılır

const BLOG_META: Record<string, { title: string; description: string }> = {
    '1': {
        title: "E-ticarette Yapay Zeka: 2026'da Neler Değişiyor?",
        description: 'Yapay zeka teknolojileri e-ticaret sektörünü kökten değiştiriyor. Otomasyon, kişiselleştirme ve tahminleme alanlarındaki son gelişmeleri inceliyoruz.',
    },
    '2': {
        title: 'Trendyol Mağaza Optimizasyonu: 10 Altın Kural',
        description: 'Trendyol mağazanızı optimize edin, aramalarda üst sıralara çıkın. SEO, ürün açıklaması, fiyatlandırma ve gönderi ipuçları.',
    },
    '3': {
        title: 'Hepsiburada ve N11 Entegrasyonu Rehberi',
        description: 'Hepsiburada ve N11 mağazalarınızı Pazaryonetimi ile entegre edin. Adım adım kurulum, stok senkronizasyonu ve sipariş yönetimi rehberi.',
    },
    '4': {
        title: 'Stok Yönetiminde 5 Kritik Hata ve Çözümleri',
        description: 'E-ticarette en sık yapılan stok yönetimi hataları ve nasıl önlenir. Stok tükenmesi, aşırı stok ve çoklu depo yönetimi çözümleri.',
    },
    '5': {
        title: 'Pazaryeri Komisyon Oranları 2026 Karşılaştırması',
        description: 'Trendyol, Hepsiburada, Amazon TR, N11 ve Çiçeksepeti 2026 komisyon oranları karşılaştırması. En avantajlı pazaryerini seçin.',
    },
    '6': {
        title: 'Çok Kanallı Satış Stratejisi Nasıl Oluşturulur?',
        description: 'Birden fazla pazaryerinde aynı anda satış yapmanın stratejileri. Kanal yönetimi, fiyatlandırma ve lojistik optimizasyonu.',
    },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const meta = BLOG_META[slug];

    if (!meta) {
        return {
            title: 'Blog Yazısı | Pazaryonetimi',
            description: 'E-ticaret dünyasındaki en son trendler ve ipuçları.',
        };
    }

    return {
        title: `${meta.title} | Pazaryonetimi Blog`,
        description: meta.description,
        alternates: { canonical: `https://pazaryonetimi.com/blog/${slug}` },
        openGraph: {
            title: meta.title,
            description: meta.description,
            type: 'article',
            url: `https://pazaryonetimi.com/blog/${slug}`,
        },
    };
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
    return children;
}
