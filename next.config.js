/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Exclude puzzle-quest folder from build
    config.module.rules.push({
      test: /\.tsx?$/,
      include: (resource) => !resource.includes('/puzzle-quest/'),
    });
    return config;
  },
}

module.exports = nextConfig

