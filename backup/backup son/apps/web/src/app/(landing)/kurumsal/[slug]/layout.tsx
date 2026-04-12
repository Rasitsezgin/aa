import type { Metadata } from 'next';

// Kurumsal sayfalar "use client" olduğu için metadata burada tanımlanır

const KURUMSAL_META: Record<string, { title: string; description: string }> = {
    'gizlilik-politikasi': {
        title: 'Gizlilik Politikası',
        description: 'Pazaryonetimi gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında detaylı bilgi.',
    },
    'kullanim-sartlari': {
        title: 'Kullanım Şartları',
        description: 'Pazaryonetimi kullanım şartları ve koşulları. Hizmet şartları, kullanıcı sorumlulukları ve yasal bilgiler.',
    },
    'cerez-politikasi': {
        title: 'Çerez Politikası',
        description: 'Pazaryonetimi çerez kullanım politikası. Hangi çerezlerin kullanıldığı ve çerez tercihlerinizi nasıl yöneteceğiniz.',
    },
    'kvkk': {
        title: 'KVKK Aydınlatma Metni',
        description: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Pazaryonetimi aydınlatma metni. Veri sorumlusu bilgileri ve haklarınız.',
    },
    'satis-sozlesmesi': {
        title: 'Mesafeli Satış Sözleşmesi',
        description: 'Pazaryonetimi mesafeli satış sözleşmesi. Cayma hakkı, ödeme koşulları ve teslimat bilgileri.',
    },
    'hizmet-politikalari': {
        title: 'Hizmet Politikaları',
        description: 'Pazaryonetimi hizmet politikaları. SLA garantisi, destek süreleri, iade koşulları ve hizmet kapsamı.',
    },
    'hakkimizda': {
        title: 'Hakkımızda',
        description: 'Pazaryonetimi hakkında. Şirket vizyonu, misyonu, hikayemiz ve e-ticaret ekosistemindeki yerimiz.',
    },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const meta = KURUMSAL_META[slug];

    if (!meta) {
        return {
            title: 'Kurumsal | Pazaryonetimi',
            description: 'Pazaryonetimi kurumsal bilgiler ve yasal metinler.',
        };
    }

    return {
        title: `${meta.title} | Pazaryonetimi`,
        description: meta.description,
        alternates: { canonical: `https://pazaryonetimi.com/kurumsal/${slug}` },
    };
}

export default function KurumsalLayout({ children }: { children: React.ReactNode }) {
    return children;
}
