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
    // Covers of external videos (profile.media): YouTube, Vimeo and Vercel Blob.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
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
