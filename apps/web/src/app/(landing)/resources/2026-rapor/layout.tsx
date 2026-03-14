import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/resources/2026-rapor'];

export default function RaporLayout({ children }: { children: React.ReactNode }) {
    return children;
}
