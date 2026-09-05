/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint separately via `npm run lint` — prevents Jest worker spawn issues on Windows
    ignoreDuringBuilds: true,
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },
};

export default nextConfig;
