import type { BatteryBrandKey } from "@/lib/battery-alias-map";

export type BatteryImageFit = "cover" | "contain";

/**
 * 배터리 상품 이미지 object-fit — 서버·클라이언트 공용 순수 함수.
 * (window/hook/client component 의존 없음)
 */
export function getBatteryImageFit(
  _code?: string,
  _brandKey: BatteryBrandKey = "rocket",
): BatteryImageFit {
  return "contain";
}

/** 향후 규격별 crop 보정 시 사용 — 현재는 중앙 정렬 */
export function getBatteryImageObjectPosition(_code?: string): string {
  return "center";
}
