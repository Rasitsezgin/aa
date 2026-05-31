export const dynamic = "force-dynamic";

// This route should not be accessed directly
// Use /api/marketplace/store/[platform]/[storeId]/products instead
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ error: 'Invalid route' }, { status: 400 });
}
