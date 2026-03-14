import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log error details on server side
    console.error('[Client Error Report]', {
      message: body.message,
      url: body.url,
      timestamp: body.timestamp,
      userAgent: body.userAgent?.substring(0, 100),
      // Don't log full stack in production
      stack: process.env.NODE_ENV === 'development' ? body.stack : undefined,
    });

    // In production, forward to external error tracking service
    // e.g., Sentry, LogRocket, etc.
    // await fetch('https://sentry.io/api/...', { ... });

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
