import type { Metadata } from 'next';
import { pageMetadata } from '@/config/seo-metadata';

export const metadata: Metadata = pageMetadata['/signup'];

export default function SignupLayout({ children }: { children: React.ReactNode }) {
    return children;
}
