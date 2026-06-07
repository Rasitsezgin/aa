import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSentryConfig } from '@sentry/nextjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../..'),
  typescript: {
    ignoreBuildErrors: true,
  },
  // Prisma/pg must not be bundled by Turbopack (breaks driver adapter runtime with "reading 'bind'").
  // Do not list @pazaryonetimi/database in both transpilePackages and serverExternalPackages.
  serverExternalPackages: [
    '@pazaryonetimi/database',
    '@prisma/client',
    '@prisma/adapter-pg',
    'pg',
    'bcryptjs',
  ],
  experimental: {
    // Package import optimization for better tree-shaking
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
  // Enable compression
  compress: true,
  poweredByHeader: false,

  // Security & Performance Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // API Proxy to backend
  async rewrites() {
    return [
      {
        source: '/api/scraping/:path*',
        destination: 'http://api:3001/api/scraping/:path*',
      },
      {
        source: '/api/marketplace/:path*',
        destination: 'http://api:3001/api/marketplace/:path*',
      },
    ];
  },

  webpack: (config) => {
    config.performance = { hints: false };
    return config;
  },
};

// Sentry configuration
const sentryConfig = {
  // Sentry org slug
  org: process.env.SENTRY_ORG || 'pazaryonetimi',
  // Sentry project name
  project: process.env.SENTRY_PROJECT || 'pazaryonetimi-web',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
};

export default withSentryConfig(nextConfig, sentryConfig);
