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
  images: {
    // Unsplash resizes on its own CDN; see src/lib/image-loader.ts.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
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
