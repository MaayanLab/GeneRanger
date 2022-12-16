/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  basePath: process.env.ENTRYPOINT,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/gene/A2M?database=ARCHS4',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
