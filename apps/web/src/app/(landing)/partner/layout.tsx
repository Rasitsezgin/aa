import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/partner'];

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
    return children;
}
