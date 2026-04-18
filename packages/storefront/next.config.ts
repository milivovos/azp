import type { NextConfig } from 'next';

const adminPort = process.env['ADMIN_PORT'] ?? '4201';
const apiPort = process.env['API_PORT'] ?? '4000';

const nextConfig: NextConfig = {
  transpilePackages: ['@forkcart/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'forkcart-api.heynyx.dev' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: '*.imgix.net' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

export default nextConfig;
