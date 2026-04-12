import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/changelog'];

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
    return children;
}
