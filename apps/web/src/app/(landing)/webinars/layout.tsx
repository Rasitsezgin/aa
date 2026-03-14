import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/webinars'];

export default function WebinarsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
