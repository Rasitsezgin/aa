// Security Headers & WAF-like Protection
// Comprehensive security configuration for Next.js

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security headers configuration
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.sentry.io https://*.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: https://*.amazonaws.com https://*.cloudfront.net https://*.r2.cloudflarestorage.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.sentry.io https://api.resend.com https://api.openai.com wss://*.pazaryonetimi.com",
    "frame-src 'self' https://*.stripe.com",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; '),

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // XSS Protection
  'X-XSS-Protection': '1; mode=block',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy
  'Permissions-Policy': [
    'accelerometer=()',
    'camera=()',
    'geolocation=(self)',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=(self)',
    'usb=()',
  ].join(', '),

  // Strict Transport Security (HSTS)
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

  // DNS Prefetch Control
  'X-DNS-Prefetch-Control': 'on',

  // Download Options
  'X-Download-Options': 'noopen',

  // Permitted Cross-Domain Policies
  'X-Permitted-Cross-Domain-Policies': 'none',

  // Report To (for CSP violations)
  'Report-To': JSON.stringify({
    group: 'csp-violations',
    max_age: 10886400,
    endpoints: [
      { url: '/api/security/csp-report' },
    ],
  }),

  // Reporting Endpoints
  'Reporting-Endpoints': 'csp-violations="/api/security/csp-report"',
};

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Request validation and WAF-like protection
export function validateRequest(req: NextRequest): { valid: boolean; reason?: string } {
  const url = req.nextUrl;
  const userAgent = req.headers.get('user-agent') || '';
  const ip = req.ip || req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // 1. Block suspicious user agents
  const blockedAgents = [
    /sqlmap/i,
    /nikto/i,
    /nessus/i,
    /masscan/i,
    /nmap/i,
    /zgrab/i,
    /gobuster/i,
    /dirbuster/i,
  ];

  for (const pattern of blockedAgents) {
    if (pattern.test(userAgent)) {
      return { valid: false, reason: 'Blocked user agent' };
    }
  }

  // 2. Block suspicious URL patterns (SQL injection attempts)
  const suspiciousPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,  // SQL injection
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(:))/i,  // SQL injection
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,  // OR injection
    /((\%27)|(\'))union/i,  // UNION injection
    /exec(\s|\+)+(s|x)p\w+/i,  // Stored procedure
    /UNION SELECT/i,
    /INSERT INTO/i,
    /DELETE FROM/i,
    /DROP TABLE/i,
    /<script/i,  // XSS
    /javascript:/i,
    /on\w+=/i,  // Event handlers
  ];

  const fullUrl = url.href;
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl)) {
      return { valid: false, reason: 'Suspicious URL pattern detected' };
    }
  }

  // 3. Rate limit check (simple implementation)
  const path = url.pathname;
  const sensitivePaths = ['/api/admin', '/api/settings', '/api/users'];
  if (sensitivePaths.some(p => path.startsWith(p))) {
    // Additional checks for admin paths
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return { valid: false, reason: 'Admin endpoint requires authentication' };
    }
  }

  // 4. Block requests to internal paths
  const blockedPaths = [
    '/.env',
    '/.git',
    '/config',
    '/wp-admin',
    '/administrator',
    '/phpmyadmin',
    '/.htaccess',
    '/server-status',
    '/actuator',
    '/api/swagger',
    '/api/docs',
  ];

  if (blockedPaths.some(p => path.toLowerCase().includes(p))) {
    return { valid: false, reason: 'Access to internal path blocked' };
  }

  // 5. Validate content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers.get('content-type') || '';
    const allowedTypes = [
      'application/json',
      'multipart/form-data',
      'application/x-www-form-urlencoded',
      'text/plain',
    ];

    if (!allowedTypes.some(type => contentType.includes(type))) {
      return { valid: false, reason: 'Invalid content type' };
    }
  }

  return { valid: true };
}

// Bot detection
export function isBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /archiver/i,
    /httpclient/i,
    /python-requests/i,
    /curl/i,
    /wget/i,
    /postman/i,
  ];

  return botPatterns.some(pattern => pattern.test(userAgent));
}

// CSRF protection
export function validateCSRFToken(req: NextRequest): boolean {
  const csrfToken = req.headers.get('x-csrf-token');
  const cookieToken = req.cookies.get('csrf-token')?.value;

  if (!csrfToken || !cookieToken) {
    return false;
  }

  // In production, use proper token comparison (timing-safe)
  return csrfToken === cookieToken;
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64');
}

// IP-based geo blocking (example)
export function isBlockedCountry(ip: string): boolean {
  // This would integrate with a GeoIP service
  // For now, just a placeholder
  const blockedCountries = process.env.BLOCKED_COUNTRIES?.split(',') || [];
  
  // In production, use MaxMind GeoIP2 or similar
  // const geo = lookup(ip);
  // return blockedCountries.includes(geo?.country?.isoCode);
  
  return false;
}

// Request size limiting
export function checkRequestSize(req: NextRequest, maxSize: number = 10 * 1024 * 1024): boolean {
  const contentLength = parseInt(req.headers.get('content-length') || '0');
  return contentLength <= maxSize;
}

// Security middleware for Next.js
export function securityMiddleware(req: NextRequest): NextResponse | null {
  // Validate request
  const validation = validateRequest(req);
  if (!validation.valid) {
    return new NextResponse(
      JSON.stringify({ error: 'Security violation', reason: validation.reason }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Check request size for uploads
  if (req.method === 'POST' && req.nextUrl.pathname.startsWith('/api/upload')) {
    if (!checkRequestSize(req, 50 * 1024 * 1024)) { // 50MB limit
      return new NextResponse(
        JSON.stringify({ error: 'File too large' }),
        {
          status: 413,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Add security headers to request for downstream use
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', crypto.randomUUID());
  requestHeaders.set('x-request-time', new Date().toISOString());

  return null; // Continue to next middleware
}

// Audit security events
export async function logSecurityEvent(
  event: string,
  details: {
    ip: string;
    userAgent: string;
    path: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  // Log to Sentry or security monitoring service
  console.warn(`[Security] ${event}:`, {
    timestamp: new Date().toISOString(),
    ...details,
  });

  // In production, send to SIEM or security monitoring
  // await sendToSIEM({ event, ...details });
}

// Export for use in middleware.ts
export { applySecurityHeaders as default };
