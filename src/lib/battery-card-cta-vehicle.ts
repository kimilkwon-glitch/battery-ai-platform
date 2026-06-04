import { canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { CHECKOUT_PAGE } from "@/lib/customer-center-routes";

export type BatteryCardBrandId = "rocket" | "solite";

/** 차량 상세 등 — 주문/체크아웃 buy_now (상품 카드 주문 CTA와 분리) */
export function buildBatteryCheckoutHref(params: {
  battery: string;
  vehicle?: string;
  brand?: BatteryCardBrandId;
  flow?: "buy_now" | "cart";
}): string {
  const sp = new URLSearchParams();
  sp.set("flow", params.flow ?? "buy_now");
  const bat = canonicalBatteryCode(params.battery);
  if (bat) sp.set("battery", bat);
  if (params.vehicle?.trim()) sp.set("vehicle", params.vehicle.trim());
  if (params.brand) sp.set("brand", params.brand);
  return `${CHECKOUT_PAGE}?${sp.toString()}`;
}
