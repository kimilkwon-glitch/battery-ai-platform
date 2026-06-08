import type { MetadataRoute } from "next";
import { absoluteUrl, ROOT_DOMAIN } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/ai-audit", "/__ai-audit", "/admin", "/admin/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: `www.${ROOT_DOMAIN}`,
  };
}
