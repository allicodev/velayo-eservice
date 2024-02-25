/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      dns: false,
      tls: false,
    };

    return config;
  },
  env: {
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
    DB_URL: process.env.DB_URL,
  },
};

export default nextConfig;
