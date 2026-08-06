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
    // Vercel's Image Optimization has a monthly quota on the current plan;
    // adding Square's CDN as a source pushed it over, so every optimized
    // image (including local product photos) started 402'ing in production.
    // Serving originals unresized keeps the storefront working without
    // requiring a paid plan - revisit if that quota is ever upgraded.
    unoptimized: true,
  },
};

export default nextConfig;
