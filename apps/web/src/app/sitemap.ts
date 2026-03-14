import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://pazaryonetimi.com';
    const now = new Date();

    // Ana sayfalar - Yüksek öncelik
    const mainPages = [
        { url: '', priority: 1.0, changeFrequency: 'daily' as const },
        { url: '/features', priority: 0.9, changeFrequency: 'weekly' as const },
        { url: '/pricing', priority: 0.9, changeFrequency: 'weekly' as const },
        { url: '/solutions', priority: 0.9, changeFrequency: 'weekly' as const },
        { url: '/entegrasyonlar', priority: 0.9, changeFrequency: 'weekly' as const },
        { url: '/demo', priority: 0.9, changeFrequency: 'monthly' as const },
        { url: '/signup', priority: 0.9, changeFrequency: 'monthly' as const },
    ];

    // Çözüm alt sayfaları
    const solutionPages = [
        '/solutions/trendyol',
        '/solutions/hepsiburada',
        '/solutions/amazon',
        '/solutions/n11',
        '/solutions/ciceksepeti',
    ].map(url => ({ url, priority: 0.8, changeFrequency: 'weekly' as const }));

    // İçerik sayfaları - Orta öncelik
    const contentPages = [
        { url: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
        { url: '/case-studies', priority: 0.8, changeFrequency: 'weekly' as const },
        { url: '/basari-hikayeleri', priority: 0.8, changeFrequency: 'weekly' as const },
        { url: '/resources', priority: 0.7, changeFrequency: 'weekly' as const },
        { url: '/resources/2026-rapor', priority: 0.7, changeFrequency: 'monthly' as const },
        { url: '/video-library', priority: 0.7, changeFrequency: 'weekly' as const },
        { url: '/webinars', priority: 0.7, changeFrequency: 'weekly' as const },
        { url: '/docs/api', priority: 0.7, changeFrequency: 'weekly' as const },
        { url: '/changelog', priority: 0.6, changeFrequency: 'weekly' as const },
        { url: '/roadmap', priority: 0.6, changeFrequency: 'monthly' as const },
    ];

    // Kurumsal sayfalar
    const corporatePages = [
        { url: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
        { url: '/iletisim', priority: 0.7, changeFrequency: 'monthly' as const },
        { url: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
        { url: '/destek', priority: 0.7, changeFrequency: 'monthly' as const },
        { url: '/comparison', priority: 0.8, changeFrequency: 'weekly' as const },
        { url: '/security', priority: 0.6, changeFrequency: 'monthly' as const },
        { url: '/team', priority: 0.5, changeFrequency: 'monthly' as const },
        { url: '/careers', priority: 0.6, changeFrequency: 'weekly' as const },
        { url: '/press', priority: 0.5, changeFrequency: 'monthly' as const },
        { url: '/partner', priority: 0.6, changeFrequency: 'monthly' as const },
        { url: '/referral', priority: 0.6, changeFrequency: 'monthly' as const },
        { url: '/community', priority: 0.5, changeFrequency: 'monthly' as const },
        { url: '/status', priority: 0.4, changeFrequency: 'daily' as const },
    ];

    // Kurumsal alt sayfalar
    const kurumsalPages = [
        '/kurumsal/hakkimizda',
        '/kurumsal/gizlilik-politikasi',
        '/kurumsal/kullanim-sartlari',
        '/kurumsal/cerez-politikasi',
        '/kurumsal/kvkk',
        '/kurumsal/satis-sozlesmesi',
        '/kurumsal/hizmet-politikalari',
    ].map(url => ({ url, priority: 0.4, changeFrequency: 'monthly' as const }));

    const allPages = [
        ...mainPages,
        ...solutionPages,
        ...contentPages,
        ...corporatePages,
        ...kurumsalPages,
    ];

    return allPages.map(page => ({
        url: `${baseUrl}${page.url}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
    }));
}
