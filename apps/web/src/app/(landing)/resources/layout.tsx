import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/resources'];

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
