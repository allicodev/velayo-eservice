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

    config.module.rules.push({
      test: /\.(mp3)$/,
      type: "asset/resource",
      generator: {
        filename: "static/chunks/[path][name].[hash][ext]",
      },
    });

    return config;
  },
  env: {
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
    DB_URL: process.env.DB_URL,
    PUSHER_APP_ID: process.env.PUSHER_APP_ID,
    PUSHER_APP_KEY: process.env.PUSHER_APP_KEY,
    PUSHER_APP_SECRET: process.env.PUSHER_APP_SECRET,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
