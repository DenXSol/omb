/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['arweave.net', 'www.arweave.net'],
  },
}

module.exports = nextConfig
