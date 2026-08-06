import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Square's Catalog image CDN. Sandbox and production use separate
      // buckets; both are allowed now so the Fase 9-cutover (production
      // credentials) needs no follow-up config change here.
      { protocol: "https", hostname: "items-images-sandbox.s3.us-west-2.amazonaws.com" },
      { protocol: "https", hostname: "items-images-production.s3.us-west-2.amazonaws.com" },
    ],
  },
};

export default nextConfig;
