export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { HOMEPAGE_TESTIMONIALS } from '@/config/homepage-testimonials';

export async function GET() {
    return NextResponse.json(HOMEPAGE_TESTIMONIALS);
}
