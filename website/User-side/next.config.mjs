/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Use memory caching to prevent ArrayBuffer allocation failure on Windows
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },
};

export default nextConfig;
