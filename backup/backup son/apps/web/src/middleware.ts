import { NextRequest, NextResponse } from "next/server";

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)",
    ],
};

// Rate limiting for login attempts (in-memory, per IP)
const loginAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const record = loginAttempts.get(ip);

    if (!record) return { allowed: true };

    // If blocked, check if block has expired
    if (record.blockedUntil > now) {
        return { allowed: false, retryAfter: Math.ceil((record.blockedUntil - now) / 1000) };
    }

    // Reset if outside attempt window
    if (now - record.lastAttempt > ATTEMPT_WINDOW) {
        loginAttempts.delete(ip);
        return { allowed: true };
    }

    if (record.count >= MAX_LOGIN_ATTEMPTS) {
        record.blockedUntil = now + BLOCK_DURATION;
        return { allowed: false, retryAfter: Math.ceil(BLOCK_DURATION / 1000) };
    }

    return { allowed: true };
}

function recordLoginAttempt(ip: string) {
    const now = Date.now();
    const record = loginAttempts.get(ip);
    if (record) {
        record.count++;
        record.lastAttempt = now;
    } else {
        loginAttempts.set(ip, { count: 1, lastAttempt: now, blockedUntil: 0 });
    }
}

// Security headers
function addSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https: http:",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-analytics.com https://cloudflareinsights.com https://api.pazaryonetimi.com wss://api.pazaryonetimi.com ws://localhost:* http://localhost:*",
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'",
        ].join('; ')
    );
    return response;
}

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get("host");
    const pathname = url.pathname;

    // ========== RATE LIMITING FOR LOGIN ==========
    if ((pathname === '/login' || pathname === '/admin/login') && req.method === 'POST') {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            req.headers.get('x-real-ip') ||
            'unknown';
        const rateCheck = checkRateLimit(ip);
        if (!rateCheck.allowed) {
            const response = NextResponse.json(
                { error: 'Çok fazla giriş denemesi. Lütfen daha sonra tekrar deneyin.' },
                { status: 429 }
            );
            response.headers.set('Retry-After', String(rateCheck.retryAfter || 900));
            return addSecurityHeaders(response);
        }
        recordLoginAttempt(ip);
    }

    // ========== AUTH PROTECTION ==========
    // Check for NextAuth session token
    const sessionToken = req.cookies.get('next-auth.session-token')?.value ||
        req.cookies.get('__Secure-next-auth.session-token')?.value ||
        req.cookies.get('authjs.session-token')?.value ||
        req.cookies.get('__Secure-authjs.session-token')?.value;

    // Protect /dashboard/* routes - require authentication
    if (pathname.startsWith('/dashboard')) {
        if (!sessionToken) {
            const loginUrl = new URL('/login', req.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            const response = NextResponse.redirect(loginUrl);
            return addSecurityHeaders(response);
        }
    }

    // Redirect to onboarding if tenant is not yet onboarded
    // Check JWT token for isOnboarded flag (set during login in auth.ts)
    if (pathname.startsWith('/dashboard') && sessionToken) {
        try {
            // JWT payload is base64 encoded in second part of the token
            const parts = sessionToken.split('.');
            if (parts.length >= 2) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                if (payload.isOnboarded === false && !pathname.startsWith('/onboarding')) {
                    const onboardingUrl = new URL('/onboarding', req.url);
                    const response = NextResponse.redirect(onboardingUrl);
                    return addSecurityHeaders(response);
                }
            }
        } catch {
            // If JWT parsing fails, let the request continue
        }
    }

    // Protect /admin/* routes (except /admin/login) - require authentication
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        if (!sessionToken) {
            const loginUrl = new URL('/admin/login', req.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            const response = NextResponse.redirect(loginUrl);
            return addSecurityHeaders(response);
        }
    }

    // Define allowed domains (localhost for dev, your production domain)
    // You might want to move these to env variables
    const allowedDomains = ["localhost:3000", "localhost:3001", "localhost:3002", "pazaryonetimi.com"];

    // Verify if hostname exist in allowed domains
    // If it's a subdomain, e.g. "tenant.pazaryonetimi.com", hostname will be "tenant.pazaryonetimi.com"
    const isMainDomain = allowedDomains.some(domain => hostname?.includes(domain)) &&
        !hostname?.split('.')[0].includes('localhost') &&
        (hostname?.split('.').length === 2 || (hostname?.includes('localhost') && hostname?.split('.').length === 1));

    // Determine the current subdomain
    // For production: tenant.pazaryonetimi.com -> subdomain is 'tenant'
    // For local: tenant.localhost:3000 -> subdomain is 'tenant'
    const currentHost =
        process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
            ? hostname?.replace(`.pazaryonetimi.com`, "")
            : hostname?.replace(/\.(localhost|192\.168):[0-9]+$/, "")?.replace(`.localhost`, "").replace(`.3000`, "").replace(`.3001`, "");

    // If it's the main domain or localhost (no subdomain), rewrite to landing page or standard app
    // But wait, our architecture plan says:
    // - Root (pazaryonetimi.com) -> Landing Page
    // - Subdomain (tenant.pazaryonetimi.com) -> Tenant Dashboard
    // - App (app.pazaryonetimi.com) -> Maybe the unified login?

    // Let's assume:
    // 1. pazaryonetimi.com (or localhost:3000) -> Landing Page
    // 2. app.pazaryonetimi.com -> Unified Login / Admin
    // 3. *.pazaryonetimi.com -> Tenant Site

    // Simplified for now:
    // If subdomain exists and is NOT 'www' and NOT 'app', it's a tenant.
    if (currentHost && !allowedDomains.includes(currentHost) && currentHost !== 'www' && currentHost !== 'app' && currentHost !== 'api') {
        const searchParams = req.nextUrl.searchParams.toString();
        // Rewrite to /_sites/[site]
        const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""
            }`;

        const response = NextResponse.rewrite(
            new URL(`/_sites/${currentHost}${path}`, req.url)
        );
        return addSecurityHeaders(response);
    }

    // If it's the main domain/app, just let Next.js handle it
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', pathname);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        }
    });
    return addSecurityHeaders(response);
}
