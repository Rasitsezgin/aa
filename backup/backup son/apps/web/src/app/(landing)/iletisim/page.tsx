import React from 'react';
import ContactView from '@/components/pages/ContactView';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'İletişim | Pazaryonetimi',
    description: 'Pazaryonetimi destek ekibi ile iletişime geçin. 7/24 canlı destek, telefon, e-posta ve WhatsApp.',
};

export default function IletisimPage() {
    return <ContactView />;
}
