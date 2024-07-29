/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  basePath: process.env.NEXT_PUBLIC_ENTRYPOINT,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/gene/A2M?database=ARCHS4',
        permanent: false,
      },
    ]
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
}

module.exports = nextConfig
