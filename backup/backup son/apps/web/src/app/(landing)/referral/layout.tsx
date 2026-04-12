import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/referral'];

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
    return children;
}
