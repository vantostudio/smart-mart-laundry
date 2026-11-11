import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    // workerd caps zlib output at 128 MiB and Next inflates the postponed state with 5x this limit
    // (default 100 MB), so resuming a partly prerendered page fails on Cloudflare without it.
    maxPostponedStateSize: "25mb",
  },
  partialPrefetching: true,
  typedRoutes: true,
  // Dev only: let phones and other machines on the network (and 127.0.0.1) load the dev scripts.
  // Without this the page renders but never hydrates: skeletons stay and nothing is tappable.
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "10.*.*.*"],
  // E-Gikomba was merged into the shop; keep old links and search results working.
  async redirects() {
    return [{ source: "/egikomba", destination: "/shop", permanent: true }];
  },
  // Staff pages: never framed (clickjacking), no referrer leaving the site, never cached anywhere.
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
  // Unsplash resizes on its own CDN, so images never go through the Next optimizer
  // (no remotePatterns needed); see src/lib/image-loader.ts.
  images: { loader: "custom", loaderFile: "./src/lib/image-loader.ts" },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
