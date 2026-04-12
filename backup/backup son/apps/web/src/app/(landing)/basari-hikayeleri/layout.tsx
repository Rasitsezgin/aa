import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/basari-hikayeleri'];

export default function BasariHikayeleriLayout({ children }: { children: React.ReactNode }) {
    return children;
}
