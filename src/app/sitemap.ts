import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site-url";

const STATIC_PATHS = [
  "/",
  "/search",
  "/vehicles",
  "/batteries/DIN74R",
  "/cart",
  "/checkout",
  "/login",
  "/signup",
  "/orders/lookup",
  "/order-request/lookup",
  "/support",
  "/support/faq",
  "/support/order-guide",
  "/support/delivery",
  "/support/return-exchange",
  "/support/used-battery-return",
  "/service-center",
  "/benefits",
  "/guides",
  "/terms",
  "/privacy",
  "/shipping",
  "/refund",
  "/company",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();
  const now = new Date();

  return STATIC_PATHS.map((path) => ({
    url: `${origin}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path.startsWith("/support") ? 0.7 : 0.8,
  }));
}
