import { NextRequest, NextResponse } from 'next/server';

function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001';
    return raw.replace(/\/$/, '').replace(/\/api$/, '');
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ platform: string; storeId: string }> }
) {
    try {
        const { platform, storeId } = await params;
        const { searchParams } = request.nextUrl;
        const url = searchParams.get('url') || '';

        const base = getApiBaseUrl();
        const query = `?url=${encodeURIComponent(url)}`;
        const candidates = [
            `${base}/api/marketplace/analyze/${platform}/${storeId}${query}`,
            `${base}/marketplace/analyze/${platform}/${storeId}${query}`,
            `${base}/api/v1/marketplace/analyze/${platform}/${storeId}${query}`,
        ];

        let response: Response | null = null;
        for (const apiUrl of candidates) {
            response = await fetch(apiUrl);
            if (response.ok || response.status !== 404) {
                break;
            }
        }

        if (!response) {
            return NextResponse.json(
                { error: 'Backend API request failed' },
                { status: 502 }
            );
        }

        if (!response.ok) {
            return NextResponse.json(
                { error: `Backend API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Marketplace API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch marketplace analysis' },
            { status: 500 }
        );
    }
}
