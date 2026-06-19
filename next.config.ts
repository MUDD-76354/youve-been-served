import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep / as the landing page; portal routes are only reached via navigation.
  async redirects() {
    return [];
  },
};

export default nextConfig;
