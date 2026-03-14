import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/comparison'];

export default function ComparisonLayout({ children }: { children: React.ReactNode }) {
    return children;
}
