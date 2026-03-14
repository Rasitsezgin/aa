import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/status'];

export default function StatusLayout({ children }: { children: React.ReactNode }) {
    return children;
}
