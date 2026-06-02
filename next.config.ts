import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        ],
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
