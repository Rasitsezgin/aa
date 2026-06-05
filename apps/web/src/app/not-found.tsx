import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NotFoundPage from '@/components/NotFoundPage';

export const metadata: Metadata = {
    title: 'Sayfa Bulunamadı',
    robots: { index: false, follow: false },
};

export default function NotFound() {
    return (
        <div className="landing-brand relative min-h-screen">
            <Navbar />
            <NotFoundPage />
            <Footer />
        </div>
    );
}
