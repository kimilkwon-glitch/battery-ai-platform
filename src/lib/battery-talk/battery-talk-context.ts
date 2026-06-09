import type { BatteryTalkPageType } from "@/types/battery-talk";

export function inferBatteryTalkPageType(pageUrl?: string | null): BatteryTalkPageType {
  if (!pageUrl?.trim()) return "home";
  try {
    const path = new URL(pageUrl).pathname.toLowerCase();
    if (path.includes("/checkout")) return "checkout";
    if (
      path.includes("/batteries/") ||
      path.includes("/battery-specs/") ||
      path.includes("/products/")
    )
      return "product";
    if (path.includes("/vehicles/")) return "vehicle";
    if (path.includes("/support") || path.includes("/customer-center")) return "support";
    if (path === "/" || path === "") return "home";
    return "other";
  } catch {
    return "other";
  }
}
