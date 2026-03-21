/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  outputFileTracingIncludes: {
    '/api/knowledge': ['./data/**/*'],
  },
}

module.exports = nextConfig
