/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude puzzle-quest from Next.js build (it's a separate Vite project)
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  webpack: (config, { isServer }) => {
    // Exclude puzzle-quest from webpack compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/puzzle-quest/**'],
    };
    return config;
  },
}

module.exports = nextConfig

