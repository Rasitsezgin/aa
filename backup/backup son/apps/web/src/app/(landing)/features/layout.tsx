import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/features'];

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
