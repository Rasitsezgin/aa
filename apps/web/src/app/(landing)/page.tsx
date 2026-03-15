import type { Metadata } from "next";
import LandingHomeClient from "@/components/landing/LandingHomeClient";

export const metadata: Metadata = {
  title: 'Pazaryonetimi | AI Destekli E-ticaret Yönetim Platformu',
  description: 'Trendyol, Hepsiburada, Amazon, N11, Çiçeksepeti — tüm pazaryerlerinizi tek platformdan yönetin. AI destekli stok senkronizasyonu, akıllı fiyatlandırma ve satış tahminleri.',
  alternates: {
    canonical: 'https://pazaryonetimi.com',
  },
  openGraph: {
    title: 'Pazaryonetimi | AI Destekli E-ticaret Yönetim Platformu',
    description: 'Tüm pazaryerlerinizi tek platformdan yönetin. AI destekli e-ticaret çözümleri ile satışlarınızı artırın.',
    url: 'https://pazaryonetimi.com',
    siteName: 'Pazaryonetimi',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Pazaryonetimi - AI Destekli E-ticaret Yönetim Platformu',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
};

export default function Home() {
  return <LandingHomeClient />;
}
