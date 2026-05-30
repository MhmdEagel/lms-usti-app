import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  swcMinify: false,
   experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
