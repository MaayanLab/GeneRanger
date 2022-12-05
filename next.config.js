/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/gene/A2M?currDatabase=ARCHS4',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
