import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/roadmap'];

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
    return children;
}
