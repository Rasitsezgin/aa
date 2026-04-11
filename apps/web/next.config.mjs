/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: false,
  experimental: {
    reactCompiler: false,
    workerThreads: false,
    cpus: 2,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.performance = { hints: false };
    return config;
  },
};

export default nextConfig;
