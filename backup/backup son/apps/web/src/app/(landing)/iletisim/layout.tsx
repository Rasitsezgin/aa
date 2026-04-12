import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/iletisim'];

export default function IletisimLayout({ children }: { children: React.ReactNode }) {
    return children;
}
