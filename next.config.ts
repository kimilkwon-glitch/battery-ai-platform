import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: "/assets/**" },
      { pathname: "/images/**" },
      { pathname: "/fallback/**" },
    ],
  },
};

export default nextConfig;
