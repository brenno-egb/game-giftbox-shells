import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const JavaScriptObfuscator = require("webpack-obfuscator");

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.smartico.ai",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
    ],
  },

  productionBrowserSourceMaps: false,

  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      config.plugins.push(
        new JavaScriptObfuscator(
          {
            rotateStringArray: true,
          },
          []
        )
      );
    }
    return config;
  },
};

module.exports = nextConfig;