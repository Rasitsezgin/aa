import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/case-studies'];

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
