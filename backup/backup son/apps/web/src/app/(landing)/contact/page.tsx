import React from 'react';
import ContactView from '@/components/pages/ContactView';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'İletişim | Pazaryonetimi',
    description: 'Pazaryonetimi destek ekibi ile iletişime geçin.',
};

export default function ContactPage() {
    return <ContactView />;
}
