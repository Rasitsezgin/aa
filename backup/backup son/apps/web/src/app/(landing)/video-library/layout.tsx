import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/video-library'];

export default function VideoLibraryLayout({ children }: { children: React.ReactNode }) {
    return children;
}
