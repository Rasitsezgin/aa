/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  typescript: {
    // TODO: Tüm TypeScript hataları düzeltildikten sonra false yapılmalı
    ignoreBuildErrors: false,
  },
  eslint: {
    // TODO: Tüm ESLint hataları düzeltildikten sonra false yapılmalı
    ignoreDuringBuilds: true,
  },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },

  // SEO: Security & Performance Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          // HSTS
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Service Worker - no cache to ensure updates
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },

  // SEO: Redirects for old/alternate URLs
  async redirects() {
    return [
      // www → non-www
      { source: '/:path*', has: [{ type: 'host', value: 'www.pazaryonetimi.com' }], destination: 'https://pazaryonetimi.com/:path*', permanent: true },
      // Alternate Turkish URLs
      { source: '/ozellikler', destination: '/features', permanent: true },
      { source: '/fiyatlandirma', destination: '/pricing', permanent: true },
      { source: '/cozumler', destination: '/solutions', permanent: true },
      { source: '/cozumler/:slug', destination: '/solutions/:slug', permanent: true },
      { source: '/sss', destination: '/faq', permanent: true },
      { source: '/hakkimizda', destination: '/kurumsal/hakkimizda', permanent: true },
      { source: '/gizlilik', destination: '/kurumsal/gizlilik-politikasi', permanent: true },
      // Common misspellings / old paths
      { source: '/register', destination: '/signup', permanent: true },
      { source: '/kayit', destination: '/signup', permanent: true },
      { source: '/giris', destination: '/login', permanent: true },
      { source: '/auth/login', destination: '/login', permanent: true },
      { source: '/auth/register', destination: '/signup', permanent: true },
    ];
  },

  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'pazaryonetimi.com' },
      { protocol: 'https', hostname: '*.pazaryonetimi.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compression
  compress: true,

  // Powered by header'ı gizle
  poweredByHeader: false,

  // Trailing slash tutarlılığı (SEO duplicate içerik önleme)
  trailingSlash: false,

  // API Proxy to backend
  async rewrites() {
    return [
      {
        source: '/api/scraping/:path*',
        destination: 'http://localhost:3001/api/scraping/:path*',
      },
      {
        source: '/api/marketplace/:path*',
        destination: 'http://localhost:3001/api/marketplace/:path*',
      },
    ];
  },
};
