import type { CategoryId, Integration } from '@/components/landing/integrations-data';

export const setupStepsByCategory: Record<CategoryId, { title: string; desc: string }[]> = {
    all: [],
    pazaryeri: [
        { title: 'Satıcı hesabını bağlayın', desc: 'Pazaryeri satıcı panelinden API anahtarlarınızı oluşturun.' },
        { title: 'Mağazayı Pazaryönetimi\'ne ekleyin', desc: 'Dashboard → Mağazalar bölümünden yeni bağlantı sihirbazını başlatın.' },
        { title: 'Ürün ve stok eşleştirmesi', desc: 'Mevcut ürünlerinizi eşleştirin veya toplu aktarım ile yükleyin.' },
        { title: 'Sipariş senkronunu aktifleştirin', desc: 'Gelen siparişler otomatik çekilir; kargo ve fatura akışı başlar.' },
    ],
    eticaret: [
        { title: 'Mağaza URL ve API erişimi', desc: 'E-ticaret panelinizden Admin API veya REST erişim bilgilerini alın.' },
        { title: 'Bağlantıyı doğrulayın', desc: 'Pazaryönetimi bağlantı testi ile mağazanızı onaylayın.' },
        { title: 'Kanal eşlemesi', desc: 'Pazaryeri kanallarınızı mağaza ürünleriyle eşleştirin.' },
        { title: 'Çift yönlü senkron', desc: 'Stok ve siparişler tüm kanallar arasında otomatik güncellenir.' },
    ],
    muhasebe: [
        { title: 'Muhasebe hesabını bağlayın', desc: 'Paraşüt, Logo veya ERP hesabınızın API bilgilerini girin.' },
        { title: 'Fatura şablonunu seçin', desc: 'E-fatura / e-arşiv ayarlarınızı yapılandırın.' },
        { title: 'Sipariş → fatura kuralı', desc: 'Hangi kanallardan gelen siparişlerin faturalanacağını belirleyin.' },
        { title: 'Otomatik kesimi açın', desc: 'Onaylanan siparişler tek tıkla veya otomatik faturalanır.' },
    ],
    kargo: [
        { title: 'Kargo sözleşme bilgileri', desc: 'Kargo firmasından aldığınız API kullanıcı adı ve şifresini girin.' },
        { title: 'Gönderici adresi', desc: 'Varsayılan çıkış şubesini ve adres bilgilerini tanımlayın.' },
        { title: 'Barkod şablonu', desc: 'Termal veya A4 barkod formatını seçin.' },
        { title: 'Otomatik kargo fişi', desc: 'Sipariş onayında kargo fişi ve takip no otomatik oluşur.' },
    ],
    efatura: [
        { title: 'GİB / entegratör kaydı', desc: 'E-fatura mükellefiyeti ve mali mühür bilgilerinizi hazırlayın.' },
        { title: 'Entegratör bağlantısı', desc: 'Portal veya özel entegratör API bilgilerini sisteme girin.' },
        { title: 'Seri ve numara aralığı', desc: 'Fatura seri tanımlarınızı yapılandırın.' },
        { title: 'Test faturası kesin', desc: 'İlk test faturasını göndererek bağlantıyı doğrulayın.' },
    ],
    xml: [
        { title: 'XML kaynağını tanımlayın', desc: 'Tedarikçi XML URL veya dosya yolunu ekleyin.' },
        { title: 'Alan eşlemesi', desc: 'Ürün adı, fiyat, stok ve kategori alanlarını eşleştirin.' },
        { title: 'Kar marjı kuralı', desc: 'Fiyatlandırma ve yuvarlama kurallarını belirleyin.' },
        { title: 'Otomatik güncelleme', desc: 'Periyodik XML çekimi ile stok ve fiyat güncellenir.' },
    ],
    dropshipping: [],
    reklam: [],
};

export function getFaqs(integration: Integration): { q: string; a: string }[] {
    const name = integration.name;
    return [
        {
            q: `${name} entegrasyonu ücretsiz mi?`,
            a: `${name} bağlantısı ${integration.price === 'Ücretsiz' ? 'ücretsizdir' : `${integration.price} planı kapsamındadır`}. Pazaryönetimi aboneliğinize göre ek ücret uygulanabilir.`,
        },
        {
            q: 'Kurulum ne kadar sürer?',
            a: `Ortalama kurulum süresi ${integration.setupTime}. API bilgileriniz hazırsa çoğu entegrasyon tek oturumda tamamlanır.`,
        },
        {
            q: 'Senkronizasyon ne sıklıkla çalışır?',
            a: `Stok ve sipariş senkronu ${integration.stats.syncTime} içinde güncellenir. Kritik kanallarda gerçek zamanlı webhook desteği sunulur.`,
        },
        {
            q: 'Birden fazla mağaza bağlayabilir miyim?',
            a: `Evet. Aynı ${name} hesabından veya farklı alt mağazalardan birden fazla bağlantı oluşturabilirsiniz.`,
        },
    ];
}

export function getSyncEndpoints(integration: Integration): { method: string; path: string; desc: string }[] {
    const platform = integration.id;
    return [
        { method: 'GET', path: `/api/v1/integrations/${platform}/status`, desc: 'Bağlantı ve senkron durumu' },
        { method: 'POST', path: `/api/v1/integrations/${platform}/sync`, desc: 'Manuel tam senkronizasyon' },
        { method: 'GET', path: `/api/v1/integrations/${platform}/products`, desc: 'Eşleşen ürün listesi' },
        { method: 'POST', path: `/api/v1/integrations/${platform}/products/publish`, desc: 'Ürün yayınlama / güncelleme' },
        { method: 'GET', path: `/api/v1/integrations/${platform}/orders`, desc: 'Kanal siparişlerini listele' },
        { method: 'PUT', path: `/api/v1/integrations/${platform}/inventory`, desc: 'Stok güncelleme' },
    ];
}

export function getCredentialExample(integration: Integration): string {
    return JSON.stringify(
        {
            platform: integration.id,
            credentials: Object.fromEntries(
                integration.requirements.map((r, i) => [`field_${i + 1}`, `/* ${r} */`]),
            ),
            sync: { products: true, orders: true, inventory: true },
        },
        null,
        2,
    );
}
