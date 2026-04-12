import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/team'];

export default function TeamLayout({ children }: { children: React.ReactNode }) {
    return children;
}
