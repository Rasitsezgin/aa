import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ platform: string; storeId: string }> }
) {
    try {
        const { platform, storeId } = await params;
        const { searchParams } = request.nextUrl;
        const limit = searchParams.get('limit') || '10';

        // NestJS API'ye çağrı yap
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/marketplace/store/${platform}/${storeId}/products?limit=${limit}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            return NextResponse.json(
                { error: `Backend API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Marketplace Products API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}
