import React from 'react';
import FeaturesView from '@/components/pages/FeaturesView';
import { getCMSData } from '@/lib/cms-service';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Özellikler | Pazaryonetimi',
    description: 'Yapay zeka destekli stok, fiyat ve sipariş yönetimi özellikleri.',
};

export default async function FeaturesPage() {
    const data = await getCMSData();
    return <FeaturesView data={data.features} />;
}
