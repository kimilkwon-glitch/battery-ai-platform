import { batterySpecGuideHref } from "@/lib/battery-product-routes";
import { batterySpecHref } from "@/lib/canonical-battery-code";

export { buildBatteryCheckoutHref, type BatteryCardBrandId } from "@/lib/battery-card-cta-vehicle";
export {
  batteryProductDetailHref,
  batteryReviewHref,
  batterySpecGuideHref,
  resolveBatteryProductCardLinks,
  type BatteryProductBrandSlug,
} from "@/lib/battery-product-routes";

/** 배터리 상품 카드 — 규격 안내 라벨 */
export const BATTERY_SPEC_DETAIL_VIEW_LABEL = "배터리 규격 보기" as const;

/** @deprecated — batterySpecGuideHref / batterySpecHref 사용 */
export function batterySpecDetailViewHref(code: string): string {
  return batterySpecHref(code);
}
