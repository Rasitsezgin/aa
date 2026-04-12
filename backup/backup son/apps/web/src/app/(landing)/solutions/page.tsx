import React from 'react';
import SolutionsView from '@/components/pages/SolutionsView';
import { getCMSData } from '@/lib/cms-service';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Çözümler | Pazaryonetimi',
    description: 'KOBİ, Girişimci ve Kurumsal markalar için e-ticaret çözümleri.',
};

export default async function SolutionsPage() {
    const data = await getCMSData();
    return <SolutionsView data={data.solutions} />;
}
