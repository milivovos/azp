import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@forkcart/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: '*.imgix.net' },
    ],
  },
};

export default nextConfig;