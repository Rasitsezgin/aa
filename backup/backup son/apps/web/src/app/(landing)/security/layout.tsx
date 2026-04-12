import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/security'];

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
    return children;
}
