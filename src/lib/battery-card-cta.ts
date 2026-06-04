import { batteryDetailHref, canonicalBatteryCode } from "@/lib/canonical-battery-code";
import { CHECKOUT_PAGE } from "@/lib/customer-center-routes";

/** 차량·카드 보조 CTA — 배터리 규격 상세(/batteries) */
export const BATTERY_SPEC_DETAIL_VIEW_LABEL = "배터리 규격 보기" as const;

export type BatteryCardBrandId = "rocket" | "solite";

/** 규격 상세(제원·브랜드 비교) — 주문/체크아웃이 아님 */
export function batterySpecDetailViewHref(
  code: string,
  options?: { brand?: BatteryCardBrandId },
): string {
  const base = batteryDetailHref(code);
  if (!options?.brand) return base;
  const params = new URLSearchParams({ brand: options.brand });
  return `${base}?${params.toString()}`;
}

/** 주문/체크아웃 — flow=buy_now + 차량·규격·브랜드 query (CheckoutOrderPage에서 장바구니 시드) */
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
