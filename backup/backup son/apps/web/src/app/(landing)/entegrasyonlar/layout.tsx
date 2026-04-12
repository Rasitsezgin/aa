import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/entegrasyonlar'];

export default function EntegrasyonlarLayout({ children }: { children: React.ReactNode }) {
    return children;
}
