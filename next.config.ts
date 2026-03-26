import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  outputFileTracingIncludes: {
    '/**': ['./generated/prisma/**/*.node'],
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
