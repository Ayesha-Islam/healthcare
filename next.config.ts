import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',

  env: {
    CHROMA_RECORDINGS_COLLECTION: process.env.CHROMA_RECORDINGS_COLLECTION,
    CHROMA_TIMEOUT: process.env.CHROMA_TIMEOUT,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default config;