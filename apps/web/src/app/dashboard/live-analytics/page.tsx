"use client";

import dynamic from 'next/dynamic';

const LiveAnalyticsDashboard = dynamic(
    () => import('@/components/dashboard/LiveAnalyticsDashboard'),
    { ssr: false }
);

export default function LiveAnalyticsPage() {
    return <LiveAnalyticsDashboard />;
}
