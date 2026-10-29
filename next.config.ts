import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  // Dev only: let phones and other machines on the network (and 127.0.0.1) load the dev scripts.
  // Without this the page renders but never hydrates: skeletons stay and nothing is tappable.
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "10.*.*.*"],
  // E-Gikomba was merged into the shop; keep old links and search results working.
  async redirects() {
    return [{ source: "/egikomba", destination: "/shop", permanent: true }];
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
