import type { NextConfig } from "next";

const vehicleAssetTraceExcludes = [
  "./public/assets/cars-normalized/**/*",
  "./public/assets/vehicles/cars-normalized/**/*",
  "./public/assets/cars-generated-review/**/*",
  "./public/assets/vehicles-original-backup/**/*",
  "./public/assets/vehicle-damaged-backup-before-restore/**/*",
  "./reports/**/*",
];

const nextConfig: NextConfig = {
  // Admin image-review routes read PNGs at runtime; exclude from serverless bundles.
  outputFileTracingExcludes: {
    "/admin/vehicle-image-review": vehicleAssetTraceExcludes,
    "/admin/vehicle-reference-review": vehicleAssetTraceExcludes,
  },
  async redirects() {
    return [
      { source: "/customer", destination: "/support", permanent: false },
      { source: "/customer/faq", destination: "/support/faq", permanent: false },
      {
        source: "/customer/order-guide",
        destination: "/support/order-guide",
        permanent: false,
      },
      {
        source: "/customer/delivery",
        destination: "/support/delivery",
        permanent: false,
      },
      {
        source: "/customer/return-exchange",
        destination: "/support/return-exchange",
        permanent: false,
      },
      {
        source: "/customer/used-battery-return",
        destination: "/support/used-battery-return",
        permanent: false,
      },
      {
        source: "/customer/message-guide",
        destination: "/support/message-guide",
        permanent: false,
      },
      { source: "/customer/cart-guide", destination: "/cart-design", permanent: false },
      {
        source: "/customer/order-complete",
        destination: "/order-complete",
        permanent: false,
      },
      {
        source: "/analysis/photo",
        destination: "/photo-check",
        permanent: true,
      },
      { source: "/order", destination: "/support/order-guide", permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/__ai-audit",
        destination: "/ai-audit",
      },
      {
        source: "/__ai-audit/:path*",
        destination: "/ai-audit/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/batteries/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "no-store",
          },
          { key: "Vary", value: "Accept-Encoding" },
        ],
      },
      {
        source: "/search",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "no-store",
          },
          { key: "Vary", value: "Accept-Encoding" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Vercel-CDN-Cache-Control",
            value: "no-store",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  images: {
    localPatterns: [
      { pathname: "/assets/**" },
      { pathname: "/images/**" },
      { pathname: "/fallback/**" },
    ],
  },
};

export default nextConfig;
