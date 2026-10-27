import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [{ source: "/orbs", destination: "/", permanent: false }];
  },
};

export default nextConfig;
