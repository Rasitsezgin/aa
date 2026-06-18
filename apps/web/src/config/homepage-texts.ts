export const HOMEPAGE_TEXTS = {
    hero: {
        badge: "Stok ve siparişleriniz 200ms'de senkron",
        badgeLabel: "CANLI",
        titleLine1: "mağazanızı",
        titleSuffix: "tek panelden yönetin.",
        subtitlePrefix: "Trendyol'dan Amazon'a tüm kanallarınızı tek merkezden bağlayın.",
        subtitleHighlight: " Çifte satış riski olmadan",
        subtitleSuffix: " stok, sipariş ve kargoyu gerçek zamanlı yönetin.",
        analyzerPlaceholder: "Mağaza linki yapıştırın...",
        analyzerButton: "Ücretsiz Analiz Et",
        analyzerNote: "Trendyol ve Hepsiburada mağaza linkleri ücretsiz · diğer platformlar premium.",
        analyzerExamples: [
            { label: "Trendyol örneği", url: "https://www.trendyol.com/magaza/atn-m-107368" },
            { label: "Hepsiburada örneği", url: "https://www.hepsiburada.com/magaza/erogluoto" },
        ],
        freeTrialNote: "14 gün ücretsiz · kredi kartı gerekmez",
        signupCta: "Ücretsiz Başla",
        demoCta: "Demo İzle",
        stats: [
            { text: "7+ Pazaryeri" },
            { text: "KVKK Uyumlu" },
            { text: "200ms Senkron" },
        ],
    },
    bento: {
        title: "Operasyonunuz",
        titleHighlight: "Tek Panelde.",
        subtitle: "Stok senkronizasyonu, sipariş yönetimi ve kargo entegrasyonu — ihtiyacınız olan her şey tek ekranda.",
        cards: [
            {
                id: 'sync',
                title: "Anlık Stok Senkronizasyonu",
                description: "Bir kanalda stok değiştiğinde 200ms içinde tüm pazaryerlerine yansır. Çifte satış ve stok fazlası sipariş riskini ortadan kaldırın.",
                features: ['Çoklu Kanal Eşleme', 'Otomatik Stok Düşümü', 'Gerçek Zamanlı Uyarılar']
            },
            {
                id: 'orders',
                title: "Sipariş & Kargo",
                description: "Gelen siparişleri tek listede toplayın, Aras ve diğer kargo firmalarıyla etiket basımını otomatikleştirin."
            },
            {
                id: 'ai-seo',
                title: "AI Destekli SEO",
                description: "Ürün başlık ve açıklamalarınızı pazaryeri algoritmalarına göre optimize edin. Satış odaklı içerik üretin."
            }
        ]
    },
        pricing: {
        badge: "Şeffaf Fiyatlandırma",
        title: "Basit, Şeffaf Fiyatlandırma.",
        subtitle: "Ücretsiz mağaza analizi: Trendyol ve Hepsiburada. Diğer platformlar ve gelişmiş özellikler PRO planında. 14 gün ücretsiz deneyin.",
        plans: [
            {
                id: 'starter',
                name: "Başlangıç",
                priceMonthly: "499",
                priceAnnual: "399",
                description: "Yeni başlayanlar ve küçük hacimli mağazalar için ideal.",
                features: ['1 Pazaryeri Entegrasyonu', '100 Ürün Limiti', 'Temel Analitik', 'E-posta Desteği']
            },
            {
                id: 'pro',
                name: "Profesyonel",
                priceMonthly: "1.299",
                priceAnnual: "999",
                description: "Büyüyen işletmeler ve power-seller'lar için tam donanım.",
                features: ['Sınırsız Pazaryeri', 'Sınırsız Ürün', 'AI SEO Motoru', '7/24 Öncelikli Destek', 'Rakip Fiyat Analizi']
            }
        ]
    },
    faq: {
        badge: "Sık Sorulan Sorular",
        title: "Merak Edilenler",
        subtitle: "Hâlâ sorunuz mu var? Bizimle iletişime geçin.",
        items: [
            {
                q: "Ücretsiz deneme süreci nasıl işliyor?",
                a: "14 gün boyunca tüm özellikleri sınırsız olarak kullanabilirsiniz. Kredi kartı bilgisi istenmez. Deneme süresi sonunda otomatik olarak ücretsiz plana geçersiniz."
            },
            {
                q: "Hangi pazaryerlerini destekliyorsunuz?",
                a: "Trendyol, Hepsiburada, N11, Amazon, Etsy, Shopify, WooCommerce ve daha 30+ global ve yerel pazaryeri ile entegre çalışıyoruz."
            }
        ]
    }
};
