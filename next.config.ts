import type { NextConfig } from "next";
import { LAUNCHED } from "./lib/site";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // English lives at "/", Spanish at "/es". Internally both render app/[lang].
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/en" }], afterFiles: [], fallback: [] };
  },
  async redirects() {
    return [{ source: "/en", destination: "/", permanent: true }];
  },
  // Until launch, every response carries noindex (robots.ts and metadata do the same).
  async headers() {
    if (LAUNCHED) return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
