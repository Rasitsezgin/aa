import type { Metadata } from "next";
import PricingClient from "@/components/landing/PricingClient";

export const metadata: Metadata = {
  title: 'Fiyatlandırma | Size Uygun Planı Seçin | Pazaryonetimi',
  description: 'Her bütçeye uygun şeffaf fiyatlandırma planları. 14 gün ücretsiz deneyin. Trendyol, Amazon, Hepsiburada entegrasyonları ile e-ticaretinizi büyütün.',
  alternates: {
    canonical: 'https://pazaryonetimi.com/pricing',
  },
  openGraph: {
    title: 'Fiyatlandırma ve Paketler | Pazaryonetimi',
    description: 'E-ticaret yönetimi için en uygun planı seçin. Yıllık ödemede %20 indirim fırsatını kaçırmayın.',
    url: 'https://pazaryonetimi.com/pricing',
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
