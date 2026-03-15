import type { Metadata } from "next";
import IntegrationsClient from "@/components/landing/IntegrationsClient";

export const metadata: Metadata = {
  title: 'Pazaryeri Entegrasyonları | Trendyol, Amazon, Hepsiburada | Pazaryonetimi',
  description: 'Trendyol, Hepsiburada, Amazon, N11, Çiçeksepeti ve 30+ pazaryeri ile tam entegrasyon. Envanter, stok ve siparişlerinizi tek bir panelden yönetin.',
  alternates: {
    canonical: 'https://pazaryonetimi.com/entegrasyonlar',
  },
  openGraph: {
    title: 'Pazaryeri Entegrasyonları | Pazaryonetimi',
    description: '30+ pazaryeri, e-ticaret altyapısı ve kargo entegrasyonu ile satışlarınızı otomatikleştirin.',
    url: 'https://pazaryonetimi.com/entegrasyonlar',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Pazaryonetimi Entegrasyonlar',
      },
    ],
  },
};

export default function EntegrasyonlarPage() {
  return <IntegrationsClient />;
}
