/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    reactCompiler: true,
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
