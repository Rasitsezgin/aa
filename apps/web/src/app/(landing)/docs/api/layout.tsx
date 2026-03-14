import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/docs/api'];

export default function DocsApiLayout({ children }: { children: React.ReactNode }) {
    return children;
}
