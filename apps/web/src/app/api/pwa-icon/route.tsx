export const dynamic = "force-dynamic";

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const VALID_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get('size');
  const maskable = searchParams.get('maskable') === 'true';
  const size = sizeParam ? parseInt(sizeParam) : 192;

  if (!VALID_SIZES.includes(size) && size > 0 && size <= 1024) {
    // kabul et ama standart değil
  } else if (!VALID_SIZES.includes(size)) {
    return new Response('Invalid size', { status: 400 });
  }

  const fontSize = Math.round(size * 0.38);
  const borderRadius = maskable ? 0 : Math.round(size * 0.125);
  const padding = maskable ? Math.round(size * 0.1) : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: maskable ? '#2563eb' : 'transparent',
          padding: padding,
        }}
      >
        <div
          style={{
            width: maskable ? size - padding * 2 : size,
            height: maskable ? size - padding * 2 : size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
            borderRadius: borderRadius,
          }}
        >
          <span
            style={{
              fontSize: fontSize,
              fontWeight: 900,
              color: 'white',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            PZ
          </span>
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': 'image/png',
      },
    }
  );
}
