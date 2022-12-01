/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/gene/A2M?currDatabase=0',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
