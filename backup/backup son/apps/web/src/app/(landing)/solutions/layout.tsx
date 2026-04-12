import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/solutions'];

export default function SolutionsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
